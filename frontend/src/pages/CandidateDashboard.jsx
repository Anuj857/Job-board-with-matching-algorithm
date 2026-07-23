import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CandidateDashboard() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // --- New State for Resume Upload Modal ---
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); 
  };

  // Opens the modal and remembers which job we are applying for
  const openApplyModal = (jobId) => {
    setSelectedJobId(jobId);
    setResumeFile(null);
    setIsApplyModalOpen(true);
  };

  // Handles the actual submission with the file attached
  const submitApplication = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
        alert("Please select a resume file (PDF) to upload.");
        return;
    }
    
    setIsApplying(true);
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('jobId', selectedJobId);
        formData.append('resume', resumeFile);
        
        const response = await axios.post('http://localhost:5000/api/applications', formData, { 
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
        });
        
        const score = response.data.application.match_score;
        alert(`Successfully applied! Your AI match score for this role is: ${score}%`);
        setIsApplyModalOpen(false);
    } catch (error) {
        alert(error.response?.data?.error || "Failed to apply.");
    } finally {
        setIsApplying(false);
    }
  };

  // Filter jobs based on search input
  const filteredJobs = jobs.filter(job =>
    (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.must_have_skills || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>Loading Available Jobs...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      <Navbar title="Candidate Portal" onLogout={handleLogout} />

      <div style={{ flex: '1', padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', color: '#1a1a1a', fontSize: '2.2rem' }}>Available Opportunities</h1>
            <p style={{ color: '#666', margin: 0, fontSize: '1.1rem' }}>Browse and apply for your next great role.</p>
          </div>
          <input 
            type="text" 
            placeholder="Search by role or skill..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '12px 20px', width: '350px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}
          />
        </div>

        {filteredJobs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', marginTop: '50px', fontSize: '1.2rem' }}>No jobs found matching your search.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {filteredJobs.map(job => (
              <div key={job.id} style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '12px', 
                border: '1px solid #eaeaea',
                boxShadow: '0 4px 6px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h2 style={{ margin: '0 0 10px 0', color: '#0056b3', fontSize: '1.4rem' }}>{job.title}</h2>
                  <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '20px', fontSize: '0.95rem' }}>
                    {job.description}
                  </p>
                  <div style={{ marginBottom: '25px', backgroundColor: '#f4f5f7', padding: '12px', borderRadius: '6px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Required Skills</strong>
                    <p style={{ margin: '5px 0 0 0', color: '#333', fontWeight: '600', fontSize: '0.95rem' }}>{job.must_have_skills}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => openApplyModal(job.id)}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontSize: '1.05rem', 
                    fontWeight: '600'
                  }}
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* --- Apply Modal with File Upload --- */}
      {isApplyModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', 
          alignItems: 'center', zIndex: 1000 
        }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, color: '#333' }}>Submit Application</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Please upload your resume to apply for this position. PDF format is highly recommended.</p>
            
            <form onSubmit={submitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ border: '1px dashed #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              {/* Fixed Buttons Section */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsApplyModalOpen(false)} 
                  disabled={isApplying}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#e2e8f0', 
                    color: '#334155', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontWeight: '600' 
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isApplying}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#0056b3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: isApplying ? 'not-allowed' : 'pointer', 
                    fontWeight: '600' 
                  }}
                >
                  {isApplying ? 'Uploading...' : 'Submit Resume'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}