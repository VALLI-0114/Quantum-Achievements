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
      {/* Hero Section with Looping Quantum Video Background */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-light)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Full-Bleed Video Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: '24px',
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          <video
            className="bg-video"
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
              zIndex: 0,
              opacity: 0.85
            }}
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
              type="video/mp4"
            />
          </video>
          {/* Glassmorphic overlay for pristine text readability */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.90) 0%, rgba(255, 255, 255, 0.76) 50%, rgba(253, 242, 244, 0.88) 100%)',
            backdropFilter: 'blur(2px)'
          }} />
        </div>

        <div style={{ maxWidth: '850px', position: 'relative', zIndex: 2 }}>
          {/* Trust Enterprise Row */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#28282a',
                border: '1px solid rgba(0,0,0,0.15)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-brands fa-microsoft" style={{ fontSize: '12px', color: '#111' }}></i>
                </div>
              </div>

              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#28282a',
                border: '1px solid rgba(0,0,0,0.15)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '-14px',
                zIndex: 2
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-brands fa-amazon" style={{ fontSize: '12px', color: '#111' }}></i>
                </div>
              </div>

              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#28282a',
                border: '1px solid rgba(0,0,0,0.15)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '-14px',
                zIndex: 3
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-brands fa-google" style={{ fontSize: '12px', color: '#111' }}></i>
                </div>
              </div>

              <div style={{
                height: 36,
                background: '#28282a',
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: '999px',
                marginLeft: '-14px',
                paddingLeft: '22px',
                paddingRight: '14px',
                display: 'flex',
                alignItems: 'center',
                color: '#c4c2c3',
                fontSize: '0.82rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-xs)'
              }}>
                Trusted by 2000+ Quantum Researchers & Labs
              </div>
            </div>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.9rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '0.75rem',
            letterSpacing: '-0.03em'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #722F37 0%, #9E2A2B 50%, #581C26 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block'
            }}>
              Intelligence Designed To Evolve
            </span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
            maxWidth: '740px'
          }}>
            Centralized institutional repository to explore quantum contributions across Faculty & Students.
            Explore completed courses, accredited industry certifications, research projects, publications, and competitive hackathons with full participant rosters and PDF dossiers.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate('faculty')}
              style={{
                padding: '0.75rem 1.6rem',
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(114, 47, 55, 0.25)'
              }}
            >
              <Users size={18} /> Faculty Contributions
              <ArrowRight size={16} />
            </button>

            <button
              className="btn btn-outline btn-lg"
              onClick={() => onNavigate('student')}
              style={{
                padding: '0.75rem 1.6rem',
                fontSize: '0.95rem',
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                background: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)'
              }}
            >
              <GraduationCap size={18} /> Student Contributions
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Performance & Runtime Highlights */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: '"BubbledotICG-FinePos", monospace', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 700 }}>&lt;</span>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>120 ms</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Inference Time</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: '"BubbledotICG-FinePos", monospace', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 700 }}>%</span>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>99.99%</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Platform Uptime</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: '"BubbledotICG-FinePos", monospace', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 700 }}>*</span>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>24/7</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Autonomous Runtime</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: '"BubbledotICG-FinePos", monospace', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 700 }}>#</span>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>2.4 M</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Context Windows</div>
              </div>
            </div>
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
            <Users size={18} style={{ color: 'var(--primary)' }} />
            <span className="metric-pill primary" style={{ fontSize: '0.7rem' }}>Faculty Core</span>
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
            <BookOpen size={18} style={{ color: 'var(--primary)' }} />
            <span className="metric-pill primary" style={{ fontSize: '0.7rem' }}>{totalCourses} Courses</span>
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
            <FileText size={18} style={{ color: 'var(--primary)' }} />
            <span className="metric-pill primary" style={{ fontSize: '0.7rem' }}>Peer Reviewed</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalPapers}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Publications Indexed</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <Trophy size={18} style={{ color: 'var(--primary)' }} />
            <span className="metric-pill primary" style={{ fontSize: '0.7rem' }}>Global</span>
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
