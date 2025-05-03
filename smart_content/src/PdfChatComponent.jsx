import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Loader2, Send, ArrowUp, Trash2, Bot, User } from 'lucide-react';

const PdfChatComponent = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  
  const messagesEndRef = useRef(null);
  const API_BASE_URL = "http://127.0.0.1:8000";

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfPreview(URL.createObjectURL(file));
      processFile(file);
    }
  };
 // upload file
  const processFile = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/process-pdf`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error processing PDF');
      }
      
      const result = await response.json();
      
      setMessages([
        { 
          role: 'assistant', 
          content: `I've processed your PDF "${file.name}". You can now ask me questions about it!`
        }
      ]);
      
      setFileUploaded(true);
    } catch (error) {
      setMessages([
        { 
          role: 'assistant', 
          content: `Error processing the PDF: ${error.message}` 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || !pdfFile || loading) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: question };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input
    setQuestion('');
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('question', question);
      
      const response = await fetch(`${API_BASE_URL}/ask-pdf`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error getting answer');
      }
      
      const result = await response.json();
      
      // Add assistant response to chat
      setMessages(prevMessages => [
        ...prevMessages, 
        { role: 'assistant', content: result.answer }
      ]);
    } catch (error) {
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          role: 'assistant', 
          content: `Sorry, I encountered an error while processing your question: ${error.message}` 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const resetChat = () => {
    setPdfFile(null);
    setPdfPreview(null);
    setFileUploaded(false);
    setMessages([]);
    setQuestion('');
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 p-4 text-white rounded-t-lg">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText size={20} />
          PDF Chat Assistant
        </h2>
        <p className="text-sm opacity-90">Upload a PDF and chat with it</p>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col bg-white">
        {!fileUploaded ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="border-2 border-dashed border-violet-300 rounded-lg p-8 hover:bg-violet-50 transition-colors mb-4">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  id="pdf-upload"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="animate-spin text-violet-500" size={32} />
                  ) : (
                    <FileText className="text-violet-500" size={32} />
                  )}
                  
                  <span className="text-sm text-gray-700 font-medium">
                    {loading ? 'Processing PDF...' : 'Click to upload a PDF'}
                  </span>
                  <span className="text-xs text-gray-500">PDF files up to 10MB</span>
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Upload a PDF document to start chatting about its contents
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <Bot size={18} className="mt-1 text-violet-600" />
                      )}
                      <div className="whitespace-pre-line">{message.content}</div>
                      {message.role === 'user' && (
                        <User size={18} className="mt-1 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              
              {loading && (
                <div className="flex justify-center items-center py-2">
                  <Loader2 className="animate-spin text-violet-500" size={24} />
                </div>
              )}
            </div>
            
            {/* Question Input */}
            <form onSubmit={handleQuestionSubmit} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about your PDF..."
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={loading}
              />
              <button 
                type="submit"
                className={`p-3 rounded-lg ${
                  loading || !question.trim() 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
                disabled={loading || !question.trim()}
              >
                <Send size={20} />
              </button>
              <button 
                type="button"
                onClick={resetChat}
                className="p-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Clear chat and upload new PDF"
              >
                <Trash2 size={20} />
              </button>
            </form>
          </>
        )}
      </div>
      
      {/* PDF Preview (when available) */}
      {pdfPreview && fileUploaded && (
        <div className="p-2 bg-gray-50 border-t text-center">
          <a 
            href={pdfPreview} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-violet-600 hover:text-violet-800 flex items-center justify-center gap-1"
          >
            <FileText size={16} />
            <span>View PDF</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default PdfChatComponent;