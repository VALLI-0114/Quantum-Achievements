import React, { useState, useEffect } from 'react';
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from 'shaders/react';
import { QuantumDBProvider, useQuantumDB } from './data/db';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewSection } from './components/overview/OverviewSection';
import { FacultySection } from './components/faculty/FacultySection';
import { StudentSection } from './components/students/StudentSection';
import { FacultyProjects } from './components/faculty/FacultyProjects';
import { FacultyPapers } from './components/faculty/FacultyPapers';
import { FacultyCertificates } from './components/faculty/FacultyCertificates';
import { StudentHackathons } from './components/students/StudentHackathons';
import { CertificateModal } from './components/common/CertificateModal';
import { ProfileModal } from './components/common/ProfileModal';
import { AddAchievementModal } from './components/common/AddAchievementModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

const MainContent = () => {
  const { attachDocumentToRecord } = useQuantumDB();

  const [activeView, setActiveView] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'home';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [certificateModal, setCertificateModal] = useState({ isOpen: false, data: null });
  const [profileModal, setProfileModal] = useState({ isOpen: false, personId: null, roleType: 'student' });
  const [addModal, setAddModal] = useState({ isOpen: false, category: 'courses', audience: 'faculty' });
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Hash synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveView(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view) => {
    setActiveView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCertificate = (certData) => {
    setCertificateModal({ isOpen: true, data: certData });
  };

  const handleOpenProfile = (personId, roleType = 'student') => {
    setProfileModal({ isOpen: true, personId, roleType });
  };

  const handleOpenAddModal = (category = 'courses', audience = 'faculty') => {
    setAddModal({ isOpen: true, category, audience });
  };

  return (
    <div className="app-container">
      {/* Global Animated Quantum Shader Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.55,
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

      {/* Subtle Quantum Dot Pattern */}
      <div className="quantum-bg-pattern"></div>

      {/* Sidebar Navigation (Faculty First, Student Second) */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="app-main">
        {/* Top Header */}
        <Header
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenAddModal={handleOpenAddModal}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />

        {/* View Router */}
        {activeView === 'home' && (
          <OverviewSection onNavigate={handleNavigate} />
        )}

        {activeView === 'faculty' && (
          <FacultySection
            onOpenCertificate={handleOpenCertificate}
            onOpenProfile={handleOpenProfile}
            onOpenAddModal={handleOpenAddModal}
          />
        )}

        {activeView === 'student' && (
          <StudentSection
            onOpenCertificate={handleOpenCertificate}
            onOpenProfile={handleOpenProfile}
            onOpenAddModal={handleOpenAddModal}
          />
        )}

        {activeView === 'projects' && (
          <div className="page-container">
            <div className="page-header">
              <div className="page-title-group">
                <h1>Quantum Projects & Engineering Repository</h1>
                <p>Innovative quantum algorithms and open-source applications built by faculty & student teams.</p>
              </div>
            </div>
            <FacultyProjects
              onOpenProfile={handleOpenProfile}
              onAddProject={() => handleOpenAddModal('projects', 'faculty')}
            />
          </div>
        )}

        {activeView === 'research' && (
          <div className="page-container">
            <div className="page-header">
              <div className="page-title-group">
                <h1>Quantum Research Publications</h1>
                <p>Peer-reviewed manuscripts, preprints, and manuscripts published by faculty & student researchers.</p>
              </div>
            </div>
            <FacultyPapers
              onOpenProfile={handleOpenProfile}
              onAddPaper={() => handleOpenAddModal('papers', 'faculty')}
            />
          </div>
        )}

        {activeView === 'certificates' && (
          <div className="page-container">
            <div className="page-header">
              <div className="page-title-group">
                <h1>Accredited Certificates Gallery</h1>
                <p>Industry-standard quantum credentials from IBM Quantum, MIT, CERN, and IEEE.</p>
              </div>
            </div>
            <FacultyCertificates
              onOpenCertificate={handleOpenCertificate}
              onOpenProfile={handleOpenProfile}
              onAddCertificate={() => handleOpenAddModal('certificates', 'faculty')}
            />
          </div>
        )}

        {activeView === 'hackathons' && (
          <div className="page-container">
            <div className="page-header">
              <div className="page-title-group">
                <h1>Quantum Hackathons & Competitions</h1>
                <p>Explore awards and team projects across MIT iQuHACK, IBM Quantum Challenges, and CERN Sprints.</p>
              </div>
            </div>
            <StudentHackathons
              onOpenProfile={handleOpenProfile}
              onAddHackathon={() => handleOpenAddModal('hackathons', 'students')}
            />
          </div>
        )}
      </main>

      {/* Global Modals */}
      <CertificateModal
        isOpen={certificateModal.isOpen}
        onClose={() => setCertificateModal({ isOpen: false, data: null })}
        certData={certificateModal.data}
        onAttachDocument={attachDocumentToRecord}
      />

      <ProfileModal
        isOpen={profileModal.isOpen}
        onClose={() => setProfileModal({ isOpen: false, personId: null, roleType: 'student' })}
        personId={profileModal.personId}
        roleType={profileModal.roleType}
        onOpenCertificate={handleOpenCertificate}
      />

      <AddAchievementModal
        isOpen={addModal.isOpen}
        onClose={() => setAddModal({ isOpen: false, category: 'courses', audience: 'faculty' })}
        targetCategory={addModal.category}
        targetAudience={addModal.audience}
      />

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectFaculty={(id) => handleOpenProfile(id, 'faculty')}
        onSelectStudent={(id) => handleOpenProfile(id, 'student')}
        onSelectCourse={() => handleNavigate('faculty')}
        onSelectCertificate={() => handleNavigate('certificates')}
        onSelectProject={() => handleNavigate('projects')}
        onSelectPaper={() => handleNavigate('research')}
        onSelectHackathon={() => handleNavigate('hackathons')}
      />
    </div>
  );
};

export function App() {
  return (
    <QuantumDBProvider>
      <MainContent />
    </QuantumDBProvider>
  );
}

export default App;
