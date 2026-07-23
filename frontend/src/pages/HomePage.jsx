// frontend/src/pages/HomePage.jsx
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      backgroundColor: '#ffffff', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
    }}>
      
      {/* Public Navigation Bar */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px', 
        borderBottom: '1px solid #eaeaea' 
      }}>
        <h2 style={{ margin: 0, color: '#0056b3', fontWeight: '800', letterSpacing: '-0.5px' }}>
          JobBoard.
        </h2>
        <div>
          <button 
            onClick={() => navigate('/login')} 
            style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: '#333', fontWeight: '600', cursor: 'pointer', marginRight: '10px' }}
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/login')} 
            style={{ padding: '10px 20px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Hero Section */}
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '80px 20px', 
        textAlign: 'center' 
      }}>
        <h1 style={{ fontSize: '3.5rem', color: '#1a1a1a', marginBottom: '20px', fontWeight: '800' }}>
          Find Your Next Job
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '60px', maxWidth: '600px', lineHeight: '1.6' }}>
          A professional platform connecting qualified Candidates with top Employers. Join today to start your journey.
        </p>

        {/* Action Cards Container */}
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {/* Candidate Card */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '40px', 
            borderRadius: '16px', 
            border: '1px solid #eaeaea', 
            width: '320px', 
            textAlign: 'left',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
          }}>
            <h2 style={{ color: '#2d3436', marginTop: 0, marginBottom: '15px' }}>For Candidates</h2>
            <p style={{ color: '#636e72', marginBottom: '30px', lineHeight: '1.6' }}>
              Browse open jobs, showcase your skills, and apply with your professional profile instantly.
            </p>
            <button 
              onClick={() => navigate('/login')} 
              style={{ width: '100%', padding: '14px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '600' }}
            >
              Find Jobs
            </button>
          </div>

          {/* Employer Card */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '40px', 
            borderRadius: '16px', 
            border: '1px solid #eaeaea', 
            width: '320px', 
            textAlign: 'left',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
          }}>
            <h2 style={{ color: '#2d3436', marginTop: 0, marginBottom: '15px' }}>For Employers</h2>
            <p style={{ color: '#636e72', marginBottom: '30px', lineHeight: '1.6' }}>
              Post new job listings, review AI-matched candidates, and manage your hiring pipeline.
            </p>
            <button 
              onClick={() => navigate('/login')} 
              style={{ width: '100%', padding: '14px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '600' }}
            >
              Post Jobs
            </button>
          </div>

        </div>
      </div>

      {/* Shared Footer */}
      <Footer />
      
    </div>
  );
}