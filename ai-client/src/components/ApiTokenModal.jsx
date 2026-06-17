// src/components/ApiTokenModal.jsx
import { useState } from 'react';

export default function ApiTokenModal({ onSave }) {
  const [value, setValue] = useState('');
  return (
    <div style={overlay}>
      <div style={box}>
        <h2 style={{ color: '#111', marginTop: 0 }}>Введите API токен</h2>
        <p style={{ color: '#444' }}>Токен можно получить в admin-панели. Он сохранится в браузере.</p>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Ваш API токен"
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />
        <button onClick={() => onSave(value)} disabled={!value.trim()}>
          Сохранить
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};
const box = {
  background: '#fff',
  color: '#111',
  padding: 32,
  borderRadius: 8,
  minWidth: 340,
  maxWidth: 480,
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  textAlign: 'left',
};