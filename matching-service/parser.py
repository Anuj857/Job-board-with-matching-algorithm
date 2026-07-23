import spacy
import pdfplumber

# Load the pre-trained English NLP model
nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(file_path: str) -> str:
    """Reads a PDF file and extracts all raw text."""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + " "
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def extract_skills_from_text(text: str) -> list:
    """Parses text using spaCy NER to extract skills."""
    doc = nlp(text.lower())
    
    # Expanded skill database including core data structures, algorithms, and development tools
    mock_skill_database = {
        "python", "java", "react", "node.js", "machine learning", "sql", "postgresql", 
        "reactjs", "android studio", "data analytics", "arrays", "linked lists", 
        "trees", "graphs", "sorting", "searching", "dynamic programming"
    }
    
    extracted_skills = []
    for token in doc:
        if token.text in mock_skill_database:
            extracted_skills.append(token.text)
            
    return list(set(extracted_skills))