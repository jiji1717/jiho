const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// GET /api/comments/:postId — 댓글 목록
router.get('/:postId', async (req, res) => {
  try {
    const { sort = 'newest' } = req.query;
    const sortOrder = sort === 'oldest' ? 1 : -1;

    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: sortOrder,
    });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/comments/:postId — 댓글 작성
router.post('/:postId', async (req, res) => {
  try {
    const { content, author } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

    const comment = new Comment({
      postId: req.params.postId,
      content: content.trim(),
      author: author?.trim() || '익명',
    });

    await comment.save();

    // Update comment count on post
    await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentCount: 1 } });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// DELETE /api/comments/:id — 댓글 삭제
router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
