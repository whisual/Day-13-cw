import React, { useState, useEffect, useRef } from "react";
import "./App.css"

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(5);
  const [quizEnded, setQuizEnded] = useState(false);
  const [questionSkipped, setQuestionSkipped] = useState(false);

  const timerRef = useRef(null); 
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(
          "https://opentdb.com/api.php?amount=10&type=multiple"
        );
        const data = await response.json();
        setQuestions(data.results);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    }

    fetchQuestions();
  }, []);
  
  useEffect(() => {
    if (currentQuestionIndex < questions.length && timer > 0) {
      timerRef.current = setTimeout(() => {
        if (timer > 0) {
          setTimer(timer - 1);
        } else {
          handleNextQuestion();
        }
      }, 1000);

      return () => {
        clearTimeout(timerRef.current);
      };
    }
  });

  useEffect(() => {
    if (questionSkipped) {
      handleNextQuestion();
      setQuestionSkipped(false);
    }
  }, [questionSkipped]);

  const handleSkipQuestion = () => {
    setQuestionSkipped(true);
  };
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimer(5);
    } else {
      // End of the quiz
      setQuizEnded(true);
      clearTimeout(timerRef.current);
    }
  };

  const handleAnswerClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    handleNextQuestion();
  };

  if (!questions || questions.length === 0) {
    return <div>Loading...</div>;
  }

  if (quizEnded) {
    return (
      <div className="quiz-container">
        <h2>Quiz Ended</h2>
        <p>
          Your score: {score}/{questions.length}
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <h1>Quiz App</h1>
      <div>
        <h2>Question {currentQuestionIndex + 1}</h2>
        <p>{currentQuestion.question}</p>
        <ul>
          {currentQuestion.incorrect_answers.map((answer, index) => (
            <li key={index}>
              <button onClick={() => handleAnswerClick(false)}>{answer}</button>
            </li>
          ))}
          <li>
            <button onClick={() => handleAnswerClick(true)}>
              {currentQuestion.correct_answer}
            </button>
          </li>
        </ul>
        <p>Time left: {timer} seconds</p>
        <button onClick={handleSkipQuestion}>Skip Question</button>
      </div>
    </div>
  );
}

export default App;
