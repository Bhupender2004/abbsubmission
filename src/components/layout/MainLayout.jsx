import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RightPanel } from './RightPanel';
import { OperatorView } from '../views/OperatorView';
import { EngineerView } from '../views/EngineerView';
import { ManagerView } from '../views/ManagerView';
import { AlarmFeedView } from '../views/AlarmFeedView';
import { MapOnlyView } from '../views/MapOnlyView';
import { SettingsView } from '../views/SettingsView';
import { useRole, ROLES } from '../../context/RoleContext';

export function MainLayout() {
  const { role } = useRole();
  const [activeNav, setActiveNav] = useState('dashboard');

  // Determine which main content to render based on nav
  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        // Dashboard uses the role-specific view
        if (role === ROLES.OPERATOR) return <OperatorView />;
        if (role === ROLES.ENGINEER) return <EngineerView />;
        if (role === ROLES.MANAGER) return <ManagerView />;
        return <OperatorView />;

      case 'alarms':
        return <AlarmFeedView />;

      case 'map':
        return <MapOnlyView />;

      case 'analytics':
        return <ManagerView />;

      case 'settings':
        return <SettingsView />;

      default:
        return <OperatorView />;
    }
  };

  // Show right panel on dashboard, alarms, and map views
  const showRightPanel = ['dashboard', 'alarms', 'map'].includes(activeNav);

  return (
    <div className="h-screen w-screen flex bg-background overflow-hidden text-text-primary selection:bg-status-selected/30">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 flex overflow-hidden">
          {renderContent()}
          {showRightPanel && <RightPanel />}
        </div>
      </div>
    </div>
  );
}
