// MobileCompanion.jsx
// Dependencies: npm install react-swipeable
// Usage: import MobileCompanion from './MobileCompanion'

import { useState, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;700&display=swap');

  :root {
    --bg-deep:        #0a0c10;
    --bg-bezel:       #1a1d24;
    --bg-screen:      #0d1017;
    --bg-card:        #151821;
    --bg-card-hover:  #1c2030;
    --accent-green:   #00e676;
    --accent-red:     #ff1744;
    --accent-amber:   #ffab00;
    --text-primary:   #e8eaf0;
    --text-secondary: #8892a4;
    --text-dim:       #4a5568;
    --border:         #252a38;
    --border-bright:  #343b52;
    --flash-green:    rgba(0, 230, 118, 0.25);
    --flash-red:      rgba(255, 23, 68, 0.25);
    --radius-card:    14px;
    --radius-badge:   6px;
    --mono:           'IBM Plex Mono', monospace;
    --sans:           'Space Grotesk', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg-deep);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: var(--sans);
  }

  /* ── Phone Bezel ── */
  .phone-bezel {
    position: relative;
    width: 390px;
    min-height: 780px;
    background: var(--bg-bezel);
    border-radius: 44px;
    padding: 12px;
    box-shadow:
      0 0 0 1px #2a2f3e,
      0 0 0 3px #111420,
      0 30px 80px rgba(0,0,0,0.7),
      inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .phone-notch {
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 28px;
    background: #0a0c10;
    border-radius: 20px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .notch-camera {
    width: 10px; height: 10px;
    background: #1a1d24;
    border-radius: 50%;
    border: 2px solid #252a38;
  }
  .notch-dot {
    width: 6px; height: 6px;
    background: #ff6b35;
    border-radius: 50%;
    opacity: 0.7;
  }

  /* ── Screen ── */
  .phone-screen {
    background: var(--bg-screen);
    border-radius: 34px;
    height: 100%;
    min-height: 756px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* ── Header ── */
  .screen-header {
    padding: 52px 20px 16px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(21,24,33,0.98) 0%, rgba(13,16,23,0.95) 100%);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
  }
  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .header-title {
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  .header-count {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--accent-amber);
    background: rgba(255, 171, 0, 0.12);
    border: 1px solid rgba(255, 171, 0, 0.25);
    padding: 3px 8px;
    border-radius: 4px;
  }
  .header-big {
    font-family: var(--sans);
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    margin-top: 6px;
    letter-spacing: -0.02em;
  }

  /* ── Swipe Hint ── */
  .swipe-hint {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px 0;
    flex-shrink: 0;
  }
  .hint-pill {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.08em;
    padding: 3px 10px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .hint-pill.left {
    background: rgba(255, 23, 68, 0.1);
    border: 1px solid rgba(255, 23, 68, 0.2);
    color: var(--accent-red);
  }
  .hint-pill.right {
    background: rgba(0, 230, 118, 0.1);
    border: 1px solid rgba(0, 230, 118, 0.2);
    color: var(--accent-green);
  }

  /* ── Card List ── */
  .card-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scrollbar-width: none;
  }
  .card-list::-webkit-scrollbar { display: none; }

  /* ── Alarm Card ── */
  .alarm-card {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 14px 16px;
    cursor: grab;
    user-select: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.2s ease;
    overflow: hidden;
  }
  .alarm-card:active { cursor: grabbing; }
  .alarm-card.swiping-right {
    border-color: rgba(0, 230, 118, 0.4);
    box-shadow: 0 0 20px rgba(0, 230, 118, 0.1);
  }
  .alarm-card.swiping-left {
    border-color: rgba(255, 23, 68, 0.4);
    box-shadow: 0 0 20px rgba(255, 23, 68, 0.1);
  }
  .alarm-card.acknowledged {
    opacity: 0.5;
    border-color: rgba(0, 230, 118, 0.2);
  }
  .alarm-card.escalated {
    opacity: 0.5;
    border-color: rgba(255, 23, 68, 0.2);
  }

  /* Flash overlay */
  .flash-overlay {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-card);
    pointer-events: none;
    opacity: 0;
    z-index: 5;
  }
  .flash-overlay.flash-green {
    background: var(--flash-green);
    animation: flashGreen 0.5s ease forwards;
  }
  .flash-overlay.flash-red {
    background: var(--flash-red);
    animation: flashRed 0.5s ease forwards;
  }

  @keyframes flashGreen {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes flashRed {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }

  /* Swipe action indicator */
  .swipe-indicator {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 4;
    padding: 4px 10px;
    border-radius: 6px;
  }
  .swipe-indicator.left-indicator {
    right: 14px;
    color: var(--accent-red);
    background: rgba(255, 23, 68, 0.15);
    border: 1px solid rgba(255, 23, 68, 0.3);
  }
  .swipe-indicator.right-indicator {
    left: 14px;
    color: var(--accent-green);
    background: rgba(0, 230, 118, 0.15);
    border: 1px solid rgba(0, 230, 118, 0.3);
  }
  .alarm-card.swiping-left  .left-indicator  { opacity: 1; }
  .alarm-card.swiping-right .right-indicator { opacity: 1; }

  /* Card top row */
  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .card-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .card-text { flex: 1; min-width: 0; }
  .card-name {
    font-family: var(--sans);
    font-size: 13px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .card-meta {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .severity-badge {
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    padding: 3px 8px;
    border-radius: 4px;
    flex-shrink: 0;
    text-transform: uppercase;
  }
  .severity-critical {
    background: rgba(255, 23, 68, 0.15);
    color: #ff4569;
    border: 1px solid rgba(255, 23, 68, 0.25);
  }
  .severity-high {
    background: rgba(255, 171, 0, 0.12);
    color: #ffc107;
    border: 1px solid rgba(255, 171, 0, 0.2);
  }
  .severity-medium {
    background: rgba(100, 181, 246, 0.12);
    color: #64b5f6;
    border: 1px solid rgba(100, 181, 246, 0.2);
  }

  .card-message {
    font-family: var(--sans);
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 8px;
    line-height: 1.5;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }
  .card-time {
    font-family: var(--mono);
    font-size: 9px;
    color: var(--text-dim);
  }
  .status-tag {
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .status-pending  { color: var(--text-dim); }
  .status-acknowledged {
    color: var(--accent-green);
    background: rgba(0, 230, 118, 0.1);
    border: 1px solid rgba(0, 230, 118, 0.2);
  }
  .status-escalated {
    color: var(--accent-red);
    background: rgba(255, 23, 68, 0.1);
    border: 1px solid rgba(255, 23, 68, 0.2);
  }

  /* ── WebSocket Badge ── */
  .ws-bar {
    flex-shrink: 0;
    padding: 10px 20px 14px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-card);
  }
  .ws-dot-wrapper {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .ws-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent-green);
    box-shadow: 0 0 6px var(--accent-green);
    animation: pulse-dot 2s infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }
  .ws-label {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--accent-green);
    letter-spacing: 0.05em;
  }
  .ws-sync {
    font-family: var(--mono);
    font-size: 9px;
    color: var(--text-dim);
  }

  /* ── Empty State ── */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 20px;
  }
  .empty-icon { font-size: 36px; }
  .empty-text {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.08em;
    text-align: center;
  }

  /* ── Tabs ── */
  .tab-bar {
    display: flex;
    padding: 0 16px;
    gap: 4px;
    flex-shrink: 0;
    margin: 8px 0 0;
  }
  .tab-btn {
    flex: 1;
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 7px 4px;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
    background: transparent;
    color: var(--text-dim);
  }
  .tab-btn.active {
    background: var(--bg-card);
    border-color: var(--border-bright);
    color: var(--text-primary);
  }
`;

// ─── Data ──────────────────────────────────────────────────────────────────────
const INITIAL_ALARMS = [
  {
    id: 1,
    name: "DB_PROD_01",
    meta: "db.prod.internal · 192.168.1.10",
    icon: "🗄️",
    iconBg: "rgba(255,23,68,0.15)",
    severity: "critical",
    message: "Connection pool exhausted. Active connections: 512/512. Queries queued.",
    time: "2 min ago",
    status: "pending",
    flash: null,
  },
  {
    id: 2,
    name: "API_GATEWAY",
    meta: "api.service.io · us-east-1",
    icon: "⚡",
    iconBg: "rgba(255,171,0,0.15)",
    severity: "high",
    message: "P99 latency spiked to 4.2s. Upstream timeout rate 12% over last 5 min.",
    time: "5 min ago",
    status: "pending",
    flash: null,
  },
  {
    id: 3,
    name: "WORKER_NODE_07",
    meta: "k8s · worker-07.cluster",
    icon: "⚙️",
    iconBg: "rgba(100,181,246,0.12)",
    severity: "medium",
    message: "CPU at 94% for 3 consecutive cycles. Pod eviction threshold approaching.",
    time: "9 min ago",
    status: "pending",
    flash: null,
  },
  {
    id: 4,
    name: "AUTH_SERVICE",
    meta: "auth.internal · svc-auth-3",
    icon: "🔐",
    iconBg: "rgba(255,23,68,0.15)",
    severity: "critical",
    message: "JWT validation failures surging. 847 errors/min. Possible token rotation issue.",
    time: "11 min ago",
    status: "pending",
    flash: null,
  },
  {
    id: 5,
    name: "CACHE_CLUSTER",
    meta: "redis.prod · 3-node cluster",
    icon: "🧠",
    iconBg: "rgba(255,171,0,0.15)",
    severity: "high",
    message: "Memory usage at 88%. Eviction policy active. Cache hit rate dropped to 61%.",
    time: "14 min ago",
    status: "pending",
    flash: null,
  },
  {
    id: 6,
    name: "CDN_EDGE_EU",
    meta: "cdn · frankfurt-edge-02",
    icon: "🌐",
    iconBg: "rgba(100,181,246,0.12)",
    severity: "medium",
    message: "Origin pull rate elevated. TTL misconfiguration suspected on /assets/* routes.",
    time: "18 min ago",
    status: "pending",
    flash: null,
  },
];

// ─── AlarmCard Component ────────────────────────────────────────────────────────
function AlarmCard({ alarm, onSwipeLeft, onSwipeRight }) {
  const [swipeDir, setSwipeDir] = useState(null); // 'left' | 'right' | null

  const handlers = useSwipeable({
    // Called while actively swiping — show live indicator
    onSwiping: ({ dir }) => {
      if (alarm.status !== "pending") return;
      if (dir === "Left")  setSwipeDir("left");
      else if (dir === "Right") setSwipeDir("right");
      else setSwipeDir(null);
    },
    // Final swipe commits
    onSwipedRight: () => {
      if (alarm.status !== "pending") return;
      setSwipeDir(null);
      onSwipeRight(alarm.id);
    },
    onSwipedLeft: () => {
      if (alarm.status !== "pending") return;
      setSwipeDir(null);
      onSwipeLeft(alarm.id);
    },
    onTouchEndOrOnMouseUp: () => setSwipeDir(null),
    trackMouse: true, // so it works on desktop too
    delta: 40,        // minimum px before swipe fires
    preventScrollOnSwipe: true,
  });

  const cardClass = [
    "alarm-card",
    alarm.status !== "pending" ? alarm.status : "",
    swipeDir === "left"  ? "swiping-left"  : "",
    swipeDir === "right" ? "swiping-right" : "",
  ].filter(Boolean).join(" ");

  return (
    <div {...handlers} className={cardClass}>
      {/* Flash overlay */}
      <div
        key={alarm.flash} // re-mount to re-trigger animation
        className={`flash-overlay ${alarm.flash ? `flash-${alarm.flash}` : ""}`}
      />

      {/* Swipe indicators */}
      <div className="swipe-indicator right-indicator">✓ ACK</div>
      <div className="swipe-indicator left-indicator">↑ ESC</div>

      {/* Card content */}
      <div className="card-top">
        <div className="card-icon" style={{ background: alarm.iconBg }}>
          {alarm.icon}
        </div>
        <div className="card-text">
          <div className="card-name">{alarm.name}</div>
          <div className="card-meta">{alarm.meta}</div>
        </div>
        <div className={`severity-badge severity-${alarm.severity}`}>
          {alarm.severity}
        </div>
      </div>

      <div className="card-message">{alarm.message}</div>

      <div className="card-footer">
        <div className="card-time">{alarm.time}</div>
        <div className={`status-tag status-${alarm.status}`}>
          {alarm.status === "pending"      && "● pending"}
          {alarm.status === "acknowledged" && "✓ ack'd"}
          {alarm.status === "escalated"    && "↑ escalated"}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function MobileCompanion() {
  const [alarms, setAlarms] = useState(INITIAL_ALARMS);
  const [lastSync, setLastSync] = useState("just now");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'pending' | 'done'
  const flashTimeouts = useRef({});

  // ── Fake WebSocket: update "last sync" every 5 seconds ──
  useEffect(() => {
    let seconds = 0;
    const interval = setInterval(() => {
      seconds += 5;
      if (seconds < 60) {
        setLastSync(`${seconds}s ago`);
      } else {
        setLastSync(`${Math.floor(seconds / 60)}m ago`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Helper: trigger flash then clear it ──
  const triggerFlash = (id, color) => {
    // Clear any existing timeout for this card
    if (flashTimeouts.current[id]) clearTimeout(flashTimeouts.current[id]);

    setAlarms(prev =>
      prev.map(a => a.id === id ? { ...a, flash: color } : a)
    );

    // Remove flash flag after animation completes (500ms)
    flashTimeouts.current[id] = setTimeout(() => {
      setAlarms(prev =>
        prev.map(a => a.id === id ? { ...a, flash: null } : a)
      );
    }, 500);
  };

  // ── Swipe Handlers ──
  const handleSwipeRight = (id) => {
    setAlarms(prev =>
      prev.map(a => a.id === id ? { ...a, status: "acknowledged" } : a)
    );
    triggerFlash(id, "green");
  };

  const handleSwipeLeft = (id) => {
    setAlarms(prev =>
      prev.map(a => a.id === id ? { ...a, status: "escalated" } : a)
    );
    triggerFlash(id, "red");
  };

  // ── Tab Filtering ──
  const visibleAlarms = alarms.filter(a => {
    if (activeTab === "pending") return a.status === "pending";
    if (activeTab === "done")    return a.status !== "pending";
    return true;
  });

  const pendingCount = alarms.filter(a => a.status === "pending").length;

  return (
    <>
      <style>{styles}</style>
      <div className="phone-bezel">
        <div className="phone-notch">
          <div className="notch-camera" />
          <div className="notch-dot" />
        </div>

        <div className="phone-screen">
          {/* Header */}
          <div className="screen-header">
            <div className="header-row">
              <span className="header-title">Alarm Monitor</span>
              {pendingCount > 0 && (
                <span className="header-count">{pendingCount} PENDING</span>
              )}
            </div>
            <div className="header-big">Active Alerts</div>
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            {["all", "pending", "done"].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Swipe hint */}
          <div className="swipe-hint">
            <div className="hint-pill left">← Escalate</div>
            <div className="hint-pill right">Acknowledge →</div>
          </div>

          {/* Card List */}
          <div className="card-list">
            {visibleAlarms.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✓</div>
                <div className="empty-text">No alarms in this view</div>
              </div>
            ) : (
              visibleAlarms.map(alarm => (
                <AlarmCard
                  key={alarm.id}
                  alarm={alarm}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                />
              ))
            )}
          </div>

          {/* WebSocket Status Bar */}
          <div className="ws-bar">
            <div className="ws-dot-wrapper">
              <div className="ws-dot" />
              <span className="ws-label">WS CONNECTED</span>
            </div>
            <span className="ws-sync">sync {lastSync}</span>
          </div>
        </div>
      </div>
    </>
  );
}
