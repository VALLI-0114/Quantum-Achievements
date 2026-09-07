import React, { useState } from 'react';
import { Trophy, ArrowLeft, Search, User, Award, CheckCircle2, FileDown, Download } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCategoryReportPDF, downloadHackathonReportPDF } from '../../utils/pdfGenerator';

export const FacultyHackathons = ({ onOpenProfile, onAddHackathon }) => {
  const { hackathons, faculty } = useQuantumDB();
  const [selectedHackathonId, setSelectedHackathonId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedHackathon = hackathons.find(h => h.id === selectedHackathonId);

  const filteredHackathons = hackathons.filter(h => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      h.name.toLowerCase().includes(q) ||
      h.organizer.toLowerCase().includes(q) ||
      h.edition.toLowerCase().includes(q)
    );
  });

  const handleDownloadAllHackathonsPDF = () => {
    const reportItems = hackathons.map(h => ({
      title: `${h.name} (${h.edition})`,
      subtitle: `Organizer: ${h.organizer} • Faculty Participants: ${(h.facultyParticipants || []).length} Teams • Date: ${h.date}`
    }));
    downloadCategoryReportPDF({
      categoryTitle: "Faculty Quantum Hackathons Report",
      roleType: "Faculty",
      items: reportItems
    });
  };

  if (selectedHackathon) {
    const facultyParticipants = (selectedHackathon.facultyParticipants || []).map(fp => {
      const f = faculty.find(fac => fac.id === fp.facultyId) || {
        name: "Dr. Faculty Participant",
        department: "Computer Science"
      };
      return { ...fp, faculty: f, facultyName: f.name, name: f.name, department: f.department };
    });

    const handleDownloadSingleHackathonPDF = () => {
      downloadHackathonReportPDF({
        hackathon: {
          ...selectedHackathon,
          facultyParticipants
        },
        roleType: "Faculty"
      });
    };

    return (
      <div className="drilldown-container">
        <div className="breadcrumb-trail">
          <span className="breadcrumb-link" onClick={() => setSelectedHackathonId(null)}>
            <ArrowLeft size={16} /> Back to Faculty Hackathons
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
                <span className="metric-pill secondary">{selectedHackathon.edition}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Organizer: {selectedHackathon.organizer}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date: {selectedHackathon.date}</span>
              </div>

              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem' }}>
                {selectedHackathon.name}
              </h1>
            </div>

            <button className="btn btn-outline" onClick={handleDownloadSingleHackathonPDF}>
              <Download size={16} /> Download Hackathon PDF
            </button>
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
              background: '#FFFBEB',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem'
            }}>
              {facultyParticipants.length}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D97706' }}>
                Total Faculty Teams / Mentors: {facultyParticipants.length}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Competitive quantum challenges & global hackathon tracks
              </div>
            </div>
          </div>
        </div>

        {/* Faculty Participants Table */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Faculty Participants, Teams & Award Placements ({facultyParticipants.length})
        </h3>

        <div className="dbms-table-container">
          <table className="dbms-table">
            <thead>
              <tr>
                <th>Faculty Participant</th>
                <th>Department</th>
                <th>Team Name</th>
                <th>Project Built</th>
                <th>Position & Awards Won</th>
                <th style={{ textAlign: 'center' }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {facultyParticipants.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No faculty participation records found for this hackathon.
                  </td>
                </tr>
              ) : (
                facultyParticipants.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
                          color: '#FFFFFF',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {item.faculty.avatar || item.faculty.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{item.faculty.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.faculty.title}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.faculty.department}</span>
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
                        onClick={() => onOpenProfile(item.faculty.id, 'faculty')}
                      >
                        <User size={14} /> View Profile
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
            placeholder="Search hackathons by event name, edition, or organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={handleDownloadAllHackathonsPDF}>
            <FileDown size={15} /> Download Hackathons PDF
          </button>
          <button className="btn btn-secondary" onClick={onAddHackathon}>
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
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 700 }}>No Faculty Hackathons Found</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Start by registering a quantum hackathon competition entry.</p>
            <button className="btn btn-secondary" onClick={onAddHackathon}>➕ Add Hackathon</button>
          </div>
        ) : (
          filteredHackathons.map(h => {
            const facCount = (h.facultyParticipants || []).length;
            return (
              <div
                key={h.id}
                className="item-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedHackathonId(h.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="metric-pill amber">{h.edition}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{h.date}</span>
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
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Faculty Teams:</span>
                    <strong style={{ fontSize: '0.95rem', color: '#D97706' }}>
                      {facCount} Faculty Teams
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#D97706', fontWeight: 600 }}>
                    View Hackathon Roster →
                  </span>
                  <span className="btn btn-outline btn-sm">
                    {facCount} Participants
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
