import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { ActiveSession } from './pages/ActiveSession';
import { HistoryView } from './pages/HistoryView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workout" element={<div className="p-6 text-center mt-20 text-gray-500 text-lg">Workout Hub (Coming soon)</div>} />
          <Route path="workout/:sessionId" element={<ActiveSession />} />
          <Route path="history" element={<HistoryView />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
