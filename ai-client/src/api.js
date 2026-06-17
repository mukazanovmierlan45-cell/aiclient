const BASE = 'https://testuser1-task1-3847.infra.wsk17.dev';

function getToken() {
  return localStorage.getItem('api_token') || '';
}

function headers(extra = {}) {
  return {
    'Content-Type': 'application/json',
    'X-API-TOKEN': getToken(),
    ...extra,
  };
}

async function handleResponse(res) {
  if (res.ok) return res.json();
  const err = await res.json().catch(() => ({}));
  const error = new Error(err.detail || err.title || 'Unknown error');
  error.status = res.status;
  throw error;
}

// === CHAT ===
export const startConversation = (prompt) =>
  fetch(`${BASE}/api/chat/conversation`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt }),
  }).then(handleResponse);

export const continueConversation = (conversation_id, prompt) =>
  fetch(`${BASE}/api/chat/conversation/${conversation_id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ prompt }),
  }).then(handleResponse);

export const getConversationResponse = (conversation_id) =>
  fetch(`${BASE}/api/chat/conversation/${conversation_id}`, {
    headers: headers(),
  }).then(handleResponse);

// === IMAGE GENERATION ===
export const generateImage = (text_prompt) =>
  fetch(`${BASE}/api/imagegeneration/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ text_prompt }),
  }).then(handleResponse);

export const getJobStatus = (job_id) =>
  fetch(`${BASE}/api/imagegeneration/status/${job_id}`, {
    headers: headers(),
  }).then(handleResponse);

export const getJobResult = (job_id) =>
  fetch(`${BASE}/api/imagegeneration/result/${job_id}`, {
    headers: headers(),
  }).then(handleResponse);

export const upscaleImage = (resource_id) =>
  fetch(`${BASE}/api/imagegeneration/upscale`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ resource_id }),
  }).then(handleResponse);

export const zoomIn = (resource_id) =>
  fetch(`${BASE}/api/imagegeneration/zoom/in`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ resource_id }),
  }).then(handleResponse);

export const zoomOut = (resource_id) =>
  fetch(`${BASE}/api/imagegeneration/zoom/out`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ resource_id }),
  }).then(handleResponse);

// === IMAGE RECOGNITION ===
export const recognizeImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return fetch(`${BASE}/api/imagerecognition/recognize`, {
    method: 'POST',
    headers: { 'X-API-TOKEN': getToken() }, // без Content-Type!
    body: formData,
  }).then(handleResponse);
};