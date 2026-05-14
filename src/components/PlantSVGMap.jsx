// src/PlantSVGMap.jsx

import { useState } from "react";
import "./PlantSVGMap.css";

import { plantHierarchy, initialAlarms } from "../data/mockData";

// Build flat sensor list from plantHierarchy + pull severity from initialAlarms
const positionMap = {
  pump_1:   { x: 130, y: 100 },
  valve_1:  { x: 250, y: 100 },
  chiller_1:{ x: 130, y: 230 },
  pump_2:   { x: 250, y: 230 },
  comp_1:   { x: 190, y: 165 },
};

const sensors = plantHierarchy.zones
  .flatMap(zone =>
    zone.machines
      .filter(m => positionMap[m.id])          // only machines you've placed on the map
      .map(m => {
        const alarm = initialAlarms.find(a => a.machineId === m.id);
        return {
          id:       m.id,
          label:    m.name,
          zone:     zone.name,
          x:        positionMap[m.id].x,
          y:        positionMap[m.id].y,
          severity: m.status === "critical" ? "critical"
                  : m.status === "warning"  ? "warning"
                  : "normal",
          detail:   alarm ? alarm.summary : "All parameters normal.",
        };
      })
  );

// ── LOOKUP MAPS ──
const colorMap = {
  critical: "#e53e3e",
  warning:  "#dd6b20",
  normal:   "#38a169"
};

const emojiMap = {
  critical: "🚨",
  warning:  "⚠️",
  normal:   "✅"
};


export default function PlantSVGMap() {

  // Tracks which sensor the user clicked. null = no panel shown.
  const [selected, setSelected] = useState(null);

  // Tracks which sensors have been acknowledged (by ID)
  const [acknowledged, setAcknowledged] = useState([]);

  function handleAcknowledge(sensor) {
    setAcknowledged((prev) => [...prev, sensor.id]);
    setSelected(null);
  }

  function handleEscalate(sensor) {
    alert(`🔺 Escalated to supervisor: ${sensor.label}`);
    setSelected(null);
  }

  return (
    <div>
      <h2 className="map-title">🏭 Plant Floor Map</h2>

      {/* ── LEGEND ── */}
      <div className="legend">
        <span>
          <span className="legend-dot" style={{ background: "#e53e3e" }} />
          Critical
        </span>
        <span>
          <span className="legend-dot" style={{ background: "#dd6b20" }} />
          Warning
        </span>
        <span>
          <span className="legend-dot" style={{ background: "#38a169" }} />
          Normal
        </span>
        <span>
          <span className="legend-dot" style={{ background: "#a0aec0" }} />
          Acknowledged
        </span>
      </div>

      <div className="map-wrapper">

        {/* ══════════════════════════════
              SVG CANVAS — The factory map
            ══════════════════════════════ */}
        <svg
          width="380"
          height="320"
          style={{
            border: "2px solid #cbd5e0",
            borderRadius: "12px",
            background: "#f0f4f8",
            flexShrink: 0          // prevents SVG from squishing on small screens
          }}
        >
          {/* ── ZONE A — top rectangle ── */}
          <rect
            x="60" y="50" width="260" height="110"
            fill="#e2e8f0" stroke="#a0aec0" strokeWidth="2" rx="8"
          />
          <text x="75" y="72" fontSize="13" fontWeight="bold" fill="#4a5568">
            Zone A
          </text>

          {/* ── ZONE B — bottom rectangle ── */}
          <rect
            x="60" y="180" width="260" height="110"
            fill="#e2e8f0" stroke="#a0aec0" strokeWidth="2" rx="8"
          />
          <text x="75" y="202" fontSize="13" fontWeight="bold" fill="#4a5568">
            Zone B
          </text>

          {/* ── PIPELINE — dashed connector between zones ── */}
          <line
            x1="190" y1="160" x2="190" y2="180"
            stroke="#a0aec0" strokeWidth="3" strokeDasharray="5,3"
          />

          {/* ── SENSOR NODES ── */}
          {sensors.map((sensor) => {

            // If acknowledged, override color to grey
            const isAcked = acknowledged.includes(sensor.id);
            const fillColor = isAcked ? "#a0aec0" : colorMap[sensor.severity];
            const isCritical = sensor.severity === "critical" && !isAcked;

            return (
              <g
                key={sensor.id}
                onClick={() => setSelected(sensor)}
                style={{ cursor: "pointer" }}
              >
                {/* Outer pulse ring — only for unacknowledged critical sensors */}
                {isCritical && (
                  <circle
                    cx={sensor.x}
                    cy={sensor.y}
                    r="26"
                    fill={fillColor}
                    className="sensor-pulse"   // CSS handles the animation
                  />
                )}

                {/* Main sensor circle */}
                <circle
                  cx={sensor.x}
                  cy={sensor.y}
                  r="18"
                  fill={fillColor}
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.95"
                />

                {/* Sensor ID inside circle */}
                <text
                  x={sensor.x}
                  y={sensor.y + 5}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="white"
                >
                  {sensor.id}
                </text>

                {/* Label below circle */}
                <text
                  x={sensor.x}
                  y={sensor.y + 34}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#4a5568"
                >
                  {sensor.label}
                </text>

                {/* Small ✓ badge on acknowledged sensors */}
                {isAcked && (
                  <text
                    x={sensor.x + 13}
                    y={sensor.y - 11}
                    fontSize="12"
                  >
                    ✓
                  </text>
                )}

              </g>
            );
          })}

        </svg>
        {/* ── End SVG ── */}


        {/* ══════════════════════════
              DETAIL PANEL
              Appears on click, slides in
            ══════════════════════════ */}
        {selected && (
          <div className="detail-panel">

            <h3>
              {acknowledged.includes(selected.id)
                ? "✅"
                : emojiMap[selected.severity]
              }{" "}
              {selected.label}
            </h3>

            <p><strong>Sensor ID:</strong> {selected.id}</p>
            <p><strong>Zone:</strong> {selected.zone}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span style={{
                color: acknowledged.includes(selected.id)
                  ? "#718096"
                  : colorMap[selected.severity],
                fontWeight: "bold",
                textTransform: "capitalize"
              }}>
                {acknowledged.includes(selected.id)
                  ? "Acknowledged"
                  : selected.severity
                }
              </span>
            </p>

            <p style={{ marginTop: "10px", lineHeight: "1.5" }}>
              {selected.detail}
            </p>

            {/* Action buttons — only for active (non-normal, non-acked) sensors */}
            {selected.severity !== "normal" && !acknowledged.includes(selected.id) && (
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>

                <button
                  style={{
                    flex: 1, padding: "7px",
                    background: "#38a169", color: "white",
                    border: "none", borderRadius: "6px",
                    cursor: "pointer", fontSize: "12px", fontWeight: "bold"
                  }}
                  onClick={() => handleAcknowledge(selected)}
                >
                  ✅ Acknowledge
                </button>

                <button
                  style={{
                    flex: 1, padding: "7px",
                    background: "#e53e3e", color: "white",
                    border: "none", borderRadius: "6px",
                    cursor: "pointer", fontSize: "12px", fontWeight: "bold"
                  }}
                  onClick={() => handleEscalate(selected)}
                >
                  🔺 Escalate
                </button>

              </div>
            )}

            <button className="close-btn" onClick={() => setSelected(null)}>
              Close ✕
            </button>

          </div>
        )}

      </div>
    </div>
  );
}