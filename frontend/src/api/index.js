import axios from 'axios';

const API_ORIGIN = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 15000,
});

// Posts
export const fetchPosts = (params) => api.get('/posts', { params });
export const fetchPost = (id) => api.get(`/posts/${id}`);
export const createPost = (formData) =>
  api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const likePost = (id) => api.patch(`/posts/${id}/like`);
export const deletePost = (id) => api.delete(`/posts/${id}`);

// Comments
export const fetchComments = (postId, sort) =>
  api.get(`/comments/${postId}`, { params: { sort } });
export const createComment = (postId, data) => api.post(`/comments/${postId}`, data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);

export default api;
