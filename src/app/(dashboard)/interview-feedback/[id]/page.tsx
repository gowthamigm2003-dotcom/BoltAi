'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InterviewSession } from '@/types';
import { formatDate } from '@/lib/utils';
import { Star, Calendar, ArrowLeft } from 'lucide-react';

export default function InterviewFeedbackPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <FeedbackContent sessionId={params.id} />
    </ProtectedRoute>
  );
}

function FeedbackContent({ sessionId }: { sessionId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
        if (sessionDoc.exists()) {
          const data = sessionDoc.data();
          setSession({
            id: sessionDoc.id,
            ...data,
            startedAt: data.startedAt?.toDate(),
            endedAt: data.endedAt?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          } as InterviewSession);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#101216] to-[#0f1014]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#101216] to-[#0f1014]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-muted-foreground mb-4">Session not found</p>
          <Button onClick={() => router.push('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const analysis = session.analysis || {
    overallScore: 12,
    enthusiasm: 0,
    communication: 5,
    selfAwareness: 2,
    technicalSkills: 5,
    verdict: 'not-recommended',
    breakdown: [
      {
        title: 'Enthusiasm & Interest (0/20)',
        score: 0,
        maxScore: 20,
        points: [
          'The candidate openly states they are not interested in the company.',
          'Their response to future career plans indicates a lack of commitment.',
        ],
      },
      {
        title: 'Communication Skills (5/20)',
        score: 5,
        maxScore: 20,
        points: [
          'Responses are brief and unhelpful.',
          'Some answers lack clarity.',
          'A slight redeeming factor is that they remain polite.',
        ],
      },
      {
        title: 'Self-Awareness & Reflection (2/20)',
        score: 2,
        maxScore: 20,
        points: [
          'The candidate refuses to discuss their background and weaknesses.',
          'They claim to have no weaknesses at all, which suggests a lack of self-awareness.',
        ],
      },
    ],
    suggestions: [
      'Show genuine interest in the company and role',
      'Provide more detailed and thoughtful responses',
      'Demonstrate self-awareness by discussing both strengths and areas for improvement',
      'Prepare specific examples using the STAR method',
      'Ask insightful questions about the role and company',
    ],
    generatedAt: new Date(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#101216] to-[#0f1014]">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold text-white mb-2 text-center">
            Feedback on the Interview — {session.title}
          </h1>

          <div className="flex items-center justify-center gap-8 mt-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 fill-current text-white" />
                <span className="text-xl text-muted-foreground">Overall Impression:</span>
              </div>
              <div className="text-xl">
                <span className="font-bold text-primary">{analysis.overallScore}</span>
                <span className="text-white">/100</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-white" />
              <span className="text-xl text-muted-foreground">{formatDate(session.startedAt)}</span>
            </div>
          </div>

          <div className="w-full h-px bg-border my-6" />

          <article className="space-y-8">
            <p className="text-lg leading-7 text-muted-foreground">
              This interview shows {analysis.verdict === 'recommended' ? 'strong' : 'areas for'}{' '}
              potential. The candidate demonstrated{' '}
              {analysis.verdict === 'recommended'
                ? 'excellent communication and technical skills'
                : 'room for improvement in several key areas'}
              .
            </p>

            <section className="space-y-5">
              <h2 className="text-3xl font-semibold text-white">Breakdown of Evaluation:</h2>

              <div className="space-y-6">
                {analysis.breakdown.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-lg font-bold text-muted-foreground">{section.title}</h3>
                    {section.points.map((point, pointIndex) => (
                      <p key={pointIndex} className="text-lg leading-7 text-muted-foreground pl-4">
                        • {point}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <h2 className="text-3xl font-semibold text-white">Suggestions for Improvement:</h2>
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion, index) => (
                  <p key={index} className="text-lg leading-7 text-muted-foreground pl-4">
                    {index + 1}. {suggestion}
                  </p>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-white whitespace-nowrap">
                  Final Verdict:
                </h2>
                <Badge
                  className={`px-5 py-2 rounded-full text-2xl font-semibold ${
                    analysis.verdict === 'recommended'
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : analysis.verdict === 'needs-improvement'
                      ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}
                >
                  {analysis.verdict === 'recommended'
                    ? 'Recommended'
                    : analysis.verdict === 'needs-improvement'
                    ? 'Needs Improvement'
                    : 'Not Recommended'}
                </Badge>
              </div>

              <p className="text-lg leading-7 text-muted-foreground">
                {analysis.verdict === 'recommended'
                  ? 'The candidate demonstrates strong potential and would be a good fit for the role. Continue refining your skills and you will excel in your interviews.'
                  : analysis.verdict === 'needs-improvement'
                  ? 'The candidate shows promise but needs to work on the areas mentioned above. With focused practice and preparation, improvement is definitely achievable.'
                  : 'The candidate does not appear to be ready for this role at this time. Focus on the suggested improvements and practice more before your next interview.'}
              </p>
            </section>

            <div className="flex items-start gap-5 pt-4">
              <Button
                variant="outline"
                className="flex-1 py-6 text-base font-bold bg-secondary hover:bg-secondary/80"
                onClick={() => router.push('/')}
              >
                Back to Dashboard
              </Button>

              <Button
                className="flex-1 py-6 text-base font-bold bg-primary hover:bg-primary/90"
                onClick={() => router.push('/interview-session')}
              >
                Retake Interview
              </Button>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
