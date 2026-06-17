import { useState, useEffect, useRef } from 'react';
import { startConversation, continueConversation, getConversationResponse } from '../api';
import { parseApiError } from '../useErrorHandler';

export default function ChatterBlast({ onUnauthorized }) {
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]); // {role, text}
  const [isLoading, setIsLoading] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [error, setError] = useState('');
  const pollRef = useRef(null);
  const typeRef = useRef(null);

  const stopPolling = () => { clearInterval(pollRef.current); };

  const typewrite = (text) => {
    clearTimeout(typeRef.current);
    let i = 0;
    setDisplayedResponse('');
    const next = () => {
      if (i <= text.length) {
        setDisplayedResponse(text.slice(0, i));
        i++;
        typeRef.current = setTimeout(next, Math.random() * 18 + 2);
      }
    };
    next();
  };

  const pollResponse = (convId) => {
    pollRef.current = setInterval(async () => {
      try {
        const data = await getConversationResponse(convId);
        typewrite(data.response);
        if (data.is_final) {
          stopPolling();
          setIsLoading(false);
          setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
          setDisplayedResponse('');
        }
      } catch (e) {
        stopPolling();
        setIsLoading(false);
        setError(parseApiError(e, onUnauthorized));
      }
    }, 1000);
  };

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const prompt = input.trim();
    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setIsLoading(true);
    try {
      let data;
      if (!conversationId) {
        data = await startConversation(prompt);
        setConversationId(data.conversation_id);
        if (data.is_final) {
          setIsLoading(false);
          setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
        } else {
          pollResponse(data.conversation_id);
        }
      } else {
        data = await continueConversation(conversationId, prompt);
        if (data.is_final) {
          setIsLoading(false);
          setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
        } else {
          pollResponse(data.conversation_id);
        }
      }
    } catch (e) {
      setIsLoading(false);
      setError(parseApiError(e, onUnauthorized));
    }
  };

  const newChat = () => {
    stopPolling();
    setConversationId(null);
    setMessages([]);
    setDisplayedResponse('');
    setIsLoading(false);
    setError('');
  };

  useEffect(() => () => { stopPolling(); clearTimeout(typeRef.current); }, []);

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <h1>ChatterBlast 💬</h1>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, minHeight: 200, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8, textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <span style={{ background: m.role === 'user' ? '#007bff' : '#f0f0f0',
              color: m.role === 'user' ? '#fff' : '#000',
              padding: '6px 12px', borderRadius: 16, display: 'inline-block' }}>
              {m.text}
            </span>
          </div>
        ))}
        {isLoading && displayedResponse && (
          <div style={{ textAlign: 'left' }}>
            <span style={{ background: '#f0f0f0', padding: '6px 12px', borderRadius: 16, display: 'inline-block' }}>
              {displayedResponse}<span style={{ animation: 'blink 1s step-end infinite' }}>|</span>
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          disabled={isLoading}
          placeholder="Введите сообщение..."
          style={{ flex: 1, padding: 8 }} />
        <button onClick={() => setInput('')} disabled={isLoading}>✕</button>
        <button onClick={send} disabled={isLoading || !input.trim()}>Отправить</button>
        <button onClick={newChat}>Новый чат</button>
      </div>

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}