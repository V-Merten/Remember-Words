import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPracticeWords, checkPracticeAnswer } from './api';
import './practicePage.css';

const DIRECTIONS = {
  FOREIGN_TO_NATIVE: 'FOREIGN_TO_NATIVE',
  NATIVE_TO_FOREIGN: 'NATIVE_TO_FOREIGN'
};

const PracticePage = () => {
  const location = useLocation();
  const selectedIds = useMemo(() => location.state?.selectedIds || [], [location.state?.selectedIds]);

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [direction, setDirection] = useState(DIRECTIONS.FOREIGN_TO_NATIVE);

  useEffect(() => {
    if (selectedIds.length === 0) return;

    const fetchWords = async () => {
      const data = await getPracticeWords(selectedIds);
      for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
      }

      setWords(data);
      setCurrentIndex(0);
    };
    fetchWords();
  }, [selectedIds]);

  useEffect(() => {
    setFeedback(null);
    setUserAnswer('');
  }, [direction]);

  const checkAnswer = async () => {
    const word = words[currentIndex];

    if (!word || !userAnswer.trim()) {
      setFeedback({
        correct: false,
        details: {
          foreignWord: word?.foreignWord || '',
          correctTranslation: word?.translatedWord || '',
          userAnswer: ''
        }
      });
      return;
    }

    try {
      const result = await checkPracticeAnswer({
        id: word.id,
        userWord: userAnswer,
        direction
      });

      setFeedback({
        correct: result.correct,
        details: {
          foreignWord: word.foreignWord,
          correctTranslation: word.translatedWord,
          userAnswer: userAnswer
        }
      });

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
      console.error('Check answer failed:', error);
      setFeedback({
        correct: false,
        details: {
          foreignWord: word.foreignWord,
          correctTranslation: word.translatedWord,
          userAnswer: userAnswer
        }
      });
    }
  };

  const currentWord = words[currentIndex];
  const promptWord =
    direction === DIRECTIONS.FOREIGN_TO_NATIVE
      ? currentWord?.foreignWord
      : currentWord?.translatedWord;
  const promptParts = promptWord ? promptWord.split('|') : [];
  const inputPlaceholder =
    direction === DIRECTIONS.FOREIGN_TO_NATIVE
      ? 'Enter translation'
      : 'Enter foreign word';

  return (
    <div className="practice-container">
      {words.length > 0 && (
        <>
          <div className="direction-toggle">
            <button
              className={direction === DIRECTIONS.FOREIGN_TO_NATIVE ? 'active' : ''}
              onClick={() => setDirection(DIRECTIONS.FOREIGN_TO_NATIVE)}
              type="button"
            >
              Foreign → Native
            </button>
            <button
              className={direction === DIRECTIONS.NATIVE_TO_FOREIGN ? 'active' : ''}
              onClick={() => setDirection(DIRECTIONS.NATIVE_TO_FOREIGN)}
              type="button"
            >
              Native → Foreign
            </button>
          </div>
          {promptParts.length > 0 && (
            <div className="foreign-word-block">
              <div className="word-title">
                {promptParts.map((part, idx) => (
                  <div key={idx}>{part.trim()}</div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {words.length > 0 && (
        <div className="practice-content">
          <input
            type="text"
            placeholder={inputPlaceholder}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setFeedback(null);
                checkAnswer();
              }
            }}
            className="input-translation"
          />

          <div>
            <div className="input-button">
              <button onClick={checkAnswer}>Check</button>
            </div>
            {feedback && feedback.details && (
              <div className={`feedback-details ${feedback.correct ? 'feedback-correct' : 'feedback-incorrect'}`}>
                <p><strong>{feedback.details.foreignWord} = {feedback.details.correctTranslation}</strong></p>
                <p><strong>Your Answer: {feedback.details.userAnswer}</strong></p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bottom-navigation">
        <Link to="/"><button>🏠 Home</button></Link>
      </div>
    </div>
  );
};

export default PracticePage;
