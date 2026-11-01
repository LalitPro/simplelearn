import React, { useState, useEffect, useRef } from 'react';
import { useCourse } from '../context/CourseContext';
import { LESSONS } from '../data/lessons';
import Header from './Header';
import Illustration from './Illustration';
import QuizStep from './QuizStep';
import WindowsSimulator from './WindowsSimulator';
import LevelSwitcherModal from './LevelSwitcherModal';
import CompletionModal from './CompletionModal';

const REAL_LESSONS = LESSONS.filter(l => l.steps && l.steps.length);

export default function LessonPlayer({ lessonId }) {
  const {
    state,
    markLessonDone,
    audioSpeed,
    playSuccessChime,
    goTo
  } = useCourse();

  const lesson = REAL_LESSONS.find(l => l.id === lessonId) || REAL_LESSONS[0];
  const steps = lesson.steps || [];

  const [stepIndex, setStepIndex] = useState(0);
  const [stepDone, setStepDone] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [showLevelSwitcher, setShowLevelSwitcher] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [reflectionText, setReflectionText] = useState(() => (state.done?.[lesson.id]?.reflection || ''));

  const audioRef = useRef(null);
  const curStep = steps[stepIndex] || steps[0];

  // Speech timing for karaoke
  const speechText = (curStep.s || '').replace(/^\[[^\]]+\]\s*/, '');
  const speechWords = speechText ? speechText.split(/\s+/) : [];

  // Reset or setup audio on step change
  useEffect(() => {
    setStepDone(false);
    setActiveWordIdx(-1);
    setIsPlayingAudio(false);

    // Audio file path
    const audioPath = `/audio/${lesson.id}-${stepIndex + 1}.mp3`;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = audioPath;
      audioRef.current.playbackRate = audioSpeed;

      // Try autoplaying audio
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {
        // Autoplay blocked by browser policy, user can tap play button
        setIsPlayingAudio(false);
      });
    }

    // Auto mark non-interactive steps done after a few seconds or when audio completes
    const isInteractive = ['q', 'sim_task', 'clk', 'dd', 'scr', 'typ'].includes(curStep.t);
    if (!isInteractive) {
      const timer = setTimeout(() => {
        setStepDone(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [stepIndex, lesson.id]);

  // Adjust playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioSpeed;
    }
  }, [audioSpeed]);

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current || speechWords.length === 0) return;
    const dur = audioRef.current.duration;
    const cur = audioRef.current.currentTime;
    if (dur && dur > 0) {
      const idx = Math.min(speechWords.length - 1, Math.floor((cur / dur) * speechWords.length));
      setActiveWordIdx(idx);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    setActiveWordIdx(-1);
    setStepDone(true);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {});
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      setIsPlayingAudio(true);
    }).catch(() => {});
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      // Finished all steps of lesson
      markLessonDone(lesson.id, reflectionText);
      setShowCompletion(true);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="lesson-page-wrapper">
      {/* Hidden HTML5 Audio Element for Local Audio Playback */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        onError={() => setIsPlayingAudio(false)}
      />

      {/* Lesson Header Navigation */}
      <Header
        lesson={lesson}
        currentStepIndex={stepIndex}
        totalSteps={steps.length}
        onPrevStep={prevStep}
        onNextStep={nextStep}
        onRestartStep={restartAudio}
        isPlayingAudio={isPlayingAudio}
        onToggleAudio={toggleAudio}
        onOpenLevelSwitcher={() => setShowLevelSwitcher(true)}
      />

      {/* Main Step Card Container */}
      <main className="stage" id="stepCard" style={{ maxWidth: '840px', margin: '20px auto 40px', padding: '24px 28px' }}>
        {/* Step 1: Text and Illustration Step */}
        {curStep.t === 't' && (
          <div className="step-activity-box">
            {curStep.i ? (
              <div className="ill">
                <Illustration name={curStep.i} className="ill-img" alt={curStep.h || 'illustration'} />
              </div>
            ) : null}
            {curStep.h && <h2>{curStep.h}</h2>}
            {curStep.p && <p style={{ fontSize: '18.5px', lineHeight: 1.65, fontWeight: 500, color: '#14213d' }}>{curStep.p}</p>}
            {curStep.b && <p className="big">{curStep.b}</p>}
            {curStep.l && (
              <ul style={{ fontSize: '17.5px', lineHeight: 1.65, fontWeight: 500, color: '#1f2937', paddingLeft: '22px' }}>
                {curStep.l.map((pt, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{pt}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step 2: Gallery Step */}
        {curStep.t === 'g' && (
          <div className="step-activity-box">
            {curStep.h && <h2>{curStep.h}</h2>}
            <div className="gal">
              {(curStep.it || []).map((item, idx) => (
                <figure key={idx}>
                  <Illustration name={item.i} className="ill-img" alt={item.l} />
                  <figcaption style={{ fontWeight: 800, marginTop: '4px' }}>{item.l}</figcaption>
                </figure>
              ))}
            </div>
            {curStep.l && (
              <ul style={{ fontSize: '17px', lineHeight: 1.55, fontWeight: 500, color: '#1f2937', paddingLeft: '20px' }}>
                {curStep.l.map((pt, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{pt}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step 3: Table Step with crisp 38px .ti icons */}
        {curStep.t === 'tb' && (
          <div className="step-activity-box">
            {curStep.h && <h2>{curStep.h}</h2>}
            {curStep.p && <p style={{ fontSize: '17.5px', fontWeight: 500, color: '#14213d', marginBottom: '14px', lineHeight: 1.6 }}>{curStep.p}</p>}
            <div style={{ overflowX: 'auto', margin: '14px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {(curStep.rows || []).map((r, k) => (
                    <tr key={k}>
                      {r.map((x, c) => (
                        k ? (
                          <td key={c} style={{ border: '1px solid var(--line)', padding: '10px 12px', verticalAlign: 'middle' }}>
                            {c === 0 && curStep.ic && curStep.ic[k - 1] && (
                              <span className="ti">
                                <Illustration name={curStep.ic[k - 1]} alt={x} />
                              </span>
                            )}
                            <b>{x}</b>
                          </td>
                        ) : (
                          <th key={c} style={{ border: '1px solid var(--line)', padding: '10px 12px', background: '#efece2', textAlign: 'left' }}>
                            {x}
                          </th>
                        )
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 4: Quiz / Knowledge Check Step */}
        {curStep.t === 'q' && (
          <div className="step-activity-box">
            <QuizStep
              key={stepIndex}
              step={curStep}
              onComplete={() => {
                setStepDone(true);
                nextStep();
              }}
            />
          </div>
        )}

        {/* Step 5: Simulator Task Step */}
        {curStep.t === 'sim_task' && (
          <div className="step-activity-box">
            <WindowsSimulator
              taskConfig={curStep}
              onTaskComplete={() => setStepDone(true)}
            />
          </div>
        )}

        {/* Step 6: End / Reflection Step */}
        {curStep.t === 'end' && (
          <div className="step-activity-box">
            <div className="ill">
              <Illustration name="desktop" className="ill-img" alt="desktop" />
            </div>
            <h2>आज तुमने क्या सीखा?</h2>
            {curStep.l && (
              <ul style={{ fontSize: '17.5px', lineHeight: 1.65, fontWeight: 500, color: '#1f2937', paddingLeft: '22px' }}>
                {curStep.l.map((pt, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{pt}</li>
                ))}
              </ul>
            )}
            {curStep.r && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '17.5px', fontWeight: 500, color: '#14213d' }}><b>Final reflection:</b> {curStep.r}</p>
                <textarea
                  rows="3"
                  value={reflectionText}
                  placeholder="अपना जवाब यहाँ लिखो…"
                  style={{ width: '100%', padding: '10px', border: '2px solid var(--line)', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                  onChange={(e) => setReflectionText(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Karaoke Voice Narration Bubble */}
        {speechWords.length > 0 && (
          <div className="karaoke-card" style={{ marginTop: '16px' }}>
            {speechWords.map((word, idx) => (
              <span
                key={idx}
                className={`k-word ${idx === activeWordIdx ? 'lit' : ''}`}
                style={{
                  display: 'inline-block',
                  marginRight: '6px',
                  transition: 'color .15s ease, background .15s ease',
                  background: idx === activeWordIdx ? '#facc15' : 'transparent',
                  padding: '1px 3px',
                  borderRadius: '4px'
                }}
              >
                {word}
              </span>
            ))}
          </div>
        )}

        {/* Floating Round Next Button (popping & ready) */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            type="button"
            className={`round-next-btn ${stepDone ? 'ready' : ''}`}
            title="आगे बढ़ो (Next Step)"
            onClick={nextStep}
          >
            ›
          </button>
        </div>
      </main>

      {/* Level Switcher Modal */}
      {showLevelSwitcher && (
        <LevelSwitcherModal
          currentLessonId={lesson.id}
          onClose={() => setShowLevelSwitcher(false)}
        />
      )}

      {/* Lesson Completion Modal */}
      {showCompletion && (
        <CompletionModal
          lessonId={lesson.id}
          onClose={() => setShowCompletion(false)}
          onNextLesson={() => {
            setShowCompletion(false);
            const curIdx = REAL_LESSONS.findIndex(l => l.id === lesson.id);
            if (curIdx >= 0 && curIdx < REAL_LESSONS.length - 1) {
              const nextId = REAL_LESSONS[curIdx + 1].id;
              goTo('lesson', nextId);
              setStepIndex(0);
            } else {
              goTo('courseHome');
            }
          }}
        />
      )}
    </div>
  );
}
