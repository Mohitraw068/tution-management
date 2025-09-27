import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkSubscriptionTier } from '@/lib/subscription';

interface AIQuestion {
  id: string;
  type: 'mcq' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string;
  answer?: string;
  points: number;
}

export async function POST(request: NextRequest) {
  // Always set JSON headers
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Please log in to access this feature'
        },
        { status: 401, headers }
      );
    }

    // Parse request body with error handling
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format - Please provide valid JSON'
        },
        { status: 400, headers }
      );
    }

    const { subject, topic, difficulty, numQuestions, questionTypes } = requestData;

    // Validate required fields
    if (!subject || !topic || !difficulty || !numQuestions || !questionTypes) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: subject, topic, difficulty, numQuestions, and questionTypes are required'
        },
        { status: 400, headers }
      );
    }

    // Validate question types array
    if (!Array.isArray(questionTypes) || questionTypes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'questionTypes must be a non-empty array'
        },
        { status: 400, headers }
      );
    }

    // Validate number of questions
    if (typeof numQuestions !== 'number' || numQuestions < 1 || numQuestions > 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'numQuestions must be a number between 1 and 20'
        },
        { status: 400, headers }
      );
    }

    // Check subscription tier
    try {
      const subscription = await checkSubscriptionTier(session.user.email);
      if (!subscription || !['PRO', 'ENTERPRISE'].includes(subscription.tier)) {
        return NextResponse.json(
          {
            success: false,
            error: 'This feature requires a PRO or ENTERPRISE subscription',
            upgradeRequired: true,
            currentTier: subscription?.tier || 'BASIC'
          },
          { status: 403, headers }
        );
      }
    } catch (subscriptionError) {
      console.error('Error checking subscription:', subscriptionError);
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to verify subscription status'
        },
        { status: 500, headers }
      );
    }

    // Generate mock questions (always use mock data for now)
    try {
      const mockQuestions = generateMockQuestions(subject, topic, difficulty, numQuestions, questionTypes);
      const answerKey = generateAnswerKey(mockQuestions);

      return NextResponse.json(
        {
          success: true,
          questions: mockQuestions,
          answerKey: answerKey,
          metadata: {
            subject,
            topic,
            difficulty,
            totalQuestions: mockQuestions.length,
            totalPoints: mockQuestions.reduce((sum, q) => sum + q.points, 0),
            generatedAt: new Date().toISOString(),
            mockData: true
          }
        },
        { status: 200, headers }
      );

    } catch (generationError) {
      console.error('Error generating mock questions:', generationError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate homework questions'
        },
        { status: 500, headers }
      );
    }

  } catch (error) {
    console.error('Unexpected error in AI homework generation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while generating homework'
      },
      { status: 500, headers }
    );
  }
}

function generateMockQuestions(subject: string, topic: string, difficulty: string, numQuestions: number, questionTypes: string[]): AIQuestion[] {
  const questions: AIQuestion[] = [];
  const timestamp = Date.now();

  const questionTemplates = {
    mcq: {
      easy: [
        `What is ${topic} in ${subject}?`,
        `Which of the following best describes ${topic}?`,
        `${topic} is primarily used for:`,
      ],
      medium: [
        `How does ${topic} relate to other concepts in ${subject}?`,
        `What are the key characteristics of ${topic}?`,
        `Which statement about ${topic} is most accurate?`,
      ],
      hard: [
        `Analyze the complex relationship between ${topic} and its applications in ${subject}.`,
        `What would be the most likely outcome if ${topic} were modified?`,
        `Which advanced principle best explains ${topic}?`,
      ]
    },
    'short-answer': {
      easy: [
        `Define ${topic} in simple terms.`,
        `List three key features of ${topic}.`,
        `Explain why ${topic} is important in ${subject}.`,
      ],
      medium: [
        `Compare and contrast ${topic} with related concepts.`,
        `Describe the process involved in ${topic}.`,
        `Explain how ${topic} is applied in real-world scenarios.`,
      ],
      hard: [
        `Critically analyze the implications of ${topic} in modern ${subject}.`,
        `Evaluate the effectiveness of different approaches to ${topic}.`,
        `Synthesize information about ${topic} to propose new applications.`,
      ]
    },
    essay: {
      easy: [
        `Write about the basics of ${topic} and why it matters in ${subject}.`,
        `Discuss the main components of ${topic}.`,
        `Explain the role of ${topic} in ${subject} with examples.`,
      ],
      medium: [
        `Analyze the significance of ${topic} in ${subject} and its practical applications.`,
        `Discuss the advantages and disadvantages of ${topic}.`,
        `Examine the relationship between ${topic} and other key concepts.`,
      ],
      hard: [
        `Critically evaluate the impact of ${topic} on modern ${subject} and predict future developments.`,
        `Synthesize multiple perspectives on ${topic} to form a comprehensive argument.`,
        `Propose innovative solutions using principles of ${topic} for contemporary challenges.`,
      ]
    }
  };

  for (let i = 0; i < numQuestions; i++) {
    const type = questionTypes[i % questionTypes.length] as 'mcq' | 'short-answer' | 'essay';
    const questionId = `ai-mock-${timestamp}-${i}`;
    const templates = questionTemplates[type]?.[difficulty as keyof typeof questionTemplates.mcq] || questionTemplates[type].medium;
    const questionText = templates[i % templates.length];

    switch (type) {
      case 'mcq':
        questions.push({
          id: questionId,
          type: 'mcq',
          question: questionText,
          options: [
            `A) Primary concept of ${topic}`,
            `B) Secondary application in ${subject}`,
            `C) Advanced theory related to ${topic}`,
            `D) Alternative approach to ${topic}`
          ],
          correctAnswer: 'A',
          points: difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7
        });
        break;

      case 'short-answer':
        questions.push({
          id: questionId,
          type: 'short-answer',
          question: questionText,
          answer: `Expected answer should cover key aspects of ${topic}, including its definition, importance in ${subject}, and practical applications. Students should demonstrate understanding of the concept and its relevance.`,
          points: difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12
        });
        break;

      case 'essay':
        questions.push({
          id: questionId,
          type: 'essay',
          question: questionText,
          answer: `A comprehensive essay should include: 1) Introduction defining ${topic} and its relevance to ${subject}, 2) Main body discussing key concepts, examples, and applications, 3) Analysis of importance and impact, 4) Conclusion summarizing main points and implications.`,
          points: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 20 : 25
        });
        break;
    }
  }

  return questions;
}

function generateAnswerKey(questions: AIQuestion[]): Record<string, string> {
  const answerKey: Record<string, string> = {};

  questions.forEach(question => {
    if (question.type === 'mcq' && question.correctAnswer) {
      answerKey[question.id] = question.correctAnswer;
    } else if (question.answer) {
      answerKey[question.id] = question.answer;
    }
  });

  return answerKey;
}