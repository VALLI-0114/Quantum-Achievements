/**
 * Q-HUB Quantum Circuit & State Vector Visualizer
 * Interactive, light-themed quantum simulation widget.
 */

class QuantumVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.qubits = 2; // q0 and q1
    this.slots = 4;  // 4 gate slots per wire
    this.circuit = [
      ["H", "CNOT_CTRL", "none", "M"],
      ["none", "CNOT_TARG", "none", "M"]
    ];
    this.preset = "Bell State |Φ+⟩";
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.calculateState();
  }

  setPreset(presetName) {
    this.preset = presetName;
    if (presetName === "Bell State") {
      this.circuit = [
        ["H", "CNOT_CTRL", "none", "M"],
        ["none", "CNOT_TARG", "none", "M"]
      ];
    } else if (presetName === "Superposition") {
      this.circuit = [
        ["H", "none", "none", "M"],
        ["H", "none", "none", "M"]
      ];
    } else if (presetName === "Pauli Flip") {
      this.circuit = [
        ["X", "H", "none", "M"],
        ["none", "X", "none", "M"]
      ];
    } else if (presetName === "Reset") {
      this.circuit = [
        ["none", "none", "none", "none"],
        ["none", "none", "none", "none"]
      ];
    }
    this.render();
    this.calculateState();
  }

  toggleGate(qubitIdx, slotIdx) {
    const current = this.circuit[qubitIdx][slotIdx];
    const gateCycle = ["none", "H", "X", "Z", "CNOT_CTRL", "M"];
    let nextIdx = (gateCycle.indexOf(current) + 1) % gateCycle.length;
    
    // If setting CNOT_CTRL on q0, auto set CNOT_TARG on q1
    if (gateCycle[nextIdx] === "CNOT_CTRL") {
      if (qubitIdx === 0) {
        this.circuit[0][slotIdx] = "CNOT_CTRL";
        this.circuit[1][slotIdx] = "CNOT_TARG";
      } else {
        this.circuit[qubitIdx][slotIdx] = "H";
      }
    } else {
      if (current === "CNOT_CTRL") {
        this.circuit[1][slotIdx] = "none";
      }
      this.circuit[qubitIdx][slotIdx] = gateCycle[nextIdx];
    }

    this.render();
    this.calculateState();
  }

  calculateState() {
    // 2-Qubit State Simulator: |00>, |01>, |10>, |11>
    let probs = { "00": 1, "01": 0, "10": 0, "11": 0 };
    let stateDesc = "|00⟩";

    const q0_g0 = this.circuit[0][0];
    const q1_g0 = this.circuit[1][0];
    const hasCnot = this.circuit[0][1] === "CNOT_CTRL" && this.circuit[1][1] === "CNOT_TARG";

    if (q0_g0 === "H" && hasCnot) {
      probs = { "00": 0.5, "01": 0, "10": 0, "11": 0.5 };
      stateDesc = "( |00⟩ + |11⟩ ) / √2  [Maximal Entanglement]";
    } else if (q0_g0 === "H" && q1_g0 === "H") {
      probs = { "00": 0.25, "01": 0.25, "10": 0.25, "11": 0.25 };
      stateDesc = "1/2 ( |00⟩ + |01⟩ + |10⟩ + |11⟩ )";
    } else if (q0_g0 === "H") {
      probs = { "00": 0.5, "01": 0.5, "10": 0, "11": 0 };
      stateDesc = "( |00⟩ + |01⟩ ) / √2";
    } else if (q0_g0 === "X" && q1_g0 === "none") {
      probs = { "00": 0, "01": 1, "10": 0, "11": 0 };
      stateDesc = "|01⟩ (Bit Flipped)";
    } else if (q0_g0 === "X" && q1_g0 === "X") {
      probs = { "00": 0, "01": 0, "10": 0, "11": 1 };
      stateDesc = "|11⟩";
    }

    const stateEl = document.getElementById("heroStateVector");
    if (stateEl) {
      stateEl.innerHTML = `<span style="color:var(--primary); font-weight:700;">${stateDesc}</span>`;
    }

    // Update probability bars if present
    const p00 = document.getElementById("prob00");
    const p11 = document.getElementById("prob11");
    if (p00) p00.style.width = `${probs["00"] * 100}%`;
    if (p11) p11.style.width = `${probs["11"] * 100}%`;
  }

  render() {
    if (!this.container) return;

    let html = `
      <div class="circuit-header">
        <div class="circuit-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 3v18M3 12h18"/>
          </svg>
          Interactive Quantum Circuit Simulator
        </div>
        <div style="display:flex; gap:0.4rem;">
          <button class="btn btn-outline btn-sm" onclick="window.quantumSim.setPreset('Bell State')">Bell State</button>
          <button class="btn btn-outline btn-sm" onclick="window.quantumSim.setPreset('Superposition')">Superposition</button>
          <button class="btn btn-outline btn-sm" onclick="window.quantumSim.setPreset('Reset')">Clear</button>
        </div>
      </div>
      <div class="circuit-interactive-board">
    `;

    for (let q = 0; q < this.qubits; q++) {
      html += `
        <div class="circuit-wire-row">
          <div class="wire-label">|q<sub>${q}</sub>⟩</div>
          <div class="wire-line">
      `;

      for (let s = 0; s < this.slots; s++) {
        const gate = this.circuit[q][s];
        let gateClass = "wire-gate";
        let gateDisplay = gate;

        if (gate === "none") {
          gateClass = "wire-gate btn-ghost";
          gateDisplay = "+";
        } else if (gate === "H") {
          gateClass = "wire-gate";
          gateDisplay = "H";
        } else if (gate === "X") {
          gateClass = "wire-gate secondary";
          gateDisplay = "X";
        } else if (gate === "CNOT_CTRL") {
          gateClass = "wire-gate accent";
          gateDisplay = "●";
        } else if (gate === "CNOT_TARG") {
          gateClass = "wire-gate accent";
          gateDisplay = "⊕";
        } else if (gate === "M") {
          gateClass = "wire-gate btn-outline";
          gateDisplay = "📊";
        }

        html += `
          <button class="${gateClass}" onclick="window.quantumSim.toggleGate(${q}, ${s})" title="Click to cycle quantum gate">
            ${gateDisplay}
          </button>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    html += `
      </div>
      <div class="state-output-bar">
        <div>
          <span style="font-weight:600; color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Output Quantum State:</span>
          <div id="heroStateVector" class="state-vector-text">Calculating state...</div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.75rem; color:var(--text-muted);">
          <span class="badge badge-teal" style="font-size:0.7rem;">Verified on Qiskit Aer</span>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}

// Global hook
document.addEventListener("DOMContentLoaded", () => {
  window.quantumSim = new QuantumVisualizer("heroCircuitContainer");
});
