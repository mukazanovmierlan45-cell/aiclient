import { Link } from 'react-router-dom';

const services = [
  { name: 'ChatterBlast', path: '/chatterblast', desc: 'Чат-бот с AI' },
  { name: 'DreamWeaver', path: '/dreamweaver', desc: 'Генератор изображений' },
  { name: 'MindReader', path: '/mindreader', desc: 'Распознавание объектов' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function Home() {
  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: 24, textAlign: 'left', width: '100%' }}>
      <h1>AI Services</h1>
      {services.map(s => (
        <Link
          key={s.path}
          to={s.path}
          style={{
            display: 'block',
            marginBottom: 16,
            fontSize: 18,
            color: 'var(--text-h)',
            textDecoration: 'none',
          }}
        >
          <strong>{s.name}</strong> — {s.desc}
        </Link>
      ))}
    </div>
  );
}