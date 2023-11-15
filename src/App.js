import React, { useState, useEffect, useRef } from "react";
import "./App.css"

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(5); // Timer for each question
  const [quizEnded, setQuizEnded] = useState(false);
  const [questionSkipped, setQuestionSkipped] = useState(false);

  const timerRef = useRef(null); // Ref for the timer timeout

  // Effect for fetching questions when the component mounts
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

  // Effect for starting and updating the timer
  useEffect(() => {
    if (currentQuestionIndex < questions.length && timer > 0) {
      timerRef.current = setTimeout(() => {
        if (timer > 0) {
          setTimer(timer - 1);
        } else {
          handleNextQuestion();
        }
      }, 1000);

      // Clean up the timer when the component unmounts or when the current question changes
      return () => {
        clearTimeout(timerRef.current);
      };
    }
  });

  useEffect(() => {
    if (questionSkipped) {
      // Handle any actions needed when a question is skipped
      handleNextQuestion();
      setQuestionSkipped(false); // Reset the skip flag
    }
  }, [questionSkipped]);

  // Function to handle skipping a question
  const handleSkipQuestion = () => {
    setQuestionSkipped(true); // Set the skip flag to true
  };

  // Function for handling the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimer(5); // Reset the timer for the next question (5 seconds)
    } else {
      // End of the quiz
      setQuizEnded(true);
      clearTimeout(timerRef.current); // Stop the timer when the quiz ends
    }
  };

  // Function for handling user answer clicks
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
        {/* Quiz Ended Phase: Display the final score */}
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