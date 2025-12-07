import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractKeywords, cosineSimilarity, calculateATAScore } from '@/lib/utils';
import mammoth from 'mammoth';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const buffer = await file.arrayBuffer();

  if (fileType === 'application/pdf') {
    return 'PDF text extraction placeholder. Install pdf-parse for full functionality.';
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return result.value;
  } else if (fileType === 'text/plain') {
    return await file.text();
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
  }
}

function calculateFormattingScore(text: string): number {
  let score = 100;

  if (text.length < 300) score -= 20;
  else if (text.length > 2000) score -= 10;

  const hasStructure = /Experience|Education|Skills|Projects/i.test(text);
  if (!hasStructure) score -= 30;

  const bulletPoints = (text.match(/[•\-\*]/g) || []).length;
  if (bulletPoints < 3) score -= 10;

  const hasEmail = /\S+@\S+\.\S+/.test(text);
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  if (!hasEmail) score -= 10;
  if (!hasPhone) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function calculateKeywordMatch(resumeKeywords: string[], jobKeywords: string[]): {
  score: number;
  matched: string[];
  missing: string[];
} {
  const matched = resumeKeywords.filter(kw => jobKeywords.includes(kw));
  const missing = jobKeywords.filter(kw => !resumeKeywords.includes(kw));

  const score = jobKeywords.length > 0 ? (matched.length / jobKeywords.length) * 100 : 0;

  return { score, matched, missing };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;

    if (!file || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume file and job description are required' },
        { status: 400 }
      );
    }

    const resumeText = await extractTextFromFile(file);

    const resumeKeywords = extractKeywords(resumeText);
    const jobKeywords = extractKeywords(jobDescription);

    const { score: keywordScore, matched, missing } = calculateKeywordMatch(
      resumeKeywords,
      jobKeywords
    );

    const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });
    const [resumeEmbedding, jobEmbedding] = await Promise.all([
      embeddingModel.embedContent(resumeText),
      embeddingModel.embedContent(jobDescription),
    ]);

    const semanticScore =
      cosineSimilarity(resumeEmbedding.embedding.values, jobEmbedding.embedding.values) * 100;

    const formattingScore = calculateFormattingScore(resumeText);

    const ataScore = calculateATAScore(keywordScore, semanticScore, formattingScore);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const suggestionsPrompt = `
Based on this resume and job description, provide 5 specific suggestions to improve the resume:

Resume:
${resumeText.substring(0, 2000)}

Job Description:
${jobDescription.substring(0, 1000)}

Missing keywords: ${missing.join(', ')}

Provide actionable suggestions as a JSON array of strings.
`;

    const suggestionsResult = await model.generateContent(suggestionsPrompt);
    let suggestions: string[] = [];

    try {
      const suggestionsText = suggestionsResult.response.text();
      const jsonMatch = suggestionsText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = suggestionsText.split('\n').filter(s => s.trim().length > 0);
      }
    } catch {
      suggestions = [
        'Add more relevant keywords from the job description',
        'Quantify your achievements with specific metrics',
        'Tailor your experience section to match job requirements',
        'Include technical skills mentioned in the job posting',
        'Improve formatting with clear section headers and bullet points',
      ];
    }

    const revisedSnippetPrompt = `
Rewrite this resume summary to better match the job description. Keep it concise (3-4 sentences):

Current Summary:
${resumeText.substring(0, 500)}

Job Description:
${jobDescription.substring(0, 500)}

Provide only the rewritten summary, no additional commentary.
`;

    const revisedResult = await model.generateContent(revisedSnippetPrompt);
    const revisedSnippet = revisedResult.response.text().trim();

    return NextResponse.json({
      ataScore,
      keywordScore: Math.round(keywordScore),
      semanticScore: Math.round(semanticScore),
      formattingScore,
      breakdown: {
        matchedKeywords: matched.slice(0, 10),
        missingKeywords: missing.slice(0, 10),
        suggestions,
      },
      revisedSnippet,
    });
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
