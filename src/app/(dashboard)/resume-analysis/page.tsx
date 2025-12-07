'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, CheckCircle, XCircle, Download } from 'lucide-react';

export default function ResumeAnalysisPage() {
  return (
    <ProtectedRoute>
      <ResumeAnalysisContent />
    </ProtectedRoute>
  );
}

function ResumeAnalysisContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription.trim() || !user) return;

    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData = await response.json();

      const fileRef = ref(storage, `resumes/${user.id}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'resumeAnalyses'), {
        userId: user.id,
        fileName: file.name,
        fileUrl,
        jobDescription,
        ...analysisData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setResult(analysisData);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadRevisedSnippet = () => {
    if (!result?.revisedSnippet) return;

    const blob = new Blob([result.revisedSnippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revised-resume-snippet.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#101216] to-[#0f1014]">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold text-white mb-2">Resume Analysis</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Upload your resume and get an ATA score with personalized suggestions
          </p>

          {!result ? (
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="mb-6">
                <label htmlFor="resume" className="block text-sm font-medium text-foreground mb-2">
                  Upload Resume (PDF, DOCX, or TXT)
                </label>
                <div className="relative">
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume"
                    className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    {file ? (
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <p className="text-foreground font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Click to upload or drag and drop</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="jobDescription"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Job Description
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  placeholder="Paste the job description here..."
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!file || !jobDescription.trim() || analyzing}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-base"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-semibold text-white mb-4">Analysis Complete!</h2>
                <div className="inline-flex flex-col items-center gap-2">
                  <div className="text-6xl font-bold text-primary">{result.ataScore}</div>
                  <p className="text-lg text-muted-foreground">ATA Score (out of 100)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Keyword Match</p>
                  <div className="flex items-center gap-2">
                    <Progress value={result.keywordScore} className="flex-1" />
                    <span className="text-sm font-semibold text-white">{result.keywordScore}%</span>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Semantic Similarity</p>
                  <div className="flex items-center gap-2">
                    <Progress value={result.semanticScore} className="flex-1" />
                    <span className="text-sm font-semibold text-white">{result.semanticScore}%</span>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Formatting</p>
                  <div className="flex items-center gap-2">
                    <Progress value={result.formattingScore} className="flex-1" />
                    <span className="text-sm font-semibold text-white">
                      {result.formattingScore}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Matched Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.breakdown.matchedKeywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.breakdown.missingKeywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Suggestions</h3>
                <ul className="space-y-2">
                  {result.breakdown.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-muted-foreground pl-4">
                      {index + 1}. {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {result.revisedSnippet && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Revised Summary Snippet</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadRevisedSnippet}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                  <div className="bg-background rounded-lg p-4 text-muted-foreground">
                    {result.revisedSnippet}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    setJobDescription('');
                  }}
                >
                  Analyze Another Resume
                </Button>
                <Button className="flex-1" onClick={() => router.push('/')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
