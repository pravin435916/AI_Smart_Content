# Smart Content Insight

Smart Content Insight is an AI-powered browser extension designed to enhance the way users interact with multimedia content. It provides transcription, summarization, quiz and note generation, and keyword timestamp retrieval for YouTube videos, local audio/video files, and PDF documents — with support for multiple languages.

---

## 🔍 Problem Statement

With the explosion of digital content, users often find it challenging to extract meaningful information quickly from long videos, audios, and documents. Existing tools lack integrated capabilities for summarization, interactivity, and multilingual access. Smart Content Insight aims to bridge this gap by offering an all-in-one intelligent solution.

---

## 🎯 Objectives

* Enable users to interact intelligently with multimedia and document content.
* Automate the generation of transcripts, summaries, quizzes, and key point navigation.
* Provide multilingual support and real-time keyword search functionality.
* Ensure scalability and usability for educational, professional, and accessibility use cases.

---

## ⚙️ Features

✅ Transcription using Whisper <br>
✅ Summarization using Groq NLP API <br>
✅ Quiz and Note Generation <br>
✅ Keyword Timestamp Search <br>
✅ Multilingual Output Support <br>
✅ YouTube, Local File, and PDF Upload Support <br>
✅ Document-based Chatbot Interaction (via LangChain) <br>

---

## 🛠 Tech Stack

| Layer                      | Technologies                  |
| -------------------------- | ----------------------------- |
| Frontend                   | React.js                      |
| Backend                    | FastAPI                       |
| Transcription              | Whisper                       |
| Summarization              | Groq NLP Transformers         |
| Chatbot / Document Parsing | LangChain, PyPDF2, Ollama     |
| Multilingual Support       | Google Translate API          |
| File Parsing               | CharacterTextSplitter, PyPDF2 |

---

## 🧪 Methodology

The extension supports three primary input modes:

1. YouTube URL Upload

   * Fetches metadata via YouTube API
   * Transcribes video via Whisper
   * Summarizes, generates notes/quizzes, and allows keyword-based timestamping

2. Local Audio/Video File Upload

   * Accepts user media files
   * Performs multilingual transcription
   * Generates full transcripts, summaries, and quizzes

3. Document Upload

   * Accepts PDF documents
   * Parses using PyPDF2 and splits using CharacterTextSplitter
   * Allows interactive queries via LangChain-powered chatbot

All processes are handled asynchronously using FastAPI, ensuring low latency and high responsiveness. Multilingual support is available for all modules.

---

## 📦 Deliverables

* Browser extension supporting all three input types
* Real-time transcript, summary, quiz, and keyword timestamp outputs
* Interactive document chatbot
* API endpoints for each feature
* Complete frontend (React) and backend (FastAPI) codebase

---

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/smart-content-insight.git
cd smart-content-insight
```

Install frontend dependencies:

```bash
cd frontend
npm install
npm run dev
```

Install backend dependencies:

```bash
cd ../backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Make sure to set up environment variables for:

* OpenAI API Key
* Google Translate API Key
* Groq API Key
* YouTube Data API Key

---

## 📈 Future Enhancements

* Better handling of noisy/low-quality audio
* Support for additional document types (e.g., Word, HTML)
* Real-time streaming transcription
* User authentication and storage of previous analyses

---
