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

export async function getPosts() {
  const res = await fetch('http://localhost:8000/posts');
  if (!res.ok) throw new Error('Failed to load posts');
  return res.json();
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
