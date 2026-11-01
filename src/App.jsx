import React from 'react';
import { useCourse } from './context/CourseContext';
import WelcomeScreen from './components/WelcomeScreen';
import CourseHome from './components/CourseHome';
import LessonPlayer from './components/LessonPlayer';
import WindowsSimulator from './components/WindowsSimulator';
import CertificateView from './components/CertificateView';
import './styles/app.css';

export default function App() {
  const { currentView, activeLessonId, toastMessage } = useCourse();

  return (
    <div className="app-root">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div id="lockToast">
          {toastMessage}
        </div>
      )}

      {/* Screen Router */}
      {currentView === 'welcome' && <WelcomeScreen />}
      {currentView === 'courseHome' && <CourseHome />}
      {currentView === 'lesson' && <LessonPlayer lessonId={activeLessonId} />}
      {currentView === 'certificate' && <CertificateView />}
      {currentView === 'sim' && (
        <main style={{ maxWidth: '980px', margin: '20px auto', padding: '16px' }}>
          <WindowsSimulator isStandalone={true} />
        </main>
      )}
    </div>
  );
}
