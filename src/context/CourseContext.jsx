import React, { createContext, useContext, useState, useEffect } from 'react';
import { LESSONS } from '../data/lessons';
import confetti from 'canvas-confetti';

const CourseContext = createContext(null);

const STORAGE_KEY = 'cs_app_v2';

const REAL_LESSONS = LESSONS.filter(l => l.steps && l.steps.length);

export function CourseProvider({ children }) {
  // Load state from localStorage or initialize defaults
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          user: parsed.user || null,
          done: parsed.done || {},
          coins: parsed.coins !== undefined ? parsed.coins : Object.keys(parsed.done || {}).length * 10,
          pos: parsed.pos || {},
          sim: parsed.sim || { folders: [] },
          assignAttempts: parsed.assignAttempts || {},
          labCompleted: parsed.labCompleted || false,
          certificateId: parsed.certificateId || null,
          quizStats: parsed.quizStats || { firstTry: 0, total: 0 },
          lastLesson: parsed.lastLesson || null
        };
      }
    } catch (e) {
      console.warn('Could not read state from localStorage', e);
    }
    return {
      user: null,
      done: {},
      coins: 0,
      pos: {},
      sim: { folders: [] },
      assignAttempts: {},
      labCompleted: false,
      certificateId: null,
      quizStats: { firstTry: 0, total: 0 },
      lastLesson: null
    };
  });

  const [currentView, setCurrentView] = useState(() => (state.user ? 'courseHome' : 'welcome'));
  const [activeLessonId, setActiveLessonId] = useState('1.1');
  const [toastMessage, setToastMessage] = useState(null);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [lang, setLang] = useState('hi'); // 'hi' or 'en'

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not write state to localStorage', e);
    }
  }, [state]);

  const showToast = (msg, duration = 2600) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, duration);
  };

  const playSuccessChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      o.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      g.gain.setValueAtTime(0.18, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      o.start();
      o.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  const playErrorBuzz = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(150, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.22);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.start();
      o.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  // Flag to unlock all levels for testing
  const UNLOCK_ALL_LEVELS_FOR_TESTING = false;

  const isLessonUnlocked = (id) => {
    if (UNLOCK_ALL_LEVELS_FOR_TESTING) return true;
    const idx = REAL_LESSONS.findIndex((l) => l.id === id);
    if (idx <= 0) return true; // First lesson is always unlocked
    const prev = REAL_LESSONS[idx - 1];
    return !!(state.done && state.done[prev.id]);
  };

  const awardCoins = (count, reason = '') => {
    setState((prev) => ({
      ...prev,
      coins: (prev.coins || 0) + count
    }));
    playSuccessChime();
    if (reason) {
      showToast(`🟡 +${count} Coins! ${reason}`);
    }
  };

  const goTo = (view, lessonId = null) => {
    if (view === 'lesson' && lessonId) {
      if (!isLessonUnlocked(lessonId)) {
        playErrorBuzz();
        const prevIdx = REAL_LESSONS.findIndex((l) => l.id === lessonId) - 1;
        const prevL = prevIdx >= 0 ? REAL_LESSONS[prevIdx] : null;
        const reqName = prevL ? `Level ${prevL.id} (${prevL.title})` : 'पिछला Level';
        showToast(`🔒 यह Level अभी लॉक है! पहले ${reqName} पूरा करें।`);
        return;
      }
      setActiveLessonId(lessonId);
      setState((prev) => ({ ...prev, lastLesson: lessonId }));
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const saveUser = (name, cls) => {
    setState((prev) => ({
      ...prev,
      user: { name, cls, start: new Date().toISOString() }
    }));
    setCurrentView('courseHome');
  };

  const markLessonDone = (lessonId, reflection = '') => {
    setState((prev) => {
      const alreadyDone = !!(prev.done && prev.done[lessonId]);
      const newDone = {
        ...(prev.done || {}),
        [lessonId]: {
          ...(prev.done && prev.done[lessonId] ? prev.done[lessonId] : {}),
          completed: true,
          completedAt: new Date().toISOString(),
          reflection: reflection || (prev.done && prev.done[lessonId] ? prev.done[lessonId].reflection : '')
        }
      };
      const addedCoins = alreadyDone ? 0 : 10;
      return {
        ...prev,
        done: newDone,
        coins: (prev.coins || 0) + addedCoins
      };
    });
    triggerConfetti();
  };

  const markAssignmentDone = (assignId = 'desktop_lab', stars = 3) => {
    setState((prev) => {
      const prevStars = prev.assignAttempts?.[assignId]?.stars || 0;
      const isAlreadyDone = !!prev.assignAttempts?.[assignId]?.completed;
      return {
        ...prev,
        labCompleted: true,
        coins: (prev.coins || 0) + (isAlreadyDone ? 0 : 25),
        assignAttempts: {
          ...(prev.assignAttempts || {}),
          [assignId]: {
            completed: true,
            stars: Math.max(stars, prevStars),
            completedAt: new Date().toISOString()
          }
        }
      };
    });
    playSuccessChime();
    triggerConfetti();
  };

  const updateUserName = (name) => {
    if (!name || !name.trim()) return;
    setState((prev) => ({
      ...prev,
      user: {
        ...(prev.user || {}),
        name: name.trim()
      }
    }));
    showToast('✅ नाम सुरक्षित हो गया!');
  };

  const totalLessonsCount = REAL_LESSONS.length;
  const doneLessonsCount = REAL_LESSONS.filter(l => state.done && state.done[l.id]).length;
  const isAllLessonsDone = doneLessonsCount >= totalLessonsCount && totalLessonsCount > 0;
  const isAssignmentDone = !!state.labCompleted || Object.values(state.assignAttempts || {}).some(a => a.completed || (a.stars && a.stars > 0));
  const isCertificateUnlocked = isAllLessonsDone && isAssignmentDone;

  const unlockAllForTesting = () => {
    const allDone = {};
    REAL_LESSONS.forEach((l) => {
      allDone[l.id] = {
        completed: true,
        completedAt: new Date().toISOString(),
        reflection: 'Completed in testing mode'
      };
    });
    setState((prev) => ({
      ...prev,
      done: allDone,
      labCompleted: true,
      assignAttempts: {
        desktop_lab: {
          completed: true,
          stars: 3,
          completedAt: new Date().toISOString()
        }
      },
      coins: (prev.coins || 0) + 620
    }));
    triggerConfetti();
    playSuccessChime();
    showToast('🎉 All 62 Levels & Assignment Done! Certificate Unlocked!');
  };

  const downloadProgress = () => {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress-${(state.user?.name || 'student').replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download progress error', e);
    }
  };

  const resetProgress = () => {
    if (window.confirm('क्या आप सारा progress reset करना चाहते हैं?')) {
      setState((prev) => ({
        ...prev,
        done: {},
        pos: {},
        coins: 0,
        sim: { folders: [] },
        assignAttempts: {},
        quizStats: { firstTry: 0, total: 0 },
        lastLesson: null
      }));
      goTo('courseHome');
    }
  };

  const logout = () => {
    if (window.confirm('Log out करें? इस device का progress मिट जाएगा।')) {
      localStorage.removeItem(STORAGE_KEY);
      setState({
        user: null,
        done: {},
        coins: 0,
        pos: {},
        sim: { folders: [] },
        assignAttempts: {},
        quizStats: { firstTry: 0, total: 0 },
        lastLesson: null
      });
      setCurrentView('welcome');
    }
  };

  const totalStars = Object.values(state.assignAttempts || {}).reduce((sum, a) => sum + (a.stars || 1), 0);

  return (
    <CourseContext.Provider
      value={{
        state,
        setState,
        currentView,
        activeLessonId,
        toastMessage,
        audioSpeed,
        setAudioSpeed,
        lang,
        setLang,
        totalStars,
        totalLessonsCount,
        doneLessonsCount,
        isAllLessonsDone,
        isAssignmentDone,
        isCertificateUnlocked,
        markAssignmentDone,
        updateUserName,
        unlockAllForTesting,
        showToast,
        goTo,
        saveUser,
        markLessonDone,
        awardCoins,
        isLessonUnlocked,
        playSuccessChime,
        playErrorBuzz,
        triggerConfetti,
        downloadProgress,
        resetProgress,
        logout
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}
