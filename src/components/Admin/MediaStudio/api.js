/** Shared API base for Media Studio — REACT_APP_API_URL already includes /api */
export const getApiUrl = () =>
  process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getAuthToken = () => localStorage.getItem('token');

export const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const jsonHeaders = () => ({
  ...getAuthHeader(),
  'Content-Type': 'application/json',
});

export async function fetchMediaHealth() {
  const res = await fetch(`${getApiUrl()}/admin/media/health`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error(`Health check failed (${res.status})`);
  return res.json();
}

export async function planMedia(body) {
  const res = await fetch(`${getApiUrl()}/admin/media/plan`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Plan failed (${res.status})`);
  return data;
}

export async function createMedia(body) {
  const res = await fetch(`${getApiUrl()}/admin/media/create`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Create failed (${res.status})`);
  return data;
}

export async function getMediaJob(jobId) {
  const res = await fetch(`${getApiUrl()}/admin/media/jobs/${jobId}`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Job fetch failed (${res.status})`);
  return data;
}

export function jobDownloadUrl(jobId) {
  return `${getApiUrl()}/admin/media/jobs/${jobId}/download`;
}

export async function listBrandAssets() {
  const res = await fetch(`${getApiUrl()}/admin/media/assets`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to list assets');
  return data.assets || [];
}

export async function uploadBrandAsset(file, meta = {}) {
  const form = new FormData();
  form.append('image', file);
  if (meta.label) form.append('label', meta.label);
  if (meta.usage) form.append('usage', meta.usage);
  if (meta.platform) form.append('platform', meta.platform);
  if (meta.feature) form.append('feature', meta.feature);
  if (meta.tags) form.append('tags', JSON.stringify(meta.tags));

  const res = await fetch(`${getApiUrl()}/admin/media/assets`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.asset;
}

export async function deleteBrandAsset(id) {
  const res = await fetch(`${getApiUrl()}/admin/media/assets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Delete failed');
  }
}

export async function planFromDocument(body) {
  const res = await fetch(`${getApiUrl()}/admin/media/plan-from-document`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Plan from document failed (${res.status})`);
  return data;
}

export async function regenerateScene(jobId, sceneIndex) {
  const res = await fetch(`${getApiUrl()}/admin/media/ai-video/${jobId}/regenerate-scene/${sceneIndex}`, {
    method: 'POST',
    headers: jsonHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Scene regeneration failed (${res.status})`);
  return data;
}

export function sceneImageUrl(jobId, index) {
  return `${getApiUrl()}/admin/media/ai-video/${jobId}/scene/${index}`;
}

export function captionsDownloadUrl(jobId) {
  return `${getApiUrl()}/admin/media/jobs/${jobId}/captions.srt`;
}

export async function fetchThumbnail(compositionId, inputProps, frame = 0) {
  const res = await fetch(`${getApiUrl()}/admin/media/thumbnail`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ compositionId, inputProps, frame }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.reason || `Thumbnail failed (${res.status})`);
  }
  return res.blob();
}

export async function fetchLibrary() {
  const res = await fetch(`${getApiUrl()}/admin/media/library`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Library fetch failed');
  return data.files || data.videos || [];
}