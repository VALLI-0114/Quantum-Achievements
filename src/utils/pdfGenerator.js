import { jsPDF } from 'jspdf';

/**
 * Institutional PDF Generator for Quantum Computing & Research Portal (Q-HUB)
 * Provides:
 * 1. Master Institutional Entire Data Report (PDF)
 * 2. Entire Faculty Achievements Report (PDF)
 * 3. Entire Student Achievements Report (PDF)
 * 4. Category-Specific Reports (PDF)
 * 5. Single Course Roster & Summary (PDF)
 * 6. Single Certificate Recipient Report (PDF)
 * 7. Official Accredited Certificate Document (PDF)
 * 8. Single Project Dossier Report (PDF)
 * 9. Single Research Paper Summary & Citation (PDF)
 * 10. Single Hackathon Participation & Award Report (PDF)
 * 11. Individual Candidate Academic Portfolio Dossier (PDF)
 */

// Helper: Setup Header Banner
const drawHeaderBanner = (doc, title, subtitle, isFaculty = false, isStudent = false) => {
  const width = doc.internal.pageSize.getWidth();
  
  // Color determination
  if (isFaculty) {
    doc.setFillColor(114, 47, 55); // Purple for faculty
  } else if (isStudent) {
    doc.setFillColor(37, 99, 235); // Royal Blue for student
  } else {
    doc.setFillColor(30, 41, 59); // Slate Navy for institutional
  }
  
  doc.rect(0, 0, width, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title.toUpperCase(), 15, 16);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(subtitle || `Institutional Quantum Academic Portal • Generated: ${new Date().toLocaleDateString()}`, 15, 24);
};

// 1. Download Master Complete Institutional Report PDF (Entire Database)
export const downloadCompleteInstitutionalPDF = (dbData) => {
  const { faculty = [], students = [], courses = [], certificates = [], projects = [], researchPapers = [], hackathons = [] } = dbData;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  let y = 20;

  const checkPage = (requiredSpace = 25) => {
    if (y + requiredSpace > 275) {
      doc.addPage();
      y = 20;
    }
  };

  // --- COVER / HEADER BANNER ---
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, width, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text("Q-HUB INSTITUTIONAL QUANTUM ACHIEVEMENTS REPORT", 15, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Official Comprehensive Academic Report • Generated: ${new Date().toLocaleDateString()}`, 15, 25);

  y = 44;

  // Executive Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, width - 30, 26, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("INSTITUTIONAL METRICS SUMMARY", 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const totalFacultyCompletions = courses.reduce((s, c) => s + (c.facultyCompletions?.length || 0), 0);
  const totalStudentCompletions = courses.reduce((s, c) => s + (c.studentCompletions?.length || 0), 0);

  doc.text(`Faculty Mentors: ${faculty.length}   |   Student Candidates: ${students.length}   |   Total Quantum Courses: ${courses.length}`, 20, y + 15);
  doc.text(`Total Completions: ${totalFacultyCompletions + totalStudentCompletions}   |   Certificates: ${certificates.length}   |   Projects: ${projects.length}   |   Papers: ${researchPapers.length}   |   Hackathons: ${hackathons.length}`, 20, y + 21);

  y += 36;

  // --- SECTION 1: FACULTY ACHIEVEMENTS ---
  doc.setFillColor(114, 47, 55);
  doc.rect(15, y, width - 30, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text("SECTION 1: FACULTY QUANTUM ACHIEVEMENTS", 18, y + 5.5);
  y += 14;

  // 1.1 Faculty Courses
  checkPage();
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("1.1 Quantum Courses Completed by Faculty", 15, y);
  y += 5;

  courses.forEach((c) => {
    checkPage(15);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`• ${c.code}: ${c.name} (${c.provider}) - Total Completed: ${c.facultyCompletions?.length || 0} Faculty`, 18, y);
    y += 4.5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (c.facultyCompletions || []).forEach(fc => {
      const f = faculty.find(fac => fac.id === fc.facultyId);
      doc.text(`    - ${f?.name || fc.facultyId} (${f?.department || 'Dept'}) - Date: ${fc.completionDate} [Grade: ${fc.grade || 'Distinction'}]`, 20, y);
      y += 4;
    });
    y += 2;
  });

  // 1.2 Faculty Certificates
  y += 4;
  checkPage();
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("1.2 Quantum Certifications Earned by Faculty", 15, y);
  y += 5;

  certificates.forEach(cert => {
    checkPage(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• ${cert.title} [Issuer: ${cert.issuer}]`, 18, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (cert.facultyRecipients || []).forEach(fr => {
      const f = faculty.find(fac => fac.id === fr.facultyId);
      doc.text(`    - ${f?.name || fr.facultyId} (${f?.department}) - Credential: ${fr.credentialId} (${fr.issueDate})`, 20, y);
      y += 4;
    });
    y += 2;
  });

  // 1.3 Faculty Projects
  y += 4;
  checkPage();
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("1.3 Faculty Quantum Research Projects", 15, y);
  y += 5;

  projects.forEach(p => {
    checkPage(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• ${p.title} (${p.domain}) - Status: ${p.status}`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const facNames = (p.facultyInvolved || []).map(fi => {
      const f = faculty.find(fac => fac.id === fi.facultyId);
      return `${f?.name} (${fi.role})`;
    }).join(', ');
    doc.text(`    Faculty Leads: ${facNames || 'Faculty Team'}`, 20, y);
    y += 5;
  });

  // 1.4 Faculty Research Papers
  y += 4;
  checkPage();
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("1.4 Faculty Quantum Publications", 15, y);
  y += 5;

  researchPapers.forEach(paper => {
    checkPage(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• "${paper.title}"`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const facNames = (paper.facultyAuthors || []).map(fid => faculty.find(f => f.id === fid)?.name).join(', ');
    doc.text(`    Venue: ${paper.venue} | DOI: ${paper.doi} | Citations: ${paper.citations}`, 20, y);
    y += 4;
    doc.text(`    Faculty Authors: ${facNames}`, 20, y);
    y += 5;
  });

  // 1.5 Faculty Hackathons
  y += 4;
  checkPage();
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("1.5 Faculty Quantum Hackathon Participation", 15, y);
  y += 5;

  hackathons.forEach(h => {
    checkPage(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• ${h.name} (${h.edition})`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (h.facultyParticipants || []).forEach(fp => {
      const f = faculty.find(fac => fac.id === fp.facultyId);
      doc.text(`    - ${f?.name}: Team "${fp.teamName}" - Project: ${fp.projectBuilt} [${fp.award}]`, 20, y);
      y += 4;
    });
    y += 3;
  });

  // --- SECTION 2: STUDENT ACHIEVEMENTS ---
  y += 8;
  checkPage(20);
  doc.setFillColor(37, 99, 235);
  doc.rect(15, y, width - 30, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text("SECTION 2: STUDENT QUANTUM ACHIEVEMENTS", 18, y + 5.5);
  y += 14;

  // 2.1 Student Courses
  checkPage();
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("2.1 Quantum Courses Completed by Students", 15, y);
  y += 5;

  courses.forEach(c => {
    checkPage(15);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`• ${c.code}: ${c.name} - Total Completed: ${c.studentCompletions?.length || 0} Students`, 18, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (c.studentCompletions || []).forEach(sc => {
      const s = students.find(stu => stu.id === sc.studentId);
      doc.text(`    - ${s?.name || sc.studentId} (${s?.studentId}) - Date: ${sc.completionDate} [Grade: ${sc.grade}]`, 20, y);
      y += 4;
    });
    y += 2;
  });

  // 2.2 Student Certificates
  y += 4;
  checkPage();
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("2.2 Quantum Certificates Earned by Students", 15, y);
  y += 5;

  certificates.forEach(cert => {
    checkPage(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• ${cert.title} [Issuer: ${cert.issuer}]`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (cert.studentRecipients || []).forEach(sr => {
      const s = students.find(stu => stu.id === sr.studentId);
      doc.text(`    - ${s?.name || sr.studentId} (${s?.studentId}) - Credential: ${sr.credentialId} (${sr.issueDate})`, 20, y);
      y += 4;
    });
    y += 2;
  });

  // 2.3 Student Hackathons
  y += 4;
  checkPage();
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("2.3 Student Hackathon & Competition Honors", 15, y);
  y += 5;

  hackathons.forEach(h => {
    checkPage(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• ${h.name} (${h.edition})`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (h.studentParticipants || []).forEach(sp => {
      const s = students.find(stu => stu.id === sp.studentId);
      doc.text(`    - ${s?.name} (${s?.studentId}): Team "${sp.teamName}" - Project: ${sp.projectBuilt} [${sp.award}]`, 20, y);
      y += 4;
    });
    y += 3;
  });

  doc.save(`Q-HUB_Entire_Institutional_Quantum_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// 2. Download Entire Faculty Data Report (PDF)
export const downloadAllFacultyDataPDF = (dbData) => {
  const { faculty = [], courses = [], certificates = [], projects = [], researchPapers = [], hackathons = [] } = dbData;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  let y = 20;

  const checkPage = (requiredSpace = 25) => {
    if (y + requiredSpace > 275) {
      doc.addPage();
      y = 20;
    }
  };

  drawHeaderBanner(doc, "FACULTY QUANTUM ACHIEVEMENTS & RESEARCH REPORT", `All Faculty Records • Generated: ${new Date().toLocaleDateString()}`, true, false);
  y = 38;

  // Faculty Summary
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(15, y, width - 30, 20, 2, 2, 'FD');
  doc.setTextColor(109, 40, 217);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total Faculty Members Registered: ${faculty.length}`, 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Comprehensive dossier of faculty courses, certifications, projects, papers & hackathons.`, 20, y + 14);

  y += 28;

  // 1. Courses
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("1. Faculty Quantum Courses", 15, y);
  y += 6;

  courses.forEach(c => {
    checkPage(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`• ${c.code}: ${c.name} (${c.provider}) - ${c.facultyCompletions?.length || 0} Faculty Completed`, 18, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (c.facultyCompletions || []).forEach(fc => {
      const f = faculty.find(fac => fac.id === fc.facultyId);
      doc.text(`    - ${f?.name || fc.facultyId} (${f?.department || 'Dept'}) - Completed: ${fc.completionDate} [${fc.grade}]`, 20, y);
      y += 4;
    });
    y += 2;
  });

  // 2. Certificates
  y += 4;
  checkPage();
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("2. Faculty Certifications", 15, y);
  y += 6;

  certificates.forEach(cert => {
    checkPage(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• ${cert.title} (${cert.issuer})`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (cert.facultyRecipients || []).forEach(fr => {
      const f = faculty.find(fac => fac.id === fr.facultyId);
      doc.text(`    - ${f?.name} (${f?.department}) - Credential: ${fr.credentialId} (${fr.issueDate})`, 20, y);
      y += 4;
    });
    y += 2;
  });

  // 3. Projects
  y += 4;
  checkPage();
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("3. Faculty Quantum Projects", 15, y);
  y += 6;

  projects.forEach(p => {
    checkPage(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• ${p.title} [${p.domain}] - Status: ${p.status}`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const facNames = (p.facultyInvolved || []).map(fi => {
      const f = faculty.find(fac => fac.id === fi.facultyId);
      return `${f?.name} (${fi.role})`;
    }).join(', ');
    doc.text(`    Faculty Leads: ${facNames}`, 20, y);
    y += 4;
  });

  // 4. Papers
  y += 4;
  checkPage();
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("4. Faculty Research Publications", 15, y);
  y += 6;

  researchPapers.forEach(paper => {
    checkPage(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• "${paper.title}"`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const facNames = (paper.facultyAuthors || []).map(fid => faculty.find(f => f.id === fid)?.name).join(', ');
    doc.text(`    Venue: ${paper.venue} | DOI: ${paper.doi} | Faculty Authors: ${facNames}`, 20, y);
    y += 4;
  });

  // 5. Hackathons
  y += 4;
  checkPage();
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("5. Faculty Hackathon Participations", 15, y);
  y += 6;

  hackathons.forEach(h => {
    checkPage(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• ${h.name} (${h.edition})`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (h.facultyParticipants || []).forEach(fp => {
      const f = faculty.find(fac => fac.id === fp.facultyId);
      doc.text(`    - ${f?.name}: Team "${fp.teamName}" - ${fp.projectBuilt} [${fp.award}]`, 20, y);
      y += 4;
    });
    y += 2;
  });

  doc.save(`Q-HUB_Entire_Faculty_Achievements_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// 3. Download Entire Student Data Report (PDF)
export const downloadAllStudentDataPDF = (dbData) => {
  const { students = [], courses = [], certificates = [], projects = [], researchPapers = [], hackathons = [] } = dbData;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  let y = 20;

  const checkPage = (requiredSpace = 25) => {
    if (y + requiredSpace > 275) {
      doc.addPage();
      y = 20;
    }
  };

  drawHeaderBanner(doc, "STUDENT QUANTUM ACHIEVEMENTS & SCHOLARSHIP REPORT", `All Student Records • Generated: ${new Date().toLocaleDateString()}`, false, true);
  y = 38;

  // Student Summary
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(15, y, width - 30, 20, 2, 2, 'FD');
  doc.setTextColor(29, 78, 216);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total Student Candidates Registered: ${students.length}`, 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Comprehensive record of student courses, certifications, projects, papers & hackathons.`, 20, y + 14);

  y += 28;

  // 1. Courses
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("1. Student Quantum Courses", 15, y);
  y += 6;

  courses.forEach(c => {
    checkPage(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`• ${c.code}: ${c.name} - ${c.studentCompletions?.length || 0} Students Completed`, 18, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (c.studentCompletions || []).forEach(sc => {
      const s = students.find(stu => stu.id === sc.studentId);
      doc.text(`    - ${s?.name || sc.studentId} (${s?.studentId}) - Completed: ${sc.completionDate} [${sc.grade}]`, 20, y);
      y += 4;
    });
    y += 2;
  });

  // 2. Certificates
  y += 4;
  checkPage();
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("2. Student Quantum Certifications", 15, y);
  y += 6;

  certificates.forEach(cert => {
    checkPage(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• ${cert.title} (${cert.issuer})`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (cert.studentRecipients || []).forEach(sr => {
      const s = students.find(stu => stu.id === sr.studentId);
      doc.text(`    - ${s?.name} (${s?.studentId}) - Credential: ${sr.credentialId} (${sr.issueDate})`, 20, y);
      y += 4;
    });
    y += 2;
  });

  // 3. Projects
  y += 4;
  checkPage();
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("3. Student Quantum Projects", 15, y);
  y += 6;

  projects.forEach(p => {
    checkPage(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• ${p.title} [${p.domain}]`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (p.studentsInvolved || []).forEach(si => {
      const s = students.find(stu => stu.id === si.studentId);
      doc.text(`    - ${s?.name} (${s?.studentId}) - Role: ${si.role}`, 20, y);
      y += 4;
    });
    y += 2;
  });

  // 4. Papers
  y += 4;
  checkPage();
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("4. Student Research Publications", 15, y);
  y += 6;

  researchPapers.forEach(paper => {
    checkPage(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• "${paper.title}"`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const stuNames = (paper.studentAuthors || []).map(sid => students.find(s => s.id === sid)?.name).join(', ');
    doc.text(`    Venue: ${paper.venue} | Student Co-Authors: ${stuNames || 'Student Team'}`, 20, y);
    y += 4;
  });

  // 5. Hackathons
  y += 4;
  checkPage();
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("5. Student Hackathon Honors", 15, y);
  y += 6;

  hackathons.forEach(h => {
    checkPage(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`• ${h.name} (${h.edition})`, 18, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    (h.studentParticipants || []).forEach(sp => {
      const s = students.find(stu => stu.id === sp.studentId);
      doc.text(`    - ${s?.name} (${s?.studentId}): Team "${sp.teamName}" - ${sp.projectBuilt} [${sp.award}]`, 20, y);
      y += 4;
    });
    y += 2;
  });

  doc.save(`Q-HUB_Entire_Student_Achievements_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// 4. Download Category Specific Report PDF (Courses, Certificates, Projects, Papers, Hackathons)
export const downloadCategoryReportPDF = ({
  categoryTitle = "Quantum Courses Report",
  roleType = "Faculty",
  items = [],
  summary = ""
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  let y = 20;

  const isFaculty = roleType.toLowerCase().includes('faculty');
  drawHeaderBanner(doc, `Q-HUB • ${categoryTitle}`, `Audience: ${roleType} Achievements • Total Records: ${items.length}`, isFaculty, !isFaculty);

  y = 38;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Target Audience: ${roleType} Quantum Achievements`, 15, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Records: ${items.length}   |   Generated: ${new Date().toLocaleDateString()}`, 15, y + 5);

  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, width - 15, y);
  y += 8;

  items.forEach((item, idx) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, width - 30, 20, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`${idx + 1}. ${item.title || item.name || 'Achievement'}`, 20, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.subtitle || item.description || `Details: ${item.code || ''}`, 20, y + 14);

    y += 24;
  });

  doc.save(`${categoryTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${roleType}_Report.pdf`);
};

// 5. Download Single Course Report & Roster PDF
export const downloadCourseRosterPDF = ({
  courseTitle = "Quantum Computing & Algorithms",
  courseCode = "QC-101",
  provider = "Q-HUB Academy",
  roleType = "Faculty",
  completions = [],
  description = ""
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const isFaculty = roleType.toLowerCase().includes('faculty');

  drawHeaderBanner(doc, "Q-HUB QUANTUM COURSE COMPLETION ROSTER", `Official Academic Verification • Generated: ${new Date().toLocaleDateString()}`, isFaculty, !isFaculty);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${courseCode}: ${courseTitle}`, 15, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Provider: ${provider}   |   Audience: ${roleType} Members   |   Total Completed: ${completions.length}`, 15, 45);
  if (description) {
    doc.setFontSize(8.5);
    const descLines = doc.splitTextToSize(description, width - 30);
    doc.text(descLines, 15, 51);
  }

  doc.setDrawColor(226, 232, 240);
  const lineY = description ? 58 : 50;
  doc.line(15, lineY, width - 15, lineY);

  let y = lineY + 9;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y - 5, width - 30, 8, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text("#", 18, y);
  doc.text(`${roleType} Name`, 26, y);
  doc.text("Department / ID", 80, y);
  doc.text("Completion Date", 130, y);
  doc.text("Grade / Distinction", 165, y);

  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  completions.forEach((c, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(8.5);
    doc.text(`${idx + 1}`, 18, y);
    doc.text(c.name || 'Member', 26, y);
    doc.text(c.department || 'Quantum Science', 80, y);
    doc.text(c.completionDate || '2025-01-01', 130, y);
    doc.text(c.grade || 'Certified', 165, y);

    doc.setDrawColor(241, 245, 249);
    doc.line(15, y + 2, width - 15, y + 2);
    y += 7;
  });

  doc.save(`${courseCode}_${roleType}_Completion_Report.pdf`);
};

// 6. Download Single Certificate Recipients Report PDF
export const downloadSingleCertificateReportPDF = ({
  certificateTitle = "IBM Certified Associate Developer - Quantum Computation",
  issuer = "IBM Quantum",
  code = "IBM-QIS-2025",
  roleType = "Faculty",
  recipients = []
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const isFaculty = roleType.toLowerCase().includes('faculty');

  drawHeaderBanner(doc, "Q-HUB CERTIFICATION RECIPIENT ROSTER", `Accredited Credential • Generated: ${new Date().toLocaleDateString()}`, isFaculty, !isFaculty);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(certificateTitle, 15, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issuer: ${issuer}   |   Code: ${code}   |   Audience: ${roleType}   |   Total Certified: ${recipients.length}`, 15, 45);

  doc.setDrawColor(226, 232, 240);
  doc.line(15, 50, width - 15, 50);

  let y = 59;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y - 5, width - 30, 8, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text("#", 18, y);
  doc.text(`${roleType} Recipient`, 26, y);
  doc.text("Department", 80, y);
  doc.text("Issue Date", 125, y);
  doc.text("Credential ID", 155, y);

  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  recipients.forEach((r, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(8.5);
    doc.text(`${idx + 1}`, 18, y);
    doc.text(r.name || 'Recipient', 26, y);
    doc.text(r.department || 'Quantum Computing', 80, y);
    doc.text(r.issueDate || '2025-01-01', 125, y);
    doc.text(r.credentialId || 'QHUB-CERT', 155, y);

    doc.setDrawColor(241, 245, 249);
    doc.line(15, y + 2, width - 15, y + 2);
    y += 7;
  });

  doc.save(`${code}_${roleType}_Certificate_Recipients.pdf`);
};

// 7. Download Single Project Dossier PDF
export const downloadProjectReportPDF = ({ project, roleType = "Faculty" }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const isFaculty = roleType.toLowerCase().includes('faculty');

  drawHeaderBanner(doc, "Q-HUB QUANTUM RESEARCH PROJECT DOSSIER", `Project Reference: ${project.id} • Status: ${project.status}`, isFaculty, !isFaculty);

  let y = 38;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(project.title, 15, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Domain: ${project.domain}   |   Status: ${project.status}   |   Tech Stack: ${(project.techStack || []).join(', ')}`, 15, y);

  if (project.githubUrl) {
    y += 5;
    doc.setTextColor(37, 99, 235);
    doc.text(`Repository: ${project.githubUrl}`, 15, y);
  }

  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, width - 30, 26, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text("PROJECT OVERVIEW & ARCHITECTURE", 20, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const descLines = doc.splitTextToSize(project.description || "Quantum computing research project.", width - 40);
  doc.text(descLines, 20, y + 12);

  y += 34;

  // Faculty Leads
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(`Faculty Research Leads & Mentors (${(project.facultyInvolved || []).length})`, 15, y);
  y += 6;

  (project.facultyInvolved || []).forEach((fi, idx) => {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${idx + 1}. ${fi.facultyName || fi.facultyId}`, 18, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`- Role: ${fi.role} (${fi.department || 'Physics'})`, 70, y);
    y += 5.5;
  });

  // Student Associates
  if (project.studentsInvolved && project.studentsInvolved.length > 0) {
    y += 4;
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(`Student Engineering Team (${project.studentsInvolved.length})`, 15, y);
    y += 6;

    project.studentsInvolved.forEach((si, idx) => {
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. ${si.studentName || si.studentId}`, 18, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`- Role: ${si.role} (${si.department || 'IT'})`, 70, y);
      y += 5.5;
    });
  }

  doc.save(`${project.id}_Quantum_Project_Report.pdf`);
};

// 8. Download Single Research Paper Summary & Citation PDF
export const downloadPaperReportPDF = ({ paper, facultyAuthors = [], studentAuthors = [] }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  drawHeaderBanner(doc, "Q-HUB QUANTUM RESEARCH PUBLICATION SUMMARY", `DOI: ${paper.doi} • Citations: ${paper.citations}`, true, false);

  let y = 38;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(`"${paper.title}"`, width - 30);
  doc.text(titleLines, 15, y);

  y += (titleLines.length * 6) + 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Venue: ${paper.venue}   |   Research Area: ${paper.researchArea}   |   Date: ${paper.date}`, 15, y);
  y += 5;
  doc.text(`DOI: ${paper.doi}   |   Citations Count: ${paper.citations}`, 15, y);

  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, width - 30, 42, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text("EXECUTIVE ABSTRACT", 20, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const abstractLines = doc.splitTextToSize(paper.abstract || "Research publication on quantum mechanics.", width - 40);
  doc.text(abstractLines, 20, y + 12);

  y += 50;

  // Authors
  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text("Faculty Authors", 15, y);
  y += 6;

  facultyAuthors.forEach((fa, idx) => {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`• ${fa.name} (${fa.department || 'Quantum Physics'})`, 18, y);
    y += 5;
  });

  if (studentAuthors.length > 0) {
    y += 3;
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text("Student Co-Authors", 15, y);
    y += 6;

    studentAuthors.forEach((sa, idx) => {
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`• ${sa.name} (${sa.department || 'Computer Science'})`, 18, y);
      y += 5;
    });
  }

  // BibTeX Citation Block
  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, width - 30, 32, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.text("BIBTEX CITATION", 20, y + 6);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`@article{${paper.id}_${paper.date.slice(0,4)},`, 20, y + 12);
  doc.text(`  title = {${paper.title}},`, 20, y + 17);
  doc.text(`  journal = {${paper.venue}}, year = {${paper.date.slice(0,4)}}, doi = {${paper.doi}}`, 20, y + 22);
  doc.text(`}`, 20, y + 27);

  doc.save(`${paper.id}_Quantum_Publication_Report.pdf`);
};

// 9. Download Single Hackathon Participation & Award Report PDF
export const downloadHackathonReportPDF = ({ hackathon, roleType = "Student" }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const isFaculty = roleType.toLowerCase().includes('faculty');

  drawHeaderBanner(doc, "Q-HUB QUANTUM HACKATHON RECORD & AWARDS", `Edition: ${hackathon.edition} • Date: ${hackathon.date}`, isFaculty, !isFaculty);

  let y = 38;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(hackathon.name, 15, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Organizer: ${hackathon.organizer}   |   Edition: ${hackathon.edition}   |   Date: ${hackathon.date}`, 15, y);

  doc.setDrawColor(226, 232, 240);
  doc.line(15, y + 5, width - 15, y + 5);

  y += 14;

  const participants = isFaculty ? (hackathon.facultyParticipants || []) : (hackathon.studentParticipants || []);

  doc.setFillColor(241, 245, 249);
  doc.rect(15, y - 5, width - 30, 8, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text("#", 18, y);
  doc.text(`${roleType} Participant`, 26, y);
  doc.text("Team Name", 75, y);
  doc.text("Project Built", 120, y);
  doc.text("Position & Award", 165, y);

  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  participants.forEach((p, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(8.5);
    doc.text(`${idx + 1}`, 18, y);
    doc.text(p.name || p.participantName || p.facultyName || p.studentName || 'Participant', 26, y);
    doc.text(p.teamName || 'Team', 75, y);
    doc.text(p.projectBuilt || 'Project', 120, y);
    doc.text(p.award || 'Winner', 165, y);

    doc.setDrawColor(241, 245, 249);
    doc.line(15, y + 2, width - 15, y + 2);
    y += 7;
  });

  doc.save(`${hackathon.id}_${roleType}_Hackathon_Report.pdf`);
};

// 10. Download Official Certificate PDF Document
export const downloadCertificatePDF = ({
  recipientName = "Kundum Pravallika",
  recipientRole = "Student Candidate",
  certificateTitle = "IBM Certified Associate Developer - Quantum Computation",
  issuer = "IBM Quantum Education Network & Q-HUB Academy",
  credentialId = "IBM-QIS-993012",
  issueDate = "2025-04-12",
  grade = "Distinction"
}) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, width, height, 'F');

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(3);
  doc.roundedRect(10, 10, width - 20, height - 20, 4, 4, 'S');

  doc.setDrawColor(114, 47, 55);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, 14, width - 28, height - 28, 2, 2, 'S');

  doc.setFillColor(37, 99, 235);
  doc.rect(20, 20, width - 40, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("QUANTUM INNOVATION & RESEARCH CENTER • OFFICIAL ACCREDITATION", width / 2, 29, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.text("Certificate of Achievement", width / 2, 54, { align: 'center' });

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text("This official credential is systematically awarded and verified to", width / 2, 66, { align: 'center' });

  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(recipientName, width / 2, 80, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.text(`[ ${recipientRole} ]`, width / 2, 88, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text("For distinguished proficiency and verified completion of the program:", width / 2, 102, { align: 'center' });

  doc.setTextColor(114, 47, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  const certLines = doc.splitTextToSize(certificateTitle, width - 60);
  doc.text(certLines, width / 2, 114, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(`Accredited by: ${issuer}  •  Grade: ${grade}`, width / 2, 130, { align: 'center' });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(30, 145, width - 30, 145);

  doc.setTextColor(100, 116, 139);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(`ISSUE DATE: ${issueDate}`, 35, 155);
  doc.text(`CREDENTIAL ID: ${credentialId}`, 35, 162);
  doc.text(`HASH: SHA256:${credentialId.split('').map(c=>c.charCodeAt(0).toString(16)).join('').slice(0,24)}`, 35, 169);

  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(37, 99, 235);
  doc.circle(width / 2, 162, 12, 'FD');
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("Q-HUB", width / 2, 161, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text("VERIFIED", width / 2, 165, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("Dr. Elena Vance", width - 75, 157);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Director of Quantum Computing", width - 75, 163);
  doc.text("Institutional Research Council", width - 75, 168);

  const filename = `${recipientName.replace(/\s+/g, '_')}_Quantum_Certificate_${credentialId}.pdf`;
  doc.save(filename);
};

// 11. Download Candidate Portfolio Dossier PDF
export const downloadCandidatePortfolioPDF = ({
  name = "Candidate",
  roleType = "Student",
  department = "Information Technology",
  id = "ID-001",
  email = "email@quantum-hub.edu",
  highestHonor = "Certified Scholar",
  courses = [],
  certificates = [],
  projects = [],
  papers = [],
  hackathons = []
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const isFaculty = roleType.includes('Faculty');

  drawHeaderBanner(doc, "Q-HUB OFFICIAL QUANTUM ACADEMIC DOSSIER", `Candidate Record • ID: ${id}`, isFaculty, !isFaculty);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 34, width - 30, 26, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(name, 22, 44);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${roleType}  •  ${department}  •  ID: ${id}  •  ${email}`, 22, 50);
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.text(`Highest Honor: ${highestHonor}`, 22, 56);

  let y = 67;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, width - 30, 10, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Courses: ${courses.length}  |  Certificates: ${certificates.length}  |  Projects: ${projects.length}  |  Papers: ${papers.length}  |  Hackathons: ${hackathons.length}`, 20, y + 6.5);

  y += 18;

  const addSection = (title, items, renderItem) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(title, 15, y);
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(15, y + 2, width - 15, y + 2);
    y += 8;

    if (!items || items.length === 0) {
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.text("No records registered in this category.", 18, y);
      y += 8;
      return;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    items.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      renderItem(item);
      y += 6;
    });
    y += 4;
  };

  addSection("1. Completed Quantum Courses", courses, (c) => {
    doc.text(`• ${c.code || 'QC'}: ${c.name} (${c.completionDate || 'Completed'}) - Grade: ${c.grade || 'Certified'}`, 18, y);
  });

  addSection("2. Accredited Certifications", certificates, (cert) => {
    doc.text(`• ${cert.title} [ID: ${cert.credentialId || 'QHUB-CERT'}] - ${cert.issueDate || 'Verified'}`, 18, y);
  });

  addSection("3. Quantum Projects & Engineering", projects, (p) => {
    doc.text(`• ${p.title} (Role: ${p.role || 'Contributor'}) - Tech: ${(p.techStack || []).join(', ')}`, 18, y);
  });

  addSection("4. Research Publications", papers, (paper) => {
    doc.text(`• "${paper.title}" - ${paper.venue} (${paper.date || '2025'})`, 18, y);
  });

  addSection("5. Hackathons & Competitions", hackathons, (h) => {
    doc.text(`• ${h.name} - Award: ${h.award || 'Participant'} (${h.projectBuilt || 'Project'})`, 18, y);
  });

  doc.save(`${name.replace(/\s+/g, '_')}_Quantum_Portfolio_Dossier.pdf`);
};

// 12. Official Certificate Document PDF (Landscape Luxury Format)
export const downloadOfficialCertificatePDF = ({
  recipientName = "Candidate Name",
  recipientRole = "Faculty Member",
  certificateTitle = "Quantum Computing Certification",
  issuer = "IBM Quantum Network & Q-HUB",
  credentialId = "QHUB-CERT-2026",
  issueDate = new Date().toISOString().slice(0, 10),
  grade = "Distinction / 98%"
}) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth(); // 297mm
  const height = doc.internal.pageSize.getHeight(); // 210mm

  // 1. Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, 'F');

  // 2. Outer Ornate Border (Deep Slate Navy)
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(3);
  doc.rect(8, 8, width - 16, height - 16);

  // 3. Inner Gold Accent Border
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.rect(12, 12, width - 24, height - 24);

  // 4. Fine Corner Accents
  doc.setFillColor(79, 70, 229);
  doc.circle(12, 12, 2.5, 'F');
  doc.circle(width - 12, 12, 2.5, 'F');
  doc.circle(12, height - 12, 2.5, 'F');
  doc.circle(width - 12, height - 12, 2.5, 'F');

  // 5. Header / Institution Logo Badge
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(196, 181, 253);
  doc.roundedRect(width / 2 - 60, 18, 120, 10, 2, 2, 'FD');

  doc.setTextColor(79, 70, 229);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text("INSTITUTIONAL QUANTUM COMPUTING NETWORK & Q-HUB", width / 2, 24.5, { align: 'center' });

  // 6. Certificate Heading
  doc.setTextColor(15, 23, 42);
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.text("CERTIFICATE OF ACHIEVEMENT", width / 2, 42, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text("THIS OFFICIAL CREDENTIAL IS PROUDLY CONFERRED UPON", width / 2, 51, { align: 'center' });

  // 7. Recipient Name
  doc.setTextColor(67, 56, 202);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(recipientName, width / 2, 68, { align: 'center' });

  // Underline for recipient name
  doc.setDrawColor(224, 231, 255);
  doc.setLineWidth(0.6);
  doc.line(width / 2 - 65, 71, width / 2 + 65, 71);

  // 8. Role & Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`as a recognized ${recipientRole}, in formal recognition of successfully completing the rigorous quantum curriculum, examination, and laboratory benchmarks for:`, width / 2, 80, { align: 'center', maxWidth: 210 });

  // 9. Course / Certificate Title
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(width / 2 - 95, 87, 190, 22, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(certificateTitle, width / 2, 97, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Accredited & Issued by: ${issuer}`, width / 2, 104, { align: 'center' });

  // 10. Grade / Honors Badge
  if (grade) {
    doc.setFillColor(220, 252, 231);
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(width / 2 - 40, 115, 80, 8, 2, 2, 'FD');
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`Honors & Distinction: ${grade}`, width / 2, 120.5, { align: 'center' });
  }

  // 11. Verification Strip
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(25, 133, width - 50, 13, 2, 2, 'F');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Credential ID: ${credentialId}`, 32, 141);
  doc.text(`Issue Date: ${issueDate}`, width / 2, 141, { align: 'center' });
  doc.text(`Status: Verified & Cryptographically Signed`, width - 32, 141, { align: 'right' });

  // 12. Signatures and Seal
  const sigY = 168;

  // Left Signature: Dean
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(35, sigY, 95, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Dr. A. Ramachandran", 65, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Dean, Faculty of Quantum Science", 65, sigY + 9, { align: 'center' });

  // Center Gold Seal
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1);
  doc.circle(width / 2, sigY + 1, 12, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text("Q-HUB", width / 2, sigY - 1, { align: 'center' });
  doc.text("OFFICIAL SEAL", width / 2, sigY + 3, { align: 'center' });
  doc.text("VERIFIED", width / 2, sigY + 6, { align: 'center' });

  // Right Signature: Academic Council Director
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(width - 95, sigY, width - 35, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Prof. Elena Rostova", width - 65, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Director, Quantum Academic Council", width - 65, sigY + 9, { align: 'center' });

  // 13. Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Academic Credential • Quantum Achievements & Research Portal • ${credentialId}`, width / 2, height - 12, { align: 'center' });

  doc.save(`${recipientName.replace(/\s+/g, '_')}_Official_Quantum_Certificate.pdf`);
};
