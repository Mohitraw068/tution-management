'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AIHomeworkForm } from '@/components/homework/AIHomeworkForm';
import { QuestionPreview } from '@/components/homework/QuestionPreview';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { SubscriptionStatus } from '@/lib/subscription';

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

export default function AIGenerateHomeworkPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHomework, setGeneratedHomework] = useState<GeneratedHomework | null>(null);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    checkSubscription();
  }, [session]);

  const handleGenerate = async (formData: {
    subject: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    numQuestions: number;
    questionTypes: string[];
  }) => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/ai/generate-homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.upgradeRequired) {
          setError(`${data.error}. Current plan: ${data.currentTier}`);
        } else {
          setError(data.error || 'Failed to generate homework');
        }
        return;
      }

      // Success case - data has questions and answerKey
      setGeneratedHomework({
        questions: data.questions,
        answerKey: data.answerKey
      });

    } catch (err) {
      console.error('Error generating homework:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveHomework = async () => {
    if (!generatedHomework) return;

    try {
      const response = await fetch('/api/homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `AI Generated Homework`,
          description: 'Generated using AI',
          questions: generatedHomework.questions,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        }),
      });

      if (response.ok) {
        router.push('/homework');
      }
    } catch (error) {
      console.error('Failed to save homework:', error);
    }
  };

  if (loadingSubscription) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Checking subscription...</span>
        </div>
      </div>
    );
  }

  // Show upgrade prompt for basic users
  if (!subscription || subscription.tier === 'BASIC') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Homework Generator
            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
              PRO
            </span>
          </h1>
          <p className="text-gray-600 mt-2">
            Generate customized homework assignments using artificial intelligence
          </p>
        </div>

        <UpgradePrompt
          currentTier={subscription?.tier || 'BASIC'}
          featureName="AI Homework Generator"
          requiredTier="PRO"
        />

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What you'll get with PRO:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Generate unlimited homework assignments</li>
            <li>• Multiple question types (MCQ, Short Answer, Essay)</li>
            <li>• Adjustable difficulty levels</li>
            <li>• Edit and customize generated questions</li>
            <li>• Save as templates for reuse</li>
            <li>• Answer keys included</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          AI Homework Generator
          <span className="ml-2 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
            PRO
          </span>
        </h1>
        <p className="text-gray-600 mt-2">
          Generate customized homework assignments using artificial intelligence
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <AIHomeworkForm
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        <div>
          {generatedHomework && (
            <QuestionPreview
              homework={generatedHomework}
              onSave={handleSaveHomework}
            />
          )}
        </div>
      </div>
    </div>
  );
}