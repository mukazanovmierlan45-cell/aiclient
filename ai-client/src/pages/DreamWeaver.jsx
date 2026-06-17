import { useState, useEffect, useRef } from 'react';
import { generateImage, getJobStatus, getJobResult, upscaleImage, zoomIn, zoomOut } from '../api';
import { parseApiError } from '../useErrorHandler';

export default function DreamWeaver({ onUnauthorized }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [finalUrl, setFinalUrl] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const stopPolling = () => clearInterval(pollRef.current);

  const generate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setError('');
    setIsGenerating(true);
    setProgress(0);
    setPreviewUrl('');
    setFinalUrl('');
    setResourceId('');
    try {
      const { job_id } = await generateImage(prompt.trim());
      pollRef.current = setInterval(async () => {
        try {
          const status = await getJobStatus(job_id);
          setProgress(status.progress);
          if (status.image_url) setPreviewUrl(status.image_url);
          if (status.status === 'finished') {
            stopPolling();
            const result = await getJobResult(job_id);
            setFinalUrl(result.image_url);
            setResourceId(result.resource_id);
            setIsGenerating(false);
          }
        } catch (e) {
          stopPolling();
          setIsGenerating(false);
          setError(parseApiError(e, onUnauthorized));
        }
      }, 2000);
    } catch (e) {
      setIsGenerating(false);
      setError(parseApiError(e, onUnauthorized));
    }
  };

  const doAction = async (action) => {
    if (!resourceId) return;
    setError('');
    setIsGenerating(true);
    setProgress(0);
    setPreviewUrl('');
    setFinalUrl('');
    try {
      const { job_id } = await action(resourceId);
      pollRef.current = setInterval(async () => {
        try {
          const status = await getJobStatus(job_id);
          setProgress(status.progress);
          if (status.image_url) setPreviewUrl(status.image_url);
          if (status.status === 'finished') {
            stopPolling();
            const result = await getJobResult(job_id);
            setFinalUrl(result.image_url);
            setResourceId(result.resource_id);
            setIsGenerating(false);
          }
        } catch (e) {
          stopPolling();
          setIsGenerating(false);
          setError(parseApiError(e, onUnauthorized));
        }
      }, 2000);
    } catch (e) {
      setIsGenerating(false);
      setError(parseApiError(e, onUnauthorized));
    }
  };

  const saveImage = () => {
    if (!finalUrl) return;
    const a = document.createElement('a');
    a.href = finalUrl;
    a.download = 'generated.jpg';
    a.click();
  };

  useEffect(() => () => stopPolling(), []);

  const shownUrl = finalUrl || previewUrl;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <h1>DreamWeaver 🎨</h1>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={prompt} onChange={e => setPrompt(e.target.value)}
          disabled={isGenerating}
          placeholder="Описание изображения..."
          style={{ flex: 1, padding: 8 }} />
        <button onClick={() => setPrompt('')} disabled={isGenerating}>✕</button>
        <button onClick={generate} disabled={isGenerating || !prompt.trim()}>
          {isGenerating ? 'Генерация...' : 'Создать'}
        </button>
      </div>

      {isGenerating && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ background: '#eee', borderRadius: 4, height: 20, overflow: 'hidden' }}>
            <div style={{ background: '#007bff', width: `${progress}%`, height: '100%', transition: 'width 0.5s' }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>{progress}%</div>
        </div>
      )}

      {shownUrl && (
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <img src={shownUrl} alt="generated"
            style={{ width: '100%', opacity: finalUrl ? 1 : 0.6, transition: 'opacity 1s', borderRadius: 8 }} />
        </div>
      )}

      {resourceId && !isGenerating && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={saveImage}>💾 Сохранить</button>
          <button onClick={() => doAction(upscaleImage)}>⬆ Upscale</button>
          <button onClick={() => doAction(zoomIn)}>🔍+ Zoom In</button>
          <button onClick={() => doAction(zoomOut)}>🔍− Zoom Out</button>
        </div>
      )}
    </div>
  );
}