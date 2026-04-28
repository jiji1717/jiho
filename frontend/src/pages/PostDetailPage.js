import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPost, likePost, deletePost, fetchComments, createComment, deleteComment } from '../api';
import './PostDetailPage.css';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [postLoading, setPostLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentSort, setCommentSort] = useState('newest');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentForm, setCommentForm] = useState({ content: '', author: '' });
  const [submitting, setSubmitting] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  // Load post
  useEffect(() => {
    fetchPost(id)
      .then((res) => setPost(res.data))
      .catch(() => navigate('/'))
      .finally(() => setPostLoading(false));
  }, [id, navigate]);

  // Load comments
  const loadComments = useCallback(async () => {
    setCommentLoading(true);
    try {
      const res = await fetchComments(id, commentSort);
      setComments(res.data);
    } finally {
      setCommentLoading(false);
    }
  }, [id, commentSort]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await likePost(id);
      setPost((p) => ({ ...p, likes: res.data.likes }));
    } finally {
      setLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createComment(id, {
        content: commentForm.content,
        author: commentForm.author || '익명',
      });
      setCommentForm({ content: '', author: '' });
      setPost((p) => ({ ...p, commentCount: (p.commentCount || 0) + 1 }));
      await loadComments();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제할까요?')) return;
    await deleteComment(commentId);
    setPost((p) => ({ ...p, commentCount: Math.max(0, (p.commentCount || 0) - 1) }));
    setComments((cs) => cs.filter((c) => c._id !== commentId));
  };

  const handleDeletePost = async () => {
    if (!window.confirm('게시글을 삭제할까요?')) return;
    await deletePost(id);
    navigate('/');
  };

  if (postLoading) return <div className="spinner" />;
  if (!post) return null;

  return (
    <article className="detail fade-up">
      {/* Back */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← 목록으로
      </button>

      {/* Post header */}
      <header className="detail-header">
        <h1 className="detail-title">{post.title}</h1>
        <div className="detail-meta">
          <span className="detail-author">
            <span className="author-icon">✦</span>
            {post.author}
          </span>
          <span className="meta-sep">·</span>
          <span className="detail-date">{formatDate(post.createdAt)}</span>
          <span className="meta-sep">·</span>
          <span className="detail-comments">댓글 {post.commentCount}</span>
        </div>
      </header>

      {/* Images */}
      {post.images?.length > 0 && (
        <div className="image-grid">
          {post.images.map((img) => (
            <img
              key={img.filename}
              src={img.url}
              alt={img.originalname}
              className="post-image"
              onClick={() => setSelectedImage(img.url)}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="detail-content">
        {post.content.split('\n').map((line, i) => (
          <p key={i}>{line || <br />}</p>
        ))}
      </div>

      {/* Actions */}
      <div className="detail-actions">
        <button
          className={`like-btn ${liking ? 'liking' : ''}`}
          onClick={handleLike}
          disabled={liking}
        >
          <span className="like-flame">🔥</span>
          <span className="like-label">화제</span>
          <span className="like-count">{post.likes}</span>
        </button>
        <button className="delete-btn" onClick={handleDeletePost}>
          게시글 삭제
        </button>
      </div>

      {/* Divider */}
      <div className="section-divider" />

      {/* Comments */}
      <section className="comments-section">
        <div className="comments-header">
          <h2 className="comments-title">
            댓글 <span className="comment-count-badge">{post.commentCount}</span>
          </h2>
          <div className="sort-tabs">
            <button
              className={`sort-tab ${commentSort === 'newest' ? 'active' : ''}`}
              onClick={() => setCommentSort('newest')}
            >
              최신순
            </button>
            <button
              className={`sort-tab ${commentSort === 'oldest' ? 'active' : ''}`}
              onClick={() => setCommentSort('oldest')}
            >
              오래된순
            </button>
          </div>
        </div>

        {/* Comment form */}
        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <input
            type="text"
            placeholder="별명 (선택, 생략 시 익명)"
            value={commentForm.author}
            onChange={(e) => setCommentForm((f) => ({ ...f, author: e.target.value }))}
            className="comment-author-input"
            maxLength={30}
          />
          <div className="comment-input-row">
            <textarea
              placeholder="댓글을 입력하세요..."
              value={commentForm.content}
              onChange={(e) => setCommentForm((f) => ({ ...f, content: e.target.value }))}
              className="comment-textarea"
              rows={3}
              maxLength={1000}
              required
            />
            <button type="submit" className="comment-submit" disabled={submitting}>
              {submitting ? '...' : '등록'}
            </button>
          </div>
        </form>

        {/* Comment list */}
        {commentLoading ? (
          <div className="spinner" />
        ) : comments.length === 0 ? (
          <p className="no-comments">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
        ) : (
          <ul className="comment-list">
            {comments.map((c) => (
              <li key={c._id} className="comment-item">
                <div className="comment-top">
                  <span className="comment-author">
                    <span className="author-icon small">✦</span>
                    {c.author}
                  </span>
                  <div className="comment-right">
                    <span className="comment-time">{timeAgo(c.createdAt)}</span>
                    <button
                      className="comment-delete"
                      onClick={() => handleDeleteComment(c._id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <p className="comment-content">{c.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Image lightbox */}
      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="확대" className="lightbox-img" />
          <button className="lightbox-close">✕</button>
        </div>
      )}
    </article>
  );
}
