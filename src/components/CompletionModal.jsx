import React from 'react';
import { useCourse } from '../context/CourseContext';
import { LESSONS } from '../data/lessons';

const REAL_LESSONS = LESSONS.filter(l => l.steps && l.steps.length);

const PART_IMAGES = {
  1: "/assets/part-01-meet-computer.jpg",
  2: "/assets/part-02-know-computer.jpg",
  3: "/assets/part-03-meet-mouse.jpg",
  4: "/assets/part-04-master-mouse.jpg",
  5: "/assets/part-05-master-keyboard.jpg",
  6: "/assets/part-06-files-folders.jpg"
};

export default function CompletionModal({ lessonId, onClose, onNextLesson }) {
  const { state, goTo, isCertificateUnlocked } = useCourse();

  const currentL = REAL_LESSONS.find(l => l.id === lessonId);
  const partNum = (lessonId || '1.1').split('.')[0];
  const partImg = PART_IMAGES[partNum] || '/assets/part-01-meet-computer.jpg';

  const curIdx = REAL_LESSONS.findIndex(l => l.id === lessonId);
  const nextL = curIdx >= 0 && curIdx < REAL_LESSONS.length - 1 ? REAL_LESSONS[curIdx + 1] : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{
          border: '3px solid #14213d',
          boxShadow: '6px 9px 0 #14213d',
          borderRadius: '22px',
          overflow: 'hidden',
          padding: 0,
          maxWidth: '460px',
          width: '92%',
          background: '#fff'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: '100%', height: '145px', overflow: 'hidden', borderBottom: '2.5px solid #14213d', background: '#efece2' }}>
          <img
            src={partImg}
            alt={currentL?.title || 'Lesson Completed'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        <div style={{ padding: '22px' }}>
          <div style={{ fontSize: '38px', marginBottom: '4px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', margin: '0 0 6px', color: '#14213d' }}>
            बहुत बढ़िया, {state.user?.name || 'विद्यार्थी'}!
          </h2>
          <p style={{ color: 'var(--mut)', margin: '0 0 16px', fontSize: '15px' }}>
            आपने <b>{currentL?.id} {currentL?.title}</b> पूरा कर लिया है!
          </p>

          <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nextL ? (
              <button
                type="button"
                className="btn y"
                style={{
                  width: '100%',
                  fontSize: '16px',
                  fontWeight: 900,
                  border: '2px solid #14213d',
                  boxShadow: '2px 3px 0 #14213d',
                  borderRadius: '12px'
                }}
                onClick={onNextLesson}
              >
                👉 अगला Level शुरू करें: {nextL.id} ({nextL.title})
              </button>
            ) : (
              <>
                <div style={{ fontWeight: 800, color: '#1b7f5c', padding: '6px 0', fontSize: '15px' }}>
                  🏆 बधाई! आपने कोर्स के सभी 62 पाठ पूरे कर लिए हैं!
                </div>
                {isCertificateUnlocked ? (
                  <button
                    type="button"
                    className="btn y"
                    style={{
                      width: '100%',
                      fontSize: '16px',
                      fontWeight: 900,
                      background: '#facc15',
                      color: '#14213d',
                      border: '2.5px solid #14213d',
                      boxShadow: '3px 4px 0 #14213d',
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                    onClick={() => {
                      onClose();
                      goTo('certificate');
                    }}
                  >
                    🎓 अपना सर्टिफिकेट देखें (Claim Certificate)
                  </button>
                ) : (
                  <>
                    <div style={{
                      background: '#fffbeb',
                      border: '1.5px solid #f59e0b',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '13.5px',
                      color: '#92400e',
                      textAlign: 'left',
                      lineHeight: 1.45
                    }}>
                      💡 सारे पाठ पूरे हो गए हैं! सर्टिफिकेट अनलॉक करने के लिए बस <b>Practice Lab Assignment</b> पूरा करें।
                    </div>
                    <button
                      type="button"
                      className="btn"
                      style={{
                        width: '100%',
                        fontWeight: 900,
                        borderRadius: '12px',
                        background: '#1b7f5c',
                        color: '#fff',
                        border: '2px solid #14213d'
                      }}
                      onClick={() => {
                        onClose();
                        goTo('sim');
                      }}
                    >
                      🖥️ Practice Lab Assignment पूरा करें →
                    </button>
                  </>
                )}
              </>
            )}
            <button
              type="button"
              className="btn o"
              style={{
                width: '100%',
                border: '2px solid #14213d',
                borderRadius: '12px',
                fontWeight: 800
              }}
              onClick={() => {
                onClose();
                goTo('courseHome');
              }}
            >
              🏠 Course Home पर लौटें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
