import React, { createContext, useContext, useState } from 'react';

const QuestionBankContext = createContext(undefined);

const sampleQuestions = [
  {
    id: '1',
    text: 'What is the capital of France?',
    type: 'mcq',
    category: 'Geography',
    difficulty: 'easy',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 'Paris',
    marks: 1,
    createdAt: new Date(),
  },
  {
    id: '2',
    text: 'The Earth revolves around the Sun.',
    type: 'true-false',
    category: 'Science',
    difficulty: 'easy',
    options: ['True', 'False'],
    correctAnswer: 'True',
    marks: 1,
    createdAt: new Date(),
  },
  {
    id: '3',
    text: 'Explain the process of photosynthesis.',
    type: 'short-answer',
    category: 'Science',
    difficulty: 'medium',
    marks: 5,
    createdAt: new Date(),
  },
  {
    id: '4',
    text: 'Which programming language is known as the "language of the web"?',
    type: 'mcq',
    category: 'Computer Science',
    difficulty: 'easy',
    options: ['Python', 'JavaScript', 'C++', 'Java'],
    correctAnswer: 'JavaScript',
    marks: 1,
    createdAt: new Date(),
  },
  {
    id: '5',
    text: 'What is the derivative of x²?',
    type: 'short-answer',
    category: 'Mathematics',
    difficulty: 'medium',
    marks: 3,
    createdAt: new Date(),
  },
];

export function QuestionBankProvider({ children }) {
  const [questions, setQuestions] = useState(sampleQuestions);
  const [exams, setExams] = useState([]);

  const addQuestion = (question) => {
    const newQuestion = {
      ...question,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addExam = (exam) => {
    setExams((prev) => [...prev, exam]);
  };

  const getCategories = () => {
    return [...new Set(questions.map((q) => q.category))];
  };

  return (
    <QuestionBankContext.Provider
      value={{ questions, exams, addQuestion, deleteQuestion, addExam, getCategories }}
    >
      {children}
    </QuestionBankContext.Provider>
  );
}

export function useQuestionBank() {
  const context = useContext(QuestionBankContext);
  if (!context) {
    throw new Error('useQuestionBank must be used within QuestionBankProvider');
  }
  return context;
}
