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

export const QuantumDBProvider = ({ children }) => {
  const [data, setData] = useState(DEFAULT_DATA);
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

  const serializeFile = (file) => {
    if (!file) return null;
    if (typeof file === 'string') return file;
    try {
      return JSON.stringify(file);
    } catch {
      return null;
    }
  };

  // Helper to push full state to Supabase dedicated tables + unified realtime table
  const persistToSupabase = useCallback(async (stateToSave) => {
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

      // 2. Faculty Profiles
      if (stateToSave.faculty && stateToSave.faculty.length > 0) {
        tableUpserts.push(supabase.from('faculty').upsert(stateToSave.faculty, { onConflict: 'id' }));
      }

      // 3. Student Profiles
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

      // 4. Faculty Courses & Student Courses
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
                  status: 'Completed',
                  uploaded_file: serializeFile(fc.uploadedFile || c.uploadedFile)
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
                status: 'Available',
                uploaded_file: serializeFile(c.uploadedFile)
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
                  status: 'Completed',
                  uploaded_file: serializeFile(sc.uploadedFile || c.uploadedFile)
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
                status: 'Available',
                uploaded_file: serializeFile(c.uploadedFile)
              });
            }
          }
        });

        if (facCourseRows.length > 0) tableUpserts.push(supabase.from('faculty_courses').upsert(facCourseRows, { onConflict: 'id' }));
        if (stuCourseRows.length > 0) tableUpserts.push(supabase.from('student_courses').upsert(stuCourseRows, { onConflict: 'id' }));
      }

      // 5. Faculty Certificates & Student Certificates
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
                  verification_url: c.verificationUrl || '',
                  uploaded_file: serializeFile(fr.uploadedFile || c.uploadedFile)
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
                verification_url: c.verificationUrl || '',
                uploaded_file: serializeFile(c.uploadedFile)
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
                  verification_url: c.verificationUrl || '',
                  uploaded_file: serializeFile(sr.uploadedFile || c.uploadedFile)
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
                verification_url: c.verificationUrl || '',
                uploaded_file: serializeFile(c.uploadedFile)
              });
            }
          }
        });

        if (facCertRows.length > 0) tableUpserts.push(supabase.from('faculty_certificates').upsert(facCertRows, { onConflict: 'id' }));
        if (stuCertRows.length > 0) tableUpserts.push(supabase.from('student_certificates').upsert(stuCertRows, { onConflict: 'id' }));
      }

      // 6. Faculty Projects & Student Projects
      if (stateToSave.projects && stateToSave.projects.length > 0) {
        const facProjRows = [];
        const stuProjRows = [];

        stateToSave.projects.forEach(p => {
          const isFaculty = p.targetAudience === 'faculty' || (p.facultyInvolved && p.facultyInvolved.length > 0) || (!p.targetAudience && (!p.studentsInvolved || p.studentsInvolved.length === 0));
          const isStudent = p.targetAudience === 'students' || p.targetAudience === 'student' || (p.studentsInvolved && p.studentsInvolved.length > 0);

          if (isFaculty) {
            const facLead = (p.facultyInvolved || [])[0] || {};
            facProjRows.push({
              id: p.id,
              title: p.title,
              domain: p.domain || 'Quantum Computing',
              tech_stack: Array.isArray(p.techStack) ? p.techStack.join(', ') : String(p.techStack || ''),
              description: p.description || '',
              status: p.status || 'Active Development',
              github_url: p.githubUrl || '',
              faculty_name: facLead.facultyName || 'Faculty PI',
              faculty_id: facLead.facultyId || '',
              role: facLead.role || 'Principal Investigator',
              uploaded_file: serializeFile(p.uploadedFile)
            });
          }

          if (isStudent) {
            const stuLead = (p.studentsInvolved || [])[0] || {};
            stuProjRows.push({
              id: p.id,
              title: p.title,
              domain: p.domain || 'Quantum Computing',
              tech_stack: Array.isArray(p.techStack) ? p.techStack.join(', ') : String(p.techStack || ''),
              description: p.description || '',
              status: p.status || 'Active Development',
              github_url: p.githubUrl || '',
              student_name: stuLead.studentName || 'Student Lead',
              student_id: stuLead.studentId || '',
              role: stuLead.role || 'Project Lead & Developer',
              uploaded_file: serializeFile(p.uploadedFile)
            });
          }
        });

        if (facProjRows.length > 0) tableUpserts.push(supabase.from('faculty_projects').upsert(facProjRows, { onConflict: 'id' }));
        if (stuProjRows.length > 0) tableUpserts.push(supabase.from('student_projects').upsert(stuProjRows, { onConflict: 'id' }));
      }

      // 7. Faculty Papers & Student Papers
      if (stateToSave.researchPapers && stateToSave.researchPapers.length > 0) {
        const facPaperRows = [];
        const stuPaperRows = [];

        stateToSave.researchPapers.forEach(rp => {
          const isFaculty = rp.targetAudience === 'faculty' || (rp.facultyAuthors && rp.facultyAuthors.length > 0) || (!rp.targetAudience && (!rp.studentAuthors || rp.studentAuthors.length === 0));
          const isStudent = rp.targetAudience === 'students' || rp.targetAudience === 'student' || (rp.studentAuthors && rp.studentAuthors.length > 0);

          if (isFaculty) {
            facPaperRows.push({
              id: rp.id,
              title: rp.title,
              venue: rp.venue || '',
              doi: rp.doi || '',
              research_area: rp.researchArea || rp.research_area || 'Quantum Computing',
              abstract: rp.abstract || '',
              citations: rp.citations || 0,
              date: rp.date || '',
              faculty_name: (rp.facultyAuthors || []).join(', ') || 'Faculty Author',
              faculty_id: (rp.facultyAuthors || [])[0] || '',
              uploaded_file: serializeFile(rp.uploadedFile)
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
              citations: rp.citations || 0,
              date: rp.date || '',
              student_name: (rp.studentAuthors || []).join(', ') || 'Student Author',
              student_id: (rp.studentAuthors || [])[0] || '',
              uploaded_file: serializeFile(rp.uploadedFile)
            });
          }
        });

        if (facPaperRows.length > 0) tableUpserts.push(supabase.from('faculty_papers').upsert(facPaperRows, { onConflict: 'id' }));
        if (stuPaperRows.length > 0) tableUpserts.push(supabase.from('student_papers').upsert(stuPaperRows, { onConflict: 'id' }));
      }

      // 8. Faculty Hackathons & Student Hackathons
      if (stateToSave.hackathons && stateToSave.hackathons.length > 0) {
        const facHckRows = [];
        const stuHckRows = [];

        stateToSave.hackathons.forEach(h => {
          const isFaculty = h.targetAudience === 'faculty' || (h.facultyParticipants && h.facultyParticipants.length > 0) || (!h.targetAudience && (!h.studentParticipants || h.studentParticipants.length === 0));
          const isStudent = h.targetAudience === 'students' || h.targetAudience === 'student' || (h.studentParticipants && h.studentParticipants.length > 0);

          if (isFaculty) {
            const facP = (h.facultyParticipants || [])[0] || {};
            facHckRows.push({
              id: h.id,
              hackathon_name: h.name,
              organizer: h.organizer || '',
              edition: h.edition || '',
              date: h.date || '',
              faculty_name: facP.facultyName || facP.name || 'Faculty Mentor',
              faculty_id: facP.facultyId || '',
              team_name: facP.teamName || 'Faculty Team',
              project_built: facP.projectBuilt || '',
              award: facP.award || 'Winner',
              uploaded_file: serializeFile(facP.uploadedFile || h.uploadedFile)
            });
          }

          if (isStudent) {
            const stuP = (h.studentParticipants || [])[0] || {};
            stuHckRows.push({
              id: h.id,
              hackathon_name: h.name,
              organizer: h.organizer || '',
              edition: h.edition || '',
              date: h.date || '',
              student_name: stuP.studentName || stuP.name || 'Student Lead',
              student_id: stuP.studentId || '',
              team_name: stuP.teamName || 'Student Team',
              project_built: stuP.projectBuilt || '',
              award: stuP.award || 'Winner',
              uploaded_file: serializeFile(stuP.uploadedFile || h.uploadedFile)
            });
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

  // 1. Initial Load directly from Supabase Dedicated Tables
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
        uniRes
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
        supabase.from('quantum_portal_data').select('data, updated_at').eq('id', 'main_state').maybeSingle()
      ]);

      const parseFile = (val) => {
        if (!val) return null;
        if (typeof val === 'object') return val;
        try {
          return JSON.parse(val);
        } catch {
          return { dataUrl: val, name: 'Document' };
        }
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
          const file = parseFile(fc.uploaded_file);
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
          const file = parseFile(sc.uploaded_file);
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
          const file = parseFile(fc.uploaded_file);
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
          const file = parseFile(sc.uploaded_file);
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

      // Faculty Projects
      if (facPrjRes.status === 'fulfilled' && facPrjRes.value.data && facPrjRes.value.data.length > 0) {
        hasDedicatedData = true;
        facPrjRes.value.data.forEach(fp => {
          const file = parseFile(fp.uploaded_file);
          loadedProjects.push({
            id: fp.id,
            title: fp.title,
            domain: fp.domain || 'Quantum Computing',
            techStack: typeof fp.tech_stack === 'string' ? fp.tech_stack.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(fp.tech_stack) ? fp.tech_stack : []),
            description: fp.description || '',
            status: fp.status || 'Active Development',
            githubUrl: fp.github_url || '',
            targetAudience: 'faculty',
            uploadedFile: file,
            facultyInvolved: fp.faculty_name ? [{
              facultyId: fp.faculty_id || 'FAC-01',
              facultyName: fp.faculty_name,
              role: fp.role || 'Principal Investigator',
              department: 'Quantum Science'
            }] : [],
            studentsInvolved: []
          });
        });
      }

      // Student Projects
      if (stuPrjRes.status === 'fulfilled' && stuPrjRes.value.data && stuPrjRes.value.data.length > 0) {
        hasDedicatedData = true;
        stuPrjRes.value.data.forEach(sp => {
          const file = parseFile(sp.uploaded_file);
          loadedProjects.push({
            id: sp.id,
            title: sp.title,
            domain: sp.domain || 'Quantum Computing',
            techStack: typeof sp.tech_stack === 'string' ? sp.tech_stack.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(sp.tech_stack) ? sp.tech_stack : []),
            description: sp.description || '',
            status: sp.status || 'Active Development',
            githubUrl: sp.github_url || '',
            targetAudience: 'students',
            uploadedFile: file,
            facultyInvolved: [],
            studentsInvolved: sp.student_name ? [{
              studentId: sp.student_id || 'STU-01',
              studentName: sp.student_name,
              role: sp.role || 'Project Lead & Developer',
              department: 'Computer Science'
            }] : []
          });
        });
      }

      // Faculty Papers
      if (facPapRes.status === 'fulfilled' && facPapRes.value.data && facPapRes.value.data.length > 0) {
        hasDedicatedData = true;
        facPapRes.value.data.forEach(fp => {
          loadedPapers.push({
            id: fp.id,
            title: fp.title,
            venue: fp.venue || '',
            doi: fp.doi || '',
            researchArea: fp.research_area || 'Quantum Computing',
            abstract: fp.abstract || '',
            citations: Number(fp.citations) || 0,
            date: fp.date || '',
            targetAudience: 'faculty',
            facultyAuthors: [fp.faculty_name || 'Faculty Author'],
            studentAuthors: []
          });
        });
      }

      // Student Papers
      if (stuPapRes.status === 'fulfilled' && stuPapRes.value.data && stuPapRes.value.data.length > 0) {
        hasDedicatedData = true;
        stuPapRes.value.data.forEach(sp => {
          loadedPapers.push({
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
            studentAuthors: [sp.student_name || 'Student Author']
          });
        });
      }

      // Faculty Hackathons
      if (facHckRes.status === 'fulfilled' && facHckRes.value.data && facHckRes.value.data.length > 0) {
        hasDedicatedData = true;
        facHckRes.value.data.forEach(fh => {
          const file = parseFile(fh.uploaded_file);
          loadedHackathons.push({
            id: fh.id,
            name: fh.hackathon_name,
            organizer: fh.organizer || '',
            edition: fh.edition || '',
            date: fh.date || '',
            targetAudience: 'faculty',
            uploadedFile: file,
            facultyParticipants: fh.faculty_name ? [{
              facultyId: fh.faculty_id || 'FAC-01',
              facultyName: fh.faculty_name,
              name: fh.faculty_name,
              teamName: fh.team_name || 'Team Quantum',
              projectBuilt: fh.project_built || '',
              award: fh.award || 'Participant',
              uploadedFile: file
            }] : [],
            studentParticipants: []
          });
        });
      }

      // Student Hackathons
      if (stuHckRes.status === 'fulfilled' && stuHckRes.value.data && stuHckRes.value.data.length > 0) {
        hasDedicatedData = true;
        stuHckRes.value.data.forEach(sh => {
          const file = parseFile(sh.uploaded_file);
          loadedHackathons.push({
            id: sh.id,
            name: sh.hackathon_name,
            organizer: sh.organizer || '',
            edition: sh.edition || '',
            date: sh.date || '',
            targetAudience: 'students',
            uploadedFile: file,
            facultyParticipants: [],
            studentParticipants: sh.student_name ? [{
              studentId: sh.student_id || 'STU-01',
              studentName: sh.student_name,
              name: sh.student_name,
              teamName: sh.team_name || 'Team Quantum',
              projectBuilt: sh.project_built || '',
              award: sh.award || 'Participant',
              uploadedFile: file
            }] : []
          });
        });
      }

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

      // If dedicated multi-table data exists, use it!
      if (hasDedicatedData) {
        const assembled = {
          faculty: loadedFaculty,
          students: loadedStudents,
          courses: loadedCourses,
          certificates: loadedCertificates,
          projects: loadedProjects,
          researchPapers: loadedPapers,
          hackathons: loadedHackathons
        };
        lastSyncedHash.current = getJson(assembled);
        setData(assembled);
        setCloudStatus('synced');
        setLastSyncTime(new Date());
        return;
      }

      // Fallback: unified quantum_portal_data
      if (uniRes.status === 'fulfilled' && uniRes.value.data && uniRes.value.data.data) {
        const cloudData = uniRes.value.data.data;
        const assembled = {
          faculty: Array.isArray(cloudData.faculty) ? cloudData.faculty : [],
          students: Array.isArray(cloudData.students) ? cloudData.students : [],
          courses: Array.isArray(cloudData.courses) ? cloudData.courses : [],
          certificates: Array.isArray(cloudData.certificates) ? cloudData.certificates : [],
          projects: Array.isArray(cloudData.projects) ? cloudData.projects : [],
          researchPapers: Array.isArray(cloudData.researchPapers) ? cloudData.researchPapers : [],
          hackathons: Array.isArray(cloudData.hackathons) ? cloudData.hackathons : []
        };
        lastSyncedHash.current = getJson(assembled);
        setData(assembled);
        setCloudStatus('synced');
        setLastSyncTime(uniRes.value.data.updated_at ? new Date(uniRes.value.data.updated_at) : new Date());

        // Backfill dedicated separate tables
        persistToSupabase(assembled);
      } else {
        setData(DEFAULT_DATA);
        setCloudStatus('synced');
      }
    } catch (e) {
      console.error("Supabase initial load error:", e);
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
            setData({
              faculty: incomingData.faculty || [],
              students: incomingData.students || [],
              courses: incomingData.courses || [],
              certificates: incomingData.certificates || [],
              projects: incomingData.projects || [],
              researchPapers: incomingData.researchPapers || [],
              hackathons: incomingData.hackathons || []
            });
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

  // Central state update function that pushes directly to Supabase
  const updateDataAndSync = useCallback((updater) => {
    setData(prev => {
      const nextData = typeof updater === 'function' ? updater(prev) : updater;
      // Immediately push to Supabase Cloud
      persistToSupabase(nextData);
      return nextData;
    });
  }, [persistToSupabase]);

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

  // 13. Export & Manual Sync
  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `qhub_quantum_db_export_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchorElem.click();
  };

  const forceCloudSync = async () => {
    return await persistToSupabase(dataRef.current);
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
