'use client';

import { useState } from 'react';
import { DifficultySelector } from './DifficultySelector';

interface AIHomeworkFormProps {
  onGenerate: (formData: {
    subject: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    numQuestions: number;
    questionTypes: string[];
  }) => void;
  isGenerating: boolean;
}

export function AIHomeworkForm({ onGenerate, isGenerating }: AIHomeworkFormProps) {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    numQuestions: 5,
    questionTypes: ['mcq']
  });

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Geography',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Other'
  ];

  const questionTypeOptions = [
    { value: 'mcq', label: 'Multiple Choice Questions' },
    { value: 'short-answer', label: 'Short Answer Questions' },
    { value: 'essay', label: 'Essay Questions' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subject && formData.topic && formData.questionTypes.length > 0) {
      onGenerate(formData);
    }
  };

  const toggleQuestionType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Generate AI Homework</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <select
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a subject</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic *
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            placeholder="e.g., Quadratic Equations, Photosynthesis, World War II"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <DifficultySelector
            value={formData.difficulty}
            onChange={(difficulty) => setFormData(prev => ({ ...prev, difficulty }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Questions
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.numQuestions}
            onChange={(e) => setFormData(prev => ({ ...prev, numQuestions: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum 20 questions</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Types *
          </label>
          <div className="space-y-2">
            {questionTypeOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.questionTypes.includes(option.value)}
                  onChange={() => toggleQuestionType(option.value)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {formData.questionTypes.length === 0 && (
            <p className="text-xs text-red-500 mt-1">Select at least one question type</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isGenerating || !formData.subject || !formData.topic || formData.questionTypes.length === 0}
          className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </div>
          ) : (
            'Generate Homework'
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-purple-700">
              <strong>PRO Feature:</strong> AI-powered homework generation is available for PRO and ENTERPRISE subscribers only.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}