import React, { useState, useRef } from 'react';
import { FileText, Send, Loader2, ArrowUp, MessageSquare } from "lucide-react";

const PdfChatComponent = ({ pdfFile, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [pdfPreview, setPdfPreview] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const API_BASE_URL = "http://127.0.0.1:8000";

  // Process PDF on component mount
  React.useEffect(() => {
    if (pdfFile) {
      processPdf();
    }
  }, [pdfFile]);

  // Scroll to bottom of chat when messages change
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const processPdf = async () => {
    if (!pdfFile) return;
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      const response = await fetch(`${API_BASE_URL}/process-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      const data = await response.json();
      setPdfPreview(data.preview);
      setIsProcessed(true);
      
      // Add welcome message
      setMessages([
        { 
          role: 'system', 
          content: 'PDF processed successfully. Ask me any questions about its content!' 
        }
      ]);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setMessages([
        { 
          role: 'system', 
          content: `Error processing PDF: ${error.message}` 
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendQuestion = async () => {
    if (!question.trim() || !pdfFile) return;
    
    // Add user question to messages
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    
    // Clear input field
    const userQuestion = question;
    setQuestion("");
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('question', userQuestion);

      const response = await fetch(`${API_BASE_URL}/ask-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      
      // Add AI response to messages
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error('Error getting answer:', error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${error.message}. Please try again.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* PDF Processing State */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-4" />
          <p className="text-gray-700">Processing PDF document...</p>
        </div>
      )}

      {/* Chat Interface */}
      {isProcessed && !isProcessing && (
        <div className="flex flex-col h-full">
          {/* PDF Preview Header */}
          <div className="bg-gray-50 p-3 border-b rounded-t-lg">
            <div className="flex items-center gap-2">
              <FileText className="text-violet-600" size={16} />
              <span className="font-medium text-sm text-gray-700">
                {pdfFile.name}
              </span>
            </div>
            {pdfPreview && (
              <div className="mt-2 p-2 bg-white border rounded-md max-h-20 overflow-y-auto">
                <p className="text-xs text-gray-600 whitespace-pre-line">
                  {pdfPreview}
                </p>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-violet-600 text-white rounded-tr-none' 
                      : message.role === 'assistant'
                        ? 'bg-gray-200 text-gray-800 rounded-tl-none'
                        : 'bg-yellow-100 text-gray-800 w-full'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Question Input */}
          <div className="border-t p-3">
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about the PDF..."
                className="w-full p-3 pl-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendQuestion}
                disabled={!question.trim() || isLoading}
                className={`absolute right-3 bottom-3 p-2 rounded-full ${
                  !question.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfChatComponent;