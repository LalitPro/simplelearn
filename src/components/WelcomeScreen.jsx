import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';

export default function WelcomeScreen() {
  const { saveUser } = useCourse();
  const [name, setName] = useState('');
  const [cls, setCls] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || !cls) {
      setError('कृपया अपना नाम लिखें और अपनी कक्षा चुनें।');
      return;
    }
    setError('');
    saveUser(trimmedName, cls);
  };

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '16px' }}>
      <div className="welcome-wrap">
        <div className="welcome-hero-card" style={{ padding: '28px 22px', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🖥️</div>
          <div className="welcome-hero-body" style={{ padding: 0 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: '26px' }}>कंप्यूटर सीखो — बिल्कुल शुरू से</h1>
            <p style={{ margin: 0, color: 'var(--mut)', fontSize: '15px' }}>
              Basic Computer Course · हिंदी में · अपनी रफ़्तार से
            </p>
          </div>
        </div>

        <div className="card" style={{ border: '2.5px solid #14213d', borderRadius: '20px', boxShadow: '4px 6px 0 #14213d', padding: '24px' }}>
          <form onSubmit={handleSubmit}>
            <label htmlFor="nm" style={{ display: 'block', fontWeight: 800, marginBottom: '6px' }}>तुम्हारा नाम</label>
            <input
              id="nm"
              type="text"
              autoComplete="off"
              value={name}
              placeholder="जैसे: Rahul Sharma"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #14213d',
                borderRadius: '10px',
                fontSize: '16px',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="cl" style={{ display: 'block', fontWeight: 800, marginBottom: '6px' }}>तुम्हारी कक्षा</label>
            <select
              id="cl"
              value={cls}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #14213d',
                borderRadius: '10px',
                fontSize: '16px',
                marginBottom: '16px',
                boxSizing: 'border-box',
                background: '#fff'
              }}
              onChange={(e) => setCls(e.target.value)}
            >
              <option value="">कक्षा चुनो…</option>
              {[6, 7, 8, 9, 10, 11, 12].map((c) => (
                <option key={c} value={c}>कक्षा {c}</option>
              ))}
            </select>

            {error && (
              <div style={{ color: '#dc2626', fontWeight: 800, marginBottom: '14px', fontSize: '14px' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn y"
              style={{
                width: '100%',
                fontSize: '17px',
                fontWeight: 900,
                padding: '12px',
                border: '2.5px solid #14213d',
                boxShadow: '3px 4px 0 #14213d',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              कोर्स शुरू करें →
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
