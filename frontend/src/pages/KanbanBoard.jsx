import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';

export default function KanbanBoard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Form State for New/Edit Job
  const [jobForm, setJobForm] = useState({ id: null, title: '', description: '', must_have_skills: '' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      const [jobsRes, appsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/jobs', { headers }),
        axios.get('http://localhost:5000/api/applications', { headers })
      ]);

      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response && error.response.status === 401) handleLogout();
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); 
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (jobForm.id) {
        await axios.put(`http://localhost:5000/api/jobs/${jobForm.id}`, jobForm, { headers });
      } else {
        await axios.post('http://localhost:5000/api/jobs', jobForm, { headers });
      }
      
      setJobForm({ id: null, title: '', description: '', must_have_skills: '' });
      setIsPostModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Failed to save job.");
    }
  };

  const handleEditJob = (job) => {
    setJobForm({ id: job.id, title: job.title, description: job.description, must_have_skills: job.must_have_skills });
    setIsManageModalOpen(false);
    setIsPostModalOpen(true);
  };

  const handleDeleteJob = async (jobId) => {
    if(!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchData();
    } catch (error) {
      alert("Failed to delete job.");
    }
  };

  const updateApplicationStatus = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/applications/${appId}/status`, 
        { status: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const filteredApps = selectedJobFilter 
    ? applications.filter(app => app.job_id.toString() === selectedJobFilter.toString())
    : applications;

  const renderColumn = (title, statusValue) => {
    const columnApps = filteredApps.filter(app => (app.status || '').toLowerCase() === statusValue.toLowerCase());

    return (
      <div style={{ flex: 1, backgroundColor: '#f4f5f7', padding: '20px', borderRadius: '10px', minWidth: '300px' }}>
        <h3 style={{ textAlign: 'center', color: '#333', marginBottom: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
          {title} <span style={{ backgroundColor: '#0056b3', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', marginLeft: '10px' }}>{columnApps.length}</span>
        </h3>
        
        {columnApps.map(app => (
          <div key={app.id} style={{ marginBottom: '15px' }}>
            <JobCard candidate={app} onClick={() => {}} />
            
            <select 
              value={(app.status || '').toLowerCase()} 
              onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '-8px',
                border: '1px solid #e0e0e0',
                borderTop: 'none',
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px',
                backgroundColor: '#f8f9fa',
                color: '#333',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <option value="applied">Applied</option>
              <option value="reviewed">Reviewed</option>
              <option value="interviewed">Interviewed</option>
            </select>
          </div>
        ))}
        {columnApps.length === 0 && <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>No candidates yet.</p>}
      </div>
    );
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>Loading Employer Board...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'Arial, sans-serif' }}>
      <Navbar title="Employer Portal" onLogout={handleLogout} />
      
      <div style={{ flex: '1', padding: '30px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Header & Controls */}
        <div style={{ backgroundColor: 'white', padding: '20px 30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', color: '#1a1a1a', fontSize: '1.8rem' }}>Hiring Dashboard</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>Manage your jobs and review applicant match scores.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <select 
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              style={{ 
                padding: '10px 15px', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db', 
                backgroundColor: '#ffffff', 
                color: '#111827',
                cursor: 'pointer', 
                fontSize: '0.95rem', 
                minWidth: '220px',
                fontWeight: '500'
              }}
            >
              <option value="" style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                All My Jobs ({jobs.length})
              </option>

              {Array.isArray(jobs) && jobs.map(job => (
                <option key={job.id} value={job.id} style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                  {job.title}
                </option>
              ))}
            </select>

            <button 
              onClick={() => setIsManageModalOpen(true)}
              style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Manage Jobs
            </button>

            <button 
              onClick={() => { setJobForm({ id: null, title: '', description: '', must_have_skills: '' }); setIsPostModalOpen(true); }}
              style={{ padding: '10px 20px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,86,179,0.2)' }}
            >
              + Post New Job
            </button>
          </div>
        </div>

        {/* Kanban Columns */}
        <div style={{ display: 'flex', gap: '25px', overflowX: 'auto', paddingBottom: '15px' }}>
          {renderColumn("📥 Applied", "applied")}
          {renderColumn("👀 Reviewed", "reviewed")}
          {renderColumn("💬 Interviewed", "interviewed")}
        </div>
      </div>

      <Footer />

      {/* Modal: Post/Edit Job */}
      {isPostModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, color: '#111827' }}>{jobForm.id ? "Edit Job Post" : "Create New Job"}</h2>
            <form onSubmit={handleSaveJob} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input required type="text" placeholder="Job Title (e.g. Data Analyst)" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <textarea required placeholder="Job Description" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', minHeight: '100px' }} />
              <input required type="text" placeholder="Must Have Skills (comma separated, e.g. excel, python, sql)" value={jobForm.must_have_skills} onChange={e => setJobForm({...jobForm, must_have_skills: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsPostModalOpen(false)} style={{ padding: '10px 20px', backgroundColor: '#f1f3f5', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{jobForm.id ? "Update Job" : "Post Job"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage Active Jobs */}
      {isManageModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#111827', textAlign: 'center', fontSize: '1.5rem', fontWeight: '700' }}>Manage Active Jobs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
              {jobs.map(job => (
                <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '1rem' }}>{job.title}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditJob(job)} style={{ padding: '8px 14px', backgroundColor: '#0056b3', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Edit</button>
                    <button onClick={() => handleDeleteJob(job.id)} style={{ padding: '8px 14px', backgroundColor: '#dc3545', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Delete</button>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>You have no active jobs.</p>}
            </div>
            <button onClick={() => setIsManageModalOpen(false)} style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#4b5563', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>Close Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}