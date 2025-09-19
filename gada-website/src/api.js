// src/api.js
import { API_BASE } from './config';

export async function registerUser({ username, email, password, role, full_name }) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, role, full_name }),
  });
  return response.json();
}

export async function loginUser({ username, password }) {
  const response = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }),
    credentials: 'include'
  });
  return response.json();
}

export async function refreshAccessToken() {
  const res = await fetch(`${API_BASE}/token/refresh`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Refresh failed');
  return res.json();
}

// Generic fetch wrapper that tries refresh once on 401 then retries original request
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const first = await fetch(url, { ...options, headers, credentials: 'include' });
  if (first.status !== 401) return first;
  // attempt refresh
  try {
    const rt = await refreshAccessToken();
    if (rt.access_token) {
      localStorage.setItem('token', rt.access_token);
      headers['Authorization'] = `Bearer ${rt.access_token}`;
      return await fetch(url, { ...options, headers, credentials: 'include' });
    }
  } catch (_) {
    // ignore
  }
  // logout on failure
  localStorage.removeItem('token');
  return first; // caller can handle 401
}

export async function logout() {
  await fetch(`${API_BASE}/token/logout`, { method: 'POST', credentials: 'include' });
}

export async function getPosts({ skip = 0, limit = 50, search, status, sort } = {}) {
  const params = new URLSearchParams();
  if (skip) params.append('skip', skip);
  if (limit) params.append('limit', limit);
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (sort) params.append('sort', sort);
  const res = await fetch(`${API_BASE}/posts` + (params.toString() ? `?${params}` : ''));
  if (!res.ok) throw new Error('Failed to load posts');
  return res.json(); // { total, items }
}

export async function createPost(post, token) {
  // token param kept for backwards-compatibility; authFetch uses localStorage token and auto-refreshes on 401
  const res = await authFetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create post');
  return data;
}

export async function updatePost(id, post, token) {
  const res = await authFetch(`${API_BASE}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update post');
  return data;
}

export async function changePostStatus(id, status, publish_at, token) {
  const res = await authFetch(`${API_BASE}/posts/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, publish_at })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to change status');
  return data;
}

export async function deletePost(id, token) {
  const res = await authFetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
  if (!res.ok) { const data = await res.json(); throw new Error(data.detail || 'Failed to delete post'); }
  return true;
}

export async function listUsers({ skip = 0, limit = 50, search } = {}, token) {
  const params = new URLSearchParams();
  if (skip) params.append('skip', skip);
  if (limit) params.append('limit', limit);
  if (search) params.append('search', search);
  const res = await authFetch(`${API_BASE}/users` + (params.toString() ? `?${params}` : ''));
  if (!res.ok) throw new Error('Failed to load users');
  return res.json(); // { total, items }
}

export async function updateUserRole(userId, role, token) {
  const res = await authFetch(`${API_BASE}/users/${userId}/role?role=${encodeURIComponent(role)}`, { method: 'PUT' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update role');
  return data;
}

export async function deleteUser(userId, token) {
  const res = await authFetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
  if (!res.ok) { const data = await res.json(); throw new Error(data.detail || 'Failed to delete user'); }
  return true;
}

export async function uploadImage(file, token) {
  const form = new FormData();
  form.append('file', file);
  const res = await authFetch(`${API_BASE}/upload-image`, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to upload image');
  return data; // { filename, url }
}

export async function approveUser(userId, approved, token) {
  const res = await authFetch(`${API_BASE}/users/${userId}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update approval');
  return data;
}

export async function changePassword(old_password, new_password, token) {
  const res = await authFetch(`${API_BASE}/users/password-change`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ old_password, new_password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to change password');
  return data;
}

export async function runPublishScheduled(token) {
  const res = await authFetch(`${API_BASE}/tasks/publish-scheduled`, { method:'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to publish scheduled');
  return data;
}
export async function backfillPostStatus(token) {
  const res = await authFetch(`${API_BASE}/tasks/backfill-post-status`, { method:'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to backfill');
  return data;
}

export async function getPost(id) {
  const res = await fetch(`${API_BASE}/posts/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to load post');
  return data;
}

export async function listComments(postId, { skip = 0, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (skip) params.append('skip', skip);
  if (limit) params.append('limit', limit);
  const res = await authFetch(`${API_BASE}/posts/${postId}/comments` + (params.toString() ? `?${params}` : ''));
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to load comments');
  return data;
}

export async function addComment(postId, content) {
  const res = await authFetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to add comment');
  return data;
}

export async function deleteCommentApi(postId, commentId) {
  const res = await authFetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
  if (!res.ok) { const data = await res.json(); throw new Error(data.detail || 'Failed to delete comment'); }
  return true;
}

export async function getLikeStatus(postId) {
  const res = await authFetch(`${API_BASE}/posts/${postId}/likes`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get like status');
  return data; // { liked, likes_count }
}

export async function toggleLike(postId) {
  const res = await authFetch(`${API_BASE}/posts/${postId}/likes/toggle`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to toggle like');
  return data;
}

export async function verifyEmail({ token, username, email }) {
  const res = await fetch(`${API_BASE}/email/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, username, email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Verification failed');
  return data; // { detail }
}

// Request a password reset token to be emailed (or returned in dev)
export async function requestPasswordReset(email) {
  const res = await fetch(`${API_BASE}/password/reset-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Reset request failed');
  return data; // { detail, token? }
}

// Perform password reset with token and new password
export async function performPasswordReset({ token, new_password }) {
  const res = await fetch(`${API_BASE}/password/reset-perform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Reset failed');
  return data; // { detail }
}

// Send verification code for logged-in user (or via username/password flow already provided)
export async function sendVerificationForCurrentUser() {
  const res = await authFetch(`${API_BASE}/email/send-verification`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to send verification');
  return data; // { detail, dev_code? }
}

// --- Investor Proposals (Admin) ---
export async function listInvestorProposals({ skip = 0, limit = 50, search, status, sector } = {}, token) {
  const params = new URLSearchParams();
  if (skip) params.append('skip', skip);
  if (limit) params.append('limit', limit);
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (sector) params.append('sector', sector);
  const res = await authFetch(`${API_BASE}/investor-proposals` + (params.toString() ? `?${params}` : ''));
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to load proposals');
  return data; // { total, items }
}

export async function updateInvestorProposalStatus(id, status, token) {
  const res = await authFetch(`${API_BASE}/investor-proposals/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update proposal');
  return data;
}
