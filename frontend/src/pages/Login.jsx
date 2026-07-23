// frontend/src/pages/Login.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('candidate');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password, role };

    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, payload);
      
      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.role);
        
        if (response.data.role === 'employer') {
          navigate('/employer');
        } else {
          navigate('/candidate');
        }
      } else {
        alert("Registration successful! Please log in.");
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert(error.response?.data?.message || "Authentication failed.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f5f7', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* Simple Header */}
      <nav style={{ padding: '20px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #eaeaea', textAlign: 'center' }}>
        <h2 
          onClick={() => navigate('/')} 
          style={{ margin: 0, color: '#0056b3', cursor: 'pointer', fontWeight: '800' }}
        >
          JobBoard.
        </h2>
      </nav>

      {/* Auth Card */}
      <div style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
          
          <h2 style={{ textAlign: 'center', color: '#1a1a1a', marginBottom: '30px' }}>
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {!isLogin && (
              <>
                <input 
                  type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required 
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} 
                />
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid #ddd', 
                    fontSize: '1rem', 
                    backgroundColor: '#ffffff', 
                    color: '#111827',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="candidate" style={{ backgroundColor: '#ffffff', color: '#111827' }}>I am looking for a job (Candidate)</option>
                  <option value="employer" style={{ backgroundColor: '#ffffff', color: '#111827' }}>I am hiring (Employer)</option>
                </select>
              </>
            )}

            <input 
              type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} 
            />
            <input 
              type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} 
            />

            <button 
              type="submit" 
              style={{ padding: '14px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' }}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}