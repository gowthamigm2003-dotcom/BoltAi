'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InterviewSession } from '@/types';
import { formatDate, formatDuration } from '@/lib/utils';
import { Play, FileText, Clock, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startedAt: doc.data().startedAt?.toDate(),
        endedAt: doc.data().endedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as InterviewSession[];
      setSessions(sessionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const stats = {
    totalSessions: sessions.length,
    completedSessions: sessions.filter((s) => s.status === 'completed').length,
    averageScore:
      sessions
        .filter((s) => s.analysis?.overallScore)
        .reduce((acc, s) => acc + (s.analysis?.overallScore || 0), 0) /
        (sessions.filter((s) => s.analysis?.overallScore).length || 1) || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#101216] to-[#0f1014]">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-white mb-2">
            Welcome back, {user?.displayName || 'there'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your progress and continue preparing for your next interview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Sessions</span>
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalSessions}</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
              <Play className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.completedSessions}</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Avg. Score</span>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-white">{Math.round(stats.averageScore)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button
            onClick={() => router.push('/interview-session')}
            className="h-32 bg-primary text-primary-foreground hover:bg-primary/90 flex flex-col items-center justify-center gap-3"
          >
            <Play className="w-8 h-8" />
            <span className="text-lg font-semibold">Start New Interview</span>
          </Button>

          <Button
            onClick={() => router.push('/resume-analysis')}
            variant="outline"
            className="h-32 border-2 border-primary text-primary hover:bg-primary/10 flex flex-col items-center justify-center gap-3"
          >
            <FileText className="w-8 h-8" />
            <span className="text-lg font-semibold">Analyze Resume</span>
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Recent Sessions</h2>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sessions yet. Start your first interview to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() =>
                    session.status === 'completed' &&
                    router.push(`/interview-feedback/${session.id}`)
                  }
                  className={`border border-border rounded-lg p-4 transition-colors ${
                    session.status === 'completed'
                      ? 'hover:border-primary cursor-pointer'
                      : 'opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{session.title}</h3>
                    <Badge
                      className={
                        session.status === 'completed'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : session.status === 'in-progress'
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{session.jobRole}</span>
                    <span>•</span>
                    <span>{formatDate(session.startedAt)}</span>
                    {session.duration > 0 && (
                      <>
                        <span>•</span>
                        <span>{formatDuration(session.duration)}</span>
                      </>
                    )}
                    {session.analysis && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-primary">
                          Score: {session.analysis.overallScore}/100
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
