import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  FileText,
  Award,
  Trophy,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ activeView, onViewChange, isOpen, onClose }) => {
  const navItems = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    { id: 'faculty', label: 'Faculty Achievements', icon: Users, badge: 'DBMS', badgeColor: 'secondary' },
    { id: 'student', label: 'Student Achievements', icon: GraduationCap, badge: 'DBMS', badgeColor: 'primary' },
    { id: 'projects', label: 'Quantum Projects', icon: Layers },
    { id: 'research', label: 'Research Publications', icon: FileText },
    { id: 'certificates', label: 'Certificates Gallery', icon: Award },
    { id: 'hackathons', label: 'Hackathons & Contests', icon: Trophy }
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo" onClick={() => { onViewChange('home'); onClose(); }}>
          <div className="brand-icon">Q</div>
          <div className="brand-text">
            <span className="brand-title">Q-<span>HUB</span></span>
            <span className="brand-subtitle">Quantum Achievements</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="sidebar-nav-container">
        <div className="nav-section">
          <div className="nav-section-title">Quantum Portal</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <a
                key={item.id}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onViewChange(item.id);
                  onClose();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge ${item.badgeColor || ''}`}>
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className="nav-badge" style={{ background: 'var(--bg-surface-subtle)', color: 'var(--text-muted)' }}>
                    {item.count}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* Footer Institution Badge */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 800
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Quantum Innovation Hub
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-teal)', display: 'inline-block' }}></span>
              Active Database
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
