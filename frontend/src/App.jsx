// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import KanbanBoard from './pages/KanbanBoard';
import CandidateDashboard from './pages/CandidateDashboard';

function App() {
  return (
    <Router>
      <div className="app-container" style={{ backgroundColor: '#f4f5f7', minHeight: '100vh', margin: 0, padding: 0 }}>
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Auth Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard Routes */}
          <Route path="/employer" element={<KanbanBoard />} />
          <Route path="/candidate" element={<CandidateDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;