# Job Board with Matching Algorithm

An AI-powered job board and applicant tracking platform that connects candidates with relevant job opportunities and helps employers manage applicants through a hiring pipeline.

The project combines a React frontend, Node.js/Express backend, PostgreSQL database, and a Python resume-processing microservice. Candidates can upload resumes when applying, while the backend sends the resume to the Python service to extract text and calculate a job-match percentage from the job's required skills.

## 🚀 Key Features

### 👤 Candidate

- Candidate registration and login
- Browse available jobs
- Search jobs by role or skill
- Apply for jobs
- Upload a resume while applying
- Receive an AI-generated match score for the selected job
- Track application status
- View candidate-specific application information

### 🏢 Employer

- Employer registration and login
- Create job listings
- Edit and delete job listings
- View submitted applications
- View candidate names and applied roles
- View candidate match scores
- Manage candidates through a Kanban-style hiring pipeline
- Move candidates through application stages

### 🤖 Resume Matching

- Resume upload through the candidate dashboard
- PDF resume text extraction
- Extraction of skills based on the job's required skills
- Exact word-boundary matching to reduce incorrect matches
- Match score calculated as a percentage
- Match score stored with the application in PostgreSQL
- Employer dashboard displays ranked candidates by match score

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │   Candidate /       │
                    │   Employer          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   Vite              │
                    │   Port: 5173       │
                    └──────────┬──────────┘
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │ Backend             │
                    │ Port: 5000         │
                    └───────┬─────┬───────┘
                            │     │
              ┌─────────────┘     └──────────────┐
              ▼                                  ▼
   ┌─────────────────────┐             ┌─────────────────────┐
   │    PostgreSQL       │             │ Python AI Service   │
   │    Database         │             │ FastAPI             │
   │                     │             │ Port: 8000          │
   └─────────────────────┘             └──────────┬──────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────────┐
                                        │ Resume PDF Parser   │
                                        │ + Skill Matching    │
                                        └─────────────────────┘
```

## 🔄 Application Matching Flow

1. An employer creates a job and specifies required skills.
2. A candidate browses available jobs.
3. The candidate clicks **Apply Now**.
4. The candidate uploads a resume.
5. The React frontend sends the job ID and resume using `FormData`.
6. The Node.js backend receives the application and resume.
7. The backend retrieves the job's `must_have_skills` from PostgreSQL.
8. The backend sends the resume path and required skills to the Python service.
9. The Python service extracts text from the PDF.
10. Required skills are searched in the extracted resume text.
11. A match percentage is calculated.
12. The Node.js backend stores the score in the `applications` table.
13. The candidate receives the match score.
14. The employer dashboard displays the candidate's name, role, status, and match score.

## 🧮 Matching Algorithm

The current matching service calculates the score based on how many required skills are found in the resume.

```text
Match Score =
(Number of matched required skills / Total required skills) × 100
```

### Example

Suppose a job requires:

```text
React, JavaScript, Python, PostgreSQL
```

The candidate's resume contains:

```text
React, JavaScript, Python
```

Then:

```text
Matched skills = 3
Required skills = 4

Match Score = (3 / 4) × 100
            = 75%
```

The Python service uses exact word-boundary matching so that short skills do not incorrectly match inside unrelated words.

## 🛠️ Technology Stack

### Frontend

- React.js
- Vite
- Axios
- React Router

### Backend

- Node.js
- Express.js
- REST API
- JWT-based authentication
- Multer for resume uploads
- Axios for Python-service communication

### AI / Resume Service

- Python
- FastAPI
- Uvicorn
- PyPDF2
- Regular expressions for skill matching

### Database

- PostgreSQL

## 📁 Project Structure

```text
JOB-BOARD-PLATFORM/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── JobCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── CandidateDashboard.jsx
│   │   │   └── ...
│   │   │
│   │   └── ...
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   └── server.js
│   ├── uploads/
│   └── package.json
│
├── python-ai-service/
│   ├── main.py
│   └── ...
│
├── .gitignore
└── README.md
```

> The exact folder structure may vary depending on the current implementation of the project.

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Anuj857/Job-board-with-matching-algorithm.git
cd Job-board-with-matching-algorithm
```

### 2. Configure PostgreSQL

Create a PostgreSQL database for the application.

Configure the database connection used by the Node.js backend.

The application requires relational data for users, jobs, and applications.

### 3. Start the Backend

```bash
cd backend
npm install
node src/server.js
```

The backend runs on:

```text
http://localhost:5000
```

### 4. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

### 5. Start the Python AI Service

Open another terminal:

```bash
cd python-ai-service
pip install fastapi uvicorn pydantic PyPDF2
python main.py
```

The Python service runs on:

```text
http://localhost:8000
```

The matching endpoint is:

```text
POST /parse-and-match
```

## 🔌 Main API Flow

### Candidate Application

```text
POST /api/applications
```

The request contains:

```text
jobId
resume
```

The resume is uploaded using `multipart/form-data`.

The backend then communicates with:

```text
POST http://localhost:8000/parse-and-match
```

with information similar to:

```json
{
  "file_path": "/path/to/resume.pdf",
  "job_requirements": [
    "react",
    "javascript",
    "python"
  ]
}
```

The Python service returns:

```json
{
  "match_score": 66,
  "extracted_skills": [
    "react",
    "javascript"
  ]
}
```

The resulting score is saved with the application.

## 📊 Employer Hiring Pipeline

The employer dashboard uses a Kanban-style workflow to manage candidates.

A typical application starts at:

```text
Applied
```

and can move through stages such as:

```text
Applied → Reviewed → Interviewed → Offered
```

Applications can be retrieved with candidate information and match scores, allowing employers to quickly identify stronger matches.

## 🔐 Authentication

The application supports separate candidate and employer roles.

Authentication uses a token-based flow, and protected API requests send the token through the `Authorization` header:

```text
Authorization: Bearer <token>
```

Role-based access helps separate candidate functionality from employer functionality.

## 📄 Resume Upload

Candidates can attach their resume during the application process.

The frontend accepts common resume formats including:

```text
PDF
DOC
DOCX
```

The current Python implementation specifically processes PDF files using PyPDF2.

## 📈 Current Project Capabilities

The project plan and implementation cover:

- Authentication
- Candidate dashboard
- Employer dashboard
- Job posting management
- Job searching
- Resume upload
- Resume text extraction
- Skill-based matching
- Match-score calculation
- PostgreSQL application storage
- Employer Kanban hiring pipeline
- Candidate name display
- Application status management

The project documentation also identifies possible extensions such as email notifications, saved searches, company profiles, interview scheduling, salary insights, analytics, mobile responsiveness, payments, subscriptions, and placement invoices.

## 🔮 Future Improvements

### AI Matching

The current matching approach is primarily keyword/skill based. It can be enhanced with:

- NLP-based skill extraction
- spaCy-based entity recognition
- TF-IDF vectors
- Cosine similarity
- Semantic embeddings
- Weighted must-have vs nice-to-have skills
- Experience-level matching
- Education matching

### Platform Improvements

Potential future improvements include:

- Email notifications
- Saved job searches
- Company profiles
- Google Calendar interview scheduling
- Salary insights
- Employer analytics
- Advanced candidate filtering
- Mobile optimization
- Stripe-based premium job postings
- Candidate subscription plans
- Automated recruitment invoices

## 🧪 End-to-End Test

To test the complete matching workflow:

1. Start the React frontend.
2. Start the Node.js backend.
3. Start the Python AI service.
4. Log in as an employer.
5. Create a job.
6. Add comma-separated required skills such as:

```text
React, JavaScript, Python
```

7. Log out and log in as a candidate.
8. Open the job.
9. Click **Apply Now**.
10. Upload a resume containing some of the required skills.
11. Submit the application.
12. Check the returned match score.
13. Log back into the employer portal.
14. Open the hiring pipeline.
15. Verify the candidate name, job role, application status, and match score.

## 🐛 Troubleshooting

### Match score is 0%

Check:

- The resume was uploaded successfully.
- The job contains `must_have_skills`.
- Required skills are comma-separated.
- The Python service is running on port `8000`.
- The Node.js backend can reach the Python service.
- The PDF contains selectable text.
- The application is saving `match_score` to PostgreSQL.

### Candidate does not appear on Employer Dashboard

Check:

- The application exists in PostgreSQL.
- `/api/applications` returns the new application.
- The employer dashboard refreshes its application data.
- The backend query joins the `users` and `jobs` tables correctly.

### Candidate name is not displayed

The employer application query should retrieve the candidate name from the users table and expose it as `candidateName`.

### Python service is not responding

Make sure:

```bash
python main.py
```

is running and that the service is available at:

```text
http://localhost:8000
```

## 🎯 Project Goal

The goal of this project is to build a smarter recruitment platform where candidates can discover relevant jobs and employers can identify suitable applicants faster using resume-based matching.

Instead of treating every application equally, the platform provides an additional match score that helps employers prioritize candidates according to the skills required for each role.

## 👨‍💻 Author

**Anuj Kumar Yadav**

B.Tech — Computer Science & Engineering

GitHub: [Anuj857](https://github.com/Anuj857)

## ⭐ Project

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

**Job Board with Matching Algorithm** — A full-stack recruitment platform with resume processing, skill-based matching, and applicant tracking.
