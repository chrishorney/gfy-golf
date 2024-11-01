import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupForm from './SignupForm';
import WeeklyList from './WeeklyList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupForm />} />
        <Route path="/weekly" element={<WeeklyList />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;