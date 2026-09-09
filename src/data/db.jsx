import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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

const QuantumDBContext = createContext(null);

const DEFAULT_DATA = {
  faculty: INITIAL_FACULTY || [],
  students: INITIAL_STUDENTS || [],
  courses: INITIAL_COURSES || [],
  certificates: INITIAL_CERTIFICATES || [],
  projects: INITIAL_PROJECTS || [],
  researchPapers: INITIAL_RESEARCH_PAPERS || [],
  hackathons: INITIAL_HACKATHONS || []
};

const CACHE_KEY = 'qhub_quantum_db_offline_v2';

const sanitizeProjectsList = (list) => {
  return (Array.isArray(list) ? list : []).map(p => {
    if (p && p.title && (p.title.toLowerCase().includes('virtual lab') || p.title.toLowerCase().includes('vlms'))) {
      return { ...p, targetAudience: 'students' };
    }
    return p;
  });
};

const loadCachedData = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          faculty: Array.isArray(parsed.faculty) ? parsed.faculty : (INITIAL_FACULTY || []),
          students: Array.isArray(parsed.students) ? parsed.students : (INITIAL_STUDENTS || []),
          courses: Array.isArray(parsed.courses) ? parsed.courses : (INITIAL_COURSES || []),
          certificates: Array.isArray(parsed.certificates) ? parsed.certificates : (INITIAL_CERTIFICATES || []),
          projects: sanitizeProjectsList(parsed.projects || INITIAL_PROJECTS || []),
          researchPapers: Array.isArray(parsed.researchPapers) ? parsed.researchPapers : (INITIAL_RESEARCH_PAPERS || []),
          hackathons: Array.isArray(parsed.hackathons) ? parsed.hackathons : (INITIAL_HACKATHONS || [])
        };
      }
    }
  } catch (err) {
    console.warn("Failed to load local DB cache:", err);
  }
  return DEFAULT_DATA;
};

const saveCachedData = (dataToSave) => {
  try {
    if (typeof window !== 'undefined' && dataToSave) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(dataToSave));
    }
  } catch (err) {
    console.warn("Failed to save local DB cache:", err);
  }
};

export const QuantumDBProvider = ({ children }) => {
  // Offline-first initial state: Always instantly available at 0ms upon page refresh
  const [data, setData] = useState(() => loadCachedData());
  const [cloudStatus, setCloudStatus] = useState('connecting'); // 'connecting' | 'synced' | 'syncing' | 'offline' | 'table_needed'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const dataRef = useRef(data);
  dataRef.current = data;

  const isInitialLoadDone = useRef(false);
  const lastSyncedHash = useRef('');

  const getJson = (obj) => {
    try {
      return JSON.stringify(obj);
    } catch {
      return '';
    }
  };

  // Helper to push full state to Supabase dedicated tables + unified realtime documents store
  const persistToSupabase = useCallback(async (stateToSave) => {
    saveCachedData(stateToSave);
    const jsonStr = getJson(stateToSave);
    if (!jsonStr || jsonStr === lastSyncedHash.current) {
      return true;
    }

    setCloudStatus('syncing');
    setSyncError(null);

    try {
      const tableUpserts = [];

      // 1. Realtime Broadcast State
      tableUpserts.push(
        supabase
          .from('quantum_portal_data')
          .upsert({
            id: 'main_state',
            data: stateToSave,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
      );

      // 2. Save individual certificate documents & images to DB
      stateToSave.courses?.forEach(c => {
        if (c.uploadedFile) {
          tableUpserts.push(
            supabase.from('quantum_portal_data').upsert({
              id: `doc_${c.id}`,
              data: { recordId: c.id, ...c.uploadedFile },
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' })
          );
        }
        c.facultyCompletions?.forEach(fc => {
          if (fc.uploadedFile) {
            const docKey = fc.certificateId || `${c.id}_${fc.facultyId}`;
            tableUpserts.push(
              supabase.from('quantum_portal_data').upsert({
                id: `doc_${docKey}`,
                data: { recordId: docKey, ...fc.uploadedFile },
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' })
            );
          }
        });
        c.studentCompletions?.forEach(sc => {
          if (sc.uploadedFile) {
            const docKey = sc.certificateId || `${c.id}_${sc.studentId}`;
            tableUpserts.push(
              supabase.from('quantum_portal_data').upsert({
                id: `doc_${docKey}`,
                data: { recordId: docKey, ...sc.uploadedFile },
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' })
            );
          }
        });
      });

      stateToSave.certificates?.forEach(cert => {
        if (cert.uploadedFile) {
          tableUpserts.push(
            supabase.from('quantum_portal_data').upsert({
              id: `doc_${cert.id}`,
              data: { recordId: cert.id, ...cert.uploadedFile },
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' })
          );
        }
        cert.facultyRecipients?.forEach(fr => {
          if (fr.uploadedFile) {
            const docKey = fr.credentialId || `${cert.id}_${fr.facultyId}`;
            tableUpserts.push(
              supabase.from('quantum_portal_data').upsert({
                id: `doc_${docKey}`,
                data: { recordId: docKey, ...fr.uploadedFile },
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' })
            );
          }
        });
        cert.studentRecipients?.forEach(sr => {
          if (sr.uploadedFile) {
            const docKey = sr.credentialId || `${cert.id}_${sr.studentId}`;
            tableUpserts.push(
              supabase.from('quantum_portal_data').upsert({
                id: `doc_${docKey}`,
                data: { recordId: docKey, ...sr.uploadedFile },
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' })
            );
          }
        });
      });

      // 3. Faculty Profiles
      if (stateToSave.faculty && stateToSave.faculty.length > 0) {
        tableUpserts.push(supabase.from('faculty').upsert(stateToSave.faculty, { onConflict: 'id' }));
      }

      // 4. Student Profiles
      if (stateToSave.students && stateToSave.students.length > 0) {
        tableUpserts.push(supabase.from('students').upsert(stateToSave.students.map(s => ({
          id: s.id,
          student_id: s.studentId || s.student_id || '',
          name: s.name,
          department: s.department || 'Computer Science & Engineering',
          year: s.year || 'Student',
          email: s.email || '',
          avatar: s.avatar || ''
        })), { onConflict: 'id' }));
      }

      // 5. Faculty Courses & Student Courses
      if (stateToSave.courses && stateToSave.courses.length > 0) {
        const facCourseRows = [];
        const stuCourseRows = [];

        stateToSave.courses.forEach(c => {
          const isFaculty = c.targetAudience === 'faculty' || (c.facultyCompletions && c.facultyCompletions.length > 0) || (!c.targetAudience && (!c.studentCompletions || c.studentCompletions.length === 0));
          const isStudent = c.targetAudience === 'students' || c.targetAudience === 'student' || (c.studentCompletions && c.studentCompletions.length > 0);

          if (isFaculty) {
            if (c.facultyCompletions && c.facultyCompletions.length > 0) {
              c.facultyCompletions.forEach((fc, idx) => {
                facCourseRows.push({
                  id: c.id ? (c.facultyCompletions.length === 1 ? c.id : `${c.id}-FC-${idx + 1}`) : `FC-${Date.now()}-${idx}`,
                  course_code: c.code || 'QC-100',
                  course_name: c.name || 'Quantum Course',
                  provider: c.provider || 'Q-HUB',
                  category: c.category || 'Quantum Computing',
                  description: c.description || '',
                  faculty_name: fc.facultyName || 'Faculty Member',
                  faculty_id: fc.facultyId || '',
                  completion_date: fc.completionDate || new Date().toISOString().slice(0, 10),
                  grade: fc.grade || 'Distinction',
                  certificate_id: fc.certificateId || '',
                  status: 'Completed'
                });
              });
            } else {
              facCourseRows.push({
                id: c.id || `FC-${Date.now()}`,
                course_code: c.code || 'QC-100',
                course_name: c.name || 'Quantum Course',
                provider: c.provider || 'Q-HUB',
                category: c.category || 'Quantum Computing',
                description: c.description || '',
                faculty_name: '',
                faculty_id: '',
                completion_date: '',
                grade: 'Available',
                certificate_id: '',
                status: 'Available'
              });
            }
          }

          if (isStudent) {
            if (c.studentCompletions && c.studentCompletions.length > 0) {
              c.studentCompletions.forEach((sc, idx) => {
                stuCourseRows.push({
                  id: c.id ? (c.studentCompletions.length === 1 ? c.id : `${c.id}-SC-${idx + 1}`) : `SC-${Date.now()}-${idx}`,
                  course_code: c.code || 'QC-100',
                  course_name: c.name || 'Quantum Course',
                  provider: c.provider || 'Q-HUB',
                  category: c.category || 'Quantum Computing',
                  description: c.description || '',
                  student_name: sc.studentName || 'Student Candidate',
                  student_id: sc.studentId || '',
                  completion_date: sc.completionDate || new Date().toISOString().slice(0, 10),
                  grade: sc.grade || 'Distinction',
                  certificate_id: sc.certificateId || '',
                  status: 'Completed'
                });
              });
            } else {
              stuCourseRows.push({
                id: c.id || `SC-${Date.now()}`,
                course_code: c.code || 'QC-100',
                course_name: c.name || 'Quantum Course',
                provider: c.provider || 'Q-HUB',
                category: c.category || 'Quantum Computing',
                description: c.description || '',
                student_name: '',
                student_id: '',
                completion_date: '',
                grade: 'Available',
                certificate_id: '',
                status: 'Available'
              });
            }
          }
        });

        if (facCourseRows.length > 0) tableUpserts.push(supabase.from('faculty_courses').upsert(facCourseRows, { onConflict: 'id' }));
        if (stuCourseRows.length > 0) tableUpserts.push(supabase.from('student_courses').upsert(stuCourseRows, { onConflict: 'id' }));
      }

      // 6. Faculty Certificates & Student Certificates
      if (stateToSave.certificates && stateToSave.certificates.length > 0) {
        const facCertRows = [];
        const stuCertRows = [];

        stateToSave.certificates.forEach(c => {
          const isFaculty = c.targetAudience === 'faculty' || (c.facultyRecipients && c.facultyRecipients.length > 0) || (!c.targetAudience && (!c.studentRecipients || c.studentRecipients.length === 0));
          const isStudent = c.targetAudience === 'students' || c.targetAudience === 'student' || (c.studentRecipients && c.studentRecipients.length > 0);

          if (isFaculty) {
            if (c.facultyRecipients && c.facultyRecipients.length > 0) {
              c.facultyRecipients.forEach((fr, idx) => {
                facCertRows.push({
                  id: c.id ? (c.facultyRecipients.length === 1 ? c.id : `${c.id}-FR-${idx + 1}`) : `CERT-F-${Date.now()}-${idx}`,
                  title: c.title,
                  issuer: c.issuer,
                  code: c.code || '',
                  faculty_name: fr.facultyName || 'Faculty Member',
                  faculty_id: fr.facultyId || '',
                  credential_id: fr.credentialId || '',
                  issue_date: fr.issueDate || new Date().toISOString().slice(0, 10),
                  score: fr.score || 'Distinction',
                  verification_url: c.verificationUrl || ''
                });
              });
            } else {
              facCertRows.push({
                id: c.id || `CERT-F-${Date.now()}`,
                title: c.title,
                issuer: c.issuer,
                code: c.code || '',
                faculty_name: '',
                faculty_id: '',
                credential_id: '',
                issue_date: '',
                score: '',
                verification_url: c.verificationUrl || ''
              });
            }
          }

          if (isStudent) {
            if (c.studentRecipients && c.studentRecipients.length > 0) {
              c.studentRecipients.forEach((sr, idx) => {
                stuCertRows.push({
                  id: c.id ? (c.studentRecipients.length === 1 ? c.id : `${c.id}-SR-${idx + 1}`) : `CERT-S-${Date.now()}-${idx}`,
                  title: c.title,
                  issuer: c.issuer,
                  code: c.code || '',
                  student_name: sr.studentName || 'Student Candidate',
                  student_id: sr.studentId || '',
                  credential_id: sr.credentialId || '',
                  issue_date: sr.issueDate || new Date().toISOString().slice(0, 10),
                  score: sr.score || 'Distinction',
                  verification_url: c.verificationUrl || ''
                });
              });
            } else {
              stuCertRows.push({
                id: c.id || `CERT-S-${Date.now()}`,
                title: c.title,
                issuer: c.issuer,
                code: c.code || '',
                student_name: '',
                student_id: '',
                credential_id: '',
                issue_date: '',
                score: '',
                verification_url: c.verificationUrl || ''
              });
            }
          }
        });

        if (facCertRows.length > 0) tableUpserts.push(supabase.from('faculty_certificates').upsert(facCertRows, { onConflict: 'id' }));
        if (stuCertRows.length > 0) tableUpserts.push(supabase.from('student_certificates').upsert(stuCertRows, { onConflict: 'id' }));
      }

      // 7. Faculty Projects & Student Projects
      if (stateToSave.projects && stateToSave.projects.length > 0) {
        const facProjRows = [];
        const stuProjRows = [];

        stateToSave.projects.forEach(p => {
          const allFacultyNames = (p.facultyInvolved || []).map(f => f.facultyName || f.name).filter(Boolean).join(', ');
          const allStudentNames = (p.studentsInvolved || []).map(s => s.studentName || s.name).filter(Boolean).join(', ');

          if (p.facultyInvolved && p.facultyInvolved.length > 0) {
            p.facultyInvolved.forEach((facLead, idx) => {
              facProjRows.push({
                id: p.id ? (p.facultyInvolved.length === 1 ? p.id : `${p.id}-FP-${idx + 1}`) : `PRJ-F-${Date.now()}-${idx}`,
                title: p.title,
                domain: p.domain || 'Quantum Computing',
                tech_stack: Array.isArray(p.techStack) ? p.techStack.join(', ') : String(p.techStack || ''),
                description: p.description || '',
                status: p.status || 'Active Development',
                github_url: p.githubUrl || '',
                faculty_name: facLead.facultyName || facLead.name || 'Faculty PI',
                faculty_id: facLead.facultyId || facLead.id || '',
                role: facLead.role || 'Principal Investigator',
                team_members: allFacultyNames || facLead.facultyName || facLead.name || ''
              });
            });
          } else if (p.targetAudience === 'faculty') {
            facProjRows.push({
              id: p.id || `PRJ-F-${Date.now()}`,
              title: p.title,
              domain: p.domain || 'Quantum Computing',
              tech_stack: Array.isArray(p.techStack) ? p.techStack.join(', ') : String(p.techStack || ''),
              description: p.description || '',
              status: p.status || 'Active Development',
              github_url: p.githubUrl || '',
              faculty_name: '',
              faculty_id: '',
              role: '',
              team_members: allFacultyNames || ''
            });
          }

          if (p.studentsInvolved && p.studentsInvolved.length > 0) {
            p.studentsInvolved.forEach((stuLead, idx) => {
              stuProjRows.push({
                id: p.id ? (p.studentsInvolved.length === 1 ? p.id : `${p.id}-SP-${idx + 1}`) : `PRJ-S-${Date.now()}-${idx}`,
                title: p.title,
                domain: p.domain || 'Quantum Computing',
                tech_stack: Array.isArray(p.techStack) ? p.techStack.join(', ') : String(p.techStack || ''),
                description: p.description || '',
                status: p.status || 'Active Development',
                github_url: p.githubUrl || '',
                student_name: stuLead.studentName || stuLead.name || 'Student Lead',
                student_id: stuLead.studentId || stuLead.id || '',
                role: stuLead.role || 'Project Developer',
                team_members: allStudentNames || stuLead.studentName || stuLead.name || ''
              });
            });
          } else if (p.targetAudience === 'students' || p.targetAudience === 'student') {
            stuProjRows.push({
              id: p.id || `PRJ-S-${Date.now()}`,
              title: p.title,
              domain: p.domain || 'Quantum Computing',
              tech_stack: Array.isArray(p.techStack) ? p.techStack.join(', ') : String(p.techStack || ''),
              description: p.description || '',
              status: p.status || 'Active Development',
              github_url: p.githubUrl || '',
              student_name: '',
              student_id: '',
              role: '',
              team_members: allStudentNames || ''
            });
          }
        });

        if (facProjRows.length > 0) tableUpserts.push(supabase.from('faculty_projects').upsert(facProjRows, { onConflict: 'id' }));
        if (stuProjRows.length > 0) tableUpserts.push(supabase.from('student_projects').upsert(stuProjRows, { onConflict: 'id' }));
      }

      // 8. Faculty Papers & Student Papers
      if (stateToSave.researchPapers && stateToSave.researchPapers.length > 0) {
        const facPaperRows = [];
        const stuPaperRows = [];

        stateToSave.researchPapers.forEach(rp => {
          const isFaculty = rp.targetAudience === 'faculty' || (!rp.targetAudience && rp.facultyAuthors && rp.facultyAuthors.length > 0 && (!rp.studentAuthors || rp.studentAuthors.length === 0));
          const isStudent = rp.targetAudience === 'students' || rp.targetAudience === 'student' || (!rp.targetAudience && rp.studentAuthors && rp.studentAuthors.length > 0);

          if (isFaculty) {
            facPaperRows.push({
              id: rp.id,
              title: rp.title,
              venue: rp.venue || '',
              doi: rp.doi || '',
              research_area: rp.researchArea || rp.research_area || 'Quantum Computing',
              abstract: rp.abstract || '',
              citations: Number(rp.citations) || 0,
              date: rp.date || '',
              faculty_name: (rp.facultyAuthors || []).join(', ') || 'Faculty Author',
              faculty_id: (rp.facultyAuthors || [])[0] || ''
            });
          }

          if (isStudent) {
            stuPaperRows.push({
              id: rp.id,
              title: rp.title,
              venue: rp.venue || '',
              doi: rp.doi || '',
              research_area: rp.researchArea || rp.research_area || 'Quantum Computing',
              abstract: rp.abstract || '',
              citations: Number(rp.citations) || 0,
              date: rp.date || '',
              student_name: (rp.studentAuthors || []).join(', ') || 'Student Author',
              student_id: (rp.studentAuthors || [])[0] || ''
            });
          }
        });

        if (facPaperRows.length > 0) tableUpserts.push(supabase.from('faculty_papers').upsert(facPaperRows, { onConflict: 'id' }));
        if (stuPaperRows.length > 0) tableUpserts.push(supabase.from('student_papers').upsert(stuPaperRows, { onConflict: 'id' }));
      }

      // 9. Faculty Hackathons & Student Hackathons
      if (stateToSave.hackathons && stateToSave.hackathons.length > 0) {
        const facHckRows = [];
        const stuHckRows = [];

        stateToSave.hackathons.forEach(h => {
          const isFaculty = h.targetAudience === 'faculty' || (!h.targetAudience && h.facultyParticipants && h.facultyParticipants.length > 0 && (!h.studentParticipants || h.studentParticipants.length === 0));
          const isStudent = h.targetAudience === 'students' || h.targetAudience === 'student' || (!h.targetAudience && h.studentParticipants && h.studentParticipants.length > 0);
          const allHckStuNames = (h.studentParticipants || []).map(s => s.studentName || s.name).filter(Boolean).join(', ');
          const allHckFacNames = (h.facultyParticipants || []).map(f => f.facultyName || f.name).filter(Boolean).join(', ');

          if (isFaculty) {
            if (h.facultyParticipants && h.facultyParticipants.length > 0) {
              h.facultyParticipants.forEach((facP, idx) => {
                facHckRows.push({
                  id: h.id ? (h.facultyParticipants.length === 1 ? h.id : `${h.id}-FP-${idx + 1}`) : `HCK-F-${Date.now()}-${idx}`,
                  hackathon_name: h.name,
                  organizer: h.organizer || '',
                  edition: h.edition || '',
                  date: h.date || '',
                  faculty_name: facP.facultyName || facP.name || 'Faculty Mentor',
                  faculty_id: facP.facultyId || '',
                  team_name: facP.teamName || 'Faculty Team',
                  team_members: allHckFacNames || facP.facultyName || facP.name || '',
                  project_built: facP.projectBuilt || '',
                  award: facP.award || 'Winner'
                });
              });
            } else {
              facHckRows.push({
                id: h.id || `HCK-F-${Date.now()}`,
                hackathon_name: h.name,
                organizer: h.organizer || '',
                edition: h.edition || '',
                date: h.date || '',
                faculty_name: '',
                faculty_id: '',
                team_name: '',
                team_members: allHckFacNames || '',
                project_built: '',
                award: 'Winner'
              });
            }
          }

          if (isStudent) {
            if (h.studentParticipants && h.studentParticipants.length > 0) {
              h.studentParticipants.forEach((stuP, idx) => {
                stuHckRows.push({
                  id: h.id ? (h.studentParticipants.length === 1 ? h.id : `${h.id}-SP-${idx + 1}`) : `HCK-S-${Date.now()}-${idx}`,
                  hackathon_name: h.name,
                  organizer: h.organizer || '',
                  edition: h.edition || '',
                  date: h.date || '',
                  student_name: stuP.studentName || stuP.name || 'Student Member',
                  student_id: stuP.studentId || '',
                  team_name: stuP.teamName || 'Student Team',
                  team_members: allHckStuNames || stuP.studentName || stuP.name || '',
                  project_built: stuP.projectBuilt || '',
                  award: stuP.award || 'Winner'
                });
              });
            } else {
              stuHckRows.push({
                id: h.id || `HCK-S-${Date.now()}`,
                hackathon_name: h.name,
                organizer: h.organizer || '',
                edition: h.edition || '',
                date: h.date || '',
                student_name: '',
                student_id: '',
                team_name: '',
                team_members: allHckStuNames || '',
                project_built: '',
                award: 'Winner'
              });
            }
          }
        });

        if (facHckRows.length > 0) tableUpserts.push(supabase.from('faculty_hackathons').upsert(facHckRows, { onConflict: 'id' }));
        if (stuHckRows.length > 0) tableUpserts.push(supabase.from('student_hackathons').upsert(stuHckRows, { onConflict: 'id' }));
      }

      await Promise.allSettled(tableUpserts);

      lastSyncedHash.current = jsonStr;
      setCloudStatus('synced');
      setLastSyncTime(new Date());
      setSyncError(null);
      return true;
    } catch (err) {
      console.error("Supabase sync network exception:", err);
      setCloudStatus('offline');
      setSyncError(err.message);
      return false;
    }
  }, []);

  // 1. Initial Load directly from Supabase Dedicated Tables + Realtime Documents Store
  const fetchFromSupabase = useCallback(async () => {
    try {
      setCloudStatus('connecting');

      const [
        facCrsRes, stuCrsRes,
        facCertRes, stuCertRes,
        facPrjRes, stuPrjRes,
        facPapRes, stuPapRes,
        facHckRes, stuHckRes,
        facRes, stuRes,
        allPortalRowsRes
      ] = await Promise.allSettled([
        supabase.from('faculty_courses').select('*'),
        supabase.from('student_courses').select('*'),
        supabase.from('faculty_certificates').select('*'),
        supabase.from('student_certificates').select('*'),
        supabase.from('faculty_projects').select('*'),
        supabase.from('student_projects').select('*'),
        supabase.from('faculty_papers').select('*'),
        supabase.from('student_papers').select('*'),
        supabase.from('faculty_hackathons').select('*'),
        supabase.from('student_hackathons').select('*'),
        supabase.from('faculty').select('*'),
        supabase.from('students').select('*'),
        supabase.from('quantum_portal_data').select('*')
      ]);

      // Build Document Map for all uploaded images and scans in Supabase
      const docMap = new Map();
      let mainStateRow = null;

      if (allPortalRowsRes.status === 'fulfilled' && allPortalRowsRes.value.data) {
        allPortalRowsRes.value.data.forEach(row => {
          if (row.id === 'main_state') {
            mainStateRow = row;
            // Also index files from main_state
            const state = row.data || {};
            state.courses?.forEach(c => {
              if (c.uploadedFile) {
                docMap.set(c.id, c.uploadedFile);
                docMap.set(`doc_${c.id}`, c.uploadedFile);
              }
              c.facultyCompletions?.forEach(fc => {
                if (fc.uploadedFile) {
                  if (fc.certificateId) docMap.set(fc.certificateId, fc.uploadedFile);
                  docMap.set(`${c.id}_${fc.facultyId}`, fc.uploadedFile);
                }
              });
              c.studentCompletions?.forEach(sc => {
                if (sc.uploadedFile) {
                  if (sc.certificateId) docMap.set(sc.certificateId, sc.uploadedFile);
                  docMap.set(`${c.id}_${sc.studentId}`, sc.uploadedFile);
                }
              });
            });
            state.certificates?.forEach(cert => {
              if (cert.uploadedFile) {
                docMap.set(cert.id, cert.uploadedFile);
                docMap.set(`doc_${cert.id}`, cert.uploadedFile);
              }
              cert.facultyRecipients?.forEach(fr => {
                if (fr.uploadedFile) {
                  if (fr.credentialId) docMap.set(fr.credentialId, fr.uploadedFile);
                  docMap.set(`${cert.id}_${fr.facultyId}`, fr.uploadedFile);
                }
              });
              cert.studentRecipients?.forEach(sr => {
                if (sr.uploadedFile) {
                  if (sr.credentialId) docMap.set(sr.credentialId, sr.uploadedFile);
                  docMap.set(`${cert.id}_${sr.studentId}`, sr.uploadedFile);
                }
              });
            });
          } else if (row.id?.startsWith('doc_') && row.data) {
            const rawId = row.id.replace('doc_', '');
            docMap.set(rawId, row.data);
            docMap.set(row.id, row.data);
            if (row.data.recordId) docMap.set(row.data.recordId, row.data);
          }
        });
      }

      const getDoc = (primaryId, secondaryId, tertiaryId) => {
        if (primaryId && docMap.has(primaryId)) return docMap.get(primaryId);
        if (secondaryId && docMap.has(secondaryId)) return docMap.get(secondaryId);
        if (tertiaryId && docMap.has(tertiaryId)) return docMap.get(tertiaryId);
        return null;
      };

      let loadedFaculty = [];
      let loadedStudents = [];
      let loadedCourses = [];
      let loadedCertificates = [];
      let loadedProjects = [];
      let loadedPapers = [];
      let loadedHackathons = [];

      let hasDedicatedData = false;

      // Faculty Profiles
      if (facRes.status === 'fulfilled' && facRes.value.data) {
        loadedFaculty = facRes.value.data;
        if (loadedFaculty.length > 0) hasDedicatedData = true;
      }

      // Student Profiles
      if (stuRes.status === 'fulfilled' && stuRes.value.data) {
        loadedStudents = stuRes.value.data.map(s => ({
          id: s.id,
          name: s.name,
          studentId: s.student_id || s.studentId,
          department: s.department,
          year: s.year,
          email: s.email,
          avatar: s.avatar
        }));
        if (loadedStudents.length > 0) hasDedicatedData = true;
      }

      // Faculty Courses
      if (facCrsRes.status === 'fulfilled' && facCrsRes.value.data && facCrsRes.value.data.length > 0) {
        hasDedicatedData = true;
        facCrsRes.value.data.forEach(fc => {
          const file = getDoc(fc.id, fc.certificate_id, `${fc.id}_${fc.faculty_id}`);
          loadedCourses.push({
            id: fc.id,
            code: fc.course_code,
            name: fc.course_name,
            provider: fc.provider,
            category: fc.category || 'Quantum Computing',
            description: fc.description || '',
            targetAudience: 'faculty',
            uploadedFile: file,
            facultyCompletions: fc.faculty_name ? [{
              facultyId: fc.faculty_id || 'FAC-01',
              facultyName: fc.faculty_name,
              completionDate: fc.completion_date || '',
              grade: fc.grade || 'Completed',
              certificateId: fc.certificate_id || '',
              uploadedFile: file
            }] : [],
            facultyEnrolled: [],
            studentCompletions: [],
            studentEnrolled: []
          });
        });
      }

      // Student Courses
      if (stuCrsRes.status === 'fulfilled' && stuCrsRes.value.data && stuCrsRes.value.data.length > 0) {
        hasDedicatedData = true;
        stuCrsRes.value.data.forEach(sc => {
          const file = getDoc(sc.id, sc.certificate_id, `${sc.id}_${sc.student_id}`);
          loadedCourses.push({
            id: sc.id,
            code: sc.course_code,
            name: sc.course_name,
            provider: sc.provider,
            category: sc.category || 'Quantum Computing',
            description: sc.description || '',
            targetAudience: 'students',
            uploadedFile: file,
            facultyCompletions: [],
            facultyEnrolled: [],
            studentCompletions: sc.student_name ? [{
              studentId: sc.student_id || 'STU-01',
              studentName: sc.student_name,
              completionDate: sc.completion_date || '',
              grade: sc.grade || 'Completed',
              certificateId: sc.certificate_id || '',
              uploadedFile: file
            }] : [],
            studentEnrolled: []
          });
        });
      }

      // Faculty Certificates
      if (facCertRes.status === 'fulfilled' && facCertRes.value.data && facCertRes.value.data.length > 0) {
        hasDedicatedData = true;
        facCertRes.value.data.forEach(fc => {
          const file = getDoc(fc.id, fc.credential_id, `${fc.id}_${fc.faculty_id}`);
          loadedCertificates.push({
            id: fc.id,
            title: fc.title,
            issuer: fc.issuer,
            code: fc.code || '',
            verificationUrl: fc.verification_url || '',
            targetAudience: 'faculty',
            uploadedFile: file,
            facultyRecipients: fc.faculty_name ? [{
              facultyId: fc.faculty_id || 'FAC-01',
              facultyName: fc.faculty_name,
              issueDate: fc.issue_date || '',
              credentialId: fc.credential_id || '',
              score: fc.score || 'Distinction',
              uploadedFile: file
            }] : [],
            studentRecipients: []
          });
        });
      }

      // Student Certificates
      if (stuCertRes.status === 'fulfilled' && stuCertRes.value.data && stuCertRes.value.data.length > 0) {
        hasDedicatedData = true;
        stuCertRes.value.data.forEach(sc => {
          const file = getDoc(sc.id, sc.credential_id, `${sc.id}_${sc.student_id}`);
          loadedCertificates.push({
            id: sc.id,
            title: sc.title,
            issuer: sc.issuer,
            code: sc.code || '',
            verificationUrl: sc.verification_url || '',
            targetAudience: 'students',
            uploadedFile: file,
            facultyRecipients: [],
            studentRecipients: sc.student_name ? [{
              studentId: sc.student_id || 'STU-01',
              studentName: sc.student_name,
              issueDate: sc.issue_date || '',
              credentialId: sc.credential_id || '',
              score: sc.score || 'Distinction',
              uploadedFile: file
            }] : []
          });
        });
      }

      // Faculty & Student Projects
      const projMap = new Map();

      if (facPrjRes.status === 'fulfilled' && facPrjRes.value.data && facPrjRes.value.data.length > 0) {
        hasDedicatedData = true;
        facPrjRes.value.data.forEach(fp => {
          const key = (fp.title || '').trim().toLowerCase();
          const file = getDoc(fp.id);
          const facObj = fp.faculty_name ? {
            facultyId: fp.faculty_id || `FAC-${Date.now()}`,
            facultyName: fp.faculty_name,
            name: fp.faculty_name,
            role: fp.role || 'Principal Investigator',
            department: 'Quantum Science'
          } : null;

          if (projMap.has(key)) {
            const existing = projMap.get(key);
            if (facObj && !existing.facultyInvolved.some(f => f.facultyName === facObj.facultyName)) {
              existing.facultyInvolved.push(facObj);
            }
          } else {
            projMap.set(key, {
              id: fp.id ? String(fp.id).split('-FP-')[0] : `PRJ-${Date.now()}`,
              title: fp.title,
              domain: fp.domain || 'Quantum Computing',
              techStack: typeof fp.tech_stack === 'string' ? fp.tech_stack.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(fp.tech_stack) ? fp.tech_stack : []),
              description: fp.description || '',
              status: fp.status || 'Active Development',
              githubUrl: fp.github_url || '',
              targetAudience: 'faculty',
              uploadedFile: file,
              facultyInvolved: facObj ? [facObj] : [],
              studentsInvolved: []
            });
          }
        });
      }

      if (stuPrjRes.status === 'fulfilled' && stuPrjRes.value.data && stuPrjRes.value.data.length > 0) {
        hasDedicatedData = true;
        stuPrjRes.value.data.forEach(sp => {
          const rawId = sp.id ? String(sp.id).split('-SP-')[0] : '';
          const key = (sp.title || '').trim().toLowerCase();
          const file = getDoc(sp.id);
          const stuObj = sp.student_name ? {
            studentId: sp.student_id || `STU-${Date.now()}`,
            id: sp.student_id || `STU-${Date.now()}`,
            studentName: sp.student_name,
            name: sp.student_name,
            role: sp.role || 'Project Developer',
            department: 'Information Technology'
          } : null;

          if (projMap.has(key)) {
            const existing = projMap.get(key);
            if (stuObj && !existing.studentsInvolved.some(s => 
              (s.studentName && s.studentName.toLowerCase() === stuObj.studentName.toLowerCase()) || 
              (s.studentId && String(s.studentId) === String(stuObj.studentId))
            )) {
              existing.studentsInvolved.push(stuObj);
            }
          } else {
            projMap.set(key, {
              id: rawId || (sp.id ? String(sp.id).split('-SP-')[0] : `PRJ-${Date.now()}`),
              title: sp.title,
              domain: sp.domain || 'Quantum Computing',
              techStack: typeof sp.tech_stack === 'string' ? sp.tech_stack.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(sp.tech_stack) ? sp.tech_stack : []),
              description: sp.description || '',
              status: sp.status || 'Active Development',
              githubUrl: sp.github_url || '',
              targetAudience: 'students',
              uploadedFile: file,
              facultyInvolved: [],
              studentsInvolved: stuObj ? [stuObj] : []
            });
          }
        });
      }

      loadedProjects = Array.from(projMap.values());

      // Faculty Papers
      if (facPapRes.status === 'fulfilled' && facPapRes.value.data && facPapRes.value.data.length > 0) {
        hasDedicatedData = true;
        const paperMap = new Map();
        facPapRes.value.data.forEach(fp => {
          const key = (fp.title || '').trim().toLowerCase();
          const authorList = (fp.faculty_name || '').split(',').map(s => s.trim()).filter(Boolean);
          if (paperMap.has(key)) {
            const existing = paperMap.get(key);
            authorList.forEach(a => {
              if (!existing.facultyAuthors.includes(a)) existing.facultyAuthors.push(a);
            });
          } else {
            paperMap.set(key, {
              id: fp.id,
              title: fp.title,
              venue: fp.venue || '',
              doi: fp.doi || '',
              researchArea: fp.research_area || 'Quantum Computing',
              abstract: fp.abstract || '',
              citations: Number(fp.citations) || 0,
              date: fp.date || '',
              targetAudience: 'faculty',
              facultyAuthors: authorList.length > 0 ? authorList : [fp.faculty_id || 'Faculty Author'],
              studentAuthors: []
            });
          }
        });
        loadedPapers.push(...paperMap.values());
      }

      // Student Papers
      if (stuPapRes.status === 'fulfilled' && stuPapRes.value.data && stuPapRes.value.data.length > 0) {
        hasDedicatedData = true;
        const paperMap = new Map();
        stuPapRes.value.data.forEach(sp => {
          const key = (sp.title || '').trim().toLowerCase();
          const authorList = (sp.student_name || '').split(',').map(s => s.trim()).filter(Boolean);
          if (paperMap.has(key)) {
            const existing = paperMap.get(key);
            authorList.forEach(a => {
              if (!existing.studentAuthors.includes(a)) existing.studentAuthors.push(a);
            });
          } else {
            paperMap.set(key, {
              id: sp.id,
              title: sp.title,
              venue: sp.venue || '',
              doi: sp.doi || '',
              researchArea: sp.research_area || 'Quantum Computing',
              abstract: sp.abstract || '',
              citations: Number(sp.citations) || 0,
              date: sp.date || '',
              targetAudience: 'students',
              facultyAuthors: [],
              studentAuthors: authorList.length > 0 ? authorList : [sp.student_id || 'Student Author']
            });
          }
        });
        loadedPapers.push(...paperMap.values());
      }

      // Faculty Hackathons
      if (facHckRes.status === 'fulfilled' && facHckRes.value.data && facHckRes.value.data.length > 0) {
        hasDedicatedData = true;
        const hckMap = new Map();
        facHckRes.value.data.forEach(fh => {
          const key = `${(fh.hackathon_name || '').trim().toLowerCase()}_${(fh.edition || '').trim().toLowerCase()}`;
          const file = getDoc(fh.id);
          const pObj = fh.faculty_name ? {
            facultyId: fh.faculty_id || `FAC-${Date.now()}`,
            facultyName: fh.faculty_name,
            name: fh.faculty_name,
            teamName: fh.team_name || 'Team Quantum',
            projectBuilt: fh.project_built || '',
            award: fh.award || 'Winner',
            uploadedFile: file
          } : null;

          if (hckMap.has(key)) {
            const existing = hckMap.get(key);
            if (pObj && !existing.facultyParticipants.some(p => p.facultyName === pObj.facultyName)) {
              existing.facultyParticipants.push(pObj);
            }
          } else {
            hckMap.set(key, {
              id: fh.id ? String(fh.id).split('-FP-')[0] : `HCK-${Date.now()}`,
              name: fh.hackathon_name,
              organizer: fh.organizer || '',
              edition: fh.edition || '',
              date: fh.date || '',
              targetAudience: 'faculty',
              uploadedFile: file,
              facultyParticipants: pObj ? [pObj] : [],
              studentParticipants: []
            });
          }
        });
        loadedHackathons.push(...hckMap.values());
      }

      // Student Hackathons
      if (stuHckRes.status === 'fulfilled' && stuHckRes.value.data && stuHckRes.value.data.length > 0) {
        hasDedicatedData = true;
        const hckMap = new Map();
        stuHckRes.value.data.forEach(sh => {
          const key = `${(sh.hackathon_name || '').trim().toLowerCase()}_${(sh.edition || '').trim().toLowerCase()}`;
          const file = getDoc(sh.id);
          const pObj = sh.student_name ? {
            studentId: sh.student_id || `STU-${Date.now()}`,
            studentName: sh.student_name,
            name: sh.student_name,
            teamName: sh.team_name || 'Team Quantum',
            projectBuilt: sh.project_built || '',
            award: sh.award || 'Winner',
            uploadedFile: file
          } : null;

          if (hckMap.has(key)) {
            const existing = hckMap.get(key);
            if (pObj && !existing.studentParticipants.some(p => p.studentName === pObj.studentName)) {
              existing.studentParticipants.push(pObj);
            }
          } else {
            hckMap.set(key, {
              id: sh.id ? String(sh.id).split('-SP-')[0] : `HCK-${Date.now()}`,
              name: sh.hackathon_name,
              organizer: sh.organizer || '',
              edition: sh.edition || '',
              date: sh.date || '',
              targetAudience: 'students',
              uploadedFile: file,
              facultyParticipants: [],
              studentParticipants: pObj ? [pObj] : []
            });
          }
        });
        loadedHackathons.push(...hckMap.values());
      }

      // Auto-extract faculty & student profiles if missing from Projects
      loadedProjects.forEach(p => {
        (p.facultyInvolved || []).forEach(fp => {
          if (fp.facultyName && !loadedFaculty.some(f => f.name.toLowerCase() === fp.facultyName.toLowerCase() || f.id === fp.facultyId)) {
            loadedFaculty.push({
              id: fp.facultyId || `FAC-${loadedFaculty.length + 1}`,
              name: fp.facultyName,
              department: fp.department || 'Physics & Quantum Computing',
              title: fp.role || 'Principal Investigator',
              avatar: fp.facultyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            });
          }
        });
        (p.studentsInvolved || []).forEach(sp => {
          if (sp.studentName && !loadedStudents.some(s => s.name.toLowerCase() === sp.studentName.toLowerCase() || s.id === sp.studentId)) {
            loadedStudents.push({
              id: sp.studentId || `STU-${loadedStudents.length + 1}`,
              name: sp.studentName,
              studentId: sp.studentId || `QU-${Math.floor(1000 + Math.random() * 9000)}`,
              department: sp.department || 'Information Technology',
              year: 'Student Developer',
              avatar: sp.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            });
          }
        });
      });

      // Auto-extract faculty & student profiles if missing from Hackathons
      loadedHackathons.forEach(h => {
        (h.facultyParticipants || []).forEach(fp => {
          if (fp.facultyName && !loadedFaculty.some(f => f.name.toLowerCase() === fp.facultyName.toLowerCase() || f.id === fp.facultyId)) {
            loadedFaculty.push({
              id: fp.facultyId || `FAC-${loadedFaculty.length + 1}`,
              name: fp.facultyName,
              department: fp.department || 'Physics & Quantum Computing',
              title: 'Faculty Researcher / Mentor',
              avatar: fp.facultyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            });
          }
        });
        (h.studentParticipants || []).forEach(sp => {
          if (sp.studentName && !loadedStudents.some(s => s.name.toLowerCase() === sp.studentName.toLowerCase() || s.id === sp.studentId)) {
            loadedStudents.push({
              id: sp.studentId || `STU-${loadedStudents.length + 1}`,
              name: sp.studentName,
              studentId: sp.studentId || `QU-${Math.floor(1000 + Math.random() * 9000)}`,
              department: sp.department || 'Information Technology',
              year: 'Student Competitor',
              avatar: sp.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            });
          }
        });
      });

      // Auto-extract faculty & student profiles if missing
      loadedCourses.forEach(c => {
        (c.facultyCompletions || []).forEach(fc => {
          if (fc.facultyName && !loadedFaculty.some(f => f.name === fc.facultyName || f.id === fc.facultyId)) {
            loadedFaculty.push({ id: fc.facultyId || `FAC-${loadedFaculty.length + 1}`, name: fc.facultyName, department: 'Computer Science & Engineering', title: 'Faculty Member' });
          }
        });
        (c.studentCompletions || []).forEach(sc => {
          if (sc.studentName && !loadedStudents.some(s => s.name === sc.studentName || s.id === sc.studentId)) {
            loadedStudents.push({ id: sc.studentId || `STU-${loadedStudents.length + 1}`, name: sc.studentName, department: 'Computer Science & Engineering', year: 'Student Candidate' });
          }
        });
      });

      loadedCertificates.forEach(c => {
        (c.facultyRecipients || []).forEach(fr => {
          if (fr.facultyName && !loadedFaculty.some(f => f.name === fr.facultyName || f.id === fr.facultyId)) {
            loadedFaculty.push({ id: fr.facultyId || `FAC-${loadedFaculty.length + 1}`, name: fr.facultyName, department: 'Computer Science & Engineering', title: 'Faculty Member' });
          }
        });
        (c.studentRecipients || []).forEach(sr => {
          if (sr.studentName && !loadedStudents.some(s => s.name === sr.studentName || s.id === sr.studentId)) {
            loadedStudents.push({ id: sr.studentId || `STU-${loadedStudents.length + 1}`, name: sr.studentName, department: 'Computer Science & Engineering', year: 'Student Candidate' });
          }
        });
      });

      // Build unified state prioritizing rich main_state and merging any external relational rows
      if (mainStateRow && mainStateRow.data) {
        const cloudData = mainStateRow.data;

        // 1. Restore Courses & Attach Documents
        const baseCourses = (Array.isArray(cloudData.courses) ? cloudData.courses : []).map(c => {
          const file = getDoc(c.id, c.uploadedFile?.name) || c.uploadedFile || null;
          return {
            ...c,
            uploadedFile: file,
            facultyCompletions: (c.facultyCompletions || []).map(fc => ({
              ...fc,
              uploadedFile: getDoc(fc.certificateId, fc.facultyId, `${c.id}_${fc.facultyId}`) || fc.uploadedFile || file
            })),
            studentCompletions: (c.studentCompletions || []).map(sc => ({
              ...sc,
              uploadedFile: getDoc(sc.certificateId, sc.studentId, `${c.id}_${sc.studentId}`) || sc.uploadedFile || file
            }))
          };
        });

        // Merge any dedicated courses not in base
        const courseIdSet = new Set(baseCourses.map(c => String(c.id).toLowerCase()));
        loadedCourses.forEach(lc => {
          if (!courseIdSet.has(String(lc.id).toLowerCase())) {
            baseCourses.push(lc);
            courseIdSet.add(String(lc.id).toLowerCase());
          }
        });

        // 2. Restore Certificates & Attach Documents
        const baseCerts = (Array.isArray(cloudData.certificates) ? cloudData.certificates : []).map(cert => {
          const file = getDoc(cert.id, cert.uploadedFile?.name) || cert.uploadedFile || null;
          return {
            ...cert,
            uploadedFile: file,
            facultyRecipients: (cert.facultyRecipients || []).map(fr => ({
              ...fr,
              uploadedFile: getDoc(fr.credentialId, fr.facultyId, `${cert.id}_${fr.facultyId}`) || fr.uploadedFile || file
            })),
            studentRecipients: (cert.studentRecipients || []).map(sr => ({
              ...sr,
              uploadedFile: getDoc(sr.credentialId, sr.studentId, `${cert.id}_${sr.studentId}`) || sr.uploadedFile || file
            }))
          };
        });

        const certIdSet = new Set(baseCerts.map(c => String(c.id).toLowerCase()));
        loadedCertificates.forEach(lc => {
          if (!certIdSet.has(String(lc.id).toLowerCase())) {
            baseCerts.push(lc);
            certIdSet.add(String(lc.id).toLowerCase());
          }
        });

        // 3. Restore Projects
        const baseProjects = Array.isArray(cloudData.projects) ? cloudData.projects : [];
        const projIdSet = new Set(baseProjects.map(p => String(p.id).toLowerCase()));
        loadedProjects.forEach(lp => {
          const key = String(lp.id).toLowerCase();
          if (!projIdSet.has(key)) {
            baseProjects.push(lp);
            projIdSet.add(key);
          } else {
            const existing = baseProjects.find(bp => String(bp.id).toLowerCase() === key || (bp.title && bp.title.toLowerCase() === (lp.title || '').toLowerCase()));
            if (existing) {
              (lp.facultyInvolved || []).forEach(lf => {
                if (!existing.facultyInvolved) existing.facultyInvolved = [];
                const lfId = lf.facultyId || lf.id || lf.name || lf.facultyName;
                const lfName = (lf.facultyName || lf.name || '').toLowerCase();
                if (!existing.facultyInvolved.some(f => (f.facultyId || f.id) === lfId || (lfName && (f.facultyName || f.name || '').toLowerCase() === lfName))) {
                  existing.facultyInvolved.push(lf);
                }
              });
              (lp.studentsInvolved || []).forEach(ls => {
                if (!existing.studentsInvolved) existing.studentsInvolved = [];
                const lsId = ls.studentId || ls.id || ls.name || ls.studentName;
                const lsName = (ls.studentName || ls.name || '').toLowerCase();
                if (!existing.studentsInvolved.some(s => (s.studentId || s.id) === lsId || (lsName && (s.studentName || s.name || '').toLowerCase() === lsName))) {
                  existing.studentsInvolved.push(ls);
                }
              });
            }
          }
        });

        // 4. Restore Papers
        const basePapers = Array.isArray(cloudData.researchPapers) ? cloudData.researchPapers : [];
        const paperIdSet = new Set(basePapers.map(p => String(p.id).toLowerCase()));
        loadedPapers.forEach(lp => {
          if (!paperIdSet.has(String(lp.id).toLowerCase())) {
            basePapers.push(lp);
            paperIdSet.add(String(lp.id).toLowerCase());
          }
        });

        // 5. Restore Hackathons
        const baseHackathons = Array.isArray(cloudData.hackathons) ? cloudData.hackathons : [];
        const hckIdSet = new Set(baseHackathons.map(h => String(h.id).toLowerCase()));
        loadedHackathons.forEach(lh => {
          if (!hckIdSet.has(String(lh.id).toLowerCase())) {
            baseHackathons.push(lh);
            hckIdSet.add(String(lh.id).toLowerCase());
          }
        });

        // 6. Restore Faculty & Students
        const baseFaculty = Array.isArray(cloudData.faculty) && cloudData.faculty.length > 0 ? cloudData.faculty : loadedFaculty;
        const baseStudents = Array.isArray(cloudData.students) && cloudData.students.length > 0 ? cloudData.students : loadedStudents;

        // Merge with any local cache items to prevent data loss if created while offline
        const localCurrent = loadCachedData();

        const localCourseMap = new Map((localCurrent.courses || []).map(c => [String(c.id).toLowerCase(), c]));
        baseCourses.forEach(c => localCourseMap.set(String(c.id).toLowerCase(), c));
        const mergedCourses = Array.from(localCourseMap.values());

        const localCertMap = new Map((localCurrent.certificates || []).map(c => [String(c.id).toLowerCase(), c]));
        baseCerts.forEach(c => localCertMap.set(String(c.id).toLowerCase(), c));
        const mergedCerts = Array.from(localCertMap.values());

        const localProjMap = new Map((localCurrent.projects || []).map(p => [String(p.id).toLowerCase(), p]));
        baseProjects.forEach(p => {
          const key = String(p.id).toLowerCase();
          if (localProjMap.has(key)) {
            const loc = localProjMap.get(key);
            const facList = [...(p.facultyInvolved || [])];
            (loc.facultyInvolved || []).forEach(lf => {
              const lfId = lf.facultyId || lf.id || lf.name || lf.facultyName;
              const lfName = (lf.facultyName || lf.name || '').toLowerCase();
              if (!facList.some(f => (f.facultyId || f.id) === lfId || (lfName && (f.facultyName || f.name || '').toLowerCase() === lfName))) facList.push(lf);
            });
            const stuList = [...(p.studentsInvolved || [])];
            (loc.studentsInvolved || []).forEach(ls => {
              const lsId = ls.studentId || ls.id || ls.name || ls.studentName;
              const lsName = (ls.studentName || ls.name || '').toLowerCase();
              if (!stuList.some(s => (s.studentId || s.id) === lsId || (lsName && (s.studentName || s.name || '').toLowerCase() === lsName))) stuList.push(ls);
            });
            localProjMap.set(key, {
              ...loc,
              ...p,
              facultyInvolved: facList,
              studentsInvolved: stuList
            });
          } else {
            localProjMap.set(key, p);
          }
        });
        const mergedProjects = Array.from(localProjMap.values());

        const localPaperMap = new Map((localCurrent.researchPapers || []).map(p => [String(p.id).toLowerCase(), p]));
        basePapers.forEach(p => localPaperMap.set(String(p.id).toLowerCase(), p));
        const mergedPapers = Array.from(localPaperMap.values());

        const localHckMap = new Map((localCurrent.hackathons || []).map(h => [String(h.id).toLowerCase(), h]));
        baseHackathons.forEach(h => localHckMap.set(String(h.id).toLowerCase(), h));
        const mergedHackathons = Array.from(localHckMap.values());

        const localFacMap = new Map((localCurrent.faculty || []).map(f => [String(f.id).toLowerCase(), f]));
        baseFaculty.forEach(f => localFacMap.set(String(f.id).toLowerCase(), f));
        const mergedFaculty = Array.from(localFacMap.values());

        const localStuMap = new Map((localCurrent.students || []).map(s => [String(s.id).toLowerCase(), s]));
        baseStudents.forEach(s => localStuMap.set(String(s.id).toLowerCase(), s));
        const mergedStudents = Array.from(localStuMap.values());

        const assembled = {
          faculty: mergedFaculty.length > 0 ? mergedFaculty : (INITIAL_FACULTY || []),
          students: mergedStudents.length > 0 ? mergedStudents : (INITIAL_STUDENTS || []),
          courses: mergedCourses.length > 0 ? mergedCourses : (INITIAL_COURSES || []),
          certificates: mergedCerts.length > 0 ? mergedCerts : (INITIAL_CERTIFICATES || []),
          projects: mergedProjects.length > 0 ? mergedProjects : (INITIAL_PROJECTS || []),
          researchPapers: mergedPapers.length > 0 ? mergedPapers : (INITIAL_RESEARCH_PAPERS || []),
          hackathons: mergedHackathons.length > 0 ? mergedHackathons : (INITIAL_HACKATHONS || [])
        };

        saveCachedData(assembled);
        lastSyncedHash.current = getJson(assembled);
        setData(assembled);
        setCloudStatus('synced');
        setLastSyncTime(mainStateRow.updated_at ? new Date(mainStateRow.updated_at) : new Date());
        return;
      }

      // If no main_state yet, use dedicated tables or cached local data
      if (hasDedicatedData) {
        const localCurrent = loadCachedData();

        const localCourseMap = new Map((localCurrent.courses || []).map(c => [String(c.id).toLowerCase(), c]));
        loadedCourses.forEach(c => localCourseMap.set(String(c.id).toLowerCase(), c));
        const mergedCourses = Array.from(localCourseMap.values());

        const assembled = {
          faculty: loadedFaculty.length > 0 ? loadedFaculty : (localCurrent.faculty?.length > 0 ? localCurrent.faculty : (INITIAL_FACULTY || [])),
          students: loadedStudents.length > 0 ? loadedStudents : (localCurrent.students?.length > 0 ? localCurrent.students : (INITIAL_STUDENTS || [])),
          courses: mergedCourses.length > 0 ? mergedCourses : (INITIAL_COURSES || []),
          certificates: loadedCertificates.length > 0 ? loadedCertificates : (localCurrent.certificates?.length > 0 ? localCurrent.certificates : (INITIAL_CERTIFICATES || [])),
          projects: loadedProjects.length > 0 ? loadedProjects : (localCurrent.projects?.length > 0 ? localCurrent.projects : (INITIAL_PROJECTS || [])),
          researchPapers: loadedPapers.length > 0 ? loadedPapers : (localCurrent.researchPapers?.length > 0 ? localCurrent.researchPapers : (INITIAL_RESEARCH_PAPERS || [])),
          hackathons: loadedHackathons.length > 0 ? loadedHackathons : (localCurrent.hackathons?.length > 0 ? localCurrent.hackathons : (INITIAL_HACKATHONS || []))
        };
        saveCachedData(assembled);
        lastSyncedHash.current = getJson(assembled);
        setData(assembled);
        setCloudStatus('synced');
        setLastSyncTime(new Date());

        // Backfill main_state
        persistToSupabase(assembled);
        return;
      }

      // Keep local cached data so nothing disappears on reload
      const localData = loadCachedData();
      setData(localData);
      setCloudStatus('synced');
    } catch (e) {
      console.error("Supabase initial load error:", e);
      // Fallback cleanly to local cache
      const localData = loadCachedData();
      setData(localData);
      setCloudStatus('offline');
      setSyncError(e.message);
    } finally {
      isInitialLoadDone.current = true;
    }
  }, [persistToSupabase]);

  // Load from Supabase on mount & setup Realtime Subscription
  useEffect(() => {
    let isMounted = true;
    fetchFromSupabase();

    // Realtime Subscription across all browser tabs / devices
    const channel = supabase
      .channel('quantum_realtime_broadcast')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quantum_portal_data',
        filter: 'id=eq.main_state'
      }, (payload) => {
        if (!isMounted) return;
        if (payload.new && payload.new.data) {
          const incomingData = payload.new.data;
          const incomingJson = getJson(incomingData);

          if (incomingJson && incomingJson !== lastSyncedHash.current) {
            lastSyncedHash.current = incomingJson;
            const assembled = {
              faculty: incomingData.faculty || [],
              students: incomingData.students || [],
              courses: incomingData.courses || [],
              certificates: incomingData.certificates || [],
              projects: incomingData.projects || [],
              researchPapers: incomingData.researchPapers || [],
              hackathons: incomingData.hackathons || []
            };
            saveCachedData(assembled);
            setData(assembled);
            setLastSyncTime(new Date());
          }
          setCloudStatus('synced');
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [fetchFromSupabase]);

  // Central state update function that pushes directly to Supabase + local cache
  const updateDataAndSync = useCallback((updater) => {
    setData(prev => {
      const nextData = typeof updater === 'function' ? updater(prev) : updater;
      // Immediately save to localStorage
      saveCachedData(nextData);
      // Immediately push to Supabase Cloud
      persistToSupabase(nextData);
      return nextData;
    });
  }, [persistToSupabase]);

  // Direct Attachment of Document / Image to Record in Supabase DB
  const attachDocumentToRecord = async (recordId, fileData) => {
    if (!recordId || !fileData) return;

    const normId = String(recordId).trim().toLowerCase();

    try {
      // 1. Save directly as permanent document in Supabase
      await supabase.from('quantum_portal_data').upsert({
        id: `doc_${recordId}`,
        data: { recordId, ...fileData },
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (e) {
      console.warn("Direct document upsert error:", e);
    }

    // 2. Update memory state & sync main_state
    updateDataAndSync(prev => {
      const updatedCourses = prev.courses.map(c => {
        const cCodeNorm = String(c.code || '').trim().toLowerCase();
        const cNameNorm = String(c.name || '').trim().toLowerCase();
        const cIdNorm = String(c.id || '').trim().toLowerCase();

        const isCourseMatch = cIdNorm === normId || cCodeNorm === normId || (cCodeNorm && normId.includes(cCodeNorm)) || normId.includes(cNameNorm);
        const hasFacMatch = (c.facultyCompletions || []).some(fc => 
          String(fc.certificateId || '').trim().toLowerCase() === normId ||
          String(fc.facultyId || '').trim().toLowerCase() === normId ||
          String(fc.facultyName || '').trim().toLowerCase() === normId
        );
        const hasStuMatch = (c.studentCompletions || []).some(sc => 
          String(sc.certificateId || '').trim().toLowerCase() === normId ||
          String(sc.studentId || '').trim().toLowerCase() === normId ||
          String(sc.studentName || '').trim().toLowerCase() === normId
        );

        if (!isCourseMatch && !hasFacMatch && !hasStuMatch) return c;

        return {
          ...c,
          uploadedFile: fileData,
          facultyCompletions: (c.facultyCompletions || []).map(fc => {
            const fcMatch = isCourseMatch || hasFacMatch || String(fc.certificateId || '').trim().toLowerCase() === normId || String(fc.facultyId || '').trim().toLowerCase() === normId;
            return fcMatch ? { ...fc, uploadedFile: fileData } : fc;
          }),
          studentCompletions: (c.studentCompletions || []).map(sc => {
            const scMatch = isCourseMatch || hasStuMatch || String(sc.certificateId || '').trim().toLowerCase() === normId || String(sc.studentId || '').trim().toLowerCase() === normId;
            return scMatch ? { ...sc, uploadedFile: fileData } : sc;
          })
        };
      });

      const updatedCerts = prev.certificates.map(cert => {
        const certCodeNorm = String(cert.code || '').trim().toLowerCase();
        const certTitleNorm = String(cert.title || '').trim().toLowerCase();
        const certIdNorm = String(cert.id || '').trim().toLowerCase();

        const isCertMatch = certIdNorm === normId || certCodeNorm === normId || normId.includes(certTitleNorm) || (certCodeNorm && normId.includes(certCodeNorm));
        const hasFacMatch = (cert.facultyRecipients || []).some(fr => 
          String(fr.credentialId || '').trim().toLowerCase() === normId ||
          String(fr.facultyId || '').trim().toLowerCase() === normId ||
          String(fr.facultyName || '').trim().toLowerCase() === normId
        );
        const hasStuMatch = (cert.studentRecipients || []).some(sr => 
          String(sr.credentialId || '').trim().toLowerCase() === normId ||
          String(sr.studentId || '').trim().toLowerCase() === normId ||
          String(sr.studentName || '').trim().toLowerCase() === normId
        );

        if (!isCertMatch && !hasFacMatch && !hasStuMatch) return cert;

        return {
          ...cert,
          uploadedFile: fileData,
          facultyRecipients: (cert.facultyRecipients || []).map(fr => {
            const frMatch = isCertMatch || hasFacMatch || String(fr.credentialId || '').trim().toLowerCase() === normId || String(fr.facultyId || '').trim().toLowerCase() === normId;
            return frMatch ? { ...fr, uploadedFile: fileData } : fr;
          }),
          studentRecipients: (cert.studentRecipients || []).map(sr => {
            const srMatch = isCertMatch || hasStuMatch || String(sr.credentialId || '').trim().toLowerCase() === normId || String(sr.studentId || '').trim().toLowerCase() === normId;
            return srMatch ? { ...sr, uploadedFile: fileData } : sr;
          })
        };
      });

      return {
        ...prev,
        courses: updatedCourses,
        certificates: updatedCerts
      };
    });
  };

  // Helper getters
  const getFacultyById = (id) => data.faculty.find(f => f.id === id);
  const getStudentById = (id) => data.students.find(s => s.id === id);

  // 1. Course Management
  const addCourse = (newCourse, newFacultyList = [], newStudentsList = []) => {
    updateDataAndSync(prev => {
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
    updateDataAndSync(prev => {
      const updatedCourses = prev.courses.map(c => {
        if (c.id !== courseId) return c;
        if (audienceType === 'faculty') {
          const exists = c.facultyCompletions.some(fc => fc.facultyId === personId);
          if (exists) return c;
          return {
            ...c,
            facultyCompletions: [...c.facultyCompletions, { facultyId: personId, ...record }],
            facultyEnrolled: (c.facultyEnrolled || []).filter(fe => fe.facultyId !== personId)
          };
        } else {
          const exists = (c.studentCompletions || []).some(sc => sc.studentId === personId);
          if (exists) return c;
          return {
            ...c,
            studentCompletions: [...(c.studentCompletions || []), { studentId: personId, ...record }],
            studentEnrolled: (c.studentEnrolled || []).filter(se => se.studentId !== personId)
          };
        }
      });
      return { ...prev, courses: updatedCourses };
    });
  };

  // 2. Certificate Management
  const addCertificate = (newCert, newFacultyList = [], newStudentsList = []) => {
    updateDataAndSync(prev => {
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
          id: newCert.id || `CERT-${Date.now().toString().slice(-4)}`,
          facultyRecipients: newCert.facultyRecipients || [],
          studentRecipients: newCert.studentRecipients || []
        }, ...prev.certificates]
      };
    });
  };

  const addCertificateRecipient = (certId, audienceType, personId, record) => {
    updateDataAndSync(prev => {
      const updatedCerts = prev.certificates.map(cert => {
        if (cert.id !== certId) return cert;
        if (audienceType === 'faculty') {
          return {
            ...cert,
            facultyRecipients: [...(cert.facultyRecipients || []), { facultyId: personId, ...record }]
          };
        } else {
          return {
            ...cert,
            studentRecipients: [...(cert.studentRecipients || []), { studentId: personId, ...record }]
          };
        }
      });
      return { ...prev, certificates: updatedCerts };
    });
  };

  // 3. Project Management
  const addProject = (newProject, newFacultyList = [], newStudentsList = []) => {
    updateDataAndSync(prev => {
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

  const updateProject = (projectId, updatedFields, newFacultyList = [], newStudentsList = []) => {
    const matchId = String(projectId);
    updateDataAndSync(prev => {
      const existingFacIds = new Set(prev.faculty.map(f => f.id));
      const existingStuIds = new Set(prev.students.map(s => s.id));
      const filteredNewFac = (newFacultyList || []).filter(f => f && f.id && !existingFacIds.has(f.id));
      const filteredNewStu = (newStudentsList || []).filter(s => s && s.id && !existingStuIds.has(s.id));

      const updatedProjects = prev.projects.map(p => {
        if (String(p.id) === matchId) {
          return {
            ...p,
            ...updatedFields,
            id: p.id
          };
        }
        return p;
      });

      return {
        ...prev,
        faculty: [...filteredNewFac, ...prev.faculty],
        students: [...filteredNewStu, ...prev.students],
        projects: updatedProjects
      };
    });
  };

  const addProjectParticipant = (projectId, roleType, personId, recordData = {}, personData = null) => {
    const matchProj = String(projectId);
    const matchPerson = String(personId);

    updateDataAndSync(prev => {
      let nextFaculty = [...prev.faculty];
      let nextStudents = [...prev.students];

      if (personData) {
        if (roleType === 'faculty' && !nextFaculty.some(f => f.id === matchPerson || (personData.name && f.name.toLowerCase() === personData.name.toLowerCase()))) {
          nextFaculty = [{ ...personData, id: matchPerson }, ...nextFaculty];
        } else if (roleType === 'student' && !nextStudents.some(s => s.id === matchPerson || (personData.name && s.name.toLowerCase() === personData.name.toLowerCase()))) {
          nextStudents = [{ ...personData, id: matchPerson }, ...nextStudents];
        }
      }

      const updatedProjects = prev.projects.map(p => {
        if (String(p.id) !== matchProj) return p;
        if (roleType === 'faculty') {
          const currentFac = p.facultyInvolved || [];
          const facName = recordData.facultyName || recordData.name || personData?.name || '';
          const existingIdx = currentFac.findIndex(fi => 
            String(fi.facultyId || fi.id || fi) === matchPerson || 
            (facName && String(fi.facultyName || fi.name || '').toLowerCase() === facName.toLowerCase())
          );
          let newFac;
          if (existingIdx >= 0) {
            newFac = [...currentFac];
            newFac[existingIdx] = { 
              ...newFac[existingIdx], 
              ...recordData, 
              facultyId: matchPerson,
              id: matchPerson,
              facultyName: facName || newFac[existingIdx].facultyName || newFac[existingIdx].name,
              name: facName || newFac[existingIdx].name || newFac[existingIdx].facultyName
            };
          } else {
            newFac = [...currentFac, { 
              facultyId: matchPerson, 
              id: matchPerson,
              facultyName: facName,
              name: facName,
              role: recordData.role || 'Faculty Advisor', 
              ...recordData 
            }];
          }
          return { ...p, facultyInvolved: newFac };
        } else {
          const currentStu = p.studentsInvolved || [];
          const stuName = recordData.studentName || recordData.name || personData?.name || '';
          const existingIdx = currentStu.findIndex(si => 
            String(si.studentId || si.id || si) === matchPerson || 
            (stuName && String(si.studentName || si.name || '').toLowerCase() === stuName.toLowerCase())
          );
          let newStu;
          if (existingIdx >= 0) {
            newStu = [...currentStu];
            newStu[existingIdx] = { 
              ...newStu[existingIdx], 
              ...recordData, 
              studentId: matchPerson,
              id: matchPerson,
              studentName: stuName || newStu[existingIdx].studentName || newStu[existingIdx].name,
              name: stuName || newStu[existingIdx].name || newStu[existingIdx].studentName
            };
          } else {
            newStu = [...currentStu, { 
              studentId: matchPerson, 
              id: matchPerson,
              studentName: stuName,
              name: stuName,
              role: recordData.role || 'Project Developer', 
              ...recordData 
            }];
          }
          return { ...p, studentsInvolved: newStu };
        }
      });

      return {
        ...prev,
        faculty: nextFaculty,
        students: nextStudents,
        projects: updatedProjects
      };
    });
  };

  // 4. Research Paper Management
  const addResearchPaper = (newPaper, newFacultyList = [], newStudentsList = []) => {
    updateDataAndSync(prev => {
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

  const updateResearchPaper = (paperId, updatedFields, newFacultyList = [], newStudentsList = []) => {
    const matchId = String(paperId);
    updateDataAndSync(prev => {
      const existingFacIds = new Set(prev.faculty.map(f => f.id));
      const existingStuIds = new Set(prev.students.map(s => s.id));
      const filteredNewFac = (newFacultyList || []).filter(f => f && f.id && !existingFacIds.has(f.id));
      const filteredNewStu = (newStudentsList || []).filter(s => s && s.id && !existingStuIds.has(s.id));

      const updatedPapers = prev.researchPapers.map(rp => {
        if (String(rp.id) === matchId) {
          return {
            ...rp,
            ...updatedFields,
            id: rp.id
          };
        }
        return rp;
      });

      return {
        ...prev,
        faculty: [...filteredNewFac, ...prev.faculty],
        students: [...filteredNewStu, ...prev.students],
        researchPapers: updatedPapers
      };
    });
  };

  const addResearchPaperAuthor = (paperId, roleType, personId, personData = null) => {
    const matchPaper = String(paperId);
    const matchPerson = String(personId);

    updateDataAndSync(prev => {
      let nextFaculty = [...prev.faculty];
      let nextStudents = [...prev.students];

      if (personData) {
        if (roleType === 'faculty' && !nextFaculty.some(f => f.id === matchPerson)) {
          nextFaculty = [{ ...personData, id: matchPerson }, ...nextFaculty];
        } else if (roleType === 'student' && !nextStudents.some(s => s.id === matchPerson)) {
          nextStudents = [{ ...personData, id: matchPerson }, ...nextStudents];
        }
      }

      const updatedPapers = prev.researchPapers.map(rp => {
        if (String(rp.id) !== matchPaper) return rp;
        if (roleType === 'faculty') {
          const currentFac = rp.facultyAuthors || [];
          if (currentFac.some(fa => String(fa.facultyId || fa) === matchPerson)) return rp;
          return {
            ...rp,
            facultyAuthors: [...currentFac, matchPerson]
          };
        } else {
          const currentStu = rp.studentAuthors || [];
          if (currentStu.some(sa => String(sa.studentId || sa) === matchPerson)) return rp;
          return {
            ...rp,
            studentAuthors: [...currentStu, matchPerson]
          };
        }
      });

      return {
        ...prev,
        faculty: nextFaculty,
        students: nextStudents,
        researchPapers: updatedPapers
      };
    });
  };

  // 5. Hackathon Management
  const addHackathon = (newHackathon, newFacultyList = [], newStudentsList = []) => {
    updateDataAndSync(prev => {
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

  const updateHackathon = (hackathonId, updatedFields, newFacultyList = [], newStudentsList = []) => {
    const matchId = String(hackathonId);
    updateDataAndSync(prev => {
      const existingFacIds = new Set(prev.faculty.map(f => f.id));
      const existingStuIds = new Set(prev.students.map(s => s.id));
      const filteredNewFac = (newFacultyList || []).filter(f => f && f.id && !existingFacIds.has(f.id));
      const filteredNewStu = (newStudentsList || []).filter(s => s && s.id && !existingStuIds.has(s.id));

      const updatedHackathons = prev.hackathons.map(h => {
        if (String(h.id) === matchId) {
          return {
            ...h,
            ...updatedFields,
            id: h.id
          };
        }
        return h;
      });

      return {
        ...prev,
        faculty: [...filteredNewFac, ...prev.faculty],
        students: [...filteredNewStu, ...prev.students],
        hackathons: updatedHackathons
      };
    });
  };

  const addHackathonParticipant = (hackathonId, roleType, personId, recordData = {}, personData = null) => {
    const matchHck = String(hackathonId);
    const matchPerson = String(personId);

    updateDataAndSync(prev => {
      let nextFaculty = [...prev.faculty];
      let nextStudents = [...prev.students];

      if (personData) {
        if (roleType === 'faculty' && !nextFaculty.some(f => f.id === matchPerson)) {
          nextFaculty = [{ ...personData, id: matchPerson }, ...nextFaculty];
        } else if (roleType === 'student' && !nextStudents.some(s => s.id === matchPerson)) {
          nextStudents = [{ ...personData, id: matchPerson }, ...nextStudents];
        }
      }

      const updatedHackathons = prev.hackathons.map(h => {
        if (String(h.id) !== matchHck) return h;
        if (roleType === 'faculty') {
          const currentFac = h.facultyParticipants || [];
          const existingIdx = currentFac.findIndex(fp => String(fp.facultyId || fp) === matchPerson);
          let newFac;
          if (existingIdx >= 0) {
            newFac = [...currentFac];
            newFac[existingIdx] = { ...newFac[existingIdx], ...recordData, facultyId: matchPerson };
          } else {
            newFac = [...currentFac, { facultyId: matchPerson, role: recordData.role || 'Mentor', ...recordData }];
          }
          return { ...h, facultyParticipants: newFac };
        } else {
          const currentStu = h.studentParticipants || [];
          const existingIdx = currentStu.findIndex(sp => String(sp.studentId || sp) === matchPerson);
          let newStu;
          if (existingIdx >= 0) {
            newStu = [...currentStu];
            newStu[existingIdx] = { ...newStu[existingIdx], ...recordData, studentId: matchPerson };
          } else {
            newStu = [...currentStu, { studentId: matchPerson, ...recordData }];
          }
          return { ...h, studentParticipants: newStu };
        }
      });

      return {
        ...prev,
        faculty: nextFaculty,
        students: nextStudents,
        hackathons: updatedHackathons
      };
    });
  };

  // 6. Person (Faculty / Student) Management
  const addFaculty = (newFaculty) => {
    updateDataAndSync(prev => ({
      ...prev,
      faculty: [{
        ...newFaculty,
        id: newFaculty.id || `FAC-${Date.now().toString().slice(-4)}`,
        avatar: newFaculty.avatar || newFaculty.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      }, ...prev.faculty]
    }));
  };

  const addStudent = (newStudent) => {
    updateDataAndSync(prev => ({
      ...prev,
      students: [{
        ...newStudent,
        id: newStudent.id || `STU-${Date.now().toString().slice(-4)}`,
        avatar: newStudent.avatar || newStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      }, ...prev.students]
    }));
  };

  // Delete Modal state
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

  // 7. Delete Entity Record (from Supabase individual tables & state)
  const deleteRecord = async (category, id) => {
    const matchId = String(id);

    try {
      if (category === 'faculty') await supabase.from('faculty').delete().eq('id', matchId);
      if (category === 'students') await supabase.from('students').delete().eq('id', matchId);
      if (category === 'courses') {
        await supabase.from('faculty_courses').delete().eq('id', matchId);
        await supabase.from('student_courses').delete().eq('id', matchId);
      }
      if (category === 'certificates') {
        await supabase.from('faculty_certificates').delete().eq('id', matchId);
        await supabase.from('student_certificates').delete().eq('id', matchId);
      }
      if (category === 'projects') {
        await supabase.from('faculty_projects').delete().eq('id', matchId);
        await supabase.from('student_projects').delete().eq('id', matchId);
      }
      if (category === 'papers' || category === 'researchPapers') {
        await supabase.from('faculty_papers').delete().eq('id', matchId);
        await supabase.from('student_papers').delete().eq('id', matchId);
      }
      if (category === 'hackathons') {
        await supabase.from('faculty_hackathons').delete().eq('id', matchId);
        await supabase.from('student_hackathons').delete().eq('id', matchId);
      }
    } catch (e) {
      console.warn('Dedicated table delete warning:', e);
    }

    updateDataAndSync(prev => {
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
    updateDataAndSync(prev => ({
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
    updateDataAndSync(prev => ({
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
    updateDataAndSync(prev => ({
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
    updateDataAndSync(prev => ({
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
    updateDataAndSync(prev => ({
      ...prev,
      hackathons: prev.hackathons.map(h => {
        if (String(h.id) !== matchHck) return h;
        if (roleType === 'faculty') {
          return {
            ...h,
            facultyParticipants: (h.facultyParticipants || []).filter(fp =>
              String(fp.facultyId || fp.id || fp) !== matchPerson &&
              String(fp.facultyName || fp.name || '') !== matchPerson
            )
          };
        } else {
          return {
            ...h,
            studentParticipants: (h.studentParticipants || []).filter(sp =>
              String(sp.studentId || sp.id || sp) !== matchPerson &&
              String(sp.studentName || sp.name || '') !== matchPerson
            )
          };
        }
      })
    }));
  };

  // 13. Export & Manual Sync
  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `qhub_quantum_db_export_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchorElem.click();
  };

  const forceCloudSync = async () => {
    saveCachedData(dataRef.current);
    const success = await persistToSupabase(dataRef.current);
    await fetchFromSupabase();
    return success;
  };

  const resetSeedData = () => {
    confirmDelete({
      title: "Reset Database in Supabase Cloud",
      message: "Are you sure you want to reset the database? All records will be cleared from Supabase Cloud permanently.",
      onConfirm: async () => {
        const initial = {
          faculty: INITIAL_FACULTY,
          students: INITIAL_STUDENTS,
          courses: INITIAL_COURSES,
          certificates: INITIAL_CERTIFICATES,
          projects: INITIAL_PROJECTS,
          researchPapers: INITIAL_RESEARCH_PAPERS,
          hackathons: INITIAL_HACKATHONS
        };
        updateDataAndSync(initial);
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
      lastSyncTime,
      syncError,
      supabase,
      forceCloudSync,
      refreshFromCloud: fetchFromSupabase,
      attachDocumentToRecord,
      getFacultyById,
      getStudentById,
      addCourse,
      addCourseCompletion,
      addCertificate,
      addCertificateRecipient,
      addProject,
      updateProject,
      addProjectParticipant,
      addResearchPaper,
      updateResearchPaper,
      addResearchPaperAuthor,
      addHackathon,
      updateHackathon,
      addHackathonParticipant,
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
