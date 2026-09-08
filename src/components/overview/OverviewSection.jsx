import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  Layers,
  FileText,
  Trophy,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from 'shaders/react';
import { useQuantumDB } from '../../data/db';
import { QuantumCircuitSimulator } from './QuantumCircuitSimulator';

export const OverviewSection = ({ onNavigate }) => {
  const { faculty, students, courses, certificates, projects, researchPapers, hackathons } = useQuantumDB();

  // Aggregate stats calculation
  const totalCourses = courses.length;
  const totalFacultyCompletions = courses.reduce((sum, c) => sum + (c.facultyCompletions?.length || 0), 0);
  const totalStudentCompletions = courses.reduce((sum, c) => sum + (c.studentCompletions?.length || 0), 0);
  const totalCertificates = certificates.length;
  const totalProjects = projects.length;
  const totalPapers = researchPapers.length;
  const totalHackathons = hackathons.length;
  const totalAchievements = totalCourses + totalCertificates + totalProjects + totalPapers + totalHackathons;

  // Active faculty who have registered completions, projects, papers, or certificates
  const activeFacultyIds = new Set([
    ...courses.flatMap(c => (c.facultyCompletions || []).map(fc => fc.facultyId).concat((c.facultyEnrolled || []).map(fe => fe.facultyId))),
    ...certificates.flatMap(c => (c.facultyRecipients || []).map(fr => fr.facultyId)),
    ...projects.flatMap(p => (p.facultyInvolved || []).map(fi => fi.facultyId)),
    ...researchPapers.flatMap(rp => rp.facultyAuthors || []),
    ...hackathons.flatMap(h => (h.facultyParticipants || []).map(fp => fp.facultyId))
  ]);

  const facultyCount = totalAchievements === 0 ? 0 : (faculty.filter(f => activeFacultyIds.has(f.id)).length || faculty.length);

  // Active students who have registered completions, projects, papers, or certificates
  const activeStudentIds = new Set([
    ...courses.flatMap(c => (c.studentCompletions || []).map(sc => sc.studentId).concat((c.studentEnrolled || []).map(se => se.studentId))),
    ...certificates.flatMap(c => (c.studentRecipients || []).map(sr => sr.studentId)),
    ...projects.flatMap(p => (p.studentsInvolved || []).map(si => si.studentId)),
    ...researchPapers.flatMap(rp => rp.studentAuthors || []),
    ...hackathons.flatMap(h => (h.studentParticipants || []).map(sp => sp.studentId))
  ]);

  const studentCount = totalAchievements === 0 ? 0 : (students.filter(s => activeStudentIds.has(s.id)).length || students.length);

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-light)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Shader Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.85,
          overflow: 'hidden'
        }}>
          <Shader style={{ width: '100%', height: '100%' }}>
            <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
            <ChromaFlow
              baseColor="#ffffff"
              downColor="#ff5f03"
              leftColor="#ff5f03"
              rightColor="#ff5f03"
              upColor="#ff5f03"
              momentum={13}
              radius={3.5}
            />
            <FlutedGlass
              aberration={0.61}
              angle={31}
              frequency={8}
              highlight={0.12}
              highlightSoftness={0}
              lightAngle={-90}
              refraction={4}
              shape="rounded"
              softness={1}
              speed={0.15}
            />
            <FilmGrain strength={0.05} />
          </Shader>
        </div>

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#EFF6FF',
            color: 'var(--primary)',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '1rem',
            border: '1px solid #BFDBFE'
          }}>
            <Sparkles size={14} /> Quantum Contributions Portal
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.85rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1rem',
            letterSpacing: '-0.03em'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Quantum Contributions
            </span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}>
            Centralized institutional repository to explore quantum contributions across Faculty & Students.
            Explore completed courses, accredited industry certifications, research projects, publications, and competitive hackathons with full participant rosters and PDF dossiers.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('faculty')} style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
              <Users size={18} /> Faculty Contributions
              <ArrowRight size={16} />
            </button>

            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('student')} style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
              <GraduationCap size={18} /> Student Contributions
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Quantum Metric Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <Users size={18} style={{ color: 'var(--secondary)' }} />
            <span className="metric-pill secondary" style={{ fontSize: '0.7rem' }}>Faculty Core</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{facultyCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Faculty Mentors</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <GraduationCap size={18} style={{ color: 'var(--primary)' }} />
            <span className="metric-pill primary" style={{ fontSize: '0.7rem' }}>Students</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{studentCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantum Candidates</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <BookOpen size={18} style={{ color: 'var(--accent-teal)' }} />
            <span className="metric-pill success" style={{ fontSize: '0.7rem' }}>{totalCourses} Courses</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {totalFacultyCompletions + totalStudentCompletions}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Completions</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <Layers size={18} style={{ color: 'var(--primary)' }} />
            <span className="metric-pill primary" style={{ fontSize: '0.7rem' }}>Open Source</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalProjects}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Research Projects</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--secondary)' }} />
            <span className="metric-pill secondary" style={{ fontSize: '0.7rem' }}>Peer Reviewed</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalPapers}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Publications Indexed</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <Trophy size={18} style={{ color: '#D97706' }} />
            <span className="metric-pill amber" style={{ fontSize: '0.7rem' }}>Global</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalHackathons}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hackathon Challenges</div>
        </div>
      </div>

      {/* Interactive Circuit Simulation Widget */}
      <div style={{ marginBottom: '2rem' }}>
        <QuantumCircuitSimulator />
      </div>
    </div>
  );
};
