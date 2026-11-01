import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import Illustration from './Illustration';

export default function QuizStep({ step, onComplete }) {
  const { awardCoins, playSuccessChime, playErrorBuzz, triggerConfetti } = useCourse();

  const qs = step.qs || [];
  const [results, setResults] = useState(() => {
    const init = {};
    qs.forEach((_, idx) => {
      init[idx] = { attempts: 0, pick: [], isCorrect: false };
    });
    return init;
  });

  const [queue, setQueue] = useState(() => qs.map((_, idx) => idx));
  const [queueIndex, setQueueIndex] = useState(0);
  const [selectedPicks, setSelectedPicks] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  if (qs.length === 0) {
    onComplete();
    return null;
  }

  const qIdx = queue[queueIndex];
  const q = qs[qIdx];
  const isMulti = q && q.a && q.a.length > 1;
  const isRetry = results[qIdx] && results[qIdx].attempts > 0;

  const handlePick = (oi) => {
    if (submitted) return;
    if (isMulti) {
      setSelectedPicks((prev) => {
        const next = new Set(prev);
        if (next.has(oi)) next.delete(oi);
        else next.add(oi);
        return next;
      });
    } else {
      submitAnswer([oi]);
    }
  };

  const submitAnswer = (chosen) => {
    setSubmitted(true);
    const isRight = chosen.length === q.a.length && chosen.every((x) => q.a.includes(x));

    setResults((prev) => ({
      ...prev,
      [qIdx]: {
        attempts: (prev[qIdx]?.attempts || 0) + 1,
        pick: chosen,
        isCorrect: isRight
      }
    }));

    if (isRight) {
      playSuccessChime();
      setFeedback({ ok: true, text: '✅ उत्तर दर्ज हो गया!' });
    } else {
      playErrorBuzz();
      setFeedback({ ok: false, text: '❌ उत्तर दर्ज हो गया।' });
    }

    setTimeout(() => {
      setSubmitted(false);
      setFeedback(null);
      setSelectedPicks(new Set());

      if (queueIndex + 1 < queue.length) {
        setQueueIndex((prev) => prev + 1);
      } else {
        // Evaluate completion
        setIsFinished(true);
      }
    }, 550);
  };

  // When finished, evaluate rewards and retry queue
  if (isFinished) {
    const incorrectIndices = queue.filter((idx) => !results[idx]?.isCorrect);
    const allCorrect = incorrectIndices.length === 0;

    if (allCorrect) {
      let firstTryCount = 0;
      let totalCoins = 0;
      qs.forEach((_, idx) => {
        const att = results[idx]?.attempts || 1;
        if (att === 1) {
          firstTryCount++;
          totalCoins += 5; // 5 coins for first attempt
        } else if (att === 2) {
          totalCoins += 1; // 1 coin for retry
        }
      });
      const isPerfect = firstTryCount === qs.length;
      if (isPerfect) totalCoins += 5; // +5 bonus for 100% first try

      triggerConfetti();

      return (
        <div className="quiz-container quiz-results-card" style={{ borderColor: '#15803d', padding: '28px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', margin: '0 0 6px', color: '#14213d' }}>शानदार! सारे उत्तर सही हैं!</h2>
          <p style={{ color: '#15803d', fontSize: '18px', fontWeight: 900, margin: '0 0 6px' }}>
            +{totalCoins} 🟡 सिक्के मिले!
          </p>
          <p style={{ color: 'var(--mut)', fontSize: '14px', fontWeight: 700, margin: '0 0 20px' }}>
            {isPerfect
              ? '🎯 सारे प्रश्न पहले प्रयास में सही (+5 Bonus)!'
              : `${firstTryCount} / ${qs.length} पहले प्रयास में सही (Reattempt पर 1 सिक्का मिला)`}
          </p>
          <button
            type="button"
            className="btn y"
            style={{
              width: '100%',
              fontSize: '17px',
              fontWeight: 900,
              padding: '13px',
              border: '2.5px solid #14213d',
              boxShadow: '3px 4px 0 #14213d',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
            onClick={() => {
              awardCoins(totalCoins);
              onComplete();
            }}
          >
            👉 अगला कदम (Next Step) →
          </button>
        </div>
      );
    }

    // Some answers incorrect - show encouraging card
    const correctCount = queue.length - incorrectIndices.length;
    return (
      <div className="quiz-container quiz-results-card" style={{ borderColor: '#ef4444', padding: '26px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '46px', marginBottom: '8px' }}>💪</div>
        <h2 style={{ fontSize: '22px', margin: '0 0 6px', color: '#14213d' }}>अच्छा प्रयास!</h2>
        <p style={{ color: 'var(--mut)', fontSize: '15px', margin: '0 0 18px' }}>
          आपने <b>{correctCount} / {queue.length}</b> सही किए। जो गलत हुए, उन्हें दोबारा हल करें!
        </p>
        <button
          type="button"
          className="btn y"
          style={{
            width: '100%',
            fontSize: '16px',
            fontWeight: 900,
            padding: '12px',
            border: '2.5px solid #14213d',
            boxShadow: '3px 4px 0 #14213d',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
          onClick={() => {
            setQueue(incorrectIndices);
            setQueueIndex(0);
            setIsFinished(false);
          }}
        >
          🔄 गलत प्रश्न दोबारा हल करें ({incorrectIndices.length}) →
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{step.h || 'Knowledge Check'}</h2>
        <div className="quiz-progress-pill">
          <span>प्रश्न {queueIndex + 1} / {queue.length}</span>
          {isRetry && (
            <span className="attempt-tag" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }}>
              ⚠️ Retry
            </span>
          )}
        </div>
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${Math.round((queueIndex / queue.length) * 100)}%` }}
        />
      </div>

      <div className="qq quiz-card">
        <div className="quiz-question-title">
          <span className="q-num-badge">{qIdx + 1}</span>
          <b>{q.q}</b>
        </div>

        {isMulti && (
          <div className="cmp" style={{ margin: '4px 0 10px', fontSize: '13px' }}>
            💡 एक से अधिक उत्तर सही हो सकते हैं
          </div>
        )}

        <div className="quiz-options-list">
          {q.o.map((rawOpt, oi) => {
            const opt = typeof rawOpt === 'string' ? { l: rawOpt } : rawOpt;
            const isSelected = isMulti ? selectedPicks.has(oi) : false;
            const isOk = submitted && q.a.includes(oi);
            const isNo = submitted && !q.a.includes(oi) && selectedPicks.has(oi);

            return (
              <button
                key={oi}
                type="button"
                className={`opt ${opt.i ? 'wi' : ''} ${isSelected ? 'sel' : ''} ${isOk ? 'ok' : ''} ${isNo ? 'no' : ''}`}
                disabled={submitted}
                onClick={() => handlePick(oi)}
              >
                {opt.i && (
                  <Illustration name={opt.i} className="ill-img" alt={opt.l} />
                )}
                <span>
                  <b>{opt.l}</b>
                  {opt.d && <small>{opt.d}</small>}
                </span>
              </button>
            );
          })}
        </div>

        {isMulti && (
          <button
            type="button"
            className="btn y"
            style={{
              marginTop: '14px',
              width: '100%',
              fontSize: '16px',
              fontWeight: 900,
              border: '2.5px solid #14213d',
              boxShadow: '3px 4px 0 #14213d',
              borderRadius: '12px'
            }}
            onClick={() => {
              if (selectedPicks.size === 0) {
                setFeedback({ ok: false, text: '⚠️ कृपया कम से कम एक विकल्प चुनें!' });
                return;
              }
              submitAnswer([...selectedPicks]);
            }}
          >
            उत्तर सबमिट करें →
          </button>
        )}

        {feedback && (
          <div
            style={{
              color: feedback.ok ? '#15803d' : '#dc2626',
              fontWeight: 900,
              marginTop: '10px',
              fontSize: '15px'
            }}
          >
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}
