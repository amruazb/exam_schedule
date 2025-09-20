import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './AppContext.jsx';
import Layout from './Layout.jsx';
import Dashboard from './Dashboard.jsx';
import ExamSchedule from './ExamSchedule.jsx';
import Leaderboard from './Leaderboard.jsx';
import AdminPanel from './AdminPanel.jsx';
import CalendarView from './CalendarView.jsx';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<ExamSchedule />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;

