import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import { LESSONS } from '../data/lessons';
import ProfileDropdown from './ProfileDropdown';

const REAL_LESSONS = LESSONS.filter(l => l.steps && l.steps.length);

const PN = [
  "Part 01 — Meet the Computer",
  "Part 02 — Know Your Computer",
  "Part 03 — First Time Using Windows",
  "Part 04 — Master the Mouse",
  "Part 05 — Master the Keyboard",
  "Part 06 — Files and Folders",
  "Part 07 — Working with Documents",
  "Part 08 — Internet and Web Browsing",
  "Part 09 — Digital Safety and Responsible Use",
  "Part 10 — Basic Computer Troubleshooting"
];

const PART_IMAGES = {
  1: "/assets/part-01-meet-computer.jpg",
  2: "/assets/part-02-know-computer.jpg",
  3: "/assets/part-03-meet-mouse.jpg",
  4: "/assets/part-04-master-mouse.jpg",
  5: "/assets/part-05-master-keyboard.jpg",
  6: "/assets/part-06-files-folders.jpg",
  7: "/assets/part-07-banner.jpg",
  8: "/assets/part-08-banner.jpg",
  9: "/assets/part-09-banner.jpg",
  10: "/assets/part-10-banner.jpg"
};

const PART_OBJECTIVES = {
  1: "विद्यार्थी कंप्यूटर की बुनियादी समझ विकसित कर सके, इसके मुख्य उपयोगों को जान सके और यह समझ सके कि कंप्यूटर कैसे काम करता है।",
  2: "विद्यार्थी कंप्यूटर के मुख्य physical parts पहचान सके, उनका काम समझ सके और एक basic desktop computer setup को पहचान सके।",
  3: "विद्यार्थी Windows Desktop को पहचान सके, Start Menu इस्तेमाल कर सके, applications खोल और बंद कर सके तथा basic desktop navigation कर सके।",
  4: "विद्यार्थी mouse को सही तरीके से पकड़ सके, pointer control कर सके और Windows में सामान्य mouse actions (Click, Double Click, Right Click, Drag) कर सके।",
  5: "विद्यार्थी keyboard के मुख्य keys को पहचान सके, typing के बुनियादी नियम समझ सके और basic text लिख सके।",
  6: "विद्यार्थी file और folder का अंतर समझ सके, नया folder बना सके, files को व्यवस्थित कर सके और बुनियादी file operations कर सके।",
  7: "विद्यार्थी digital document को समझ सके, Notepad में text लिख व edit कर सके, file save कर सके और word processor का परिचय पा सके।",
  8: "विद्यार्थी internet और web browser की बुनियादी समझ विकसित कर सके, search engine पर जानकारी खोज सके और safe web browsing कर सके।",
  9: "विद्यार्थी online safety के नियम समझ सके, strong passwords बना सके, scams व phishing पहचान सके और responsible digital behavior अपना सके।",
  10: "विद्यार्थी सामान्य कंप्यूटर समस्याओं को पहचान सके, बुनियादी troubleshooting कर सके और computer care की अच्छी आदतें सीख सके।"
};

const PART_INTROS = {
  1: "कंप्यूटर हमारी दुनिया की सबसे उपयोगी मशीनों में से एक है। आइए जानते हैं कि यह क्या है, यह क्या-क्या कर सकता है और यह हमारे आसपास कहाँ-कहाँ दिखाई देता है।",
  2: "अब तक हमने सीखा कि computer क्या है और इसका इस्तेमाल कहाँ होता है। लेकिन जब आप computer के सामने बैठते हैं, तो आपको कई अलग-अलग चीजें दिखाई देती हैं: एक Screen, Keyboard, Mouse और एक बड़ा Computer Cabinet। क्या आपको पता है कि इन सभी का काम क्या होता है?",
  3: "अब तक हमने computer के अलग-अलग parts के बारे में सीखा। अब समय है computer को ऑन करके Windows की दुनिया में कदम रखने का। आइए डेस्कटॉप, स्टार्ट मेनू और विंडोज़ को समझें।",
  4: "माउस आपके हाथ का जादू है! स्क्रीन पर किसी भी चीज को छूने, खोलने या हिलाने के लिए माउस सबसे जरूरी टूल है। आइए माउस मास्टर बनें।",
  5: "कीबोर्ड कंप्यूटर से बात करने का जरिया है। जब आप कीबोर्ड पर टाइप करते हैं, तो कंप्यूटर आपके विचार स्क्रीन पर लिखता है। आइए कीबोर्ड के सभी बटनों को समझें।",
  6: "जैसे आप स्कूल की कॉपियाँ अपने बस्ते में रखते हैं, वैसे ही कंप्यूटर में हर जानकारी फाइल में और बहुत सारी फाइलें फोल्डर में रहती हैं। आइए फाइलों को सजाना सीखें।",
  7: "कंप्यूटर पर खुद के नोट्स, होमवर्क या चिट्ठी लिखना बहुत आसान है। इस भाग में हम Notepad और Word Processor की मदद से अपना पहला डिजिटल डॉक्यूमेंट बनाना सीखेंगे।",
  8: "इंटरनेट दुनिया भर के कंप्यूटरों का विशाल जाल है। वेब ब्राउज़र और गूगल सर्च इंजन की मदद से हम किसी भी सवाल का जवाब पलक झपकते ही पा सकते हैं।",
  9: "इंटरनेट की दुनिया जितनी ज्ञानवर्धक है, उतनी ही सतर्क रहने की जरूरत भी है। अपनी निजी जानकारी, पासवर्ड और कंप्यूटर को सुरक्षित रखने के लिए डिजिटल सुरक्षा कवच सीखें।",
  10: "कभी स्क्रीन काली हो जाए, माउस न चले या इंटरनेट अटक जाए तो घबराएं नहीं! 80% कंप्यूटर समस्याएं बहुत छोटी होती हैं जिन्हें आप खुद 2 मिनट में ठीक कर सकते हैं।"
};

const PARTS = PN.map((name, k) => {
  const lessons = REAL_LESSONS.filter(l => l.id.startsWith((k + 1) + "."));
  return { id: k + 1, name, lessons };
});

export default function CourseHome() {
  const {
    state,
    isLessonUnlocked,
    goTo,
    totalStars,
    isCertificateUnlocked,
    isAllLessonsDone,
    isAssignmentDone,
    unlockAllForTesting
  } = useCourse();

  const doneCount = REAL_LESSONS.filter(l => state.done && state.done[l.id]).length;
  const pct = Math.round((doneCount / REAL_LESSONS.length) * 100);

  const nextLesson = REAL_LESSONS.find(l => !state.done || !state.done[l.id]);
  const lastLesson = REAL_LESSONS.find(l => l.id === state.lastLesson) || nextLesson || REAL_LESSONS[0];
  const continueLessonId = lastLesson && (!state.done || !state.done[lastLesson.id]) ? lastLesson.id : (nextLesson ? nextLesson.id : REAL_LESSONS[0].id);
  const continueLesson = REAL_LESSONS.find(l => l.id === continueLessonId) || REAL_LESSONS[0];

  // Default active part tab is the part of continueLesson
  const defaultPartId = continueLesson ? parseInt(continueLesson.id.split('.')[0], 10) : 1;
  const [activePart, setActivePart] = useState(defaultPartId);

  return (
    <main className="course-home-container" style={{ maxWidth: '980px', margin: '0 auto', padding: '16px' }}>
      {/* Topbar with Profile and Coins */}
      <div className="course-home-topbar">
        <ProfileDropdown />
        <div className="home-stats-cluster">
          <div className="user-stat-pill coin-stat-pill" title="कुल अर्जित सिक्के (Coins)">
            <span className="coin-spin">🟡</span>
            <b id="homeCoinCount">{state.coins || 0}</b>
            <span className="stat-unit">Coins</span>
          </div>
          <div className="user-stat-pill star-stat-pill" title="Verified Assignments & Stars">
            <span>⭐</span>
            <b>{totalStars}★</b>
          </div>
        </div>
      </div>

      {/* Clean Compact Greeting Banner */}
      <div className="course-home-hero">
        <div className="course-hero-content">
          <h1>नमस्ते {state.user?.name || 'विद्यार्थी'}! 👋</h1>
          <p style={{ opacity: 0.9, margin: '4px 0 10px', fontSize: '15px' }}>
            {doneCount} / {REAL_LESSONS.length} lessons पूरे ({pct}%)
          </p>
          <div className="bar" style={{ background: 'rgba(255,255,255,0.25)', height: '12px', border: '1.5px solid rgba(255,255,255,0.5)' }}>
            <i style={{ width: `${pct}%` }} />
          </div>
          {continueLesson && (
            <button
              type="button"
              className="btn y"
              style={{
                marginTop: '14px',
                border: '2.5px solid #14213d',
                boxShadow: '3px 4px 0 #14213d',
                fontWeight: 900,
                fontSize: '16px',
                padding: '12px 22px',
                borderRadius: '12px'
              }}
              onClick={() => goTo('lesson', continueLesson.id)}
            >
              👉 {doneCount > 0 ? 'आगे बढ़ो' : 'पहला lesson शुरू करो'}: Level {continueLesson.id} ({continueLesson.title})
            </button>
          )}
        </div>
      </div>

      {/* Certificate Quick Alert Strip */}
      <div style={{
        background: isCertificateUnlocked ? 'linear-gradient(135deg, #1b7f5c 0%, #11573e 100%)' : '#fff',
        border: isCertificateUnlocked ? '2.5px solid #14213d' : '2px dashed #94a3b8',
        boxShadow: isCertificateUnlocked ? '3px 4px 0 #14213d' : 'none',
        borderRadius: '14px',
        padding: '14px 18px',
        margin: '14px 0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        color: isCertificateUnlocked ? '#fff' : '#1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>{isCertificateUnlocked ? '🎓' : '🔒'}</span>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{isCertificateUnlocked ? 'Course Certificate Unlocked!' : 'Official Course Certificate'}</span>
              <span className={`part-badge ${isCertificateUnlocked ? 'done' : ''}`} style={{ fontSize: '11px' }}>
                {isCertificateUnlocked ? 'Ready to Claim' : 'Locked'}
              </span>
            </div>
            <div style={{ fontSize: '13.5px', opacity: isCertificateUnlocked ? 0.92 : 0.8, marginTop: '2px' }}>
              {isCertificateUnlocked
                ? 'बधाई हो! आपने सभी 62 Levels और Windows Simulator Assignment पूरा कर लिया है।'
                : `${doneCount}/62 Levels पूरे · Lab Assignment: ${isAssignmentDone ? '✅ Verified' : '⏳ Pending'}`}
            </div>
          </div>
        </div>

        <button
          type="button"
          className={isCertificateUnlocked ? 'btn y' : 'btn o'}
          style={{
            border: '2px solid #14213d',
            borderRadius: '10px',
            fontWeight: 900,
            fontSize: '14.5px',
            padding: '8px 16px',
            boxShadow: isCertificateUnlocked ? '2px 2px 0 #14213d' : 'none'
          }}
          onClick={() => goTo('certificate')}
        >
          {isCertificateUnlocked ? '📜 View & Print Certificate' : '🔍 Check Requirements'}
        </button>
      </div>

      {/* Modular Part Tabs Navigation */}
      <div className="parts-nav-tabs-wrapper">
        <div className="parts-nav-label">
          <span>📚 Course Curriculum</span>
          <small style={{ color: 'var(--mut)', fontWeight: 700 }}>
            {activePart === 'practice' ? 'Interactive Lab' : (activePart === 'certificate' ? 'Course Certificate' : `Part ${String(activePart).padStart(2, '0')} of 10`)}
          </small>
        </div>
        <div className="parts-nav-tabs">
          {PARTS.map((p) => {
            const pDone = p.lessons.filter(l => state.done && state.done[l.id]).length;
            const isPartComplete = pDone === p.lessons.length && p.lessons.length > 0;
            return (
              <button
                key={p.id}
                type="button"
                className={`part-nav-btn ${activePart === p.id ? 'active' : ''}`}
                data-pid={p.id}
                onClick={() => setActivePart(p.id)}
                title={p.name}
              >
                <span className="part-label-full">Part 0{p.id}</span>
                <span className="part-label-collapsed">{p.id}</span>
                {isPartComplete ? (
                  <span className="part-nav-badge done">✓</span>
                ) : (
                  <span className="part-nav-badge">{pDone}/{p.lessons.length}</span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            className={`part-nav-btn special-nav-btn ${activePart === 'practice' ? 'active' : ''}`}
            onClick={() => setActivePart('practice')}
            title="Practice Lab"
          >
            <span className="tab-icon">🖥️</span>
            <span className="tab-label-text">
              Practice Lab <span className="part-nav-badge" style={{ background: '#facc15', color: '#14213d' }}>Lab</span>
            </span>
          </button>
          <button
            type="button"
            className={`part-nav-btn special-nav-btn ${activePart === 'certificate' ? 'active' : ''}`}
            onClick={() => setActivePart('certificate')}
            title="Course Certificate"
          >
            <span className="tab-icon">{isCertificateUnlocked ? '🎓' : '🔒'}</span>
            <span className="tab-label-text">
              Certificate
              <span
                className="part-nav-badge"
                style={{
                  background: isCertificateUnlocked ? '#1b7f5c' : '#e2e8f0',
                  color: isCertificateUnlocked ? '#fff' : '#64748b'
                }}
              >
                {isCertificateUnlocked ? 'Ready' : 'Locked'}
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Active Part Content */}
      {activePart !== 'practice' && activePart !== 'certificate' && (() => {
        const p = PARTS.find(x => x.id === activePart);
        if (!p) return null;
        const pDone = p.lessons.filter(l => state.done && state.done[l.id]).length;

        return (
          <div className="part-view-pane active">
            <div className="part-card">
              <div className="part-banner-wrap">
                <img
                  src={PART_IMAGES[p.id]}
                  alt={p.name}
                  className="part-banner-img"
                  loading="lazy"
                />
              </div>
              <div className="part-title-row">
                <div>
                  <div className="part" style={{ margin: 0 }}>{p.name}</div>
                  <small style={{ color: 'var(--mut)', display: 'block', marginTop: '2px', fontWeight: 600 }}>
                    {p.lessons.length} पाठ · बुनियादी से अभ्यास तक
                  </small>
                </div>
                <span className="part-badge done">
                  {pDone}/{p.lessons.length} पूरे
                </span>
              </div>

              {/* Part Objective & Introduction */}
              <div className="part-objective-banner" style={{
                background: '#fff9e6',
                border: '2px solid #ffc233',
                borderRadius: '12px',
                padding: '14px 18px',
                margin: '12px 0 16px',
                boxShadow: '2px 3px 0 #14213d'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  🎯 Part Objective
                </div>
                <p style={{ fontSize: '16.5px', fontWeight: 550, color: '#14213d', lineHeight: 1.6, margin: '0 0 8px' }}>
                  {PART_OBJECTIVES[p.id]}
                </p>
                <p style={{ fontSize: '15.5px', fontWeight: 500, color: '#334155', lineHeight: 1.55, margin: 0 }}>
                  {PART_INTROS[p.id]}
                </p>
              </div>

              <div className="part-lessons-list">
                {p.lessons.map((l) => {
                  const isDone = !!(state.done && state.done[l.id]);
                  const isUnlocked = isLessonUnlocked(l.id);

                  return (
                    <button
                      key={l.id}
                      type="button"
                      className={`lrow ${isDone ? 'done' : ''} ${!isUnlocked ? 'locked' : ''}`}
                      disabled={!isUnlocked}
                      style={{
                        border: '2px solid #14213d',
                        boxShadow: '2px 3px 0 #14213d',
                        marginBottom: '8px'
                      }}
                      onClick={() => goTo('lesson', l.id)}
                    >
                      <span className="n">{isDone ? '✓' : (!isUnlocked ? '🔒' : l.id)}</span>
                      <span style={{ flex: 1 }}>
                        <h3>{l.title}</h3>
                        <small>{l.sub} · ~{l.min} मिनट</small>
                      </span>
                      <span className={`part-badge ${isDone ? 'done' : (!isUnlocked ? 'locked-badge' : '')}`}>
                        {isDone ? 'Completed' : (!isUnlocked ? '🔒 Locked' : 'Start →')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Practice Lab Pane */}
      {activePart === 'practice' && (
        <div className="part-view-pane active">
          <div className="part-card" style={{ marginBottom: 0 }}>
            <div className="part-banner-wrap">
              <img
                src="/assets/practice-lab.jpg"
                alt="Windows Simulator Practice"
                className="part-banner-img"
                loading="lazy"
              />
            </div>
            <div className="part-title-row">
              <div className="part" style={{ margin: 0 }}>Real Computer Practice Lab</div>
              <span className="part-badge" style={{ background: '#facc15', color: '#14213d', border: '1.5px solid #14213d' }}>
                Interactive
              </span>
            </div>
            <div className="part-lessons-list">
              <button
                type="button"
                className="lrow"
                style={{ border: '2px solid #14213d', boxShadow: '2px 3px 0 #14213d' }}
                onClick={() => goTo('sim')}
              >
                <span className="n">🪟</span>
                <span style={{ flex: 1 }}>
                  <h3>Windows Desktop Simulator</h3>
                  <small>Desktop पर folder बनाना, Notepad, Calculator, Paint, File Explorer (interactive assignment)</small>
                </span>
                <span className="part-badge" style={{ background: '#1b7f5c', color: '#fff' }}>
                  Open Lab →
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Certificate Pane */}
      {activePart === 'certificate' && (
        <div className="part-view-pane active">
          <div className="part-card" style={{ marginBottom: 0, padding: '24px' }}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ fontSize: '56px', marginBottom: '8px' }}>
                {isCertificateUnlocked ? '🎓' : '📜'}
              </div>
              <h2 style={{ fontSize: '26px', color: '#14213d', margin: '0 0 8px' }}>
                {isCertificateUnlocked ? 'बधाई! आपका Certificate तैयार है' : 'Course Completion Certificate'}
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.55 }}>
                {isCertificateUnlocked
                  ? 'आपने बेसिक कंप्यूटर कोर्स के सभी 10 भाग, 62 लेवल्स तथा Windows Simulator Assignment सफलतापूर्वक पूरा कर लिया है।'
                  : 'सर्टिफिकेट अनलॉक करने के लिए आपको नीचे दिए गए दोनों मील के पत्थर (milestones) पूरे करने होंगे:'}
              </p>

              {/* Requirements Checklist */}
              <div style={{
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 20px',
                textAlign: 'left',
                margin: '0 auto 24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{isAllLessonsDone ? '✅' : '⚪'}</span>
                    <div>
                      <b style={{ color: '#14213d', fontSize: '15px' }}>62 Course Lessons (All 10 Parts)</b>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {doneCount} of {REAL_LESSONS.length} पाठ पूर्ण ({pct}%)
                      </div>
                    </div>
                  </div>
                  <span className={`part-badge ${isAllLessonsDone ? 'done' : ''}`}>
                    {isAllLessonsDone ? 'Done' : `${doneCount}/${REAL_LESSONS.length}`}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{isAssignmentDone ? '✅' : '⚪'}</span>
                    <div>
                      <b style={{ color: '#14213d', fontSize: '15px' }}>Practical Lab Assignment</b>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Windows Desktop Simulator 4/4 Tasks Verified
                      </div>
                    </div>
                  </div>
                  <span className={`part-badge ${isAssignmentDone ? 'done' : ''}`}>
                    {isAssignmentDone ? 'Verified ★' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {isCertificateUnlocked ? (
                  <button
                    type="button"
                    className="btn y"
                    style={{
                      border: '2.5px solid #14213d',
                      boxShadow: '3px 4px 0 #14213d',
                      fontSize: '17px',
                      fontWeight: 900,
                      padding: '12px 24px',
                      borderRadius: '12px'
                    }}
                    onClick={() => goTo('certificate')}
                  >
                    📜 View & Print Official Certificate →
                  </button>
                ) : (
                  <>
                    {!isAllLessonsDone && continueLesson && (
                      <button
                        type="button"
                        className="btn y"
                        style={{ border: '2px solid #14213d', borderRadius: '10px', fontWeight: 900 }}
                        onClick={() => goTo('lesson', continueLesson.id)}
                      >
                        👉 Continue Lessons (Level {continueLesson.id})
                      </button>
                    )}
                    {!isAssignmentDone && (
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
