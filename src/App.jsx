import { AlarmProvider } from "./context/AlarmContext";
import { MainLayout } from "./components/layout/MainLayout";

function App() {
  return (
    <AlarmProvider>
      <MainLayout />
    </AlarmProvider>
  );
}

export default App;
