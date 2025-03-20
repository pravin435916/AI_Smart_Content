from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi
import uvicorn
import os

# Create FastAPI app
app = FastAPI(title="Content Summarizer API", 
              description="API for YouTube video analysis, summary and quiz generation")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Configure API keys
GENAI_API_KEY = os.environ.get("GENAI_API_KEY", "AIzaSyAa4NuK4tAmtxBL3-TvxEdcgC1M2xH3WuY")
YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "AIzaSyBcyuPjWN6rKM6i6EUwjz13hh6qEpz6pBE")

# Initialize Gemini AI
genai.configure(api_key=GENAI_API_KEY)

# Define request models
class VideoURL(BaseModel):
    url: str

# Helper functions
def extract_video_id(url):
    """Extract YouTube video ID from URL"""
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    return None

def get_video_metadata(video_id):
    """Fetch video metadata from YouTube API"""
    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    request = youtube.videos().list(
        part="snippet,statistics",
        id=video_id
    )
    response = request.execute()

    if "items" in response and len(response["items"]) > 0:
        video = response["items"][0]
        return {
            "title": video["snippet"]["title"],
            "description": video["snippet"]["description"],
            "views": video["statistics"].get("viewCount", "N/A"),
            "likes": video["statistics"].get("likeCount", "N/A"),
            "comments": video["statistics"].get("commentCount", "N/A"),
            "thumbnail": video["snippet"]["thumbnails"]["high"]["url"],
            "channel": video["snippet"]["channelTitle"],
            "published_at": video["snippet"]["publishedAt"],
        }
    return None

def get_video_transcript(video_id):
    """Fetch video transcript using YouTube Transcript API"""
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join([t["text"] for t in transcript])
    except Exception as e:
        return f"Transcript not available: {str(e)}"

def summarize_text(text):
    """Summarize text using Gemini Pro 1.5"""
    if "Transcript not available" in text:
        return text
    
    prompt = f"""Generate a concise summary of the following transcript. 
    Focus on the main points and key takeaways. The summary should be clear, 
    informative, and about 150-250 words.
    
    Here's the transcript:
    {text[:4000]}...
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def generate_quiz_questions(text):
    """Generate quiz questions using Gemini AI"""
    prompt = f"""Generate 5 multiple-choice quiz questions based on this video transcript. 
    Format the response as JSON with the following structure:
    [
      {{
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Correct option text here"
      }}
    ]
    
    Here's the transcript:
    {text[:2000]}...
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating questions: {str(e)}"

# API Routes
@app.post("/api/metadata")
async def get_metadata(video_data: VideoURL):
    url = video_data.url
    
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    metadata = get_video_metadata(video_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Could not retrieve video metadata")
    
    return {"metadata": metadata}

@app.post("/api/summary")
async def get_summary(video_data: VideoURL):
    url = video_data.url
    
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    transcript = get_video_transcript(video_id)
    if "Transcript not available" in transcript:
        raise HTTPException(status_code=404, detail=transcript)
    
    summary = summarize_text(transcript)
    
    return {
        "summary": summary,
        "transcript_preview": transcript[:500] + "..." if len(transcript) > 500 else transcript
    }

@app.post("/api/generate-questions")
async def get_questions(video_data: VideoURL):
    url = video_data.url
    
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    transcript = get_video_transcript(video_id)
    if "Transcript not available" in transcript:
        raise HTTPException(status_code=404, detail=transcript)
    
    questions = generate_quiz_questions(transcript)
    
    return {"questions": questions}

@app.post("/api/full-analysis")
async def full_analysis(video_data: VideoURL):
    url = video_data.url
    
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    # Get metadata
    metadata = get_video_metadata(video_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Could not retrieve video metadata")
    
    # Get transcript
    transcript = get_video_transcript(video_id)
    transcript_error = None
    
    if "Transcript not available" in transcript:
        transcript_error = transcript
        summary = None
        questions = None
    else:
        # Generate summary
        summary = summarize_text(transcript)
        
        # Generate quiz questions
        questions = generate_quiz_questions(transcript)
    
    return {
        "metadata": metadata,
        "transcript_error": transcript_error,
        "summary": summary,
        "transcript_preview": transcript[:500] + "..." if len(transcript) > 500 and "Transcript not available" not in transcript else None,
        "questions": questions
    }

# Root endpoint for API health check
@app.get("/")
async def root():
    return {"status": "API is running", "version": "1.0.0"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)