import React, { useState, useRef, useEffect } from 'react';
import { useCourse } from '../context/CourseContext';

export default function ProfileDropdown() {
  const {
    state,
    goTo,
    isCertificateUnlocked,
    downloadProgress,
    resetProgress,
    logout
  } = useCourse();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userName = state.user?.name || 'Learner';
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'U';
  const userCls = state.user?.cls || '';

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div
      className="user-profile-badge"
      ref={dropdownRef}
      tabIndex={0}
      title="Click or hover for Profile Menu"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <div className="user-avatar">{userInitial}</div>
      <div className="user-info">
        <div className="user-name">
          {userName} <span style={{ fontSize: '12px', opacity: 0.7 }}>▾</span>
        </div>
        <div className="user-cls">Class {userCls}</div>
      </div>

      <div className={`profile-dropdown-menu ${isOpen ? 'show' : ''}`}>
        <div className="profile-dropdown-header">
          <div className="dropdown-avatar">{userInitial}</div>
          <div>
            <span className="dropdown-user-name">{userName}</span>
            <span className="dropdown-user-cls">Class {userCls} · Basic Course</span>
          </div>
        </div>
        <div className="profile-dropdown-divider" />
        <button
          type="button"
          className="profile-dropdown-item"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
            goTo('certificate');
          }}
        >
          <span className="p-item-icon">{isCertificateUnlocked ? '🎓' : '🔒'}</span>
          <span>{isCertificateUnlocked ? 'Course Certificate' : 'Certificate (Locked)'}</span>
        </button>

        <div className="profile-dropdown-divider" />
        <button
          type="button"
          className="profile-dropdown-item logout-item"
          onClick={(e) => {
            e.stopPropagation();
            logout();
            setIsOpen(false);
          }}
        >
          <span className="p-item-icon">🚪</span>
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
