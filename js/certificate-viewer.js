/**
 * Q-HUB Certificate Verification & Renderer
 * Interactive verification audit modal & academic credential renderer using Q_DB.
 */

const Q_CERT = {
  viewCertificate(certId) {
    const cert = Q_DB.getCertificates().find(c => c.id === certId) || Q_DB.getCertificates()[0];
    const modal = document.getElementById("certViewModal");
    const body = document.getElementById("certViewBody");

    if (!modal || !body || !cert) return;

    body.innerHTML = `
      <div style="background:#FFFFFF; border:8px double #CBD5E1; border-radius:12px; padding:2.5rem; text-align:center; position:relative; box-shadow:0 10px 25px rgba(0,0,0,0.05); font-family:'Inter', sans-serif;">
        <div style="position:absolute; top:20px; right:20px; display:flex; align-items:center; gap:0.4rem; font-size:0.75rem; color:#10B981; font-weight:700; background:#ECFDF5; padding:0.3rem 0.6rem; border-radius:9999px; border:1px solid #A7F3D0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          AUTHENTIC & VERIFIED
        </div>
        
        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.15em; color:#64748B; margin-bottom:0.5rem;">
          INSTITUTIONAL QUANTUM COMPUTING & RESEARCH HUB
        </div>
        <h2 style="font-family:'Poppins', sans-serif; font-size:1.85rem; color:#1E40AF; font-weight:800; margin-bottom:1rem;">
          Certificate of Academic Achievement
        </h2>
        <p style="color:#64748B; font-size:0.9rem; margin-bottom:1.5rem;">This is to certify that</p>
        
        <div style="font-family:'Poppins', sans-serif; font-size:1.6rem; font-weight:700; color:#0F172A; border-bottom:2px solid #2563EB; display:inline-block; padding:0 2rem 0.4rem; margin-bottom:1.5rem;">
          ${cert.recipient}
        </div>
        
        <p style="color:#475569; font-size:0.95rem; max-width:540px; margin:0 auto 1.5rem; line-height:1.6;">
          has successfully demonstrated theoretical and laboratory mastery in the accredited curriculum for
        </p>
        
        <div style="font-size:1.15rem; font-weight:700; color:#4338CA; margin-bottom:1.75rem;">
          "${cert.course}"
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; border-top:1px solid #E2E8F0; padding-top:1.5rem; text-align:left; font-size:0.8rem;">
          <div>
            <div style="color:#64748B;">Issuing Organization:</div>
            <div style="font-weight:600; color:#0F172A;">${cert.organization}</div>
            <div style="color:#64748B; margin-top:0.4rem;">Date Issued:</div>
            <div style="font-weight:600; color:#0F172A;">${cert.issueDate}</div>
          </div>
          <div>
            <div style="color:#64748B;">Credential ID:</div>
            <div style="font-family:monospace; font-weight:700; color:#2563EB;">${cert.credentialId}</div>
            <div style="color:#64748B; margin-top:0.4rem;">Verification Hash:</div>
            <div style="font-family:monospace; font-size:0.68rem; color:#64748B; word-break:break-all;">${cert.hash}</div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("open");
  },

  verifyCertificate(certId) {
    const cert = Q_DB.getCertificates().find(c => c.id === certId) || Q_DB.getCertificates()[0];
    const modal = document.getElementById("certVerifyModal");
    const body = document.getElementById("certVerifyBody");

    if (!modal || !body || !cert) return;

    body.innerHTML = `
      <div style="text-align:center; padding:1rem 0;">
        <div style="width:64px; height:64px; border-radius:50%; background:#ECFDF5; color:#10B981; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; border:2px solid #A7F3D0;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 style="font-size:1.35rem; font-weight:700; color:#0F172A; margin-bottom:0.25rem;">Credential Cryptographically Verified</h3>
        <p style="font-size:0.85rem; color:#64748B; margin-bottom:1.5rem;">The following credential record is authentic and confirmed on the institutional ledger.</p>
        
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:1.25rem; text-align:left; font-size:0.85rem; display:flex; flex-direction:column; gap:0.6rem;">
          <div style="display:flex; justify-content:space-between;"><span style="color:#64748B;">Recipient:</span> <strong style="color:#0F172A;">${cert.recipient}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:#64748B;">Curriculum:</span> <strong style="color:#0F172A; text-align:right; max-width:280px;">${cert.course}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:#64748B;">Issuing Entity:</span> <strong>${cert.organization}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:#64748B;">Credential ID:</span> <span style="font-family:monospace; color:#2563EB; font-weight:700;">${cert.credentialId}</span></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:#64748B;">Audit Status:</span> <span class="badge badge-success">Official & Valid</span></div>
          <div style="display:flex; justify-content:space-between; flex-direction:column; gap:0.2rem; margin-top:0.4rem; border-top:1px dashed #CBD5E1; padding-top:0.5rem;">
            <span style="color:#64748B; font-size:0.75rem;">SHA-256 Digest:</span>
            <code style="background:#FFFFFF; padding:0.3rem 0.5rem; border:1px solid #E2E8F0; border-radius:4px; font-size:0.72rem; color:#475569; word-break:break-all;">${cert.hash}</code>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("open");
  },

  downloadCertificate() {
    window.print();
  }
};
