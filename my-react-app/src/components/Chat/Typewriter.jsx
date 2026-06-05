// src/components/Typewriter.jsx
import React, { useState, useEffect } from 'react';
import './Typewriter.css';

const Typewriter = ({ 
  texts = [], 
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenTexts = 2000,
  className = "",
  onComplete = null
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentDisplayText, setCurrentDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeout;

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, delayBetweenTexts);
      return () => clearTimeout(timeout);
    }

    const currentText = texts[currentTextIndex];
    
    if (isDeleting) {
      // Deleting text
      if (currentDisplayText.length === 0) {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        if (onComplete && currentTextIndex === texts.length - 1) {
          onComplete();
        }
      } else {
        timeout = setTimeout(() => {
          setCurrentDisplayText(prev => prev.slice(0, -1));
        }, deletingSpeed);
      }
    } else {
      // Typing text
      if (currentDisplayText.length === currentText.length) {
        setIsPaused(true);
      } else {
        timeout = setTimeout(() => {
          setCurrentDisplayText(currentText.slice(0, currentDisplayText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentDisplayText, isDeleting, currentTextIndex, texts, typingSpeed, deletingSpeed, delayBetweenTexts, isPaused, onComplete]);

  return (
    <span className={`typewriter ${className}`}>
      {currentDisplayText}
      <span className="cursor">|</span>
    </span>
  );
};

export default Typewriter;