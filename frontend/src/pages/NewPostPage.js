import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api';
import './NewPostPage.css';

export default function NewPostPage() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({ title: '', content: '', author: '' });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + files.length > 10) {
      setError('이미지는 최대 10장까지 첨부할 수 있습니다.');
      return;
    }
    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    setFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('제목과 본문을 모두 입력해주세요.');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('content', form.content.trim());
      fd.append('author', form.author.trim() || '익명');
      files.forEach((f) => fd.append('images', f));
      const res = await createPost(fd);
      navigate(`/post/${res.data._id}`);
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED';
      const message =
        err.response?.data?.message ||
        (isTimeout
          ? '등록 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
          : '게시글 등록 중 오류가 발생했습니다. 서버가 켜져 있는지 확인해주세요.');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="new-post fade-up">
      <div className="new-post-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← 뒤로</button>
        <h1 className="new-post-title">글쓰기</h1>
      </div>

      <form className="post-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        {/* Author */}
        <div className="form-group">
          <label className="form-label">별명</label>
          <input
            type="text"
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="익명으로 남기려면 비워두세요"
            className="form-input"
            maxLength={30}
          />
        </div>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">
            제목 <span className="required">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="제목을 입력하세요"
            className="form-input"
            maxLength={200}
            required
          />
          <span className="char-count">{form.title.length}/200</span>
        </div>

        {/* Content */}
        <div className="form-group">
          <label className="form-label">
            본문 <span className="required">*</span>
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="내용을 입력하세요..."
            className="form-textarea"
            rows={12}
            required
          />
        </div>

        {/* Images */}
        <div className="form-group">
          <label className="form-label">이미지 첨부 (선택, 최대 10장)</label>
          <button
            type="button"
            className="upload-btn"
            onClick={() => fileRef.current.click()}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            이미지 선택
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {previews.length > 0 && (
            <div className="preview-grid">
              {previews.map((src, i) => (
                <div key={i} className="preview-item">
                  <img src={src} alt={`preview-${i}`} />
                  <button
                    type="button"
                    className="preview-remove"
                    onClick={() => removeImage(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate(-1)}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={submitting}
          >
            {submitting ? '등록 중...' : '게시글 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
