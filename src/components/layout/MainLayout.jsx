import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RightPanel } from './RightPanel';
import { AlarmFeed } from '../alarm/AlarmFeed';
import { PlantMap } from '../map/PlantMap';

export function MainLayout() {
  return (
    <div className="h-screen w-screen flex bg-background overflow-hidden text-text-primary selection:bg-status-selected/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 flex overflow-hidden">
          {/* Map + overlaid alarm feed */}
          <main className="flex-1 flex relative min-w-0">
            <PlantMap />
            {/* Alarm Feed overlay — positioned on left side of map */}
            <div className="absolute left-4 top-4 bottom-4 w-[380px] pointer-events-none z-10">
              <div className="h-full pointer-events-auto">
                <AlarmFeed />
              </div>
            </div>
          </main>
          {/* Right context panel */}
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
