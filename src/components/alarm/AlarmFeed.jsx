// =============================================================================
// AlarmFeed.jsx — Social Feed of Alarms (Feature 1)
// =============================================================================
// • Pinned critical alarms at top with red border glow
// • Threaded related alarms underneath parent incidents
// • Expand/collapse logic per card
// • AI-generated global summary banner
// • Acknowledge / Escalate actions
// • Severity indicators, timestamps, smooth live updates
// =============================================================================

import { useState } from 'react';
import { useAlarmContext } from '../../context/AlarmContext';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  Pin,
  Brain,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// ─── AI Summary Banner ─────────────────────────────────────────────────────

function AISummaryBanner() {
  const { aiGlobalSummary, criticalCount, warningCount } = useAlarmContext();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-status-selected/20 bg-status-selected/[0.04] overflow-hidden"
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-status-selected/[0.06] transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-status-selected/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-status-selected" />
          </div>
          <div>
            <span className="text-xs font-semibold text-status-selected uppercase tracking-wider">
              AI Incident Summary
            </span>
            <div className="flex items-center space-x-3 mt-0.5">
              <span className="text-[10px] text-status-critical font-medium">
                {criticalCount} CRITICAL
              </span>
              <span className="text-[10px] text-status-warning font-medium">
                {warningCount} WARNING
              </span>
            </div>
          </div>
        </div>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        ) : (
          <ChevronUp className="w-4 h-4 text-text-secondary" />
        )}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              <p className="text-xs text-text-primary leading-relaxed">
                {aiGlobalSummary.narrative}
              </p>
              <div className="flex items-center space-x-4 mt-3 text-[10px] text-text-secondary">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(aiGlobalSummary.timestamp).toLocaleTimeString()}
                </span>
                <span>
                  Zones affected:{' '}
                  <span className="text-text-primary">
                    {aiGlobalSummary.affectedZones.join(', ')}
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main AlarmFeed Component ───────────────────────────────────────────────

export function AlarmFeed() {
  const { activeAlarms, acknowledgedAlarms, escalatedAlarms, activeAlarmsCount } =
    useAlarmContext();

  // Sort: pinned first, then by severity (critical > warning > info), then by time
  const sortedAlarms = [...activeAlarms].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const sevOrder = { critical: 0, warning: 1, info: 2 };
    const sevDiff = (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3);
    if (sevDiff !== 0) return sevDiff;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const pinnedAlarms = sortedAlarms.filter((a) => a.pinned);
  const unpinnedAlarms = sortedAlarms.filter((a) => !a.pinned);

  return (
    <div className="h-full flex flex-col bg-background/90 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card/60 flex justify-between items-center shrink-0">
        <h2 className="text-xs font-semibold text-text-primary uppercase tracking-[0.1em] flex items-center">
          <ShieldAlert className="w-4 h-4 mr-2 text-status-warning" />
          Incident Feed
        </h2>
        <div className="flex items-center space-x-2">
          {acknowledgedAlarms.length > 0 && (
            <Badge variant="healthy">{acknowledgedAlarms.length} Ack</Badge>
          )}
          {escalatedAlarms.length > 0 && (
            <Badge variant="critical">{escalatedAlarms.length} Esc</Badge>
          )}
          <Badge variant="neutral">{activeAlarmsCount} Active</Badge>
        </div>
      </div>

      {/* Scrollable feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {/* AI Summary at top */}
          <AISummaryBanner />

          {/* Pinned section */}
          {pinnedAlarms.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pt-2">
                <Pin className="w-3 h-3 text-status-critical" />
                <span className="text-[10px] font-semibold text-status-critical uppercase tracking-wider">
                  Pinned — Requires Attention
                </span>
              </div>
              <AnimatePresence>
                {pinnedAlarms.map((alarm, i) => (
                  <AlarmCard key={alarm.id} alarm={alarm} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Unpinned section */}
          {unpinnedAlarms.length > 0 && (
            <div className="space-y-3">
              {pinnedAlarms.length > 0 && (
                <div className="flex items-center space-x-2 pt-2">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Active Incidents
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              <AnimatePresence>
                {unpinnedAlarms.map((alarm, i) => (
                  <AlarmCard key={alarm.id} alarm={alarm} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty state */}
          {activeAlarms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-text-secondary"
            >
              <div className="w-14 h-14 rounded-full bg-status-healthy/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-status-healthy" />
              </div>
              <p className="text-sm font-medium text-text-primary mb-1">All Clear</p>
              <p className="text-xs">No active incidents. All systems nominal.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Individual Alarm Card ──────────────────────────────────────────────────

function AlarmCard({ alarm, index }) {
  const { acknowledgeAlarm, escalateAlarm, selectMachine, selectedMachineId } = useAlarmContext();
  const [expanded, setExpanded] = useState(alarm.pinned); // pinned alarms start expanded

  const isCritical = alarm.severity === 'critical';
  const isWarning = alarm.severity === 'warning';
  const isSelected = selectedMachineId === alarm.machineId;
  const hasChildren = alarm.relatedAlarms && alarm.relatedAlarms.length > 0;

  const handleSelect = () => selectMachine(alarm.machineId);

  const severityDot = isCritical
    ? 'bg-status-critical'
    : isWarning
    ? 'bg-status-warning'
    : 'bg-status-healthy';

  const timeAgo = getTimeAgo(alarm.timestamp);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={`relative rounded-lg border transition-all duration-200 ${
        isSelected
          ? 'border-status-selected bg-card ring-1 ring-status-selected/20'
          : isCritical
          ? 'border-status-critical/30 bg-card shadow-[0_0_20px_rgba(255,77,79,0.06)]'
          : 'border-border bg-card hover:border-text-secondary/30'
      }`}
    >
      {/* Main card content */}
      <div className="p-4 cursor-pointer" onClick={handleSelect}>
        {/* Header row */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${severityDot} ${isCritical ? 'animate-pulse' : ''}`} />
            <Badge variant={isCritical ? 'critical' : isWarning ? 'warning' : 'neutral'}>
              {alarm.id}
            </Badge>
            {alarm.pinned && <Pin className="w-3 h-3 text-status-critical" />}
          </div>
          <span className="text-[10px] text-text-secondary flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {timeAgo}
          </span>
        </div>

        {/* Title and location */}
        <h3 className="text-sm font-semibold text-text-primary mb-1 leading-snug">{alarm.title}</h3>
        <p className="text-[11px] text-text-secondary mb-3 flex items-center">
          <span className="w-1 h-1 rounded-full bg-text-secondary mr-2" />
          {alarm.machineName} &bull; {alarm.location}
        </p>

        {/* AI Summary */}
        {alarm.summary && (
          <div className="bg-background/80 border border-status-selected/15 rounded-md p-3 mb-3">
            <div className="flex items-start">
              <Zap className="w-3.5 h-3.5 text-status-selected mr-2 shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-primary/90 leading-relaxed">{alarm.summary}</p>
            </div>
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              acknowledgeAlarm(alarm.id);
            }}
            className="flex-1 text-[11px]"
          >
            <Check className="w-3 h-3 mr-1.5" />
            Acknowledge
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              escalateAlarm(alarm.id);
            }}
            className="flex-1 text-[11px]"
          >
            <ArrowUpRight className="w-3 h-3 mr-1.5" />
            Escalate
          </Button>
        </div>
      </div>

      {/* Threaded children — expand/collapse */}
      {hasChildren && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="w-full flex items-center justify-center border-t border-border py-1.5 text-[10px] text-text-secondary hover:text-text-primary hover:bg-card transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" /> Hide {alarm.relatedAlarms.length} related
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" /> Show {alarm.relatedAlarms.length} related
              </>
            )}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-background/40 border-t border-border px-4 py-3">
                  <div className="relative ml-1 space-y-3">
                    {/* Vertical connector line */}
                    <div className="absolute left-[5px] top-0 bottom-0 w-px bg-border" />

                    {alarm.relatedAlarms.map((related, idx) => (
                      <motion.div
                        key={related.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="relative pl-6"
                      >
                        {/* Connector dot */}
                        <div
                          className={`absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full border-2 border-background ${
                            related.severity === 'critical' ? 'bg-status-critical' : 'bg-status-warning'
                          }`}
                        />

                        <div className="bg-card/50 border border-border/50 rounded-md p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <CornerDownRight className="w-3 h-3 text-text-secondary" />
                              <span className="text-[10px] font-semibold text-text-secondary uppercase">
                                {related.id}
                              </span>
                              <Badge
                                variant={related.severity === 'critical' ? 'critical' : 'warning'}
                              >
                                {related.severity}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-text-secondary">
                              {new Date(related.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-text-primary">{related.title}</p>
                          {related.summary && (
                            <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
                              {related.summary}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function getTimeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
