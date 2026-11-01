import React, { useState, useRef, useEffect } from 'react';
import { useCourse } from '../context/CourseContext';

export default function WindowsSimulator({ taskConfig, onTaskComplete, isStandalone = false }) {
  const {
    state,
    awardCoins,
    playSuccessChime,
    triggerConfetti,
    goTo,
    markAssignmentDone,
    isCertificateUnlocked
  } = useCourse();

  const [folders, setFolders] = useState(() => (state.sim?.folders || ['Documents', 'Pictures']));
  const [recycled, setRecycled] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, type: 'desk' | 'folder', index }
  const [activeWindow, setActiveWindow] = useState(null); // 'notepad' | 'calc' | 'paint' | 'explorer' | 'recycle'
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('12:00 PM');
  const [lastAction, setLastAction] = useState('Desktop Ready');

  // Notepad State
  const [notepadText, setNotepadText] = useState('');

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState(null);
  const [calcOp, setCalcOp] = useState(null);
  const [calcClearNext, setCalcClearNext] = useState(false);

  // Paint Canvas Ref
  const paintCanvasRef = useRef(null);
  const [paintColor, setPaintColor] = useState('#2563eb');
  const [isPainting, setIsPainting] = useState(false);

  // Assignment tasks
  const tasks = taskConfig?.tasks || [
    { id: "new_folder", label: "Desktop पर Right-Click करके New Folder बनाएँ", hint: "खाली जगह Right-Click > New > Folder" },
    { id: "rename_school", label: "Folder का नाम बदलकर 'School' या 'Notes' रखें", hint: "Folder पर Right-Click > Rename या F2" },
    { id: "open_start", label: "Start Menu खोलकर देखें", hint: "नीचे बाईं ओर Windows आइकॉन पर क्लिक करें" },
    { id: "delete_item", label: "किसी भी Folder को Delete करके Recycle Bin में भेजें", hint: "Right-Click > Delete या Delete Key" }
  ];

  const [completedTasks, setCompletedTasks] = useState(new Set());

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check tasks
  useEffect(() => {
    const nextCompleted = new Set(completedTasks);

    if (folders.length > 2) nextCompleted.add("new_folder");
    if (folders.some(f => ['school', 'notes', 'study', 'work', 'स्कूल', 'नोट्स', 'किताब'].includes(f.toLowerCase()))) {
      nextCompleted.add("rename_school");
    }
    if (startMenuOpen) nextCompleted.add("open_start");
    if (recycled.length > 0) nextCompleted.add("delete_item");

    if (nextCompleted.size !== completedTasks.size) {
      setCompletedTasks(nextCompleted);
      if (nextCompleted.size === tasks.length) {
        playSuccessChime();
        triggerConfetti();
        awardCoins(5, "Assignment Tasks Complete!");
        if (markAssignmentDone) {
          markAssignmentDone(taskConfig?.id || 'desktop_lab', 3);
        }
        if (onTaskComplete) onTaskComplete();
      }
    }
  }, [folders, recycled, startMenuOpen]);

  // Context Menu Handler
  const handleDeskContextMenu = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      type: 'desk'
    });
  };

  const handleFolderContextMenu = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    const deskRect = document.getElementById('simDeskBox')?.getBoundingClientRect() || { left: 0, top: 0 };
    setContextMenu({
      x: e.clientX - deskRect.left,
      y: e.clientY - deskRect.top,
      type: 'folder',
      index: idx
    });
    setSelectedIdx(idx);
  };

  const addFolder = () => {
    let name = 'New Folder';
    let count = 1;
    while (folders.includes(name)) {
      count++;
      name = `New Folder (${count})`;
    }
    setFolders((prev) => [...prev, name]);
    setContextMenu(null);
    setLastAction(`Created "${name}"`);
  };

  const renameFolder = (idx) => {
    const oldName = folders[idx];
    const newName = window.prompt("Folder का नया नाम लिखें:", oldName);
    if (newName && newName.trim() && newName.trim() !== oldName) {
      setFolders((prev) => {
        const next = [...prev];
        next[idx] = newName.trim();
        return next;
      });
      setLastAction(`Renamed to "${newName.trim()}"`);
    }
    setContextMenu(null);
  };

  const deleteFolder = (idx) => {
    const item = folders[idx];
    setRecycled((prev) => [...prev, item]);
    setFolders((prev) => prev.filter((_, i) => i !== idx));
    setSelectedIdx(null);
    setContextMenu(null);
    setLastAction(`Deleted "${item}"`);
  };

  // Calculator logic
  const handleCalcBtn = (val) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setCalcPrev(null);
      setCalcOp(null);
      return;
    }
    if (['+', '-', '*', '/'].includes(val)) {
      setCalcPrev(parseFloat(calcDisplay));
      setCalcOp(val);
      setCalcClearNext(true);
      return;
    }
    if (val === '=') {
      if (calcOp && calcPrev !== null) {
        const cur = parseFloat(calcDisplay);
        let res = 0;
        if (calcOp === '+') res = calcPrev + cur;
        if (calcOp === '-') res = calcPrev - cur;
        if (calcOp === '*') res = calcPrev * cur;
        if (calcOp === '/') res = cur !== 0 ? calcPrev / cur : 'Error';
        setCalcDisplay(String(res));
        setCalcPrev(null);
        setCalcOp(null);
        setCalcClearNext(true);
      }
      return;
    }
    if (calcClearNext) {
      setCalcDisplay(val);
      setCalcClearNext(false);
    } else {
      setCalcDisplay((prev) => (prev === '0' ? val : prev + val));
    }
  };

  // Paint Canvas Drawing
  const startDrawing = (e) => {
    setIsPainting(true);
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isPainting) return;
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = paintColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsPainting(false);
  };

  const clearPaint = () => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="sim-container" style={{ margin: '14px 0' }}>
      {/* Top Controls Bar */}
      <div className="sim-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        {isStandalone && (
          <button type="button" className="btn o" onClick={() => goTo('courseHome')}>
            ← Home
          </button>
        )}
        <div style={{ fontWeight: 800, fontSize: '15px' }}>
          🖥️ Windows Desktop Simulator
        </div>
        <span className={`part-badge ${completedTasks.size === tasks.length ? 'done' : ''}`}>
          {completedTasks.size} / {tasks.length} Tasks
        </span>
      </div>

      {/* Assignment Tasks Checklist */}
      <div className="sim-tasks-card">
        <div className="sim-tasks-head">
          <span>📋 Assignment Tasks ({tasks.length} कुल)</span>
          <span>{completedTasks.size} / {tasks.length} पूरे</span>
        </div>
        <div className="bar" style={{ marginBottom: '12px' }}>
          <i style={{ width: `${Math.round((completedTasks.size / tasks.length) * 100)}%` }} />
        </div>

        {completedTasks.size === tasks.length && (
          <div style={{
            background: '#dff3ea',
            border: '2px solid #1b7f5c',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '12px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div>
              <b style={{ color: '#11573e', fontSize: '15px' }}>🎉 Assignment Verified! (3 Stars ⭐⭐⭐)</b>
              <div style={{ fontSize: '13px', color: '#1b7f5c' }}>
                आपने Windows Practical Assignment सफलतापूर्वक पूरा कर लिया है!
              </div>
            </div>
            {isCertificateUnlocked && (
              <button
                type="button"
                className="btn y"
                onClick={() => goTo('certificate')}
                style={{ border: '2px solid #14213d', fontWeight: 900, whiteSpace: 'nowrap' }}
              >
                🎓 View Certificate →
              </button>
            )}
          </div>
        )}
        <div id="simTasksList">
          {tasks.map((t) => {
            const isDone = completedTasks.has(t.id);
            return (
              <div key={t.id} className={`task-item ${isDone ? 'done' : ''}`}>
                <span className="task-check">{isDone ? '✅' : '⚪'}</span>
                <div style={{ flex: 1 }}>
                  <b>{t.label}</b>
                  <div className="task-item-hint">{t.hint}</div>
                </div>
                <span className="task-badge">{isDone ? 'VERIFIED' : 'PENDING'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Realistic Windows 11 Desktop */}
      <div
        id="simDeskBox"
        className="desk-box"
        style={{
          height: '520px',
          background: 'radial-gradient(circle at 50% 30%, #2563eb 0%, #1e3a8a 40%, #0f172a 100%)',
          position: 'relative',
          borderRadius: '16px',
          border: '2.5px solid #14213d',
          boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          userSelect: 'none'
        }}
        onClick={() => {
          setContextMenu(null);
          setStartMenuOpen(false);
          setSelectedIdx(null);
        }}
        onContextMenu={handleDeskContextMenu}
      >
        {/* Desktop Icons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', flexWrap: 'wrap', height: '80%' }}>
          {/* This PC */}
          <div className="ic" onDoubleClick={() => setActiveWindow('explorer')}>
            <span>💻</span>
            <div>This PC</div>
          </div>

          {/* Notepad */}
          <div className="ic" onDoubleClick={() => setActiveWindow('notepad')}>
            <span>📝</span>
            <div>Notepad</div>
          </div>

          {/* Calculator */}
          <div className="ic" onDoubleClick={() => setActiveWindow('calc')}>
            <span>🧮</span>
            <div>Calculator</div>
          </div>

          {/* Paint */}
          <div className="ic" onDoubleClick={() => setActiveWindow('paint')}>
            <span>🎨</span>
            <div>Paint</div>
          </div>

          {/* Recycle Bin */}
          <div className="ic" onDoubleClick={() => setActiveWindow('recycle')}>
            <span>🗑️</span>
            <div>Recycle Bin ({recycled.length})</div>
          </div>

          {/* User Folders */}
          {folders.map((fName, idx) => (
            <div
              key={idx}
              className={`ic ${selectedIdx === idx ? 'sel' : ''}`}
              style={{ background: selectedIdx === idx ? 'rgba(255,255,255,0.25)' : 'transparent', borderRadius: '8px' }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIdx(idx);
              }}
              onContextMenu={(e) => handleFolderContextMenu(e, idx)}
            >
              <span>📁</span>
              <div>{fName}</div>
            </div>
          ))}
        </div>

        {/* Floating Notepad Window */}
        {activeWindow === 'notepad' && (
          <div className="sim-win" style={{ display: 'block', top: '40px', left: '60px', width: '380px', zIndex: 50 }}>
            <div className="sim-win-bar">
              <span>📝 Notepad - Untitled</span>
              <div className="sim-win-ctrls">
                <span className="sim-win-btn close" onClick={() => setActiveWindow(null)}>✕</span>
              </div>
            </div>
            <div className="sim-win-body">
              <textarea
                value={notepadText}
                placeholder="यहाँ टाइप करें…"
                style={{ width: '100%', height: '180px', fontFamily: 'monospace', fontSize: '14px', padding: '8px', boxSizing: 'border-box' }}
                onChange={(e) => setNotepadText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <small style={{ color: 'var(--mut)' }}>Chars: {notepadText.length} | Words: {notepadText.trim() ? notepadText.trim().split(/\s+/).length : 0}</small>
                <div>
                  <button type="button" className="btn o" style={{ padding: '4px 8px', fontSize: '12px', marginRight: '6px' }} onClick={() => setNotepadText('')}>Clear</button>
                  <button type="button" className="btn y" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setLastAction('Notepad note saved')}>Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Calculator Window */}
        {activeWindow === 'calc' && (
          <div className="sim-win" style={{ display: 'block', top: '50px', left: '100px', width: '260px', zIndex: 50 }}>
            <div className="sim-win-bar">
              <span>🧮 Calculator</span>
              <div className="sim-win-ctrls">
                <span className="sim-win-btn close" onClick={() => setActiveWindow(null)}>✕</span>
              </div>
            </div>
            <div className="sim-win-body" style={{ padding: '12px' }}>
              <div style={{ background: '#f1f5f9', border: '1.5px solid #cbd5e1', padding: '10px', textAlign: 'right', fontSize: '24px', fontWeight: 900, borderRadius: '8px', marginBottom: '10px' }}>
                {calcDisplay}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((b) => (
                  <button
                    key={b}
                    type="button"
                    style={{
                      padding: '10px',
                      fontSize: '16px',
                      fontWeight: 800,
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: b === '=' ? '#facc15' : '#fff',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleCalcBtn(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Paint Window */}
        {activeWindow === 'paint' && (
          <div className="sim-win" style={{ display: 'block', top: '30px', left: '40px', width: '420px', zIndex: 50 }}>
            <div className="sim-win-bar">
              <span>🎨 Paint</span>
              <div className="sim-win-ctrls">
                <span className="sim-win-btn close" onClick={() => setActiveWindow(null)}>✕</span>
              </div>
            </div>
            <div className="sim-win-body" style={{ padding: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <span>रंग:</span>
                {['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#000000'].map((c) => (
                  <div
                    key={c}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: c,
                      border: paintColor === c ? '2.5px solid #14213d' : '1px solid #ccc',
                      cursor: 'pointer'
                    }}
                    onClick={() => setPaintColor(c)}
                  />
                ))}
                <button type="button" className="btn o" style={{ padding: '2px 8px', fontSize: '11px', marginLeft: 'auto' }} onClick={clearPaint}>Clear</button>
              </div>
              <canvas
                ref={paintCanvasRef}
                width={400}
                height={220}
                style={{ background: '#fff', border: '1.5px solid #94a3b8', borderRadius: '6px', cursor: 'crosshair', display: 'block' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
          </div>
        )}

        {/* Floating File Explorer Window */}
        {activeWindow === 'explorer' && (
          <div className="sim-win" style={{ display: 'block', top: '50px', left: '80px', width: '380px', zIndex: 50 }}>
            <div className="sim-win-bar">
              <span>📁 File Explorer - Desktop</span>
              <div className="sim-win-ctrls">
                <span className="sim-win-btn close" onClick={() => setActiveWindow(null)}>✕</span>
              </div>
            </div>
            <div className="sim-win-body" style={{ padding: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {folders.map((f, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}>
                    <span style={{ fontSize: '28px' }}>📁</span>
                    <small style={{ display: 'block', fontWeight: 700, marginTop: '4px' }}>{f}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Recycle Bin Window */}
        {activeWindow === 'recycle' && (
          <div className="sim-win" style={{ display: 'block', top: '60px', left: '100px', width: '360px', zIndex: 50 }}>
            <div className="sim-win-bar">
              <span>🗑️ Recycle Bin</span>
              <div className="sim-win-ctrls">
                <span className="sim-win-btn close" onClick={() => setActiveWindow(null)}>✕</span>
              </div>
            </div>
            <div className="sim-win-body" style={{ padding: '10px' }}>
              {recycled.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--mut)', padding: '20px' }}>
                  Recycle Bin खाली है।
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <small style={{ fontWeight: 800 }}>{recycled.length} items</small>
                    <button
                      type="button"
                      className="btn o"
                      style={{ padding: '2px 8px', fontSize: '12px' }}
                      onClick={() => {
                        setFolders((prev) => [...prev, ...recycled]);
                        setRecycled([]);
                        setLastAction('Restored all deleted folders');
                      }}
                    >
                      Restore All
                    </button>
                  </div>
                  {recycled.map((r, i) => (
                    <div key={i} style={{ padding: '6px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📁</span>
                      <b>{r}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop Context Menu */}
        {contextMenu && (
          <div
            className="sim-ctx-menu"
            style={{
              position: 'absolute',
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
              display: 'block',
              zIndex: 100
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.type === 'desk' ? (
              <>
                <div className="sim-ctx-item" onClick={addFolder}>➕ New Folder</div>
                <div className="sim-ctx-item" onClick={() => { setLastAction('Refreshed Desktop'); setContextMenu(null); }}>🔄 Refresh</div>
                <div className="sim-ctx-item" onClick={() => { setActiveWindow('notepad'); setContextMenu(null); }}>📝 Open Notepad</div>
                <div className="sim-ctx-item" onClick={() => { setActiveWindow('calc'); setContextMenu(null); }}>🧮 Open Calculator</div>
              </>
            ) : (
              <>
                <div className="sim-ctx-item" onClick={() => renameFolder(contextMenu.index)}>🏷️ Rename (F2)</div>
                <div className="sim-ctx-item" onClick={() => deleteFolder(contextMenu.index)}>🗑 Delete</div>
              </>
            )}
          </div>
        )}

        {/* Windows 11 Start Menu */}
        {startMenuOpen && (
          <div
            className="sim-start-menu"
            style={{
              display: 'block',
              position: 'absolute',
              bottom: '48px',
              left: '12px',
              width: '280px',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '2px solid #14213d',
              borderRadius: '14px',
              padding: '14px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              zIndex: 90
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 900, marginBottom: '10px', color: '#14213d' }}>Pinned Apps</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="sim-app-tile" onClick={() => { setActiveWindow('notepad'); setStartMenuOpen(false); }}>
                <span>📝</span>
                <small>Notepad</small>
              </div>
              <div className="sim-app-tile" onClick={() => { setActiveWindow('calc'); setStartMenuOpen(false); }}>
                <span>🧮</span>
                <small>Calc</small>
              </div>
              <div className="sim-app-tile" onClick={() => { setActiveWindow('paint'); setStartMenuOpen(false); }}>
                <span>🎨</span>
                <small>Paint</small>
              </div>
              <div className="sim-app-tile" onClick={() => { setActiveWindow('explorer'); setStartMenuOpen(false); }}>
                <span>📁</span>
                <small>Explorer</small>
              </div>
              <div className="sim-app-tile" onClick={() => { setActiveWindow('recycle'); setStartMenuOpen(false); }}>
                <span>🗑️</span>
                <small>Recycle</small>
              </div>
            </div>
          </div>
        )}

        {/* Windows 11 Taskbar */}
        <div
          className="sim-taskbar"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '44px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            borderTop: '1.5px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: '8px',
            zIndex: 80
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Start Button */}
          <button
            type="button"
            className="sim-start-btn"
            style={{
              background: startMenuOpen ? 'rgba(255,255,255,0.25)' : 'transparent',
              border: 'none',
              fontSize: '20px',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => setStartMenuOpen((prev) => !prev)}
          >
            🪟
          </button>

          {/* Running Apps */}
          {activeWindow && (
            <div
              className="sim-app-pill active"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              {activeWindow === 'notepad' && '📝 Notepad'}
              {activeWindow === 'calc' && '🧮 Calculator'}
              {activeWindow === 'paint' && '🎨 Paint'}
              {activeWindow === 'explorer' && '📁 Explorer'}
              {activeWindow === 'recycle' && '🗑️ Recycle Bin'}
            </div>
          )}

          {/* System Tray */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center', color: '#fff', fontSize: '13px', fontWeight: 700 }}>
            <span>🔊</span>
            <span>📶</span>
            <span>{timeStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
