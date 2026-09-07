import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_FACULTY,
  INITIAL_STUDENTS,
  INITIAL_COURSES,
  INITIAL_CERTIFICATES,
  INITIAL_PROJECTS,
  INITIAL_RESEARCH_PAPERS,
  INITIAL_HACKATHONS
} from './initialData';

const STORAGE_KEY = 'qhub_quantum_react_db_v2';

const QuantumDBContext = createContext(null);

export const QuantumDBProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to parse saved database:", e);
    }
    return {
      faculty: INITIAL_FACULTY,
      students: INITIAL_STUDENTS,
      courses: INITIAL_COURSES,
      certificates: INITIAL_CERTIFICATES,
      projects: INITIAL_PROJECTS,
      researchPapers: INITIAL_RESEARCH_PAPERS,
      hackathons: INITIAL_HACKATHONS
    };
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("LocalStorage save error:", e);
    }
  }, [data]);

  // Helper getters
  const getFacultyById = (id) => data.faculty.find(f => f.id === id);
  const getStudentById = (id) => data.students.find(s => s.id === id);

  // 1. Course Management & Completion Add
  const addCourse = (newCourse) => {
    setData(prev => ({
      ...prev,
      courses: [{
        ...newCourse,
        id: newCourse.id || `CRS-${Date.now().toString().slice(-4)}`,
        facultyCompletions: newCourse.facultyCompletions || [],
        facultyEnrolled: newCourse.facultyEnrolled || [],
        studentCompletions: newCourse.studentCompletions || [],
        studentEnrolled: newCourse.studentEnrolled || []
      }, ...prev.courses]
    }));
  };

  const addCourseCompletion = (courseId, audienceType, personId, record) => {
    setData(prev => {
      const updatedCourses = prev.courses.map(c => {
        if (c.id !== courseId) return c;
        if (audienceType === 'faculty') {
          const exists = c.facultyCompletions.some(fc => fc.facultyId === personId);
          if (exists) return c;
          return {
            ...c,
            facultyCompletions: [...c.facultyCompletions, { facultyId: personId, ...record }],
            facultyEnrolled: c.facultyEnrolled.filter(fe => fe.facultyId !== personId)
          };
        } else {
          const exists = c.studentCompletions.some(sc => sc.studentId === personId);
          if (exists) return c;
          return {
            ...c,
            studentCompletions: [...c.studentCompletions, { studentId: personId, ...record }],
            studentEnrolled: c.studentEnrolled.filter(se => se.studentId !== personId)
          };
        }
      });
      return { ...prev, courses: updatedCourses };
    });
  };

  // 2. Certificate Management
  const addCertificate = (newCert) => {
    setData(prev => ({
      ...prev,
      certificates: [{
        ...newCert,
        id: newCert.id || `CERT-NEW-${Date.now().toString().slice(-4)}`,
        facultyRecipients: newCert.facultyRecipients || [],
        studentRecipients: newCert.studentRecipients || []
      }, ...prev.certificates]
    }));
  };

  const addCertificateRecipient = (certId, audienceType, personId, record) => {
    setData(prev => {
      const updatedCerts = prev.certificates.map(cert => {
        if (cert.id !== certId) return cert;
        if (audienceType === 'faculty') {
          return {
            ...cert,
            facultyRecipients: [...cert.facultyRecipients, { facultyId: personId, ...record }]
          };
        } else {
          return {
            ...cert,
            studentRecipients: [...cert.studentRecipients, { studentId: personId, ...record }]
          };
        }
      });
      return { ...prev, certificates: updatedCerts };
    });
  };

  // 3. Project Management
  const addProject = (newProject) => {
    setData(prev => ({
      ...prev,
      projects: [{
        ...newProject,
        id: newProject.id || `PRJ-${Date.now().toString().slice(-4)}`,
        facultyInvolved: newProject.facultyInvolved || [],
        studentsInvolved: newProject.studentsInvolved || []
      }, ...prev.projects]
    }));
  };

  // 4. Research Paper Management
  const addResearchPaper = (newPaper) => {
    setData(prev => ({
      ...prev,
      researchPapers: [{
        ...newPaper,
        id: newPaper.id || `PUB-${Date.now().toString().slice(-4)}`,
        facultyAuthors: newPaper.facultyAuthors || [],
        studentAuthors: newPaper.studentAuthors || []
      }, ...prev.researchPapers]
    }));
  };

  // 5. Hackathon Management
  const addHackathon = (newHackathon) => {
    setData(prev => ({
      ...prev,
      hackathons: [{
        ...newHackathon,
        id: newHackathon.id || `HCK-${Date.now().toString().slice(-4)}`,
        facultyParticipants: newHackathon.facultyParticipants || [],
        studentParticipants: newHackathon.studentParticipants || []
      }, ...prev.hackathons]
    }));
  };

  // 6. Person (Faculty / Student) Management
  const addFaculty = (newFaculty) => {
    setData(prev => ({
      ...prev,
      faculty: [{
        ...newFaculty,
        id: newFaculty.id || `FAC-${(prev.faculty.length + 1).toString().padStart(3, '0')}`,
        avatar: newFaculty.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      }, ...prev.faculty]
    }));
  };

  const addStudent = (newStudent) => {
    setData(prev => ({
      ...prev,
      students: [{
        ...newStudent,
        id: newStudent.id || `STU-${(prev.students.length + 1).toString().padStart(3, '0')}`,
        avatar: newStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      }, ...prev.students]
    }));
  };

  // 7. Delete Entity Record
  const deleteRecord = (category, id) => {
    setData(prev => {
      if (category === 'faculty') return { ...prev, faculty: prev.faculty.filter(f => f.id !== id) };
      if (category === 'students') return { ...prev, students: prev.students.filter(s => s.id !== id) };
      if (category === 'courses') return { ...prev, courses: prev.courses.filter(c => c.id !== id) };
      if (category === 'certificates') return { ...prev, certificates: prev.certificates.filter(c => c.id !== id) };
      if (category === 'projects') return { ...prev, projects: prev.projects.filter(p => p.id !== id) };
      if (category === 'papers' || category === 'researchPapers') return { ...prev, researchPapers: prev.researchPapers.filter(p => p.id !== id) };
      if (category === 'hackathons') return { ...prev, hackathons: prev.hackathons.filter(h => h.id !== id) };
      return prev;
    });
  };

  // 8. Delete Participant from Course Roster
  const removeCourseCompletion = (courseId, audienceType, personId) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map(c => {
        if (c.id !== courseId) return c;
        if (audienceType === 'faculty') {
          return {
            ...c,
            facultyCompletions: (c.facultyCompletions || []).filter(fc => fc.facultyId !== personId)
          };
        } else {
          return {
            ...c,
            studentCompletions: (c.studentCompletions || []).filter(sc => sc.studentId !== personId)
          };
        }
      })
    }));
  };

  // 9. Delete Recipient from Certificate
  const removeCertificateRecipient = (certId, audienceType, personId) => {
    setData(prev => ({
      ...prev,
      certificates: prev.certificates.map(c => {
        if (c.id !== certId) return c;
        if (audienceType === 'faculty') {
          return {
            ...c,
            facultyRecipients: (c.facultyRecipients || []).filter(fr => fr.facultyId !== personId)
          };
        } else {
          return {
            ...c,
            studentRecipients: (c.studentRecipients || []).filter(sr => sr.studentId !== personId)
          };
        }
      })
    }));
  };

  // 10. Delete Participant from Project
  const removeProjectParticipant = (projectId, roleType, personId) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        if (roleType === 'faculty') {
          return {
            ...p,
            facultyInvolved: (p.facultyInvolved || []).filter(fi => fi.facultyId !== personId)
          };
        } else {
          return {
            ...p,
            studentsInvolved: (p.studentsInvolved || []).filter(si => si.studentId !== personId)
          };
        }
      })
    }));
  };

  // 11. Delete Author from Paper
  const removePaperAuthor = (paperId, roleType, personId) => {
    setData(prev => ({
      ...prev,
      researchPapers: prev.researchPapers.map(rp => {
        if (rp.id !== paperId) return rp;
        if (roleType === 'faculty') {
          return {
            ...rp,
            facultyAuthors: (rp.facultyAuthors || []).filter(fa => fa.facultyId !== personId)
          };
        } else {
          return {
            ...rp,
            studentAuthors: (rp.studentAuthors || []).filter(sa => sa.studentId !== personId)
          };
        }
      })
    }));
  };

  // 12. Delete Participant from Hackathon
  const removeHackathonParticipant = (hackathonId, roleType, personId) => {
    setData(prev => ({
      ...prev,
      hackathons: prev.hackathons.map(h => {
        if (h.id !== hackathonId) return h;
        if (roleType === 'faculty') {
          return {
            ...h,
            facultyParticipants: (h.facultyParticipants || []).filter(fp => fp.facultyId !== personId)
          };
        } else {
          return {
            ...h,
            studentParticipants: (h.studentParticipants || []).filter(sp => sp.studentId !== personId)
          };
        }
      })
    }));
  };

  // 13. Export & Reset
  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `qhub_quantum_db_export_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchorElem.click();
  };

  const resetSeedData = () => {
    if (window.confirm("Are you sure you want to reset the database to default academic seed records?")) {
      const initial = {
        faculty: INITIAL_FACULTY,
        students: INITIAL_STUDENTS,
        courses: INITIAL_COURSES,
        certificates: INITIAL_CERTIFICATES,
        projects: INITIAL_PROJECTS,
        researchPapers: INITIAL_RESEARCH_PAPERS,
        hackathons: INITIAL_HACKATHONS
      };
      setData(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  };

  return (
    <QuantumDBContext.Provider value={{
      faculty: data.faculty,
      students: data.students,
      courses: data.courses,
      certificates: data.certificates,
      projects: data.projects,
      researchPapers: data.researchPapers,
      hackathons: data.hackathons,
      getFacultyById,
      getStudentById,
      addCourse,
      addCourseCompletion,
      addCertificate,
      addCertificateRecipient,
      addProject,
      addResearchPaper,
      addHackathon,
      addFaculty,
      addStudent,
      deleteRecord,
      removeCourseCompletion,
      removeCertificateRecipient,
      removeProjectParticipant,
      removePaperAuthor,
      removeHackathonParticipant,
      exportJSON,
      resetSeedData
    }}>
      {children}
    </QuantumDBContext.Provider>
  );
};

export const useQuantumDB = () => {
  const context = useContext(QuantumDBContext);
  if (!context) {
    throw new Error('useQuantumDB must be used within a QuantumDBProvider');
  }
  return context;
};
