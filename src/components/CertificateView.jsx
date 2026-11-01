import React, { useState, useRef } from 'react';
import { useCourse } from '../context/CourseContext';
import { LESSONS } from '../data/lessons';

const REAL_LESSONS = LESSONS.filter(l => l.steps && l.steps.length);

export default function CertificateView() {
  const {
    state,
    goTo,
    updateUserName,
    unlockAllForTesting,
    showToast,
    totalStars
  } = useCourse();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(() => state.user?.name || 'Learner');
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef(null);

  // Verification requirements
  const totalLessonsCount = REAL_LESSONS.length;
  const doneLessonsCount = REAL_LESSONS.filter(l => state.done && state.done[l.id]).length;
  const isAllLessonsDone = doneLessonsCount >= totalLessonsCount && totalLessonsCount > 0;
  const isAssignmentDone = !!state.labCompleted || Object.values(state.assignAttempts || {}).some(a => a.completed || (a.stars && a.stars > 0));
  const isUnlocked = isAllLessonsDone && isAssignmentDone;

  const nextLesson = REAL_LESSONS.find(l => !state.done || !state.done[l.id]);

  // Certificate metadata
  const studentName = state.user?.name || 'Learner';
  const rawCertId = state.certificateId || `SLC-2026-${(studentName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4) || 'VALU').toUpperCase()}-${Math.abs((studentName + '2026').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString().slice(0, 4)}`;
  
  // Format issue date
  const issueDate = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const issueDateEn = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      updateUserName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    try {
      navigator.clipboard.writeText(rawCertId);
      showToast(`📋 Certificate ID कॉपी हो गया: ${rawCertId}`);
    } catch (e) {
      showToast(`Certificate ID: ${rawCertId}`);
    }
  };

  // High-Resolution PNG Generator using Canvas
  const handleDownloadPNG = () => {
    setIsDownloading(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = 1920;
      const H = 1280;
      canvas.width = W;
      canvas.height = H;

      // Background Parchment Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.5, '#fffdf9');
      bgGrad.addColorStop(1, '#fbf7ee');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Outer Navy Border
      ctx.strokeStyle = '#14213d';
      ctx.lineWidth = 16;
      ctx.strokeRect(36, 36, W - 72, H - 72);

      // Inner Gold Border
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.strokeRect(56, 56, W - 112, H - 112);

      // Thin Inner Navy Guide
      ctx.strokeStyle = '#14213d';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(66, 66, W - 132, H - 132);

      // Corner Ornaments
      const drawCorner = (x, y, flipX, flipY) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.lineTo(0, 0);
        ctx.lineTo(40, 0);
        ctx.stroke();

        ctx.fillStyle = '#14213d';
        ctx.beginPath();
        ctx.arc(14, 14, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawCorner(76, 76, false, false);
      drawCorner(W - 76, 76, true, false);
      drawCorner(76, H - 76, false, true);
      drawCorner(W - 76, H - 76, true, true);

      // Watermark Emblem in Background
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = '#14213d';
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 280, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Top Organization Title
      ctx.fillStyle = '#14213d';
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '6px';
      ctx.fillText('SIMPLELEARN COMPUTER ACADEMY', W / 2, 140);

      ctx.fillStyle = '#b45309';
      ctx.font = '700 18px sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('NATIONAL DIGITAL LITERACY & COMPUTER EMPOWERMENT PROGRAM', W / 2, 175);

      // Ribbon Title
      ctx.fillStyle = '#14213d';
      ctx.fillRect(W / 2 - 340, 210, 680, 52);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('CERTIFICATE OF COMPLETION & MASTERY', W / 2, 245);

      // Hindi Subtitle
      ctx.fillStyle = '#5d6479';
      ctx.font = '600 20px sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('प्रमाणित किया जाता है कि', W / 2, 310);
      ctx.fillText('This is proudly presented to', W / 2, 340);

      // Student Name
      ctx.fillStyle = '#14213d';
      ctx.font = '900 64px serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(studentName, W / 2, 425);

      // Name underline bar
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 280, 455);
      ctx.lineTo(W / 2 + 280, 455);
      ctx.stroke();

      // Body text
      ctx.fillStyle = '#334155';
      ctx.font = '500 21px sans-serif';
      ctx.letterSpacing = '0.5px';
      // Body description removed for minimal look

      // Course Name
      ctx.fillStyle = '#14213d';
      ctx.font = '900 34px sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('COMPLETE COMPUTER FOUNDATIONS & DIGITAL LITERACY', W / 2, 620);

      ctx.fillStyle = '#1b7f5c';
      ctx.font = '800 22px sans-serif';
      // Course subtitle removed for minimal look

      // Skills box removed for clean minimal certificate

      // Bottom Section: Left (ID & Date), Center (Gold Seal), Right (Signatures)

      // Left: Verification & Issue Info
      const footY = 960;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = '800 13px sans-serif';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('CERTIFICATE ID', 180, footY);
      ctx.fillStyle = '#14213d';
      ctx.font = '900 20px monospace';
      ctx.fillText(rawCertId, 180, footY + 28);

      ctx.fillStyle = '#64748b';
      ctx.font = '800 13px sans-serif';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('ISSUE DATE', 180, footY + 75);
      ctx.fillStyle = '#14213d';
      ctx.font = '700 17px sans-serif';
      ctx.fillText(`${issueDateEn} (${issueDate})`, 180, footY + 100);

      ctx.fillStyle = '#1b7f5c';
      ctx.font = '800 14px sans-serif';
      

      // Gold seal removed for minimal look

      // Right: Signatures
      const sigX = W - 220;
      ctx.textAlign = 'center';

      // Signature line 1
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sigX - 130, footY + 40);
      ctx.lineTo(sigX + 130, footY + 40);
      ctx.stroke();

      // Script signature simulation
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'italic 700 28px serif';
      ctx.fillText('Lalit Yadav', sigX, footY + 25);

      ctx.fillStyle = '#14213d';
      ctx.font = '800 15px sans-serif';
      ctx.fillText('Founder ● SimpleLearn', sigX, footY + 62);
      ctx.fillStyle = '#64748b';
      ctx.font = '600 13px sans-serif';
      

      // Second signatory removed for minimal single founder signature

      // Trigger automatic file download
      const imgUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgUrl;
      a.download = `Certificate-${studentName.replace(/\s+/g, '_')}.png`;
      a.click();
      showToast('🎉 Certificate PNG डाउनलोड हो गया!');
    } catch (e) {
      console.error('Download PNG failed', e);
      showToast('PNG डाउनलोड करने में समस्या आई, कृपया Print / Save as PDF चुनें।');
    } finally {
      setIsDownloading(false);
    }
  };

  // If locked, render the locked explanation and roadmap
  if (!isUnlocked) {
    return (
      <div className="certificate-page-wrap" style={{ maxWidth: '860px', margin: '20px auto', padding: '16px' }}>
        <div className="card" style={{
          border: '3px solid #14213d',
          boxShadow: '4px 6px 0 #14213d',
          borderRadius: '18px',
          padding: '30px',
          textAlign: 'center',
          background: '#fff'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>🔒</div>
          <h2 style={{ fontSize: '28px', color: '#14213d', margin: '0 0 10px' }}>
            Course Certificate अभी अनलॉक नहीं हुआ है
          </h2>
          <p style={{ fontSize: '17px', color: '#475569', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            सर्टिफिकेट अनलॉक करने के लिए आपको पाठ्यक्रम के सभी <b>62 Lessons</b> और <b>Windows Simulator Practical Lab Assignment</b> पूरे करने होंगे।
          </p>

          {/* Progress Checklist */}
          <div style={{
            maxWidth: '520px',
            margin: '0 auto 24px',
            textAlign: 'left',
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 22px'
          }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '16px', color: '#1e293b' }}>
              📋 Certificate Unlock Checklist:
            </h4>

            {/* Item 1: Real Lessons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{isAllLessonsDone ? '✅' : '⚪'}</span>
                <div>
                  <b style={{ color: '#14213d', fontSize: '15.5px' }}>62 Course Levels</b>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {doneLessonsCount} of {totalLessonsCount} पूर्ण ({Math.round((doneLessonsCount / totalLessonsCount) * 100)}%)
                  </div>
                </div>
              </div>
              <span className={`part-badge ${isAllLessonsDone ? 'done' : ''}`}>
                {isAllLessonsDone ? 'COMPLETED' : `${doneLessonsCount}/${totalLessonsCount}`}
              </span>
            </div>

            {/* Item 2: Assignment */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{isAssignmentDone ? '✅' : '⚪'}</span>
                <div>
                  <b style={{ color: '#14213d', fontSize: '15.5px' }}>Practical Lab Assignment</b>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Desktop Simulator (Folder, Rename, Start, Delete)
                  </div>
                </div>
              </div>
              <span className={`part-badge ${isAssignmentDone ? 'done' : ''}`}>
                {isAssignmentDone ? 'VERIFIED ★' : 'PENDING'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn o"
              onClick={() => goTo('courseHome')}
              style={{ border: '2px solid #14213d', borderRadius: '10px', fontWeight: 800 }}
            >
              ← Course Home पर लौटें
            </button>

            {!isAllLessonsDone && nextLesson && (
              <button
                type="button"
                className="btn y"
                onClick={() => goTo('lesson', nextLesson.id)}
                style={{
                  border: '2px solid #14213d',
                  boxShadow: '2px 3px 0 #14213d',
                  borderRadius: '10px',
                  fontWeight: 900
                }}
              >
                👉 अगला Lesson पूरा करें: Level {nextLesson.id}
              </button>
            )}

            {!isAssignmentDone && (
              <button
                type="button"
                className="btn"
                onClick={() => goTo('sim')}
                style={{
                  background: '#1b7f5c',
                  color: '#fff',
                  border: '2px solid #14213d',
                  boxShadow: '2px 3px 0 #14213d',
                  borderRadius: '10px',
                  fontWeight: 900
                }}
              >
                🖥️ Practice Lab पूरा करें
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Certificate UNLOCKED View
  return (
    <div className="certificate-page-wrap" style={{ maxWidth: '1080px', margin: '20px auto', padding: '16px' }}>
      {/* Hidden high-res canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Action Bar (Hidden during printing) */}
      <div className="certificate-actions-bar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        background: '#fff',
        border: '2.5px solid #14213d',
        boxShadow: '3px 4px 0 #14213d',
        borderRadius: '14px',
        padding: '14px 18px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn o"
            onClick={() => goTo('courseHome')}
            style={{ border: '2px solid #14213d', borderRadius: '8px', padding: '8px 14px', fontWeight: 800 }}
          >
            ← Course Home
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#14213d' }}>
              🎓 Official Course Certificate
            </h3>
            <small style={{ color: '#1b7f5c', fontWeight: 800 }}>
              ✓ Verified Completion · All 62 Levels & Assignment Done
            </small>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            className="btn o"
            onClick={() => {
              setTempName(studentName);
              setIsEditingName(true);
            }}
            style={{ border: '2px solid #14213d', borderRadius: '8px', padding: '8px 14px', fontWeight: 800 }}
            title="सर्टिफिकेट पर छपने वाला नाम बदलें"
          >
            ✏️ Edit Name
          </button>

          <button
            type="button"
            className="btn o"
            onClick={handleCopyId}
            style={{ border: '2px solid #14213d', borderRadius: '8px', padding: '8px 14px', fontWeight: 800 }}
            title="सर्टिफिकेट ID कॉपी करें"
          >
            📋 Copy ID
          </button>

          <button
            type="button"
            className="btn y"
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            style={{
              border: '2px solid #14213d',
              boxShadow: '2px 2px 0 #14213d',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 900
            }}
          >
            {isDownloading ? '⏳ Generating...' : '📥 Download Image (PNG)'}
          </button>

          <button
            type="button"
            className="btn"
            onClick={handlePrint}
            style={{
              background: '#1b7f5c',
              color: '#fff',
              border: '2px solid #14213d',
              boxShadow: '2px 2px 0 #14213d',
              borderRadius: '8px',
              padding: '8px 18px',
              fontWeight: 900
            }}
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {/* Edit Name Modal */}
      {isEditingName && (
        <div className="modal-overlay" onClick={() => setIsEditingName(false)}>
          <div
            className="modal-card"
            style={{
              border: '3px solid #14213d',
              boxShadow: '5px 7px 0 #14213d',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '90%',
              padding: '24px',
              background: '#fff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 10px', fontSize: '20px', color: '#14213d' }}>
              ✏️ सर्टिफिकेट पर नाम बदलें
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b' }}>
              सर्टिफिकेट पर प्रिंट होने वाला अपना पूरा नाम यहाँ दर्ज करें:
            </p>
            <form onSubmit={handleSaveName}>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
                placeholder="उदा. Rahul Sharma"
                style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 700 }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn o"
                  onClick={() => setIsEditingName(false)}
                  style={{ border: '2px solid #14213d', borderRadius: '8px', fontWeight: 800 }}
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="btn y"
                  style={{ border: '2px solid #14213d', borderRadius: '8px', fontWeight: 900 }}
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THE OFFICIAL CERTIFICATE PAPER */}
      <div
        id="certificateDoc"
        className="certificate-paper"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fffdf9 40%, #faf6eb 100%)',
          border: '14px solid #14213d',
          outline: '4px solid #d4af37',
          outlineOffset: '-10px',
          borderRadius: '4px',
          boxShadow: '0 12px 40px rgba(20,33,61,0.18)',
          padding: '48px 40px',
          position: 'relative',
          overflow: 'hidden',
          color: '#14213d',
          fontFamily: 'Hind, system-ui, sans-serif'
        }}
      >
        {/* Decorative Inner Guilloche Corner Accents */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', width: '32px', height: '32px', borderTop: '3px solid #d4af37', borderLeft: '3px solid #d4af37' }} />
        <div style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderTop: '3px solid #d4af37', borderRight: '3px solid #d4af37' }} />
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '32px', height: '32px', borderBottom: '3px solid #d4af37', borderLeft: '3px solid #d4af37' }} />
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '32px', height: '32px', borderBottom: '3px solid #d4af37', borderRight: '3px solid #d4af37' }} />

        {/* Certificate Header Banner */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '28px' }}>🎓</span>
            <span style={{
              fontSize: '24px',
              fontWeight: 900,
              letterSpacing: '3px',
              color: '#14213d',
              textTransform: 'uppercase'
            }}>
              SimpleLearn Computer Academy
            </span>
            <span style={{ fontSize: '28px' }}>💻</span>
          </div>
          <div style={{
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '2px',
            color: '#b45309',
            textTransform: 'uppercase'
          }}>
            National Digital Literacy & Practical Computer Empowerment Program
          </div>
        </div>

        {/* Ribbon Title */}
        <div style={{ textAlign: 'center', margin: '0 auto 20px', maxWidth: '620px' }}>
          <div style={{
            background: '#14213d',
            color: '#ffffff',
            padding: '10px 24px',
            borderRadius: '6px',
            fontSize: '20px',
            fontWeight: 900,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            display: 'inline-block',
            boxShadow: '0 4px 12px rgba(20,33,61,0.2)'
          }}>
            Certificate of Completion & Mastery
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', fontWeight: 700 }}>
            प्रमाण पत्र · कंप्यूटर दक्षता एवं व्यावहारिक ज्ञान
          </div>
        </div>

        {/* Presentation Text */}
        <div style={{ textAlign: 'center', margin: '22px 0 10px' }}>
          <p style={{ fontSize: '17px', color: '#475569', margin: '0 0 12px', fontStyle: 'italic' }}>
            यह प्रमाणपत्र सम्मानपूर्वक प्रदान किया जाता है / This is proudly presented to:
          </p>
          <div style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#14213d',
            fontFamily: 'serif',
            letterSpacing: '0.5px',
            margin: '0 0 8px',
            textDecoration: 'none'
          }}>
            {studentName}
          </div>
          <div style={{
            width: '260px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
            margin: '0 auto 16px'
          }} />
        </div>

        {/* Course Title */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '22px auto 44px' }}>
          <div style={{
            fontSize: '26px',
            fontWeight: 900,
            color: '#14213d',
            letterSpacing: '1px'
          }}>
            COMPLETE COMPUTER FOUNDATIONS & DIGITAL LITERACY
          </div>
        </div>

        {/* Certificate Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '1.5px solid #e2e8f0',
          paddingTop: '28px',
          marginTop: '40px'
        }}>
          {/* Left Column: ID & Issue Details */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Certificate ID
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, fontFamily: 'monospace', color: '#14213d', margin: '2px 0 8px' }}>
              {rawCertId}
            </div>

            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Date of Issue
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#14213d', margin: '2px 0 0' }}>
              {issueDateEn} ({issueDate})
            </div>
          </div>

          {/* Right Column: Signature */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '180px' }}>
              <div style={{
                fontFamily: 'serif',
                fontStyle: 'italic',
                fontSize: '26px',
                fontWeight: 700,
                color: '#14213d',
                lineHeight: 1,
                marginBottom: '6px'
              }}>
                Lalit Yadav
              </div>
              <div style={{ borderTop: '1.5px solid #94a3b8', paddingTop: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#14213d', letterSpacing: '0.5px' }}>
                  Founder ● SimpleLearn
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
