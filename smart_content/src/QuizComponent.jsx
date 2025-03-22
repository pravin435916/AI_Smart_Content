import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, X, Award, RotateCcw, HelpCircle } from 'lucide-react';

const QuizComponent = ({ quizData }) => {
  // Parse the quiz data if it's a string
  const parseQuizData = (data) => {
    if (typeof data === 'string') {
      try {
        const parsed = data.replace('```json', '').replace('```', '');
        console.log('parsed: ', parsed);
        return JSON.parse(parsed);
      } catch (error) {
        console.error('Error parsing quiz data:', error);
        return [];
      }
    }
    return data || [];
  };

  const parsedQuizData = parseQuizData(quizData);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizComplete(false);
    setUserAnswers([]);
  };

  const restartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizComplete(false);
    setUserAnswers([]);
  };

  const handleAnswerSelect = (answer) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    if (!selectedAnswer || isAnswered) return;
    
    const currentQuestion = parsedQuizData[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    // Save user's answer
    setUserAnswers(prev => [
      ...prev, 
      { 
        questionIndex: currentQuestionIndex,
        selectedAnswer,
        correctAnswer: currentQuestion.answer,
        isCorrect
      }
    ]);
    
    setIsAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < parsedQuizData.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizComplete(true);
    }
  };

  // Handle empty or invalid quiz data
  if (!parsedQuizData || parsedQuizData.length === 0) {
    return (
      <div className="p-6 text-center bg-violet-50 rounded-lg border border-violet-200">
        <HelpCircle className="mx-auto text-violet-500 mb-2" size={32} />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Quiz Available</h3>
        <p className="text-gray-600">The quiz data is empty or in an invalid format.</p>
      </div>
    );
  }

  // Quiz welcome screen
  if (!quizStarted) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-6 text-white text-center">
          <HelpCircle className="mx-auto mb-2" size={32} />
          <h2 className="text-xl font-bold mb-2">Knowledge Check Quiz</h2>
          <p className="text-sm opacity-90">Test your understanding with {parsedQuizData.length} questions</p>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-700 mb-6">Ready to test your knowledge? This quiz contains {parsedQuizData.length} questions about the content you just processed.</p>
          <button
            onClick={startQuiz}
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md flex items-center gap-2 mx-auto"
          >
            <span>Start Quiz</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Quiz completion screen
  if (quizComplete) {
    const percentage = Math.round((score / parsedQuizData.length) * 100);
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-6 text-white text-center">
          <Award className="mx-auto mb-2" size={32} />
          <h2 className="text-xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-sm opacity-90">You scored {score} out of {parsedQuizData.length}</p>
        </div>
        
        <div className="p-6">
          {/* Score Display */}
          <div className="mb-6 text-center">
            <div className="w-32 h-32 rounded-full flex items-center justify-center border-8 border-violet-100 mx-auto mb-4">
              <div className="text-2xl font-bold text-violet-700">{percentage}%</div>
            </div>
            
            <p className="text-gray-700">
              {percentage >= 80 ? 'Excellent work! You have a great understanding of the material.' :
               percentage >= 60 ? 'Good job! You have a solid grasp of the content.' :
               'Keep studying! Review the material again to improve your score.'}
            </p>
          </div>
          
          {/* Answer Review */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Question Review:</h3>
            <div className="space-y-3 max-h-60 overflow-auto pr-2">
              {userAnswers.map((answer, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                >
                  <div className="flex items-start gap-2">
                    {answer.isCorrect ? 
                      <Check className="text-green-600 shrink-0 mt-0.5" size={16} /> : 
                      <X className="text-red-600 shrink-0 mt-0.5" size={16} />
                    }
                    <div>
                      <div className="text-sm font-medium mb-1">
                        Q{index + 1}: {parsedQuizData[answer.questionIndex].question}
                      </div>
                      <div className="text-xs text-gray-600">
                        Your answer: <span className={answer.isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                          {answer.selectedAnswer}
                        </span>
                        {!answer.isCorrect && (
                          <div className="text-green-700">
                            Correct answer: {answer.correctAnswer}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Restart Button */}
          <button
            onClick={restartQuiz}
            className="mt-6 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={16} />
            <span>Retake Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // Current question being displayed
  const currentQuestion = parsedQuizData[currentQuestionIndex];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-4 text-white">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Knowledge Check</h3>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            Question {currentQuestionIndex + 1} of {parsedQuizData.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/30 rounded-full h-1.5 mt-3">
          <div 
            className="bg-white h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex) / parsedQuizData.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Question */}
      <div className="p-4">
        <h4 className="text-lg font-medium text-gray-800 mb-4">{currentQuestion.question}</h4>
        
        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedAnswer === option 
                  ? isAnswered
                    ? selectedAnswer === currentQuestion.answer
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                    : 'bg-violet-50 border-violet-500'
                  : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                  selectedAnswer === option 
                    ? isAnswered
                      ? selectedAnswer === currentQuestion.answer
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-violet-500 text-white'
                    : 'border border-gray-300 text-gray-500'
                }`}>
                  {/* Show a check or X mark for answered questions, otherwise show option number */}
                  {isAnswered && selectedAnswer === option ? (
                    selectedAnswer === currentQuestion.answer ? (
                      <Check size={14} />
                    ) : (
                      <X size={14} />
                    )
                  ) : (
                    <span className="text-xs font-medium">{String.fromCharCode(65 + index)}</span>
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Show correct answer if the user got it wrong */}
        {isAnswered && selectedAnswer !== currentQuestion.answer && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <Check className="text-green-600 shrink-0 mt-0.5" size={16} />
            <div>
              <div className="text-sm font-medium text-green-800">Correct Answer:</div>
              <div className="text-sm text-green-700">{currentQuestion.answer}</div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-between">
          <div className="text-sm text-gray-500 flex items-center">
            Score: {score}/{currentQuestionIndex + (isAnswered ? 1 : 0)}
          </div>
          
          {!isAnswered ? (
            <button
              onClick={checkAnswer}
              disabled={!selectedAnswer}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !selectedAnswer 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>{currentQuestionIndex < parsedQuizData.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizComponent;