import { AlarmProvider } from "./context/AlarmContext";
import { RoleProvider } from "./context/RoleContext";
import { MainLayout } from "./components/layout/MainLayout";

function App() {
  return (
    <RoleProvider>
      <AlarmProvider>
        <MainLayout />
      </AlarmProvider>
    </RoleProvider>
  );
}

export default App;

