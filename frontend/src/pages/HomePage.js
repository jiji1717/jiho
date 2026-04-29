import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPosts } from '../api';
import './HomePage.css';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPosts({ q: query, page, limit: 20 });
      setPosts(res.data.posts);
      setTotal(res.data.total);
    } catch {
      /* handle silently */
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setInputVal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(val);
      setPage(1);
    }, 380);
  };

  const handleClear = () => {
    setInputVal('');
    setQuery('');
    setPage(1);
  };

  return (
    <div className="home fade-up">
      {/* Hero */}
      <div className="home-hero">
        <h1 className="home-title">게시판</h1>
        <p className="home-subtitle">총 {total.toLocaleString()}개의 게시글</p>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={inputVal}
            onChange={handleSearch}
            placeholder="제목으로 검색..."
            className="search-input"
          />
          {inputVal && (
            <button className="search-clear" onClick={handleClear} aria-label="clear">✕</button>
          )}
        </div>
        {query && !loading && (
          <p className="search-result-label">
            "{query}" 검색 결과 {total}건
          </p>
        )}
      </div>

      {/* List */}
      {loading ? (
        null
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">📭</p>
          <p>{query ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}</p>
          {!query && (
            <button className="btn-primary" onClick={() => navigate('/new')}>
              첫 글 작성하기
            </button>
          )}
        </div>
      ) : (
        <ul className="post-list">
          {posts.map((post, i) => (
            <li
              key={post._id}
              className="post-item"
              style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => navigate(`/post/${post._id}`)}
            >
              <div className="post-item-left">
                {post.images?.length > 0 && (
                  <div className="post-thumb">
                    <img src={post.images[0].url} alt="" />
                  </div>
                )}
                <div className="post-info">
                  <span className="post-title">{post.title}</span>
                  <div className="post-meta">
                    <span className="post-author">{post.author}</span>
                    <span className="meta-dot">·</span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="post-stats">
                <span className="stat" title="좋아요">
                  <span className="stat-icon">🔥</span>
                  {post.likes}
                </span>
                <span className="stat" title="댓글">
                  <span className="stat-icon">💬</span>
                  {post.commentCount}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← 이전
          </button>
          <span className="page-info">{page} / {Math.ceil(total / 20)}</span>
          <button
            className="page-btn"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            다음 →
          </button>
        </div>
      )}
    </div>
  );
}
