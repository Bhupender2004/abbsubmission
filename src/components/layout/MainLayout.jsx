import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RightPanel } from './RightPanel';
import { OperatorView } from '../views/OperatorView';
import { EngineerView } from '../views/EngineerView';
import { ManagerView } from '../views/ManagerView';
import { useRole, ROLES } from '../../context/RoleContext';

export function MainLayout() {
  const { role } = useRole();

  return (
    <div className="h-screen w-screen flex bg-background overflow-hidden text-text-primary selection:bg-status-selected/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 flex overflow-hidden">
          {/* Main View Area with Role-Based Abstraction */}
          {role === ROLES.OPERATOR && <OperatorView />}
          {role === ROLES.ENGINEER && <EngineerView />}
          {role === ROLES.MANAGER && <ManagerView />}

          {/* Right context panel — shared across roles but internally role-aware */}
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
