import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, Zap, Target, BarChart3 } from 'lucide-react';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const throughputData = [
  { time: '0:00', value: 45 },
  { time: '1:00', value: 62 },
  { time: '2:00', value: 58 },
  { time: '3:00', value: 75 },
  { time: '4:00', value: 90 },
  { time: '5:00', value: 82 },
  { time: '6:00', value: 88 },
  { time: '7:00', value: 95 },
];

export function ManagerView() {
  return (
    <main className="flex-1 bg-background-secondary p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Plant Performance Overview</h2>
          <p className="text-text-secondary text-sm">Shift Alpha • 06:00 - 14:00 • Supervisor: Sarah J.</p>
        </header>

        {/* Top Level KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard title="OEE Index" value="84.2%" trend="+2.1%" icon={Target} color="text-status-healthy" />
          <KPICard title="Availability" value="98.4%" trend="-0.2%" icon={Clock} color="text-status-warning" />
          <KPICard title="Quality Rate" value="99.1%" trend="+0.5%" icon={Zap} color="text-status-healthy" />
          <KPICard title="Output" value="1,240" trend="+124" icon={TrendingUp} color="text-status-healthy" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Production Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-text-primary flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Hourly Production Throughput
              </h3>
              <select className="bg-background border border-border text-[10px] rounded px-2 py-1 text-text-secondary">
                <option>Last 8 Hours</option>
                <option>Last 24 Hours</option>
              </select>
            </div>
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={throughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--role-accent, #a855f7)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--role-accent, #a855f7)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#f4f4f5'
                    }} 
                    itemStyle={{ color: 'var(--role-accent, #a855f7)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--role-accent, #a855f7)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shift Summary */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Resource Allocation
            </h3>
            <div className="space-y-6">
              <ResourceStat label="Operator Utilization" value="92%" />
              <ResourceStat label="Energy Consumption" value="4.2 MWh" />
              <ResourceStat label="Maintenance Backlog" value="3 Tasks" />
              
              <div className="pt-4 border-t border-border">
                <h4 className="text-[10px] font-bold text-text-secondary uppercase mb-3 tracking-widest">Recent Events</h4>
                <ul className="space-y-3">
                  <li className="text-xs text-text-secondary flex">
                    <span className="w-1 h-1 rounded-full bg-status-critical mt-1.5 mr-2 shrink-0" />
                    Zone A down for 12m (Hydraulic Leak)
                  </li>
                  <li className="text-xs text-text-secondary flex">
                    <span className="w-1 h-1 rounded-full bg-status-healthy mt-1.5 mr-2 shrink-0" />
                    Shift target exceeded by 4.2%
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function KPICard({ title, value, trend, icon: Icon, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-[var(--role-accent)]/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-background rounded-lg border border-border">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-status-healthy' : 'text-status-warning'}`}>
          {trend}
        </span>
      </div>
      <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-2xl font-bold text-text-primary tracking-tight">{value}</p>
    </div>
  );
}

function ResourceStat({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-semibold">{value}</span>
      </div>
        <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
          <div className="h-full w-[85%]" style={{ backgroundColor: 'var(--role-accent)' }} />
      </div>
    </div>
  );
}
