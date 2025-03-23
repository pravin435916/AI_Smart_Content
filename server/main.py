import whisper
import ffmpeg
import os
import groq
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = groq.Client(api_key=GROQ_API_KEY)

# Configure YouTube API key
YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "AIzaSyBcyuPjWN6rKM6i6EUwjz13hh6qEpz6pBE")

# Load Whisper Model
model = whisper.load_model("base", device="cpu")

# Initialize FastAPI app
app = FastAPI(title="Content Analysis API", 
              description="API for audio transcription and YouTube video analysis")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Download NLTK resources
nltk.download('punkt')
nltk.download('punkt_tab')

# Initialize Stemmer
stemmer = PorterStemmer()

# Define request models
class VideoURL(BaseModel):
    url: str

def clean_text(text):
    """Lowercase, remove punctuation, and tokenize."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)  # Remove punctuation
    return word_tokenize(text)

def transcribe_audio(audio_path):
    """
    Transcribes audio using Whisper model.
    """
    result = model.transcribe(audio_path, word_timestamps=True)
    
    # Extract detected language and transcription
    detected_lang = result["language"]
    transcription = result["text"]
    
    # Store words with timestamps
    word_segments = []
    for segment in result["segments"]:
        for word_info in segment["words"]:
            word_segments.append({
                "word": word_info["word"].lower(),  # Convert to lowercase
                "start": word_info["start"],
                "end": word_info["end"]
            })
    
    return detected_lang, transcription, word_segments

def summarize_with_groq(text):
    """
    Uses Groq API to summarize the transcribed text.
    """
    if len(text.split()) < 20:
        return "Text too short for summarization."
    
    try:
        response = client.chat.completions.create(
            model="mistral-saba-24b",
            messages=[
                {"role": "system", "content": "Summarize the following transcription in a clear, concise, and structured manner. Present the key points in bullet format, highlighting the most important details, insights, and takeaways. Ensure the summary is easy to read and provides a meaningful understanding of the content."},
                {"role": "user", "content": text}
            ],
            temperature=0.5,
            max_tokens=300
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error in summarization: {str(e)}"

def find_phrase_nltk(word_segments, key_phrase):
    """
    Uses NLTK to find key phrase timestamps in the transcription.
    """
    key_tokens = clean_text(key_phrase)
    transcribed_tokens = [clean_text(word["word"]) for word in word_segments]
    transcribed_tokens = [token for sublist in transcribed_tokens for token in sublist]  # Flatten list

    matches = []
    for i in range(len(transcribed_tokens) - len(key_tokens) + 1):
        if transcribed_tokens[i:i + len(key_tokens)] == key_tokens:
            start_time = word_segments[i]["start"]
            end_time = word_segments[i + len(key_tokens) - 1]["end"]
            matches.append((start_time, end_time))
    return matches

# YouTube Helper Functions
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
    """Summarize text using Groq API with mistral-saba-24b model"""
    if "Transcript not available" in text:
        return text
    
    try:
        response = client.chat.completions.create(
            model="mistral-saba-24b",
            messages=[
                {"role": "system", "content": "Generate a concise summary of the following transcript. Focus on the main points and key takeaways. The summary should be clear, informative, and about 150-250 words."},
                {"role": "user", "content": text[:4000] + "..."}
            ],
            temperature=0.5,
            max_tokens=300
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def generate_quiz_questions(text):
    """Generate quiz questions using Groq API with mistral-saba-24b model"""
    try:
        response = client.chat.completions.create(
            model="mistral-saba-24b",
            messages=[
                {"role": "system", "content": """Generate 5 multiple-choice quiz questions based on this video transcript. 
                Format the response as JSON with the following structure:
                [
                  {
                    "question": "Question text here",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": "Correct option text here"
                  }
                ]"""},
                {"role": "user", "content": text[:2000] + "..."}
            ],
            temperature=0.5,
            max_tokens=600
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating questions: {str(e)}"

# Original Audio Transcription Routes
@app.post("/transcribe")
async def transcribe_and_summarize(file: UploadFile = File(...)):
    """
    Transcribes uploaded audio file and summarizes it using Groq API.
    """
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())
    
    detected_lang, transcription, word_segments = transcribe_audio(file_location)
    summary = summarize_with_groq(transcription)
    os.remove(file_location)  # Clean up temporary file
    
    return {
        "Detected Language": detected_lang,
        "Full Transcription": transcription,
        "Summary": summary
    }

@app.post("/find-keyphrase")
async def find_keyphrase_in_audio(file: UploadFile = File(...), key_phrase: str = ""):
    """
    Transcribes uploaded audio file and finds timestamps for a key phrase.
    """
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())
    
    detected_lang, _, word_segments = transcribe_audio(file_location)
    timestamps = find_phrase_nltk(word_segments, key_phrase)
    os.remove(file_location)  # Clean up temporary file
    
    return {
        "Detected Language": detected_lang,
        "Key Phrase": key_phrase,
        "Timestamps": timestamps if timestamps else "Key phrase not found"
    }

# Added YouTube Analysis Routes
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
    uvicorn.run(app, host="0.0.0.0", port=port)