from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn
import PyPDF2
import os
import re

app = FastAPI(title="RojgarDwar AI Parser")

class MatchRequest(BaseModel):
    file_path: str
    job_requirements: List[str]

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + " "
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return text.lower()

@app.post("/parse-and-match")
def parse_and_match(request: MatchRequest):
    if not os.path.exists(request.file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    resume_text = extract_text_from_pdf(request.file_path)
    extracted_skills = []
    
    for req in request.job_requirements:
        skill = req.strip().lower()
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, resume_text):
            extracted_skills.append(skill)
            
    total_reqs = len(request.job_requirements)
    match_score = int((len(extracted_skills) / total_reqs) * 100) if total_reqs > 0 else 0
    
    return {"match_score": match_score, "extracted_skills": extracted_skills}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)