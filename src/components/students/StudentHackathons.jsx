import React, { useState } from 'react';
import { Trophy, ArrowLeft, Search, User, FileDown, Download, Trash2 } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCategoryReportPDF, downloadHackathonReportPDF } from '../../utils/pdfGenerator';

export const StudentHackathons = ({ onOpenProfile, onAddHackathon }) => {
  const { hackathons, students, deleteRecord, confirmDelete, removeHackathonParticipant } = useQuantumDB();
  const [selectedHackathonId, setSelectedHackathonId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedHackathon = hackathons.find(h => h.id === selectedHackathonId);

  const filteredHackathons = hackathons.filter(h => {
    const isStudentHackathon = h.targetAudience === 'students' || h.targetAudience === 'student' ||
      (h.studentParticipants && h.studentParticipants.length > 0);

    if (!isStudentHackathon) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      h.name.toLowerCase().includes(q) ||
      h.organizer.toLowerCase().includes(q) ||
      h.edition.toLowerCase().includes(q)
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
      const s = students.find(stu => stu.id === sp.studentId) || {
        id: sp.studentId,
        name: "Student Competitor",
        department: "Computer Science",
        studentId: "QU-2023"
      };
      return { ...sp, student: s, studentName: s.name, name: s.name, department: s.department };
    });

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className="metric-pill primary">{selectedHackathon.edition}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Organizer: {selectedHackathon.organizer}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date: {selectedHackathon.date}</span>
              </div>

              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem' }}>
                {selectedHackathon.name}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={handleDownloadSingleHackathonPDF}>
                <Download size={16} /> Download Hackathon PDF
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
                <Trash2 size={16} /> Delete Hackathon
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-light)'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: '#EFF6FF',
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
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                Total Student Winners & Competitors: {studentParticipants.length}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Hackathon awards, global podium rankings & innovation tracks
              </div>
            </div>
          </div>
        </div>

        {/* Student Participants Table */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Student Participants, Teams & Award Placements ({studentParticipants.length})
        </h3>

        <div className="dbms-table-container">
          <table className="dbms-table">
            <thead>
              <tr>
                <th>Student Participant</th>
                <th>Roll / Student ID</th>
                <th>Department</th>
                <th>Team Name</th>
                <th>Project Built</th>
                <th>Position & Awards Won</th>
                <th style={{ textAlign: 'center' }}>Profile</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {studentParticipants.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No student participation records found for this hackathon.
                  </td>
                </tr>
              ) : (
                studentParticipants.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
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
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.teamName}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.projectBuilt}</span>
                    </td>
                    <td>
                      <span className="metric-pill amber" style={{ fontWeight: 700 }}>
                        {item.award}
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
                        title="Remove Participant"
                        onClick={() => {
                          confirmDelete({
                            title: `Remove ${item.student.name}`,
                            message: `Remove ${item.student.name} from this hackathon?`,
                            onConfirm: () => removeHackathonParticipant(selectedHackathon.id, 'student', item.studentId)
                          });
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="metric-pill primary">{h.edition}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{h.date}</span>
                    <button
                      className="btn-icon-danger"
                      title="Delete Hackathon"
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
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {h.name}
                </h3>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
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
