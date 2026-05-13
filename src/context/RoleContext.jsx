import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const ROLES = {
  OPERATOR: 'Operator',
  ENGINEER: 'Engineer',
  MANAGER: 'Manager',
};

export const ROLE_THEMES = {
  [ROLES.OPERATOR]: {
    accent: '#22C55E', // Healthy green
    accentSoft: 'rgba(34, 197, 94, 0.1)',
    label: 'Operations Mode',
    description: 'Real-time monitoring and alarm response focus.',
    permissions: ['view_alarms', 'ack_alarms', 'view_telemetry']
  },
  [ROLES.ENGINEER]: {
    accent: '#3B82F6', // Selected blue
    accentSoft: 'rgba(59, 130, 246, 0.1)',
    label: 'Engineering Mode',
    description: 'Performance optimization and technical analysis focus.',
    permissions: ['view_telemetry', 'view_logs', 'calibrate_sensors', 'edit_config']
  },
  [ROLES.MANAGER]: {
    accent: '#A855F7', // Purple
    accentSoft: 'rgba(168, 85, 247, 0.1)',
    label: 'Management Mode',
    description: 'Key performance indicators and resource overview focus.',
    permissions: ['view_kpis', 'view_reports', 'manage_users']
  },
};

export function RoleProvider({ children }) {
  const [role, setRole] = useState(ROLES.OPERATOR);

  const hasPermission = (permission) => {
    return ROLE_THEMES[role].permissions.includes(permission);
  };

  // Update CSS variables when role changes
  useEffect(() => {
    const theme = ROLE_THEMES[role];
    document.documentElement.style.setProperty('--role-accent', theme.accent);
    document.documentElement.style.setProperty('--role-accent-soft', theme.accentSoft);
  }, [role]);

  return (
    <RoleContext.Provider value={{ 
      role, 
      setRole, 
      theme: ROLE_THEMES[role],
      hasPermission 
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
