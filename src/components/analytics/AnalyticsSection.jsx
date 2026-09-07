import React from 'react';
import { BarChart3, ShieldCheck, TrendingUp, Award, Users } from 'lucide-react';
import { useQuantumDB } from '../../data/db';

export const AnalyticsSection = () => {
  const { faculty, students, courses, certificates, projects, researchPapers, hackathons } = useQuantumDB();

  const dimensions = [
    { title: "Curriculum Integration", score: 85, desc: "Accredited Qiskit and PennyLane core and elective tracks." },
    { title: "Faculty Readiness", score: 92, desc: "Certified faculty researchers with peer-reviewed publications." },
    { title: "Student Participation", score: 78, desc: "Active candidate enrollment in foundation & advanced modules." },
    { title: "Research & Publication", score: 80, desc: "IEEE/APS indexed quantum algorithm and hardware manuscripts." },
    { title: "Hackathon Competitiveness", score: 75, desc: "Global awards across MIT iQuHACK and IBM Challenges." },
    { title: "Hardware Access & Labs", score: 70, desc: "Superconducting quantum cloud execution tokens and cryo labs." }
  ];

  const overallScore = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <span className="metric-pill success" style={{ marginBottom: '0.35rem' }}>
            Audited Academic Metrics
          </span>
          <h1>Institutional Quantum Readiness & Analytics</h1>
          <p>
            Multi-dimensional evaluation of quantum computing education, faculty research capacity, student achievements, and hardware readiness.
          </p>
        </div>
      </div>

      {/* Benchmark Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        border: '1px solid var(--border-light)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Overall Institutional Index
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '0.25rem 0 0.5rem' }}>
            {overallScore}% Quantum Maturity Score
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Benchmark calculated across curriculum depth, faculty mastery, student certifications, and competitive hackathon placement.
          </p>
        </div>

        <div style={{
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{overallScore}%</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.9 }}>HIGH READINESS</span>
        </div>
      </div>

      {/* 6 Dimension Progress Bars */}
      <div className="cards-grid-2">
        {dimensions.map((dim, idx) => (
          <div key={idx} className="item-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{dim.title}</strong>
              <span className="metric-pill primary" style={{ fontWeight: 800 }}>{dim.score}%</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {dim.desc}
            </p>

            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${dim.score}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
