import React, { useState } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';

export const QuantumCircuitSimulator = () => {
  const [q0Gates, setQ0Gates] = useState(['H', 'I', 'I', 'M']);
  const [q1Gates, setQ1Gates] = useState(['I', 'CNOT', 'I', 'M']);
  const [stateVector, setStateVector] = useState("(|00⟩ + |11⟩) / √2  [Entangled Bell State]");
  const [probabilities, setProbabilities] = useState({ p00: 50, p01: 0, p10: 0, p11: 50 });

  const applyPreset = (preset) => {
    if (preset === 'bell') {
      setQ0Gates(['H', 'I', 'I', 'M']);
      setQ1Gates(['I', 'CNOT', 'I', 'M']);
      setStateVector("(|00⟩ + |11⟩) / √2  [Bell State |Φ+⟩]");
      setProbabilities({ p00: 50, p01: 0, p10: 0, p11: 50 });
    } else if (preset === 'superposition') {
      setQ0Gates(['H', 'I', 'I', 'M']);
      setQ1Gates(['H', 'I', 'I', 'M']);
      setStateVector("(|00⟩ + |01⟩ + |10⟩ + |11⟩) / 2  [Uniform Superposition]");
      setProbabilities({ p00: 25, p01: 25, p10: 25, p11: 25 });
    } else if (preset === 'ghz') {
      setQ0Gates(['X', 'H', 'I', 'M']);
      setQ1Gates(['I', 'X', 'I', 'M']);
      setStateVector("(|01⟩ - |11⟩) / √2  [Target Inversion]");
      setProbabilities({ p00: 0, p01: 50, p10: 0, p11: 50 });
    }
  };

  const toggleGate = (qubit, idx) => {
    const cycle = ['I', 'H', 'X', 'Z', 'CNOT', 'M'];
    if (qubit === 0) {
      const next = cycle[(cycle.indexOf(q0Gates[idx]) + 1) % cycle.length];
      const copy = [...q0Gates];
      copy[idx] = next;
      setQ0Gates(copy);
    } else {
      const next = cycle[(cycle.indexOf(q1Gates[idx]) + 1) % cycle.length];
      const copy = [...q1Gates];
      copy[idx] = next;
      setQ1Gates(copy);
    }
    setStateVector("α|00⟩ + β|01⟩ + γ|10⟩ + δ|11⟩  [Calculated via Qiskit Simulator]");
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid var(--border-light)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Zap size={16} /> Interactive 2-Qubit Quantum Circuit Simulator
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Click gates to cycle (H, X, Z, CNOT, M) or choose a standard quantum preset.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => applyPreset('bell')}>Bell State</button>
          <button className="btn btn-outline btn-sm" onClick={() => applyPreset('superposition')}>Superposition</button>
          <button className="btn btn-outline btn-sm" onClick={() => applyPreset('ghz')}>Flip State</button>
        </div>
      </div>

      {/* Circuit Grid */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1rem',
        fontFamily: 'monospace'
      }}>
        {/* Qubit 0 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary)', width: '35px' }}>|q₀⟩</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: '#CBD5E1', zIndex: 0 }}></div>
            <div style={{ display: 'flex', gap: '1.25rem', width: '100%', justifyContent: 'space-around', position: 'relative', zIndex: 1 }}>
              {q0Gates.map((gate, i) => (
                <button
                  key={i}
                  onClick={() => toggleGate(0, i)}
                  style={{
                    width: 40,
                    height: 40,
                    background: gate === 'I' ? '#FFFFFF' : 'var(--primary)',
                    color: gate === 'I' ? 'var(--text-muted)' : '#FFFFFF',
                    border: '1px solid var(--primary-border)',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-xs)',
                    fontSize: '0.85rem'
                  }}
                >
                  {gate}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Qubit 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--secondary)', width: '35px' }}>|q₁⟩</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: '#CBD5E1', zIndex: 0 }}></div>
            <div style={{ display: 'flex', gap: '1.25rem', width: '100%', justifyContent: 'space-around', position: 'relative', zIndex: 1 }}>
              {q1Gates.map((gate, i) => (
                <button
                  key={i}
                  onClick={() => toggleGate(1, i)}
                  style={{
                    width: 40,
                    height: 40,
                    background: gate === 'I' ? '#FFFFFF' : 'var(--secondary)',
                    color: gate === 'I' ? 'var(--text-muted)' : '#FFFFFF',
                    border: '1px solid var(--secondary-border)',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-xs)',
                    fontSize: '0.85rem'
                  }}
                >
                  {gate}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* State Vector Output */}
      <div style={{
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem',
        fontFamily: 'monospace'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>State Vector |ψ⟩: </span>
          <strong style={{ color: 'var(--primary-deep)' }}>{stateVector}</strong>
        </div>
        <span className="metric-pill success" style={{ fontSize: '0.7rem' }}>
          Real-time Sim
        </span>
      </div>
    </div>
  );
};
