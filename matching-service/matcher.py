from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_match_score(candidate_skills: list, job_requirements: list) -> float:
    """
    Uses Cosine Similarity between job requirement vectors and candidate skill vectors.
    Outputs a percentage score.
    """
    if not candidate_skills or not job_requirements:
        return 0.0

    # Convert lists to space-separated strings for the vectorizer
    candidate_text = " ".join(candidate_skills)
    job_text = " ".join(job_requirements)

    vectorizer = TfidfVectorizer()
    
    try:
        # Create vectors for both the candidate and the job
        tfidf_matrix = vectorizer.fit_transform([job_text, candidate_text])
        
        # Calculate cosine similarity between the two vectors
        similarity_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        
        # Extract the raw float score and convert to a percentage
        raw_score = similarity_matrix[0][0]
        percentage_score = round(raw_score * 100, 2)
        
        return percentage_score
        
    except ValueError:
        # Handles cases where vocabulary is empty
        return 0.0