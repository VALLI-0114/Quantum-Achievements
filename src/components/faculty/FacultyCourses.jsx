import React, { useState } from 'react';
import { BookOpen, Users, Clock, Award, ArrowLeft, Download, Search, CheckCircle2, User, FileDown, Plus, UserPlus, Trash2 } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCourseRosterPDF, downloadCategoryReportPDF } from '../../utils/pdfGenerator';
import { AddParticipantModal } from '../common/AddParticipantModal';

export const FacultyCourses = ({ onOpenCertificate, onOpenProfile, onAddCourse }) => {
  const { courses, faculty, deleteRecord, confirmDelete, removeCourseCompletion } = useQuantumDB();
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);

  // Selected Course
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // Filter courses by search query and faculty relevance
  const filteredCourses = courses.filter(c => {
    const isFacultyCourse = c.targetAudience === 'faculty' ||
      (c.facultyCompletions && c.facultyCompletions.length > 0) ||
      (c.facultyEnrolled && c.facultyEnrolled.length > 0) ||
      (!c.targetAudience && (!c.studentCompletions || c.studentCompletions.length === 0));

    if (!isFacultyCourse) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.provider.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  });

  // If a course is selected -> Show Drill-Down View
  if (selectedCourse) {
    const completions = selectedCourse.facultyCompletions || [];
    const enrolled = selectedCourse.facultyEnrolled || [];

    // Map faculty data
    const completedFacultyList = completions.map(comp => {
      const f = faculty.find(fac => fac.id === comp.facultyId) || {
        name: "Dr. Faculty Member",
        department: "Physics & Quantum",
        title: "Professor",
        email: "faculty@quantum-hub.edu"
      };
      return {
        ...comp,
        faculty: f,
        name: f.name,
        department: f.department
      };
    }).filter(item => {
      const q = facultySearch.toLowerCase().trim();
      if (!q) return true;
      return (
        item.faculty.name.toLowerCase().includes(q) ||
        item.faculty.department.toLowerCase().includes(q) ||
        item.grade?.toLowerCase().includes(q)
      );
    });

    const enrolledFacultyList = enrolled.map(enr => {
      const f = faculty.find(fac => fac.id === enr.facultyId) || {
        name: "Dr. Enrolled Faculty",
        department: "Computer Science"
      };
      return { ...enr, faculty: f };
    });

    const handleDownloadRoster = () => {
      downloadCourseRosterPDF({
        courseTitle: selectedCourse.name,
        courseCode: selectedCourse.code,
        provider: selectedCourse.provider,
        roleType: "Faculty",
        completions: completedFacultyList.map(c => ({
          name: c.faculty.name,
          department: c.faculty.department,
          completionDate: c.completionDate,
          grade: c.grade
        }))
      });
    };

    return (
      <div className="drilldown-container">
        {/* Breadcrumb Trail */}
        <div className="breadcrumb-trail">
          <span className="breadcrumb-link" onClick={() => setSelectedCourseId(null)}>
            <ArrowLeft size={16} /> Back to Faculty Courses
          </span>
          <span>/</span>
          <span>{selectedCourse.code}</span>
        </div>

        {/* Header Banner */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.75rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className="metric-pill primary">{selectedCourse.code}</span>
                <span className="metric-pill secondary">{selectedCourse.category || 'Quantum Theory'}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selectedCourse.provider}</span>
              </div>

              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem' }}>
                {selectedCourse.name}
              </h1>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '820px' }}>
                {selectedCourse.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={handleDownloadRoster}>
                <Download size={16} /> Download Roster PDF
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  confirmDelete({
                    title: selectedCourse.name || selectedCourse.code,
                    message: `Are you sure you want to delete course "${selectedCourse.name || selectedCourse.code}"? This will remove the course and all associated completion records.`,
                    onConfirm: () => {
                      deleteRecord('courses', selectedCourse.id);
                      setSelectedCourseId(null);
                    }
                  });
                }}
              >
                <Trash2 size={15} /> Delete Course
              </button>
            </div>
          </div>

          {/* Highlight Metrics */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-light)',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                background: 'var(--secondary-light)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem'
              }}>
                {completions.length}
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  Total Completed: {completions.length} Faculty
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified course completion credentials</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                {enrolled.length}
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {enrolled.length} Enrolled / In-Progress
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Faculty currently studying syllabus</div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar with Search and Add Faculty Action */}
        <div className="view-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Faculty Members Who Completed This Course ({completedFacultyList.length})
            </h3>
            <span className="metric-pill success">
              <CheckCircle2 size={13} /> Verified Roster
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="view-search-box">
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search faculty name, department, or distinction..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
              />
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setIsAddFacultyModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              <UserPlus size={15} /> Add Faculty to Course
            </button>
          </div>
        </div>

        {/* Faculty Roster Table */}
        <div className="dbms-table-container" style={{ marginBottom: '2rem' }}>
          <table className="dbms-table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Department</th>
                <th>Completion Date</th>
                <th>Distinction / Grade</th>
                <th style={{ textAlign: 'center' }}>Certificate</th>
                <th style={{ textAlign: 'center' }}>Profile</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {completedFacultyList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No faculty records found matching your query.
                  </td>
                </tr>
              ) : (
                completedFacultyList.map((item, idx) => (
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
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {item.completionDate}
                      </span>
                    </td>
                    <td>
                      <span className="metric-pill success">
                        {item.grade || 'Certified Master'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenCertificate({
                          recipientName: item.faculty.name,
                          recipientRole: "Faculty Member",
                          certificateTitle: `${selectedCourse.code}: ${selectedCourse.name}`,
                          issuer: selectedCourse.provider,
                          credentialId: item.certificateId || `QHUB-FAC-${idx + 101}`,
                          issueDate: item.completionDate,
                          grade: item.grade || "Distinction",
                          uploadedFile: item.uploadedFile || selectedCourse.uploadedFile
                        })}
                      >
                        <Award size={14} /> View Certificate
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenProfile(item.faculty.id, 'faculty')}
                      >
                        <User size={14} /> View Profile
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-icon-danger"
                        title="Remove faculty from course"
                        onClick={() => {
                          confirmDelete({
                            title: `Remove ${item.faculty.name}`,
                            message: `Remove ${item.faculty.name} from this course completion roster?`,
                            onConfirm: () => removeCourseCompletion(selectedCourse.id, 'faculty', item.faculty.id)
                          });
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Faculty to Course Modal */}
        <AddParticipantModal
          isOpen={isAddFacultyModalOpen}
          onClose={() => setIsAddFacultyModalOpen(false)}
          targetType="course"
          audienceType="faculty"
          entityId={selectedCourse.id}
          entityTitle={selectedCourse.name}
          entityCode={selectedCourse.code}
        />

        {/* Faculty Currently Enrolled / In Progress */}
        {enrolledFacultyList.length > 0 && (
          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
              Faculty Members Currently Enrolled / In Progress ({enrolledFacultyList.length})
            </h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {enrolledFacultyList.map((enr, i) => (
                <div key={i} style={{
                  background: '#FFFFFF',
                  border: '1px solid #DBEAFE',
                  borderRadius: '8px',
                  padding: '0.65rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <User size={16} style={{ color: 'var(--primary)' }} />
                  <div>
                    <strong style={{ fontSize: '0.88rem' }}>{enr.faculty.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Progress: {enr.progress}% • Started: {enr.startDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Main View: Grid of Quantum Courses Completed by Faculty ---
  const handleDownloadAllCoursesPDF = () => {
    const reportItems = courses.map(c => ({
      title: `${c.code}: ${c.name}`,
      subtitle: `Provider: ${c.provider} • Completed: ${c.facultyCompletions?.length || 0} Faculty • Enrolled: ${c.facultyEnrolled?.length || 0} Faculty`
    }));
    downloadCategoryReportPDF({
      categoryTitle: "Faculty Quantum Courses Roster",
      roleType: "Faculty",
      items: reportItems
    });
  };

  return (
    <div>
      <div className="view-toolbar">
        <div className="view-search-box">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search quantum courses by name, code, domain, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={handleDownloadAllCoursesPDF}>
            <FileDown size={15} /> Download Courses PDF
          </button>
          <button className="btn btn-secondary" onClick={onAddCourse}>
            ➕ Add Course
          </button>
        </div>
      </div>

      <div className="cards-grid-3">
        {filteredCourses.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3.5rem 1rem',
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-light)'
          }}>
            <BookOpen size={44} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 700 }}>No Faculty Courses Found</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Start by adding a quantum course for faculty members.</p>
            <button className="btn btn-secondary" onClick={onAddCourse}>➕ Add Course</button>
          </div>
        ) : (
          filteredCourses.map(course => {
            const completedCount = (course.facultyCompletions || []).length;
            const enrolledCount = (course.facultyEnrolled || []).length;
            const totalFacultyPool = faculty.length || 4;
            const completionPct = Math.round((completedCount / (totalFacultyPool || 1)) * 100);

            return (
              <div
                key={course.id}
                className="item-card"
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => setSelectedCourseId(course.id)}
              >
                <div className="card-header-row">
                  <span className="metric-pill secondary card-badge-pill" title={course.code}>
                    {course.code}
                  </span>
                  <div className="card-header-meta">
                    <span className="card-header-meta-text" title={course.provider}>
                      {course.provider}
                    </span>
                    <button
                      className="btn-icon-danger"
                      title="Delete Course"
                      style={{ flexShrink: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        confirmDelete({
                          title: course.name || course.code,
                          message: `Are you sure you want to delete course "${course.name || course.code}"? This action cannot be undone.`,
                          onConfirm: () => deleteRecord('courses', course.id)
                        });
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="card-title-clamp" title={course.name}>
                  {course.name}
                </h3>

                <p className="card-desc-clamp" title={course.description}>
                  {course.description}
                </p>

                {/* Course Metrics */}
                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1rem',
                  marginTop: 'auto',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Total Faculty Completed:</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--secondary)' }}>
                      {completedCount} Faculty
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Currently Enrolled / In-Progress:</span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                      {enrolledCount} Enrolled
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 600 }}>
                    Explore Course Roster →
                  </span>
                  <span className="btn btn-outline btn-sm">
                    View {completedCount} Completers
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
