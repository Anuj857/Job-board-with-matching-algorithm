// frontend/src/pages/EmployerDashboard.jsx
import { useState } from 'react';
import axios from 'axios';

export default function EmployerDashboard() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mustHaveSkills: '' // We will take this as a comma-separated string from the user
  });
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert the comma-separated string into an array for the database
    const skillsArray = formData.mustHaveSkills
      .split(',')
      .map(skill => skill.trim().toLowerCase());

    const payload = {
      title: formData.title,
      description: formData.description,
      must_have_skills: skillsArray,
      // Hardcoding employer_id to 1 for testing purposes until full JWT login is wired up on the frontend
      employer_id: 1 
    };

    try {
      // In production, you would attach the JWT token in the headers here
      const response = await axios.post('http://localhost:5000/api/jobs', payload);
      
      if (response.status === 201) {
        setStatusMessage('Job successfully posted!');
        setFormData({ title: '', description: '', mustHaveSkills: '' }); // Reset form
      }
    } catch (error) {
      console.error("Error posting job:", error);
      setStatusMessage('Failed to post the job. Is the backend running?');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Employer Dashboard</h2>
      <p>Post a new job opportunity with structured requirements.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label><strong>Job Title</strong></label><br />
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label><strong>Job Description</strong></label><br />
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            required 
            rows="4"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label><strong>Must-Have Skills (comma separated)</strong></label><br />
          <input 
            type="text" 
            name="mustHaveSkills" 
            placeholder="e.g., Python, React, PostgreSQL"
            value={formData.mustHaveSkills} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}>
          Post Job
        </button>
      </form>

      {statusMessage && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{statusMessage}</p>}
    </div>
  );
}