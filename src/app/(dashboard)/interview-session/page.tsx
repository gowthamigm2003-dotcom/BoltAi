'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { TranscriptMessage } from '@/types';
import { Mic, MicOff, Pause, Play, Square, Flag } from 'lucide-react';

export default function InterviewSessionPage() {
  return (
    <ProtectedRoute>
      <InterviewSessionContent />
    </ProtectedRoute>
  );
}

function InterviewSessionContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startSession = async () => {
    if (!user || !jobRole.trim()) return;

    const sessionDoc = await addDoc(collection(db, 'sessions'), {
      userId: user.id,
      title: `${jobRole} Interview`,
      jobRole,
      status: 'in-progress',
      startedAt: new Date(),
      duration: 0,
      transcript: [],
      markedForReview: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setSessionId(sessionDoc.id);
    setSessionStarted(true);
    setStartTime(Date.now());

    const initialMessage: TranscriptMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Welcome! I'm your interview assistant. Let's begin your ${jobRole} interview. Tell me about yourself and your experience.`,
      timestamp: new Date(),
    };
    setTranscript([initialMessage]);

    startRecording();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused && isRecording) {
      mediaRecorderRef.current?.pause();
    } else if (isPaused && isRecording) {
      mediaRecorderRef.current?.resume();
    }
  };

  const sendMessage = async (userMessage: string) => {
    if (!sessionId || isStreaming) return;

    const userMsg: TranscriptMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setTranscript((prev) => [...prev, userMsg]);

    setIsStreaming(true);
    setAssistantMessage('');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          history: transcript.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })),
          systemInstruction: `You are an experienced interviewer conducting a ${jobRole} interview. Ask relevant technical and behavioral questions. Provide follow-up questions based on the candidate's responses.`,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                fullText += parsed.text;
                setAssistantMessage(fullText);
              } catch {}
            }
          }
        }
      }

      const assistantMsg: TranscriptMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: fullText,
        timestamp: new Date(),
      };
      setTranscript((prev) => [...prev, assistantMsg]);
      setAssistantMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const markForReview = (messageId: string) => {
    setTranscript((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, markedForReview: !msg.markedForReview } : msg
      )
    );
  };

  const endSession = async () => {
    if (!sessionId || !user) return;

    stopRecording();

    const duration = Math.floor((Date.now() - startTime) / 1000);

    let audioUrl = '';
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioRef = ref(storage, `audio/${user.id}/${sessionId}.webm`);
      await uploadBytes(audioRef, audioBlob);
      audioUrl = await getDownloadURL(audioRef);
    }

    await updateDoc(doc(db, 'sessions', sessionId), {
      status: 'completed',
      endedAt: new Date(),
      duration,
      transcript,
      audioUrl,
      markedForReview: transcript.filter((m) => m.markedForReview).map((m) => m.id),
      updatedAt: new Date(),
    });

    router.push(`/interview-feedback/${sessionId}`);
  };

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#101216] to-[#0f1014]">
        <Navbar />
        <main className="container mx-auto px-4 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-semibold text-white mb-4">Start Interview Session</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Prepare for your interview with AI-powered practice
            </p>

            <div className="bg-card border border-border rounded-xl p-8">
              <label htmlFor="jobRole" className="block text-sm font-medium text-foreground mb-2">
                What position are you interviewing for?
              </label>
              <input
                id="jobRole"
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g., Frontend Developer, Product Manager"
                className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-6"
              />

              <Button
                onClick={startSession}
                disabled={!jobRole.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-base"
              >
                Start Interview
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#101216] to-[#0f1014]">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-white">{jobRole} Interview</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={togglePause} size="sm">
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button variant="destructive" onClick={endSession} size="sm">
              <Square className="w-4 h-4 mr-2" />
              End Interview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-card border border-border rounded-xl p-6 h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {transcript.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : msg.role === 'coach'
                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium opacity-70">
                        {msg.role === 'user' ? 'You' : msg.role === 'coach' ? 'Coach' : 'Assistant'}
                      </span>
                      {msg.role === 'user' && (
                        <button
                          onClick={() => markForReview(msg.id)}
                          className={`ml-2 ${msg.markedForReview ? 'text-yellow-500' : 'opacity-50'}`}
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {assistantMessage && (
                <div className="flex gap-3 justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-secondary text-secondary-foreground">
                    <p className="text-xs font-medium opacity-70 mb-1">Assistant</p>
                    <p className="text-sm whitespace-pre-wrap">{assistantMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 mb-4">
              <h3 className="text-lg font-semibold text-white mb-4">Recording</h3>
              <div className="flex items-center justify-center py-8">
                {isRecording ? (
                  <div className="relative">
                    <Mic className="w-12 h-12 text-red-500" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <MicOff className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {isRecording ? 'Recording in progress' : 'Recording paused'}
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Coach Tips</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>✓ Maintain eye contact</p>
                <p>✓ Be specific with examples</p>
                <p>✓ Use the STAR method</p>
                <p>✓ Ask clarifying questions</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
