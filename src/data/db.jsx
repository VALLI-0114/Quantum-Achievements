import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
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

  const [cloudStatus, setCloudStatus] = useState('connecting'); // 'connecting' | 'synced' | 'syncing' | 'table_needed' | 'offline'
  const isInitialCloudLoad = useRef(true);

  // 1. Initial Load from Supabase Cloud
  useEffect(() => {
    let isMounted = true;

    const fetchFromSupabase = async () => {
      try {
        const { data: cloudRow, error } = await supabase
          .from('quantum_portal_data')
          .select('data, updated_at')
          .eq('id', 'main_state')
          .maybeSingle();

        if (error) {
          if (error.code === 'PGRST205' || error.code === '42P01') {
            if (isMounted) setCloudStatus('table_needed');
          } else {
            if (isMounted) setCloudStatus('offline');
          }
          return;
        }

        if (cloudRow && cloudRow.data) {
          if (isMounted) {
            setData(cloudRow.data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudRow.data));
            setCloudStatus('synced');
          }
        } else {
          // No cloud row exists yet -> upload initial data
          const { error: insertErr } = await supabase
            .from('quantum_portal_data')
            .upsert({
              id: 'main_state',
              data: data,
              updated_at: new Date().toISOString()
            });

          if (insertErr) {
            if (insertErr.code === 'PGRST205' || insertErr.code === '42P01') {
              if (isMounted) setCloudStatus('table_needed');
            } else {
              if (isMounted) setCloudStatus('offline');
            }
          } else {
            if (isMounted) setCloudStatus('synced');
          }
        }
      } catch (e) {
        console.warn("Supabase initial load error:", e);
        if (isMounted) setCloudStatus('offline');
      } finally {
        isInitialCloudLoad.current = false;
      }
    };

    fetchFromSupabase();

    // 2. Realtime Subscription across all devices
    const channel = supabase
      .channel('quantum_realtime_broadcast')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quantum_portal_data',
        filter: 'id=eq.main_state'
      }, (payload) => {
        if (payload.new && payload.new.data && isMounted) {
          setData(payload.new.data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.new.data));
          setCloudStatus('synced');
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Save to localStorage and Push to Supabase on Local State Change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("LocalStorage save error:", e);
    }

    if (!isInitialCloudLoad.current) {
      const syncToCloud = async () => {
        try {
          setCloudStatus('syncing');
          const { error } = await supabase
            .from('quantum_portal_data')
            .upsert({
              id: 'main_state',
              data: data,
              updated_at: new Date().toISOString()
            });

          if (error) {
            if (error.code === 'PGRST205' || error.code === '42P01') {
              setCloudStatus('table_needed');
            } else {
              setCloudStatus('offline');
            }
          } else {
            setCloudStatus('synced');
          }
        } catch (e) {
          setCloudStatus('offline');
        }
      };

      const timer = setTimeout(() => {
        syncToCloud();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [data]);

  // Helper getters
  const getFacultyById = (id) => data.faculty.find(f => f.id === id);
  const getStudentById = (id) => data.students.find(s => s.id === id);

  // 1. Course Management & Completion Add
  const addCourse = (newCourse, newFacultyList = [], newStudentsList = []) => {
    setData(prev => {
      const existingFacIds = new Set(prev.faculty.map(f => f.id));
      const existingStuIds = new Set(prev.students.map(s => s.id));
      const filteredNewFac = newFacultyList.filter(f => f && f.id && !existingFacIds.has(f.id));
      const filteredNewStu = newStudentsList.filter(s => s && s.id && !existingStuIds.has(s.id));

      return {
        ...prev,
        faculty: [...filteredNewFac, ...prev.faculty],
        students: [...filteredNewStu, ...prev.students],
        courses: [{
          ...newCourse,
          id: newCourse.id || `CRS-${Date.now().toString().slice(-4)}`,
          facultyCompletions: newCourse.facultyCompletions || [],
          facultyEnrolled: newCourse.facultyEnrolled || [],
          studentCompletions: newCourse.studentCompletions || [],
          studentEnrolled: newCourse.studentEnrolled || []
        }, ...prev.courses]
      };
    });
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
  const addCertificate = (newCert, newFacultyList = [], newStudentsList = []) => {
    setData(prev => {
      const existingFacIds = new Set(prev.faculty.map(f => f.id));
      const existingStuIds = new Set(prev.students.map(s => s.id));
      const filteredNewFac = newFacultyList.filter(f => f && f.id && !existingFacIds.has(f.id));
      const filteredNewStu = newStudentsList.filter(s => s && s.id && !existingStuIds.has(s.id));

      return {
        ...prev,
        faculty: [...filteredNewFac, ...prev.faculty],
        students: [...filteredNewStu, ...prev.students],
        certificates: [{
          ...newCert,
          id: newCert.id || `CERT-NEW-${Date.now().toString().slice(-4)}`,
          facultyRecipients: newCert.facultyRecipients || [],
          studentRecipients: newCert.studentRecipients || []
        }, ...prev.certificates]
      };
    });
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
  const addProject = (newProject, newFacultyList = [], newStudentsList = []) => {
    setData(prev => {
      const existingFacIds = new Set(prev.faculty.map(f => f.id));
      const existingStuIds = new Set(prev.students.map(s => s.id));
      const filteredNewFac = newFacultyList.filter(f => f && f.id && !existingFacIds.has(f.id));
      const filteredNewStu = newStudentsList.filter(s => s && s.id && !existingStuIds.has(s.id));

      return {
        ...prev,
        faculty: [...filteredNewFac, ...prev.faculty],
        students: [...filteredNewStu, ...prev.students],
        projects: [{
          ...newProject,
          id: newProject.id || `PRJ-${Date.now().toString().slice(-4)}`,
          facultyInvolved: newProject.facultyInvolved || [],
          studentsInvolved: newProject.studentsInvolved || []
        }, ...prev.projects]
      };
    });
  };

  // 4. Research Paper Management
  const addResearchPaper = (newPaper, newFacultyList = [], newStudentsList = []) => {
    setData(prev => {
      const existingFacIds = new Set(prev.faculty.map(f => f.id));
      const existingStuIds = new Set(prev.students.map(s => s.id));
      const filteredNewFac = newFacultyList.filter(f => f && f.id && !existingFacIds.has(f.id));
      const filteredNewStu = newStudentsList.filter(s => s && s.id && !existingStuIds.has(s.id));

      return {
        ...prev,
        faculty: [...filteredNewFac, ...prev.faculty],
        students: [...filteredNewStu, ...prev.students],
        researchPapers: [{
          ...newPaper,
          id: newPaper.id || `PUB-${Date.now().toString().slice(-4)}`,
          facultyAuthors: newPaper.facultyAuthors || [],
          studentAuthors: newPaper.studentAuthors || []
        }, ...prev.researchPapers]
      };
    });
  };

  // 5. Hackathon Management
  const addHackathon = (newHackathon, newFacultyList = [], newStudentsList = []) => {
    setData(prev => {
      const existingFacIds = new Set(prev.faculty.map(f => f.id));
      const existingStuIds = new Set(prev.students.map(s => s.id));
      const filteredNewFac = newFacultyList.filter(f => f && f.id && !existingFacIds.has(f.id));
      const filteredNewStu = newStudentsList.filter(s => s && s.id && !existingStuIds.has(s.id));

      return {
        ...prev,
        faculty: [...filteredNewFac, ...prev.faculty],
        students: [...filteredNewStu, ...prev.students],
        hackathons: [{
          ...newHackathon,
          id: newHackathon.id || `HCK-${Date.now().toString().slice(-4)}`,
          facultyParticipants: newHackathon.facultyParticipants || [],
          studentParticipants: newHackathon.studentParticipants || []
        }, ...prev.hackathons]
      };
    });
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

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const confirmDelete = ({ title, message, onConfirm }) => {
    setDeleteModalState({
      isOpen: true,
      title: title || '',
      message: message || '',
      onConfirm: () => {
        if (onConfirm) onConfirm();
      }
    });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null
    });
  };

  // 7. Delete Entity Record
  const deleteRecord = (category, id) => {
    setData(prev => {
      const matchId = String(id);
      if (category === 'faculty') return { ...prev, faculty: prev.faculty.filter(f => String(f.id) !== matchId) };
      if (category === 'students') return { ...prev, students: prev.students.filter(s => String(s.id) !== matchId) };
      if (category === 'courses') return { ...prev, courses: prev.courses.filter(c => String(c.id) !== matchId) };
      if (category === 'certificates') return { ...prev, certificates: prev.certificates.filter(c => String(c.id) !== matchId) };
      if (category === 'projects') return { ...prev, projects: prev.projects.filter(p => String(p.id) !== matchId) };
      if (category === 'papers' || category === 'researchPapers') return { ...prev, researchPapers: prev.researchPapers.filter(p => String(p.id) !== matchId) };
      if (category === 'hackathons') return { ...prev, hackathons: prev.hackathons.filter(h => String(h.id) !== matchId) };
      return prev;
    });
  };

  // 8. Delete Participant from Course Roster
  const removeCourseCompletion = (courseId, audienceType, personId) => {
    const matchCourse = String(courseId);
    const matchPerson = String(personId);
    setData(prev => ({
      ...prev,
      courses: prev.courses.map(c => {
        if (String(c.id) !== matchCourse) return c;
        if (audienceType === 'faculty') {
          return {
            ...c,
            facultyCompletions: (c.facultyCompletions || []).filter(fc => String(fc.facultyId) !== matchPerson)
          };
        } else {
          return {
            ...c,
            studentCompletions: (c.studentCompletions || []).filter(sc => String(sc.studentId) !== matchPerson)
          };
        }
      })
    }));
  };

  // 9. Delete Recipient from Certificate
  const removeCertificateRecipient = (certId, audienceType, personId) => {
    const matchCert = String(certId);
    const matchPerson = String(personId);
    setData(prev => ({
      ...prev,
      certificates: prev.certificates.map(c => {
        if (String(c.id) !== matchCert) return c;
        if (audienceType === 'faculty') {
          return {
            ...c,
            facultyRecipients: (c.facultyRecipients || []).filter(fr => String(fr.facultyId) !== matchPerson)
          };
        } else {
          return {
            ...c,
            studentRecipients: (c.studentRecipients || []).filter(sr => String(sr.studentId) !== matchPerson)
          };
        }
      })
    }));
  };

  // 10. Delete Participant from Project
  const removeProjectParticipant = (projectId, roleType, personId) => {
    const matchProj = String(projectId);
    const matchPerson = String(personId);
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (String(p.id) !== matchProj) return p;
        if (roleType === 'faculty') {
          return {
            ...p,
            facultyInvolved: (p.facultyInvolved || []).filter(fi => String(fi.facultyId) !== matchPerson)
          };
        } else {
          return {
            ...p,
            studentsInvolved: (p.studentsInvolved || []).filter(si => String(si.studentId) !== matchPerson)
          };
        }
      })
    }));
  };

  // 11. Delete Author from Paper
  const removePaperAuthor = (paperId, roleType, personId) => {
    const matchPaper = String(paperId);
    const matchPerson = String(personId);
    setData(prev => ({
      ...prev,
      researchPapers: prev.researchPapers.map(rp => {
        if (String(rp.id) !== matchPaper) return rp;
        if (roleType === 'faculty') {
          return {
            ...rp,
            facultyAuthors: (rp.facultyAuthors || []).filter(fa => String(fa.facultyId || fa) !== matchPerson)
          };
        } else {
          return {
            ...rp,
            studentAuthors: (rp.studentAuthors || []).filter(sa => String(sa.studentId || sa) !== matchPerson)
          };
        }
      })
    }));
  };

  // 12. Delete Participant from Hackathon
  const removeHackathonParticipant = (hackathonId, roleType, personId) => {
    const matchHck = String(hackathonId);
    const matchPerson = String(personId);
    setData(prev => ({
      ...prev,
      hackathons: prev.hackathons.map(h => {
        if (String(h.id) !== matchHck) return h;
        if (roleType === 'faculty') {
          return {
            ...h,
            facultyParticipants: (h.facultyParticipants || []).filter(fp => String(fp.facultyId) !== matchPerson)
          };
        } else {
          return {
            ...h,
            studentParticipants: (h.studentParticipants || []).filter(sp => String(sp.studentId) !== matchPerson)
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
    confirmDelete({
      title: "Reset Database",
      message: "Are you sure you want to reset the database? All records will be cleared.",
      onConfirm: () => {
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
    });
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
      cloudStatus,
      supabase,
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
      confirmDelete,
      removeCourseCompletion,
      removeCertificateRecipient,
      removeProjectParticipant,
      removePaperAuthor,
      removeHackathonParticipant,
      exportJSON,
      resetSeedData
    }}>
      {children}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        title={deleteModalState.title}
        message={deleteModalState.message}
        onConfirm={deleteModalState.onConfirm}
        onClose={closeDeleteModal}
      />
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
