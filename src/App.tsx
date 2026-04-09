import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { ActiveSession } from './pages/ActiveSession';
import { HistoryView } from './pages/HistoryView';
import { SessionDetailView } from './pages/SessionDetailView';

import { useEffect, useState } from 'react';
import { getJsonConfig } from './data/json/jsonConfig';
import { jsonDatabase } from './data/json/JsonDatabaseService';
import { get } from 'idb-keyval';

function App() {
  const [needsPermission, setNeedsPermission] = useState(false);

  useEffect(() => {
      const checkPermission = async () => {
          if (getJsonConfig().enabled) {
              const handle = await get('gymtracker_json_file_handle');
              if (handle) {
                  const valid = await jsonDatabase.hasValidHandle();
                  if (!valid) {
                      setNeedsPermission(true);
                  } else {
                      // Init DB if permission is already good
                      await jsonDatabase.init();
                  }
              }
          }
      };
      checkPermission();
  }, []);

  const handleGrant = async () => {
     if (await jsonDatabase.verifyPermission()) {
         setNeedsPermission(false);
         // Once granted, initialize the database
         await jsonDatabase.init();
     }
  };

  if (needsPermission) {
      return (
         <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col items-center justify-center p-6 text-center">
              <h1 className="text-2xl font-bold mb-4 text-gray-900">Database Connection Needs Refresh</h1>
              <p className="text-gray-600 mb-8 max-w-md">Your browser reset the secure connection to your JSON database file. Please click below to re-authorize the connection.</p>
              <button onClick={handleGrant} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-colors">Reconnect to File</button>
         </div>
      );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workout" element={<div className="p-6 text-center mt-20 text-gray-500 text-lg">Workout Hub (Coming soon)</div>} />
          <Route path="workout/:sessionId" element={<ActiveSession />} />
          <Route path="history" element={<HistoryView />} />
          <Route path="history/:sessionId" element={<SessionDetailView />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
