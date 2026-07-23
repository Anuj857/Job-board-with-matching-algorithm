from fastapi import FastAPI
from pydantic import BaseModel
from parser import extract_text_from_pdf, extract_skills_from_text
from matcher import calculate_match_score

app = FastAPI()

class MatchRequest(BaseModel):
    file_path: str
    job_requirements: list

@app.get("/")
def read_root():
    return {"status": "Python Matching Engine is running smoothly."}

@app.post("/parse-and-match")
def parse_and_match(request: MatchRequest):
    # 1. Read the physical PDF file using the path provided by Node.js
    raw_text = extract_text_from_pdf(request.file_path)
    
    # 2. Extract skills using spaCy
    candidate_skills = extract_skills_from_text(raw_text)
    
    # 3. Calculate the cosine similarity match score against job requirements
    match_percentage = calculate_match_score(candidate_skills, request.job_requirements)
    
    return {
        "extracted_skills": candidate_skills,
        "match_score": match_percentage
    }