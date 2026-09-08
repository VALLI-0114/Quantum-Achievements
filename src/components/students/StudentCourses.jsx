import React, { useState } from 'react';
import { BookOpen, Users, Clock, Award, ArrowLeft, Download, Search, CheckCircle2, User, FileDown, Plus, UserPlus, Trash2 } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCourseRosterPDF, downloadCategoryReportPDF } from '../../utils/pdfGenerator';
import { AddParticipantModal } from '../common/AddParticipantModal';

export const StudentCourses = ({ onOpenCertificate, onOpenProfile, onAddCourse }) => {
  const { courses, students, deleteRecord, confirmDelete, removeCourseCompletion } = useQuantumDB();
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const filteredCourses = courses.filter(c => {
    // Exclude courses explicitly targeted for faculty
    if (c.targetAudience === 'faculty') return false;

    const isStudentCourse = c.targetAudience === 'students' || c.targetAudience === 'student' ||
      (!c.targetAudience && (
        (c.studentCompletions && c.studentCompletions.length > 0) ||
        (c.studentEnrolled && c.studentEnrolled.length > 0) ||
        (!c.facultyCompletions || c.facultyCompletions.length === 0)
      ));

    if (!isStudentCourse) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.provider.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  });

  const handleDownloadAllStudentCoursesPDF = () => {
    const reportItems = courses.map(c => ({
      title: `${c.code}: ${c.name}`,
      subtitle: `Provider: ${c.provider} • Student Completions: ${c.studentCompletions?.length || 0} • Learning: ${c.studentEnrolled?.length || 0}`
    }));
    downloadCategoryReportPDF({
      categoryTitle: "Student Quantum Courses Roster",
      roleType: "Student",
      items: reportItems
    });
  };

  if (selectedCourse) {
    const completions = selectedCourse.studentCompletions || [];
    const enrolled = selectedCourse.studentEnrolled || [];

    const completedStudentList = completions.map(comp => {
      const s = students.find(stu => stu.id === comp.studentId) || {
        name: "Student Candidate",
        department: "Information Technology",
        studentId: "QU-2025",
        year: "3rd Year"
      };
      return {
        ...comp,
        student: s,
        name: s.name,
        department: s.department
      };
    }).filter(item => {
      const q = studentSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        item.student.name.toLowerCase().includes(q) ||
        item.student.studentId.toLowerCase().includes(q) ||
        item.student.department.toLowerCase().includes(q)
      );
    });

    const enrolledStudentList = enrolled.map(enr => {
      const s = students.find(stu => stu.id === enr.studentId) || {
        name: "Enrolled Candidate",
        department: "Computer Science",
        studentId: "QU-2025"
      };
      return { ...enr, student: s };
    });

    const handleDownloadRoster = () => {
      downloadCourseRosterPDF({
        courseTitle: selectedCourse.name,
        courseCode: selectedCourse.code,
        provider: selectedCourse.provider,
        roleType: "Student",
        completions: completedStudentList.map(c => ({
          name: c.student.name,
          department: c.student.department,
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
            <ArrowLeft size={16} /> Back to Student Courses
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
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className="metric-pill primary">{selectedCourse.code}</span>
                <span className="metric-pill secondary">{selectedCourse.category || 'Quantum Track'}</span>
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
                <Download size={16} /> Download Student Roster PDF
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  confirmDelete({
                    title: selectedCourse.name || selectedCourse.code,
                    message: `Are you sure you want to delete course "${selectedCourse.name || selectedCourse.code}"? This will remove the course and its student completion records.`,
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
                background: '#EFF6FF',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem'
              }}>
                {completions.length}
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Total Completed: {completions.length} Students
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified student graduation records</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                background: '#F0FDFA',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem'
              }}>
                {enrolled.length}
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                  {enrolled.length} Currently Learning
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active learners in current cohort</div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar with Search and Add Student Action */}
        <div className="view-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Students Who Completed This Course ({completedStudentList.length})
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
                placeholder="Search student candidate, roll number, or department..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setIsAddStudentModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              <UserPlus size={15} /> Add Student to Course
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="dbms-table-container" style={{ marginBottom: '2rem' }}>
          <table className="dbms-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll / Student ID</th>
                <th>Department</th>
                <th>Year</th>
                <th>Completion Date</th>
                <th>Grade / Distinction</th>
                <th style={{ textAlign: 'center' }}>Certificate</th>
                <th style={{ textAlign: 'center' }}>Profile</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {completedStudentList.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No student completion records matching search.
                  </td>
                </tr>
              ) : (
                completedStudentList.map((item, idx) => (
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
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.student.year || '4th Year'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {item.completionDate}
                      </span>
                    </td>
                    <td>
                      <span className="metric-pill success">
                        {item.grade || '95% (Distinction)'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenCertificate({
                          recipientName: item.student.name,
                          recipientRole: "Student Candidate",
                          certificateTitle: `${selectedCourse.code}: ${selectedCourse.name}`,
                          issuer: selectedCourse.provider,
                          credentialId: item.certificateId || `QHUB-STU-${idx + 101}`,
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
                        onClick={() => onOpenProfile(item.student.id, 'student')}
                      >
                        <User size={14} /> View Profile
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-icon-danger"
                        title="Remove student from course"
                        onClick={() => {
                          confirmDelete({
                            title: `Remove ${item.student.name}`,
                            message: `Remove ${item.student.name} from this course completion roster?`,
                            onConfirm: () => removeCourseCompletion(selectedCourse.id, 'students', item.student.id)
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

        {/* Add Student to Course Modal */}
        <AddParticipantModal
          isOpen={isAddStudentModalOpen}
          onClose={() => setIsAddStudentModalOpen(false)}
          targetType="course"
          audienceType="student"
          entityId={selectedCourse.id}
          entityTitle={selectedCourse.name}
          entityCode={selectedCourse.code}
        />

        {/* Currently Learning Students List */}
        {enrolledStudentList.length > 0 && (
          <div style={{
            background: '#F0FDFA',
            border: '1px solid #99F6E4',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-teal)', marginBottom: '0.75rem' }}>
              Students Currently Learning / In Progress ({enrolledStudentList.length})
            </h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {enrolledStudentList.map((enr, i) => (
                <div key={i} style={{
                  background: '#FFFFFF',
                  border: '1px solid #CCFBF1',
                  borderRadius: '8px',
                  padding: '0.65rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <User size={16} style={{ color: 'var(--accent-teal)' }} />
                  <div>
                    <strong style={{ fontSize: '0.88rem' }}>{enr.student.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Progress: {enr.progress}% • {enr.student.studentId}
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

  // --- Main View: Grid of Quantum Courses Completed by Students ---
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
          <button className="btn btn-outline" onClick={handleDownloadAllStudentCoursesPDF}>
            <FileDown size={15} /> Download Courses PDF
          </button>
          <button className="btn btn-primary" onClick={onAddCourse}>
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
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 700 }}>No Student Courses Found</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Start by adding quantum courses for students.</p>
            <button className="btn btn-primary" onClick={onAddCourse}>➕ Add Course</button>
          </div>
        ) : (
          filteredCourses.map(course => {
            const completedCount = (course.studentCompletions || []).length;
            const enrolledCount = (course.studentEnrolled || []).length;
            const totalPool = students.length || 6;
            const completionPct = Math.round((completedCount / (totalPool || 1)) * 100);

            return (
              <div
                key={course.id}
                className="item-card"
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => setSelectedCourseId(course.id)}
              >
                <div className="card-header-row">
                  <span className="metric-pill primary card-badge-pill" title={course.code}>
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
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Number of Students Completed:</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>
                      {completedCount} Students
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Currently Learning / Enrolled:</span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent-teal)' }}>
                      {enrolledCount} Students
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                    Explore Student Roster →
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
