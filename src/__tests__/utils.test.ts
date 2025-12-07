import {
  calculateATAScore,
  extractKeywords,
  cosineSimilarity,
  formatDuration,
} from '../lib/utils';

describe('Utility Functions', () => {
  describe('calculateATAScore', () => {
    it('should calculate ATA score correctly', () => {
      const keywordScore = 80;
      const semanticScore = 90;
      const formattingScore = 85;

      const ataScore = calculateATAScore(keywordScore, semanticScore, formattingScore);

      const expected = Math.round(80 * 0.45 + 90 * 0.45 + 85 * 0.1);
      expect(ataScore).toBe(expected);
      expect(ataScore).toBe(85);
    });

    it('should handle edge case with all zeros', () => {
      const ataScore = calculateATAScore(0, 0, 0);
      expect(ataScore).toBe(0);
    });

    it('should handle perfect scores', () => {
      const ataScore = calculateATAScore(100, 100, 100);
      expect(ataScore).toBe(100);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'React TypeScript JavaScript frontend developer with experience';
      const keywords = extractKeywords(text);

      expect(keywords).toContain('react');
      expect(keywords).toContain('typescript');
      expect(keywords).toContain('javascript');
      expect(keywords).toContain('frontend');
      expect(keywords).toContain('developer');
      expect(keywords).toContain('experience');
    });

    it('should filter out stop words', () => {
      const text = 'The developer is working with React and TypeScript';
      const keywords = extractKeywords(text);

      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('is');
      expect(keywords).not.toContain('with');
      expect(keywords).not.toContain('and');
    });

    it('should filter out short words', () => {
      const text = 'I am a web dev';
      const keywords = extractKeywords(text);

      expect(keywords).not.toContain('i');
      expect(keywords).not.toContain('am');
      expect(keywords).not.toContain('a');
      expect(keywords).not.toContain('web');
      expect(keywords).not.toContain('dev');
    });

    it('should return unique keywords', () => {
      const text = 'React React TypeScript TypeScript';
      const keywords = extractKeywords(text);

      const reactCount = keywords.filter((k) => k === 'react').length;
      const typescriptCount = keywords.filter((k) => k === 'typescript').length;

      expect(reactCount).toBe(1);
      expect(typescriptCount).toBe(1);
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [1, 0, 0];
      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBe(1);
    });

    it('should return 0 for orthogonal vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBe(0);
    });

    it('should handle different length vectors', () => {
      const vec1 = [1, 0];
      const vec2 = [1, 0, 0];
      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBe(0);
    });

    it('should handle zero vectors', () => {
      const vec1 = [0, 0, 0];
      const vec2 = [1, 2, 3];
      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('should format minutes and seconds correctly', () => {
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(125)).toBe('2m 5s');
    });

    it('should format hours, minutes and seconds correctly', () => {
      expect(formatDuration(3665)).toBe('1h 1m 5s');
      expect(formatDuration(7200)).toBe('2h 0m 0s');
    });
  });
});
