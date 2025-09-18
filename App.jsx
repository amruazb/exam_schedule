import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExamSchedule from './components/ExamSchedule';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import CalendarView from './components/CalendarView';
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

