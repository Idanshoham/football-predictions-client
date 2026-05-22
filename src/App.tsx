import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Leaderboard } from './pages/Leaderboard';
import { Matches } from './pages/Matches';
import { Live } from './pages/Live';
import { Tournament } from './pages/Tournament';
import { Me } from './pages/Me';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Leaderboard />} />
        <Route path="matches" element={<Matches />} />
        <Route path="live" element={<Live />} />
        <Route path="tournament" element={<Tournament />} />
        <Route path="me" element={<Me />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
