// src/api.js

export async function registerUser({ username, email, password, role }) {
  const response = await fetch('http://localhost:8000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, role }),
  });
  return response.json();
}

export async function loginUser({ username, password }) {
  const response = await fetch('http://localhost:8000/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }),
  });
  return response.json();
}

export async function getPosts({ skip = 0, limit = 50, search, status, sort } = {}) {
  const params = new URLSearchParams();
  if (skip) params.append('skip', skip);
  if (limit) params.append('limit', limit);
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (sort) params.append('sort', sort);
  const res = await fetch('http://localhost:8000/posts' + (params.toString() ? `?${params}` : ''));
  if (!res.ok) throw new Error('Failed to load posts');
  return res.json(); // { total, items }
}

export async function createPost(post, token) {
  const res = await fetch('http://localhost:8000/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(post)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create post');
  return data;
}

export async function updatePost(id, post, token) {
  const res = await fetch(`http://localhost:8000/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(post)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update post');
  return data;
}

export async function changePostStatus(id, status, publish_at, token) {
  const res = await fetch(`http://localhost:8000/posts/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status, publish_at })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to change status');
  return data;
}

export async function deletePost(id, token) {
  const res = await fetch(`http://localhost:8000/posts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) { const data = await res.json(); throw new Error(data.detail || 'Failed to delete post'); }
  return true;
}

export async function listUsers({ skip = 0, limit = 50, search } = {}, token) {
  const params = new URLSearchParams();
  if (skip) params.append('skip', skip);
  if (limit) params.append('limit', limit);
  if (search) params.append('search', search);
  const res = await fetch('http://localhost:8000/users' + (params.toString() ? `?${params}` : ''), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to load users');
  return res.json(); // { total, items }
}

export async function updateUserRole(userId, role, token) {
  const res = await fetch(`http://localhost:8000/users/${userId}/role?role=${encodeURIComponent(role)}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update role');
  return data;
}

export async function deleteUser(userId, token) {
  const res = await fetch(`http://localhost:8000/users/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) { const data = await res.json(); throw new Error(data.detail || 'Failed to delete user'); }
  return true;
}

export async function uploadImage(file, token) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('http://localhost:8000/upload-image', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to upload image');
  return data; // { filename, url }
}

export async function approveUser(userId, approved, token) {
  const res = await fetch(`http://localhost:8000/users/${userId}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ approved })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update approval');
  return data;
}

export async function changePassword(old_password, new_password, token) {
  const res = await fetch('http://localhost:8000/users/password-change', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ old_password, new_password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to change password');
  return data;
}

export async function runPublishScheduled(token) {
  const res = await fetch('http://localhost:8000/tasks/publish-scheduled', { method:'POST', headers:{ Authorization:`Bearer ${token}` }});
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to publish scheduled');
  return data;
}
export async function backfillPostStatus(token) {
  const res = await fetch('http://localhost:8000/tasks/backfill-post-status', { method:'POST', headers:{ Authorization:`Bearer ${token}` }});
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to backfill');
  return data;
}
