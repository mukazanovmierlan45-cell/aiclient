import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import ChatterBlast from './pages/ChatterBlast';
import DreamWeaver from './pages/DreamWeaver';
import MindReader from './pages/MindReader';
import ApiTokenModal from './components/ApiTokenModal';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('api_token') || '');
  const [showModal, setShowModal] = useState(!token);

  const saveToken = (t) => {
    localStorage.setItem('api_token', t);
    setToken(t);
    setShowModal(false);
  };

  return (
    <BrowserRouter>
      {showModal && <ApiTokenModal onSave={saveToken} />}
      <main style={{ flex: 1, width: '100%' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chatterblast" element={<ChatterBlast onUnauthorized={() => setShowModal(true)} />} />
        <Route path="/dreamweaver" element={<DreamWeaver onUnauthorized={() => setShowModal(true)} />} />
        <Route path="/mindreader" element={<MindReader onUnauthorized={() => setShowModal(true)} />} />
      </Routes>
      </main>
    </BrowserRouter>
  );
}