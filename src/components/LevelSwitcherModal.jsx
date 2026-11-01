import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import { LESSONS } from '../data/lessons';

const REAL_LESSONS = LESSONS.filter(l => l.steps && l.steps.length);

const PARTS = [
  { id: 1, name: "Part 01 — Meet the Computer" },
  { id: 2, name: "Part 02 — Know Your Computer" },
  { id: 3, name: "Part 03 — First Time Using Windows" },
  { id: 4, name: "Part 04 — Master the Mouse" },
  { id: 5, name: "Part 05 — Master the Keyboard" },
  { id: 6, name: "Part 06 — Files and Folders" },
  { id: 7, name: "Part 07 — Working with Documents" },
  { id: 8, name: "Part 08 — Internet and Web Browsing" },
  { id: 9, name: "Part 09 — Digital Safety and Responsible Use" },
  { id: 10, name: "Part 10 — Basic Computer Troubleshooting" }
];

export default function LevelSwitcherModal({ currentLessonId, onClose }) {
  const { state, isLessonUnlocked, goTo, playErrorBuzz, showToast } = useCourse();

  const currentL = REAL_LESSONS.find(l => l.id === currentLessonId) || REAL_LESSONS[0];
  const initialPartNum = parseInt((currentL.id || '1.1').split('.')[0], 10) || 1;
  const [activePart, setActivePart] = useState(initialPartNum);
  const [shakingId, setShakingId] = useState(null);

  const filteredLessons = REAL_LESSONS.filter(l => l.id.startsWith(activePart + '.'));

  const handleSelectLevel = (l) => {
    if (!isLessonUnlocked(l.id)) {
      setShakingId(l.id);
      playErrorBuzz();
      const prevIdx = REAL_LESSONS.findIndex(x => x.id === l.id) - 1;
      const prevL = prevIdx >= 0 ? REAL_LESSONS[prevIdx] : null;
      const reqName = prevL ? `Level ${prevL.id} (${prevL.title})` : 'पिछला Level';
      showToast(`🔒 यह Level अभी लॉक है! अनलॉक करने के लिए पहले ${reqName} पूरा करें।`);
      setTimeout(() => setShakingId(null), 500);
      return;
    }
    onClose();
    goTo('lesson', l.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card level-switcher-modal" onClick={(e) => e.stopPropagation()}>
        <div className="level-switcher-head">
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '20px', margin: '0 0 2px', color: '#fff' }}>🎯 Level चुनें (Select Level)</h2>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              वर्तमान: Lv. {currentL.id} — {currentL.title}
            </div>
          </div>
          <button
            type="button"
            id="closeSwitcher"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid #fff',
              color: '#fff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center'
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="level-switcher-tabs" id="switcherTabs">
          {PARTS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`level-tab-btn ${activePart === p.id ? 'active' : ''}`}
              onClick={() => setActivePart(p.id)}
            >
              Part 0{p.id}
            </button>
          ))}
        </div>

        <div className="level-switcher-list" id="switcherList">
          {filteredLessons.map((l) => {
            const isDone = !!(state.done && state.done[l.id]);
            const isCurrent = l.id === currentLessonId;
            const isUnlocked = isLessonUnlocked(l.id);

            let badgeHtml;
            if (isCurrent) {
              badgeHtml = <span className="part-badge" style={{ background: '#facc15', color: '#14213d', border: '1.5px solid #14213d' }}>📍 Current</span>;
            } else if (isDone) {
              badgeHtml = <span className="part-badge done">✅ पूरा हुआ</span>;
            } else if (isUnlocked) {
              badgeHtml = <span className="part-badge" style={{ background: '#0284c7', color: '#fff' }}>👉 अनलॉक</span>;
            } else {
              badgeHtml = <span className="part-badge locked-badge">🔒 लॉक</span>;
            }

            return (
              <div
                key={l.id}
                className={`level-switch-item ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''} ${!isUnlocked ? 'locked' : ''} ${shakingId === l.id ? 'shake' : ''}`}
                onClick={() => handleSelectLevel(l)}
              >
                <div className="level-switch-num">
                  {isDone ? '✓' : (!isUnlocked ? '🔒' : `Lv.${l.id}`)}
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '15px', color: '#14213d' }}>{l.title}</b>
                  <small style={{ display: 'block', color: 'var(--mut)', marginTop: '2px' }}>
                    {l.sub} · ~{l.min} मिनट
                  </small>
                </div>
                {badgeHtml}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
