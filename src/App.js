import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupForm from './SignupForm';
import WeeklyList from './WeeklyList';
import YearlyStats from './YearlyStats';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupForm />} />
        <Route path="/weekly" element={<WeeklyList />} />
        <Route path="/stats" element={<YearlyStats />} />
      </Routes>
    </Router>
  );
}

export default App;