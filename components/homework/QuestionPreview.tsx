'use client';

import { useState } from 'react';

interface AIQuestion {
  id: string;
  type: 'mcq' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string;
  answer?: string;
  points: number;
}

interface GeneratedHomework {
  questions: AIQuestion[];
  answerKey: Record<string, string>;
}

interface QuestionPreviewProps {
  homework: GeneratedHomework;
  onSave: () => void;
}

export function QuestionPreview({ homework, onSave }: QuestionPreviewProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [editingQuestions, setEditingQuestions] = useState<Record<string, AIQuestion>>({});

  const handleEditQuestion = (questionId: string, field: string, value: string) => {
    setEditingQuestions(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const getEditedQuestion = (question: AIQuestion) => {
    return editingQuestions[question.id] || question;
  };

  const renderQuestion = (question: AIQuestion, index: number) => {
    const editedQuestion = getEditedQuestion(question);

    return (
      <div key={question.id} className="border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-gray-500">
            Question {index + 1} • {editedQuestion.type.toUpperCase()} • {editedQuestion.points} points
          </span>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
            {editedQuestion.type === 'mcq' ? 'Multiple Choice' :
             editedQuestion.type === 'short-answer' ? 'Short Answer' : 'Essay'}
          </span>
        </div>

        <div className="mb-3">
          <textarea
            value={editedQuestion.question}
            onChange={(e) => handleEditQuestion(question.id, 'question', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-gray-900 font-medium resize-none"
            rows={2}
          />
        </div>

        {editedQuestion.type === 'mcq' && editedQuestion.options && (
          <div className="mb-3">
            <div className="space-y-2">
              {editedQuestion.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...editedQuestion.options!];
                      newOptions[optionIndex] = e.target.value;
                      handleEditQuestion(question.id, 'options', newOptions as any);
                    }}
                    className="flex-1 p-1 border border-gray-300 rounded text-sm"
                  />
                  {showAnswers && editedQuestion.correctAnswer === option.charAt(0) && (
                    <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showAnswers && (editedQuestion.type === 'short-answer' || editedQuestion.type === 'essay') && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Answer:
            </label>
            <textarea
              value={editedQuestion.answer || ''}
              onChange={(e) => handleEditQuestion(question.id, 'answer', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={3}
            />
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Points: {editedQuestion.points}</span>
          <input
            type="number"
            min="1"
            max="50"
            value={editedQuestion.points}
            onChange={(e) => handleEditQuestion(question.id, 'points', parseInt(e.target.value))}
            className="w-16 p-1 border border-gray-300 rounded text-center"
          />
        </div>
      </div>
    );
  };

  const totalPoints = homework.questions.reduce((sum, q) => {
    const editedQuestion = getEditedQuestion(q);
    return sum + editedQuestion.points;
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Generated Questions</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex justify-between text-sm">
          <span>Total Questions: {homework.questions.length}</span>
          <span>Total Points: {totalPoints}</span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {homework.questions.map((question, index) => renderQuestion(question, index))}
      </div>

      <div className="mt-6 flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(homework, null, 2)],
                { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'homework-template.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Save as Template
          </button>

          <button
            onClick={() => {
              const printContent = homework.questions.map((q, i) =>
                `${i + 1}. ${q.question}\n${q.options ? q.options.join('\n') + '\n' : ''}`
              ).join('\n');

              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(`
                  <html>
                    <head><title>Homework Questions</title></head>
                    <body style="font-family: Arial, sans-serif; padding: 20px;">
                      <h1>Homework Assignment</h1>
                      <pre style="white-space: pre-wrap;">${printContent}</pre>
                    </body>
                  </html>
                `);
                printWindow.document.close();
                printWindow.print();
              }
            }}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Print Preview
          </button>
        </div>

        <button
          onClick={onSave}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Homework
        </button>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-700">
          <strong>Pro Tip:</strong> Review and edit the questions above before saving.
          You can adjust question text, options, answers, and point values to better fit your needs.
        </p>
      </div>
    </div>
  );
}