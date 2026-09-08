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

  // Helper to push full state to Supabase (both multi-table and unified table)
  const persistToSupabase = useCallback(async (stateToSave) => {
    const jsonStr = getJson(stateToSave);
    if (!jsonStr || jsonStr === lastSyncedHash.current) {
      return true;
    }

    setCloudStatus('syncing');
    setSyncError(null);

    try {
      // 1. Save to Unified Realtime Table
      const { error: uniErr } = await supabase
        .from('quantum_portal_data')
        .upsert({
          id: 'main_state',
          data: stateToSave,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      // 2. Save to Dedicated Faculty Tables & Student Tables
      const tableUpserts = [];

      // Faculty Profiles
      if (stateToSave.faculty && stateToSave.faculty.length > 0) {
        tableUpserts.push(supabase.from('faculty').upsert(stateToSave.faculty, { onConflict: 'id' }));
      }

      // Student Profiles
      if (stateToSave.students && stateToSave.students.length > 0) {
        tableUpserts.push(supabase.from('students').upsert(stateToSave.students.map(s => ({
          id: s.id,
          student_id: s.studentId || s.student_id,
          name: s.name,
          department: s.department,
          year: s.year || 'Student',
          email: s.email,
          avatar: s.avatar
        })), { onConflict: 'id' }));
      }

      // Faculty Courses & Student Courses
      if (stateToSave.courses && stateToSave.courses.length > 0) {
        // Generic courses table
        tableUpserts.push(supabase.from('courses').upsert(stateToSave.courses.map(c => ({
          id: c.id,
          code: c.code,
          name: c.name,
          provider: c.provider,
          category: c.category,
          description: c.description,
          faculty_completions: c.facultyCompletions || c.faculty_completions || [],
          faculty_enrolled: c.facultyEnrolled || c.faculty_enrolled || [],
          student_completions: c.studentCompletions || c.student_completions || [],
          student_enrolled: c.studentEnrolled || c.student_enrolled || []
        })), { onConflict: 'id' }));

        // Dedicated faculty_courses
        const facCourseRows = [];
        const stuCourseRows = [];

        stateToSave.courses.forEach(c => {
          const isFaculty = c.targetAudience === 'faculty' || (c.facultyCompletions && c.facultyCompletions.length > 0) || (c.facultyEnrolled && c.facultyEnrolled.length > 0) || (!c.targetAudience && (!c.studentCompletions || c.studentCompletions.length === 0));
          const isStudent = c.targetAudience === 'students' || c.targetAudience === 'student' || (c.studentCompletions && c.studentCompletions.length > 0) || (c.studentEnrolled && c.studentEnrolled.length > 0);

          if (isFaculty) {
            if (c.facultyCompletions && c.facultyCompletions.length > 0) {
              c.facultyCompletions.forEach((fc, idx) => {
                facCourseRows.push({
                  id: `${c.id}-FC-${idx + 1}`,
                  course_code: c.code,
                  course_name: c.name,
                  provider: c.provider,
                  category: c.category || 'Quantum',
                  description: c.description || '',
                  faculty_name: fc.facultyName || 'Faculty Member',
                  faculty_id: fc.facultyId || '',
                  completion_date: fc.completionDate || '',
                  grade: fc.grade || 'Verified',
                  certificate_id: fc.certificateId || '',
                  status: 'Completed'
                });
              });
            } else {
              facCourseRows.push({
                id: c.id,
                course_code: c.code,
                course_name: c.name,
                provider: c.provider,
                category: c.category || 'Quantum',
                description: c.description || '',
                faculty_name: '',
                faculty_id: '',
                completion_date: '',
                grade: '',
                certificate_id: '',
                status: 'Available'
              });
            }
          }

          if (isStudent) {
            if (c.studentCompletions && c.studentCompletions.length > 0) {
              c.studentCompletions.forEach((sc, idx) => {
                stuCourseRows.push({
                  id: `${c.id}-SC-${idx + 1}`,
                  course_code: c.code,
                  course_name: c.name,
                  provider: c.provider,
                  category: c.category || 'Quantum',
                  description: c.description || '',
                  student_name: sc.studentName || 'Student Candidate',
                  student_id: sc.studentId || '',
                  completion_date: sc.completionDate || '',
                  grade: sc.grade || 'Verified',
                  certificate_id: sc.certificateId || '',
                  status: 'Completed'
                });
              });
            } else {
              stuCourseRows.push({
                id: c.id,
                course_code: c.code,
                course_name: c.name,
                provider: c.provider,
                category: c.category || 'Quantum',
                description: c.description || '',
                student_name: '',
                student_id: '',
                completion_date: '',
                grade: '',
                certificate_id: '',
                status: 'Available'
              });
            }
          }
        });

        if (facCourseRows.length > 0) tableUpserts.push(supabase.from('faculty_courses').upsert(facCourseRows, { onConflict: 'id' }));
        if (stuCourseRows.length > 0) tableUpserts.push(supabase.from('student_courses').upsert(stuCourseRows, { onConflict: 'id' }));
      }

      // Faculty Certificates & Student Certificates
      if (stateToSave.certificates && stateToSave.certificates.length > 0) {
        tableUpserts.push(supabase.from('certificates').upsert(stateToSave.certificates.map(c => ({
          id: c.id,
          title: c.title,
          issuer: c.issuer,
          code: c.code,
          verification_url: c.verificationUrl || c.verification_url,
          faculty_recipients: c.facultyRecipients || c.faculty_recipients || [],
          student_recipients: c.studentRecipients || c.student_recipients || []
        })), { onConflict: 'id' }));

        const facCertRows = [];
        const stuCertRows = [];

        stateToSave.certificates.forEach(c => {
          const isFaculty = c.targetAudience === 'faculty' || (c.facultyRecipients && c.facultyRecipients.length > 0) || (!c.targetAudience && (!c.studentRecipients || c.studentRecipients.length === 0));
          const isStudent = c.targetAudience === 'students' || c.targetAudience === 'student' || (c.studentRecipients && c.studentRecipients.length > 0);

          if (isFaculty) {
            if (c.facultyRecipients && c.facultyRecipients.length > 0) {
              c.facultyRecipients.forEach((fr, idx) => {
                facCertRows.push({
                  id: `${c.id}-FR-${idx + 1}`,
                  title: c.title,
                  issuer: c.issuer,
                  code: c.code,
                  faculty_name: fr.facultyName || 'Faculty Researcher',
                  faculty_id: fr.facultyId || '',
                  credential_id: fr.credentialId || '',
                  issue_date: fr.issueDate || '',
                  score: fr.score || 'Mastery',
                  verification_url: c.verificationUrl || ''
                });
              });
            } else {
              facCertRows.push({
                id: c.id,
                title: c.title,
                issuer: c.issuer,
                code: c.code,
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
                  id: `${c.id}-SR-${idx + 1}`,
                  title: c.title,
                  issuer: c.issuer,
                  code: c.code,
                  student_name: sr.studentName || 'Student Recipient',
                  student_id: sr.studentId || '',
                  credential_id: sr.credentialId || '',
                  issue_date: sr.issueDate || '',
                  score: sr.score || 'Mastery',
                  verification_url: c.verificationUrl || ''
                });
              });
            } else {
              stuCertRows.push({
                id: c.id,
                title: c.title,
                issuer: c.issuer,
                code: c.code,
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

      // Faculty Projects & Student Projects
      if (stateToSave.projects && stateToSave.projects.length > 0) {
        tableUpserts.push(supabase.from('projects').upsert(stateToSave.projects.map(p => ({
          id: p.id,
          title: p.title,
          domain: p.domain,
          tech_stack: p.techStack || p.tech_stack || [],
          description: p.description,
          status: p.status,
          github_url: p.githubUrl || p.github_url,
          faculty_involved: p.facultyInvolved || p.faculty_involved || [],
          students_involved: p.studentsInvolved || p.students_involved || []
        })), { onConflict: 'id' }));

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
              domain: p.domain || '',
              tech_stack: Array.isArray(p.techStack) ? p.techStack.join(', ') : String(p.techStack || ''),
              description: p.description || '',
              status: p.status || 'Active',
              github_url: p.githubUrl || '',
              faculty_name: facLead.facultyName || 'Faculty PI',
              faculty_id: facLead.facultyId || '',
              role: facLead.role || 'Principal Investigator'
            });
          }

          if (isStudent) {
            const stuLead = (p.studentsInvolved || [])[0] || {};
            stuProjRows.push({
              id: p.id,
              title: p.title,
              domain: p.domain || '',
              tech_stack: Array.isArray(p.techStack) ? p.techStack.join(', ') : String(p.techStack || ''),
              description: p.description || '',
              status: p.status || 'Active',
              github_url: p.githubUrl || '',
              student_name: stuLead.studentName || 'Student Lead',
              student_id: stuLead.studentId || '',
              role: stuLead.role || 'Project Lead & Developer'
            });
          }
        });

        if (facProjRows.length > 0) tableUpserts.push(supabase.from('faculty_projects').upsert(facProjRows, { onConflict: 'id' }));
        if (stuProjRows.length > 0) tableUpserts.push(supabase.from('student_projects').upsert(stuProjRows, { onConflict: 'id' }));
      }

      // Faculty Papers & Student Papers
      if (stateToSave.researchPapers && stateToSave.researchPapers.length > 0) {
        tableUpserts.push(supabase.from('research_papers').upsert(stateToSave.researchPapers.map(rp => ({
          id: rp.id,
          title: rp.title,
          venue: rp.venue,
          doi: rp.doi,
          research_area: rp.researchArea || rp.research_area,
          abstract: rp.abstract,
          citations: rp.citations || 0,
          date: rp.date,
          faculty_authors: rp.facultyAuthors || rp.faculty_authors || [],
          student_authors: rp.studentAuthors || rp.student_authors || []
        })), { onConflict: 'id' }));

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
              research_area: rp.researchArea || '',
              abstract: rp.abstract || '',
              citations: rp.citations || 0,
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
              research_area: rp.researchArea || '',
              abstract: rp.abstract || '',
              citations: rp.citations || 0,
              date: rp.date || '',
              student_name: (rp.studentAuthors || []).join(', ') || 'Student Author',
              student_id: (rp.studentAuthors || [])[0] || ''
            });
          }
        });

        if (facPaperRows.length > 0) tableUpserts.push(supabase.from('faculty_papers').upsert(facPaperRows, { onConflict: 'id' }));
        if (stuPaperRows.length > 0) tableUpserts.push(supabase.from('student_papers').upsert(stuPaperRows, { onConflict: 'id' }));
      }

      // Faculty Hackathons & Student Hackathons
      if (stateToSave.hackathons && stateToSave.hackathons.length > 0) {
        tableUpserts.push(supabase.from('hackathons').upsert(stateToSave.hackathons.map(h => ({
          id: h.id,
          name: h.name,
          organizer: h.organizer,
          edition: h.edition,
          date: h.date,
          faculty_participants: h.facultyParticipants || h.faculty_participants || [],
          student_participants: h.studentParticipants || h.student_participants || []
        })), { onConflict: 'id' }));

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
              faculty_name: facP.facultyName || 'Faculty Mentor',
              faculty_id: facP.facultyId || '',
              team_name: facP.teamName || 'Faculty Team',
              project_built: facP.projectBuilt || '',
              award: facP.award || 'Winner'
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
              student_name: stuP.studentName || 'Student Lead',
              student_id: stuP.studentId || '',
              team_name: stuP.teamName || 'Student Team',
              project_built: stuP.projectBuilt || '',
              award: stuP.award || 'Winner'
            });
          }
        });

        if (facHckRows.length > 0) tableUpserts.push(supabase.from('faculty_hackathons').upsert(facHckRows, { onConflict: 'id' }));
        if (stuHckRows.length > 0) tableUpserts.push(supabase.from('student_hackathons').upsert(stuHckRows, { onConflict: 'id' }));
      }

      await Promise.allSettled(tableUpserts);

      if (uniErr && (uniErr.code === 'PGRST205' || uniErr.code === '42P01')) {
        setCloudStatus('table_needed');
        return false;
      }

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

  // 1. Initial Load directly from Supabase Cloud
  const fetchFromSupabase = useCallback(async () => {
    try {
      setCloudStatus('connecting');

      // Attempt multi-table fetch first
      const [facRes, stuRes, crsRes, certRes, prjRes, papRes, hckRes, uniRes] = await Promise.allSettled([
        supabase.from('faculty').select('*'),
        supabase.from('students').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('certificates').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('research_papers').select('*'),
        supabase.from('hackathons').select('*'),
        supabase.from('quantum_portal_data').select('data, updated_at').eq('id', 'main_state').maybeSingle()
      ]);

      let loadedFaculty = [];
      let loadedStudents = [];
      let loadedCourses = [];
      let loadedCertificates = [];
      let loadedProjects = [];
      let loadedPapers = [];
      let loadedHackathons = [];

      let hasMultiTableData = false;

      if (facRes.status === 'fulfilled' && facRes.value.data && facRes.value.data.length > 0) {
        loadedFaculty = facRes.value.data;
        hasMultiTableData = true;
      }
      if (stuRes.status === 'fulfilled' && stuRes.value.data && stuRes.value.data.length > 0) {
        loadedStudents = stuRes.value.data.map(s => ({
          id: s.id,
          name: s.name,
          studentId: s.student_id || s.studentId,
          department: s.department,
          year: s.year,
          email: s.email,
          avatar: s.avatar
        }));
        hasMultiTableData = true;
      }
      if (crsRes.status === 'fulfilled' && crsRes.value.data && crsRes.value.data.length > 0) {
        loadedCourses = crsRes.value.data.map(c => ({
          id: c.id,
          code: c.code,
          name: c.name,
          provider: c.provider,
          category: c.category,
          description: c.description,
          targetAudience: c.target_audience || c.targetAudience || ((c.faculty_completions?.length > 0 || c.faculty_enrolled?.length > 0) ? 'faculty' : (c.student_completions?.length > 0 || c.student_enrolled?.length > 0) ? 'students' : 'faculty'),
          facultyCompletions: c.faculty_completions || c.facultyCompletions || [],
          facultyEnrolled: c.faculty_enrolled || c.facultyEnrolled || [],
          studentCompletions: c.student_completions || c.studentCompletions || [],
          studentEnrolled: c.student_enrolled || c.studentEnrolled || []
        }));
        hasMultiTableData = true;
      }
      if (certRes.status === 'fulfilled' && certRes.value.data && certRes.value.data.length > 0) {
        loadedCertificates = certRes.value.data.map(c => ({
          id: c.id,
          title: c.title,
          issuer: c.issuer,
          code: c.code,
          verificationUrl: c.verification_url || c.verificationUrl,
          targetAudience: c.target_audience || c.targetAudience || (c.faculty_recipients?.length > 0 ? 'faculty' : c.student_recipients?.length > 0 ? 'students' : 'faculty'),
          facultyRecipients: c.faculty_recipients || c.facultyRecipients || [],
          studentRecipients: c.student_recipients || c.studentRecipients || []
        }));
        hasMultiTableData = true;
      }
      if (prjRes.status === 'fulfilled' && prjRes.value.data && prjRes.value.data.length > 0) {
        loadedProjects = prjRes.value.data.map(p => ({
          id: p.id,
          title: p.title,
          domain: p.domain,
          techStack: p.tech_stack || p.techStack || [],
          description: p.description,
          status: p.status,
          githubUrl: p.github_url || p.githubUrl,
          targetAudience: p.target_audience || p.targetAudience || (p.faculty_involved?.length > 0 ? 'faculty' : p.students_involved?.length > 0 ? 'students' : 'faculty'),
          facultyInvolved: p.faculty_involved || p.facultyInvolved || [],
          studentsInvolved: p.students_involved || p.studentsInvolved || []
        }));
        hasMultiTableData = true;
      }
      if (papRes.status === 'fulfilled' && papRes.value.data && papRes.value.data.length > 0) {
        loadedPapers = papRes.value.data.map(rp => ({
          id: rp.id,
          title: rp.title,
          venue: rp.venue,
          doi: rp.doi,
          researchArea: rp.research_area || rp.researchArea,
          abstract: rp.abstract,
          citations: rp.citations || 0,
          date: rp.date,
          targetAudience: rp.target_audience || rp.targetAudience || (rp.faculty_authors?.length > 0 ? 'faculty' : rp.student_authors?.length > 0 ? 'students' : 'faculty'),
          facultyAuthors: rp.faculty_authors || rp.facultyAuthors || [],
          studentAuthors: rp.student_authors || rp.studentAuthors || []
        }));
        hasMultiTableData = true;
      }
      if (hckRes.status === 'fulfilled' && hckRes.value.data && hckRes.value.data.length > 0) {
        loadedHackathons = hckRes.value.data.map(h => ({
          id: h.id,
          name: h.name,
          organizer: h.organizer,
          edition: h.edition,
          date: h.date,
          targetAudience: h.target_audience || h.targetAudience || (h.faculty_participants?.length > 0 ? 'faculty' : h.student_participants?.length > 0 ? 'students' : 'faculty'),
          facultyParticipants: h.faculty_participants || h.facultyParticipants || [],
          studentParticipants: h.student_participants || h.studentParticipants || []
        }));
        hasMultiTableData = true;
      }

      // If multi-table rows exist, use them
      if (hasMultiTableData) {
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

      // Otherwise, fallback to unified quantum_portal_data
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

        // Backfill separate tables if they are empty
        persistToSupabase(assembled);
      } else {
        // No row in Supabase -> Seed Supabase with default data
        await persistToSupabase(DEFAULT_DATA);
        setData(DEFAULT_DATA);
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
          id: newCert.id || `CERT-NEW-${Date.now().toString().slice(-4)}`,
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

    // Delete directly from Supabase individual table
    try {
      if (category === 'faculty') await supabase.from('faculty').delete().eq('id', matchId);
      if (category === 'students') await supabase.from('students').delete().eq('id', matchId);
      if (category === 'courses') await supabase.from('courses').delete().eq('id', matchId);
      if (category === 'certificates') await supabase.from('certificates').delete().eq('id', matchId);
      if (category === 'projects') await supabase.from('projects').delete().eq('id', matchId);
      if (category === 'papers' || category === 'researchPapers') await supabase.from('research_papers').delete().eq('id', matchId);
      if (category === 'hackathons') await supabase.from('hackathons').delete().eq('id', matchId);
    } catch (e) {
      console.warn('Individual table delete warning:', e);
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
