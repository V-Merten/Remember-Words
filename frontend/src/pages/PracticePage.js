import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPracticeWords, checkPracticeAnswer } from '../api';
import './PracticePage.css';

const PracticePage = () => {
  const location = useLocation();
const selectedIds = useMemo(() => location.state?.selectedIds || [], [location.state?.selectedIds]);

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (selectedIds.length === 0) return;

    const fetchWords = async () => {
      const data = await getPracticeWords(selectedIds);
  
      // Shuffle words
      for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
      }
  
      setWords(data);
      setCurrentIndex(0);
    };
    fetchWords();
  }, [selectedIds]);

  const checkAnswer = async () => {
    const word = words[currentIndex];
    if (!word || !userAnswer.trim()) {
      setFeedback({ correct: false, message: "Answer cannot be empty." });
      return;
    }
    try {
      const result = await checkPracticeAnswer({
        id: word.id,
        userWord: userAnswer
      });
      console.log('Server result:', result);
      
      setFeedback(result);

      setCurrentIndex((prevIndex) => {
        if (words.length <= 1) return prevIndex;
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * words.length);
        } while (nextIndex === prevIndex);
      
        return nextIndex;
      });
      setUserAnswer('');
    } catch (error) {
      setFeedback({ correct: false, message: "Error checking answer." });
      console.error('Check answer failed:', error);
    }
  };

  return (
    <div className="practice-container">
      <h1>Practice Page</h1>
      {words.length > 0 && (
        <div>
          <div className="word-title">
            {words[currentIndex]?.foreignWord}
          </div>
          <input
            type="text"
            placeholder="Enter translation"
            value={userAnswer}
          onChange={(e) => {
            setUserAnswer(e.target.value);
          }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setFeedback(null);
                checkAnswer();
              }
            }}
            className="input-translation"
          />
          <div className="input-button">
            <button onClick={checkAnswer}>Check</button>
          </div>
          {feedback && (
            <div className="feedback-details">
              <p><strong>{feedback.correct ? "Correct!" : "Incorrect!"}</strong></p>
              {!feedback.correct && feedback.details && (
                <>
                  <p><strong>Foreign Word:</strong> {feedback.details.foreignWord}</p>
                  <p><strong>Correct Translation:</strong> {feedback.details.correctTranslation}</p>
                  <p><strong>Your Answer:</strong> {feedback.details.userAnswer}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
      <div className="bottom-navigation">
        <Link to="/"><button>🏠 Home</button></Link>
      </div>
    </div>
  );
};

export default PracticePage;