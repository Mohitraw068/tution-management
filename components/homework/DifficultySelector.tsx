'use client';

interface DifficultySelectorProps {
  value: 'easy' | 'medium' | 'hard';
  onChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  const difficulties = [
    {
      value: 'easy',
      label: 'Easy',
      description: 'Basic concepts and simple problems',
      color: 'bg-green-100 border-green-300 text-green-800',
      selectedColor: 'bg-green-200 border-green-400'
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Intermediate concepts and moderate complexity',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      selectedColor: 'bg-yellow-200 border-yellow-400'
    },
    {
      value: 'hard',
      label: 'Hard',
      description: 'Advanced concepts and challenging problems',
      color: 'bg-red-100 border-red-300 text-red-800',
      selectedColor: 'bg-red-200 border-red-400'
    }
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-3">
      {difficulties.map((difficulty) => (
        <button
          key={difficulty.value}
          type="button"
          onClick={() => onChange(difficulty.value)}
          className={`
            p-3 border-2 rounded-lg text-center transition-all duration-200
            ${value === difficulty.value
              ? difficulty.selectedColor
              : difficulty.color + ' hover:bg-opacity-80'
            }
          `}
        >
          <div className="font-medium text-sm">{difficulty.label}</div>
          <div className="text-xs mt-1 opacity-75">
            {difficulty.description}
          </div>
        </button>
      ))}
    </div>
  );
}