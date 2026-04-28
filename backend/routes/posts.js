const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const upload = require('../middleware/upload');

// GET /api/posts — 게시글 목록 (검색 포함, 최신순)
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    if (q && q.trim()) {
      query = { title: { $regex: q.trim(), $options: 'i' } };
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('title author likes commentCount createdAt images'),
      Post.countDocuments(query),
    ]);

    res.json({
      posts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// GET /api/posts/:id — 게시글 상세
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/posts — 게시글 작성 (이미지 업로드 포함)
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, content, author } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: '제목과 본문은 필수입니다.' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const images = (req.files || []).map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      url: `${baseUrl}/uploads/${file.filename}`,
    }));

    const post = new Post({
      title,
      content,
      author: author?.trim() || '익명',
      images,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// PATCH /api/posts/:id/like — 좋아요 +1
router.patch('/:id/like', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// DELETE /api/posts/:id — 게시글 삭제
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    await Comment.deleteMany({ postId: req.params.id });
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
