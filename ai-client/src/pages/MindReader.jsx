import { useState, useRef } from 'react';
import { recognizeImage } from '../api';
import { parseApiError } from '../useErrorHandler';

export default function MindReader({ onUnauthorized }) {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [objects, setObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef(null);
  const [imgSize, setImgSize] = useState({ w: 1, h: 1 });

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setObjects([]);
    setError('');
    setImageUrl(URL.createObjectURL(f));
  };

  const recognize = async () => {
    if (!file || isLoading) return;
    setError('');
    setIsLoading(true);
    setObjects([]);
    try {
      const data = await recognizeImage(file);
      setObjects(data.objects || []);
    } catch (e) {
      setError(parseApiError(e, onUnauthorized));
    } finally {
      setIsLoading(false);
    }
  };

  const onImgLoad = () => {
    if (imgRef.current) {
      setImgSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <h1>MindReader 🧠</h1>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input type="file" accept="image/*" onChange={onFileChange} disabled={isLoading} />
        <button onClick={recognize} disabled={!file || isLoading}>
          {isLoading ? 'Анализ...' : 'Распознать'}
        </button>
      </div>

      {objects.length > 0 && (
        <p><strong>Найдено объектов: {objects.length}</strong></p>
      )}

      {imageUrl && (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <img ref={imgRef} src={imageUrl} alt="uploaded" onLoad={onImgLoad}
            style={{ width: '100%', display: 'block', borderRadius: 8 }} />

          {/* Bounding boxes */}
          {objects.map((obj, i) => {
            const rendered = imgRef.current;
            if (!rendered) return null;
            const scaleX = rendered.clientWidth / imgSize.w;
            const scaleY = rendered.clientHeight / imgSize.h;
            const { x, y, width, height } = obj.bounding_box;
            return (
              <div key={i} style={{
                position: 'absolute',
                left: x * scaleX, top: y * scaleY,
                width: width * scaleX, height: height * scaleY,
                border: '2px solid red',
                background: 'rgba(255,0,0,0.1)',
                boxSizing: 'border-box',
              }}>
                <span style={{
                  position: 'absolute', top: 0, left: 0,
                  background: 'red', color: '#fff',
                  fontSize: 11, padding: '1px 4px',
                }}>
                  {obj.name} ({Math.round(obj.probability * 100)}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}