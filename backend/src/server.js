const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('./config/db');
const pdf = require('pdf-parse'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('./middlewares/authMiddleware');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_development_key';
const app = express();

app.use(cors());
app.use(express.json());
// --- Configure Multer for File Uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- Health Check ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Node.js Backend is running.' });
});

// --- Employer Route: Create a New Job Posting ---
app.post('/api/jobs', verifyToken, async (req, res) => {
    const { title, description, must_have_skills } = req.body;
    const employerId = req.user.userId; 

    try {
        const queryText = `
            INSERT INTO jobs (employer_id, title, description, must_have_skills) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`;
        const result = await db.query(queryText, [employerId, title, description, must_have_skills]);
        res.status(201).json({ message: "Job posted successfully", job: result.rows[0] });
    } catch (err) {
        console.error("Job Creation Error:", err);
        res.status(500).json({ error: 'Failed to create job posting.' });
    }
});

// 1. Fetch ONLY jobs created by the logged-in employer
app.get('/api/jobs', verifyToken, async (req, res) => {
    try {
        const employerId = req.user.userId;
        const result = await db.query(
            'SELECT * FROM jobs WHERE employer_id = $1 ORDER BY id DESC', 
            [employerId]
        );
        res.status(200).json(result.rows || []);
    } catch (err) {
        console.error("Fetch Jobs Error:", err);
        res.status(500).json({ error: 'Failed to fetch jobs.' });
    }
});

// --- Candidate Route: Handle Applying & Resume Upload (Dynamic AI Matching) ---
app.post('/api/applications', verifyToken, upload.single('resume'), async (req, res) => {
    const candidateId = req.user.userId;
    const userRole = req.user.role; 

    //  EMPLOYER CHECK: Employers cannot apply for jobs
    if (userRole === 'employer') {
        return res.status(403).json({ error: 'Employers cannot apply for jobs. Please use a candidate account.' });
    }

    const jobId = req.body.jobId || req.body.job_id;
    let matchScore = 0; 
    let extractedPhone = 'N/A';

    if (!jobId) return res.status(400).json({ error: "Missing Job ID." });

    let jobRequirements = [];
    try {
        const jobResult = await db.query(`SELECT must_have_skills FROM jobs WHERE id = $1`, [jobId]);
        if (jobResult.rows.length > 0) {
            jobRequirements = jobResult.rows[0].must_have_skills.split(',').map(skill => skill.trim().toLowerCase());
        }
    } catch (err) {
        console.error("Error fetching job requirements:", err);
    }

    if (req.file) {
        const absoluteFilePath = path.resolve(req.file.path); 
        
        //  PHONE EXTRACTION: Read PDF and extract Phone Number
        try {
            const dataBuffer = fs.readFileSync(absoluteFilePath);
            const pdfData = await pdf(dataBuffer);
            const resumeText = pdfData.text;
            
            // Regex to find 10 digit phone numbers with optional country code/spaces
            const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
            const phoneMatch = resumeText.match(phoneRegex);
            extractedPhone = phoneMatch ? phoneMatch[0].trim() : 'N/A';
        } catch (err) {
            console.error("PDF Parsing Error (Phone extraction):", err.message);
        }

        //  AI MATCHING: Send to Python Server
        if (jobRequirements.length > 0) {
            try {
                const pythonResponse = await axios.post('http://localhost:8000/parse-and-match', {
                    file_path: absoluteFilePath,
                    job_requirements: jobRequirements 
                });
                matchScore = pythonResponse.data.match_score;
            } catch (err) {
                console.error("Python AI Error:", err.message);
            }
        }
    }

    try {
        //  SAVE APPLICATION WITH PHONE NUMBER
        const queryText = `INSERT INTO applications (job_id, candidate_id, status, match_score, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const result = await db.query(queryText, [jobId, candidateId, 'applied', matchScore, extractedPhone]);
        res.status(201).json({ message: "Successfully applied!", application: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: "Already applied." });
        console.error("Database Insert Error:", err);
        res.status(500).json({ error: 'Failed to process application.' });
    }
});

// 2. Fetch ONLY applicants for jobs belonging to this logged-in employer
app.get('/api/applications', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role; 

        let queryText = "";
        let queryParams = [];

        if (userRole === 'employer') {
            //  EMPLOYER: Get applications for their jobs with clean candidate mapping
            queryText = `
                SELECT 
                    a.id, 
                    a.job_id, 
                    a.candidate_id, 
                    a.phone, 
                    COALESCE(u.name, 'Unknown Candidate') AS "candidateName",
                    COALESCE(u.email, 'No Email Found') AS "candidateEmail",
                    j.title AS role, 
                    COALESCE(a.match_score, 0) AS score, 
                    a.status 
                FROM applications a
                INNER JOIN jobs j ON a.job_id = j.id
                LEFT JOIN users u ON a.candidate_id = u.id
                WHERE j.employer_id = $1
                ORDER BY a.match_score DESC NULLS LAST;
            `;
            queryParams = [userId];
        } else {
            //  CANDIDATE: Show only their own applications
            queryText = `
                SELECT 
                    a.id, 
                    a.job_id, 
                    a.candidate_id, 
                    a.phone,
                    j.title AS role, 
                    COALESCE(a.match_score, 0) AS score, 
                    a.status 
                FROM applications a
                LEFT JOIN jobs j ON a.job_id = j.id
                WHERE a.candidate_id = $1 
                ORDER BY a.id DESC;
            `;
            queryParams = [userId];
        }

        const result = await db.query(queryText, queryParams);
        res.status(200).json(result.rows || []);
    } catch (err) {
        console.error("Database Fetch Error:", err);
        res.status(500).json({ error: 'Failed to retrieve applications.' });
    }
});

// --- Employer Route: Update an Existing Job ---
app.put('/api/jobs/:id', verifyToken, async (req, res) => {
    const jobId = req.params.id;
    const employerId = req.user.userId;
    const { title, description, must_have_skills } = req.body;

    try {
        const queryText = `
            UPDATE jobs 
            SET title = $1, description = $2, must_have_skills = $3 
            WHERE id = $4 AND employer_id = $5 
            RETURNING *`;
            
        const result = await db.query(queryText, [title, description, must_have_skills, jobId, employerId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Job not found or unauthorized to edit." });
        }
        
        res.status(200).json({ message: "Job updated successfully", job: result.rows[0] });
    } catch (err) {
        console.error("Job Update Error:", err);
        res.status(500).json({ error: 'Failed to update job posting.' });
    }
});

// --- Employer Route: Delete a Job ---
app.delete('/api/jobs/:id', verifyToken, async (req, res) => {
    const jobId = req.params.id;
    const employerId = req.user.userId;

    try {
        const queryText = `DELETE FROM jobs WHERE id = $1 AND employer_id = $2 RETURNING *`;
        const result = await db.query(queryText, [jobId, employerId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Job not found or unauthorized to delete." });
        }

        res.status(200).json({ message: "Job deleted successfully" });
    } catch (err) {
        console.error("Job Deletion Error:", err);
        res.status(500).json({ error: 'Failed to delete job posting.' });
    }
});

// --- AUTHENTICATION: Register a New User ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const queryText = `
            INSERT INTO users (name, email, password, role) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, name, email, role`;
            
        const result = await db.query(queryText, [name, email, hashedPassword, role]);
        
        res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
    } catch (err) {
        console.error("Registration Error:", err);
        if (err.code === '23505') {
            return res.status(400).json({ error: "Email already exists." });
        }
        res.status(500).json({ error: "Failed to register user." });
    }
});

// --- AUTHENTICATION: Login ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const queryText = `SELECT * FROM users WHERE email = $1`;
        const result = await db.query(queryText, [email]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
            role: user.role, 
            user: { id: user.id, name: user.name }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Failed to log in." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend API listening on port ${PORT}`);
});