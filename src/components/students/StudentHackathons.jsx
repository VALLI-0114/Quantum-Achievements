import React, { useState } from 'react';
import { Trophy, ArrowLeft, Search, User, FileDown, Download, Trash2, Edit3, UserPlus, Plus, Users, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCategoryReportPDF, downloadHackathonReportPDF } from '../../utils/pdfGenerator';
import { EditHackathonModal } from '../common/EditHackathonModal';
import { AddHackathonMemberModal } from '../common/AddHackathonMemberModal';

export const StudentHackathons = ({ onOpenProfile, onAddHackathon }) => {
  const { hackathons, students, deleteRecord, confirmDelete, removeHackathonParticipant } = useQuantumDB();
  const [selectedHackathonId, setSelectedHackathonId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [memberModalConfig, setMemberModalConfig] = useState(null);

  const selectedHackathon = hackathons.find(h => h.id === selectedHackathonId);

  const filteredHackathons = hackathons.filter(h => {
    const hasStudents = Array.isArray(h.studentParticipants) && h.studentParticipants.length > 0;
    const isStudentTargeted = h.targetAudience === 'students' || h.targetAudience === 'student' || h.targetAudience === 'all';

    if (!hasStudents && h.targetAudience === 'faculty') return false;

    const isStudentHackathon = hasStudents || isStudentTargeted || (!h.targetAudience && (!h.facultyParticipants || h.facultyParticipants.length === 0));

    if (!isStudentHackathon) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (h.name && h.name.toLowerCase().includes(q)) ||
      (h.organizer && h.organizer.toLowerCase().includes(q)) ||
      (h.edition && h.edition.toLowerCase().includes(q))
    );
  });

  const handleDownloadAllStudentHackathonsPDF = () => {
    const reportItems = hackathons.map(h => ({
      title: `${h.name} (${h.edition})`,
      subtitle: `Organizer: ${h.organizer} • Student Winners: ${(h.studentParticipants || []).length} • Date: ${h.date}`
    }));
    downloadCategoryReportPDF({
      categoryTitle: "Student Quantum Hackathons & Honors Report",
      roleType: "Student",
      items: reportItems
    });
  };

  if (selectedHackathon) {
    const studentParticipants = (selectedHackathon.studentParticipants || []).map(sp => {
      const sid = sp.studentId || sp.id || sp;
      const s = students.find(stu => stu.id === sid || stu.studentId === sid || (sp.studentName && stu.name.toLowerCase() === sp.studentName.toLowerCase()) || (sp.name && stu.name.toLowerCase() === sp.name.toLowerCase())) || {
        id: sid,
        name: sp.studentName || sp.name || "Student Member",
        department: sp.department || "Information Technology",
        studentId: sp.studentId || (typeof sid === 'string' && sid.startsWith('QU-') ? sid : "QU-2026"),
        avatar: (sp.studentName || sp.name || 'SM').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        email: `${(sp.studentName || sp.name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '')}@student.quantum.edu`
      };
      return {
        ...sp,
        student: s,
        studentName: s.name,
        name: s.name,
        department: s.department || sp.department || "Information Technology",
        teamName: sp.teamName?.trim() || 'Team 1',
        award: sp.award || 'Winner',
        projectBuilt: sp.projectBuilt || '—'
      };
    });

    // Group participants strictly by individual teamName
    const teamsMap = new Map();
    studentParticipants.forEach((sp) => {
      const tName = sp.teamName || 'Team 1';
      if (!teamsMap.has(tName)) {
        teamsMap.set(tName, {
          teamName: tName,
          award: sp.award || 'Winner',
          projectBuilt: (sp.projectBuilt && sp.projectBuilt !== '—') ? sp.projectBuilt : '',
          members: []
        });
      }
      const tObj = teamsMap.get(tName);
      if (sp.award && sp.award !== 'Winner' && (!tObj.award || tObj.award === 'Winner')) {
        tObj.award = sp.award;
      }
      if (sp.projectBuilt && sp.projectBuilt !== '—' && !tObj.projectBuilt) {
        tObj.projectBuilt = sp.projectBuilt;
      }
      tObj.members.push({
        ...sp,
        teamRole: sp.role || (tObj.members.length === 0 ? 'Team Lead' : 'Team Member')
      });
    });

    const teams = Array.from(teamsMap.values());

    const handleDownloadSingleHackathonPDF = () => {
      downloadHackathonReportPDF({
        hackathon: {
          ...selectedHackathon,
          studentParticipants
        },
        roleType: "Student"
      });
    };

    return (
      <div className="drilldown-container">
        <div className="breadcrumb-trail">
          <span className="breadcrumb-link" onClick={() => setSelectedHackathonId(null)}>
            <ArrowLeft size={16} /> Back to Student Hackathons
          </span>
          <span>/</span>
          <span>{selectedHackathon.edition}</span>
        </div>

        {/* Hackathon Overview Header Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span className="metric-pill primary">{selectedHackathon.edition}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Organizer: <strong>{selectedHackathon.organizer}</strong></span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>• Date: {selectedHackathon.date}</span>
              </div>

              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem' }}>
                {selectedHackathon.name}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => setMemberModalConfig({ teamName: `Team ${teams.length + 1}`, award: '', project: '' })}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={15} /> Add New Team
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setEditingHackathon(selectedHackathon)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Edit3 size={15} /> Edit Hackathon
              </button>
              <button className="btn btn-outline" onClick={handleDownloadSingleHackathonPDF}>
                <Download size={16} /> Download PDF
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  confirmDelete({
                    title: selectedHackathon.name,
                    message: `Are you sure you want to delete "${selectedHackathon.name}"?`,
                    onConfirm: () => {
                      deleteRecord('hackathons', selectedHackathon.id);
                      setSelectedHackathonId(null);
                    }
                  });
                }}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-light)',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem'
              }}>
                {teams.length}
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {teams.length} Competing Teams
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Individual student team divisions
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                background: 'rgba(114, 47, 55, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem'
              }}>
                {studentParticipants.length}
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {studentParticipants.length} Total Student Winners
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Max 6 members per team
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teams List Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} style={{ color: 'var(--primary)' }} />
              Individual Team Rosters & Honors ({teams.length} Teams)
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Each team has its own award placement, project solution, and member roster (max 6 members per team).
            </p>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setMemberModalConfig({ teamName: `Team ${teams.length + 1}`, award: '', project: '' })}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={14} /> + Add New Team
          </button>
        </div>

        {/* Separate Team Cards */}
        {teams.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-light)'
          }}>
            <Users size={44} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 700 }}>
              No Teams Registered Yet
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Add individual student teams with their award placements and up to 6 members.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setMemberModalConfig({ teamName: 'Team 1', award: '', project: '' })}
            >
              ➕ Add First Team
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {teams.map((team, tIdx) => {
              const isFull = team.members.length >= 6;
              return (
                <div
                  key={tIdx}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    boxShadow: '0 2px 10px rgba(114, 47, 55, 0.04)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Team Card Header */}
                  <div style={{
                    padding: '1.15rem 1.5rem',
                    background: 'linear-gradient(135deg, rgba(114, 47, 55, 0.05) 0%, rgba(114, 47, 55, 0.01) 100%)',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <span className="metric-pill primary" style={{ fontWeight: 800, fontSize: '0.92rem', padding: '0.35rem 0.85rem' }}>
                          {team.teamName}
                        </span>
                        <span className="metric-pill amber" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                          🏆 {team.award}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: isFull ? '#059669' : 'var(--primary)',
                          background: 'var(--bg-surface)',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '20px',
                          border: '1px solid var(--border-light)'
                        }}>
                          👥 {team.members.length} / 6 Members {isFull ? '(Full)' : ''}
                        </span>
                      </div>

                      {team.projectBuilt && team.projectBuilt !== '—' && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Project Solution:</strong> {team.projectBuilt}
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-outline btn-sm"
                      disabled={isFull}
                      onClick={() => setMemberModalConfig({
                        teamName: team.teamName,
                        award: team.award,
                        project: team.projectBuilt
                      })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        borderColor: isFull ? 'var(--border-light)' : 'var(--primary)',
                        color: isFull ? 'var(--text-muted)' : 'var(--primary)',
                        fontWeight: 600,
                        opacity: isFull ? 0.6 : 1
                      }}
                      title={isFull ? "Maximum 6 members reached" : `Add member to ${team.teamName}`}
                    >
                      <UserPlus size={14} /> + Add Member to {team.teamName}
                    </button>
                  </div>

                  {/* Team Members Table */}
                  <div className="dbms-table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                    <table className="dbms-table">
                      <thead>
                        <tr>
                          <th>Student Member</th>
                          <th>Roll / Student ID</th>
                          <th>Department</th>
                          <th>Team Role</th>
                          <th style={{ textAlign: 'center' }}>Profile</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.members.map((item, mIdx) => (
                          <tr key={mIdx}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, var(--primary) 0%, #A3485E 100%)',
                                  color: '#FFFFFF',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {item.student.avatar || item.student.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{item.student.name}</strong>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>
                                {item.student.studentId}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.student.department}</span>
                            </td>
                            <td>
                              <span style={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                background: mIdx === 0 ? 'var(--primary-light)' : 'var(--bg-surface-subtle)',
                                color: mIdx === 0 ? 'var(--primary)' : 'var(--text-secondary)',
                                border: '1px solid var(--border-light)'
                              }}>
                                {item.teamRole || (mIdx === 0 ? 'Team Lead' : 'Team Member')}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => onOpenProfile(item.student.id, 'student')}
                              >
                                <User size={14} /> View Profile
                              </button>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="btn-icon-danger"
                                title={`Remove ${item.student.name} from ${team.teamName}`}
                                onClick={() => {
                                  confirmDelete({
                                    title: `Remove ${item.student.name}`,
                                    message: `Are you sure you want to remove ${item.student.name} from ${team.teamName}?`,
                                    onConfirm: () => removeHackathonParticipant(
                                      selectedHackathon.id,
                                      'student',
                                      item.studentId || item.student.id || item.student.name
                                    )
                                  });
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Team Card Footer Action */}
                  {!isFull ? (
                    <div
                      onClick={() => setMemberModalConfig({
                        teamName: team.teamName,
                        award: team.award,
                        project: team.projectBuilt
                      })}
                      style={{
                        padding: '0.8rem 1.5rem',
                        background: 'rgba(114, 47, 55, 0.02)',
                        borderTop: '1px dashed var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(114, 47, 55, 0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(114, 47, 55, 0.02)'}
                    >
                      <UserPlus size={15} /> + Add another member to {team.teamName} ({6 - team.members.length} spot{6 - team.members.length > 1 ? 's' : ''} remaining)
                    </div>
                  ) : (
                    <div style={{
                      padding: '0.65rem 1.5rem',
                      background: 'rgba(16, 185, 129, 0.05)',
                      borderTop: '1px solid var(--border-light)',
                      textAlign: 'center',
                      color: '#059669',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      ✓ Team Complete (Max 6 members reached)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modals */}
        {editingHackathon && (
          <EditHackathonModal
            isOpen={Boolean(editingHackathon)}
            onClose={() => setEditingHackathon(null)}
            hackathon={editingHackathon}
          />
        )}

        {memberModalConfig && (
          <AddHackathonMemberModal
            isOpen={Boolean(memberModalConfig)}
            onClose={() => setMemberModalConfig(null)}
            hackathonId={selectedHackathon.id}
            hackathonName={selectedHackathon.name}
            initialTeamName={memberModalConfig.teamName || ''}
            initialAward={memberModalConfig.award || ''}
            initialProject={memberModalConfig.project || ''}
            roleType="student"
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="view-toolbar">
        <div className="view-search-box">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search student hackathons by event name or edition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={handleDownloadAllStudentHackathonsPDF}>
            <FileDown size={15} /> Download Hackathons PDF
          </button>
          <button className="btn btn-primary" onClick={onAddHackathon}>
            ➕ Add Hackathon
          </button>
        </div>
      </div>

      <div className="cards-grid-3">
        {filteredHackathons.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3.5rem 1rem',
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-light)'
          }}>
            <Trophy size={44} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 700 }}>No Student Hackathons Found</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Start by registering a student quantum hackathon victory or project.</p>
            <button className="btn btn-primary" onClick={onAddHackathon}>➕ Add Hackathon</button>
          </div>
        ) : (
          filteredHackathons.map(h => {
            const stuCount = (h.studentParticipants || []).length;
            return (
              <div
                key={h.id}
                className="item-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedHackathonId(h.id)}
              >
                <div className="card-header-row">
                  <span className="metric-pill primary card-badge-pill" title={h.edition}>{h.edition}</span>
                  <div className="card-header-meta">
                    <span className="card-header-meta-text" title={h.date}>{h.date}</span>
                    <button
                      className="btn-icon-danger"
                      title="Delete Hackathon"
                      style={{ flexShrink: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        confirmDelete({
                          title: h.name,
                          message: `Are you sure you want to delete "${h.name}"?`,
                          onConfirm: () => deleteRecord('hackathons', h.id)
                        });
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="card-title-clamp" title={h.name}>
                  {h.name}
                </h3>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={h.organizer}>
                  Organizer: <strong>{h.organizer}</strong>
                </div>

                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1rem',
                  marginTop: 'auto',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Student Competitors:</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>
                      {stuCount} Student Winners
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                    View Student Teams →
                  </span>
                  <span className="btn btn-outline btn-sm">
                    {stuCount} Participants
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
