import React from 'react';
import { useCourse } from '../context/CourseContext';

export default function Header({
  lesson,
  currentStepIndex,
  totalSteps,
  onPrevStep,
  onNextStep,
  onRestartStep,
  isPlayingAudio,
  onToggleAudio,
  onOpenLevelSwitcher
}) {
  const { state, goTo, audioSpeed, setAudioSpeed, lang, setLang } = useCourse();

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 0.85];
    const nextIdx = (speeds.indexOf(audioSpeed) + 1) % speeds.length;
    setAudioSpeed(speeds[nextIdx]);
  };

  const progressPct = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0;

  return (
    <header className="lesson-top-header">
      <div className="player-top-row">
        <div className="top-nav-cluster">
          <button
            type="button"
            className="round-icon-btn"
            title="Course Home"
            onClick={() => goTo('courseHome')}
          >
            🏠
          </button>
          <button
            type="button"
            className="lang-toggle-btn"
            title="भाषा बदलें (Change Language)"
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
          >
            🌐 {lang === 'hi' ? 'अ/A' : 'A/अ'}
          </button>
          <div className="coins-badge-btn" title="सिक्के (Coins)">
            <span>🟡</span>
            <b>{state.coins || 0}</b>
          </div>
          <button
            type="button"
            className="round-icon-btn nav-arrow"
            title="पिछला कदम (Previous Step)"
            disabled={currentStepIndex <= 0}
            onClick={onPrevStep}
          >
            ‹
          </button>
        </div>

        <div className="media-ctrls-cluster">
          <button
            type="button"
            className="media-pill-btn"
            title="पुनः सुनें (Restart Audio)"
            onClick={onRestartStep}
          >
            ↺
          </button>
          <button
            type="button"
            className="media-pill-btn"
            title="पिछला कदम"
            disabled={currentStepIndex <= 0}
            onClick={onPrevStep}
          >
            &lt;
          </button>
          <button
            type="button"
            className="media-pill-btn play-pause-btn"
            title={isPlayingAudio ? 'रोकें (Pause Audio)' : 'सुनें (Play Audio)'}
            onClick={onToggleAudio}
          >
            {isPlayingAudio ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            className="media-pill-btn"
            title="अगला कदम"
            disabled={currentStepIndex >= totalSteps - 1}
            onClick={onNextStep}
          >
            &gt;
          </button>
          <button
            type="button"
            className="media-pill-btn speed-btn"
            title="ध्वनि गति (Playback Speed)"
            onClick={cycleSpeed}
          >
            {audioSpeed}x
          </button>
        </div>
      </div>

      <div className="player-progress-row">
        <div
          className="level-badge-btn"
          title="Level बदलें (Switch Level)"
          onClick={onOpenLevelSwitcher}
        >
          Lv. {lesson?.id || '1.1'} ▾
        </div>
        <div className="striped-bar-container" title={`Step ${currentStepIndex + 1} of ${totalSteps}`}>
          <div
            className="striped-bar-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </header>
  );
}
