// Score thresholds for SEO factors
const SCORE_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 70,
  AVERAGE: 50,
  POOR: 30
};

// Calculate overall SEO score based on various factors
export function calculateSeoScore(factors: { [key: string]: number }) {
  // Weight of each factor in the overall score
  const weights = {
    metaTitle: 0.10,
    metaDescription: 0.10,
    headings: 0.08,
    contentQuality: 0.12,
    keywordDensity: 0.10,
    internalLinks: 0.08,
    externalLinks: 0.05,
    imagesAlt: 0.05,
    pageSpeed: 0.10,
    mobileCompatibility: 0.08,
    security: 0.07,
    socialMetadata: 0.07
  };

  let totalWeightedScore = 0;
  let totalWeightApplied = 0;

  // Calculate weighted score for each factor that exists
  Object.entries(factors).forEach(([factor, score]) => {
    if (factor in weights && typeof score === 'number') {
      const weight = weights[factor as keyof typeof weights];
      totalWeightedScore += score * weight;
      totalWeightApplied += weight;
    }
  });

  // Adjust for missing factors if necessary
  if (totalWeightApplied > 0 && totalWeightApplied < 1) {
    return Math.round(totalWeightedScore / totalWeightApplied);
  }

  return Math.round(totalWeightedScore);
}

// Get score category based on numeric score
export function getScoreCategory(score: number) {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'excellent';
  if (score >= SCORE_THRESHOLDS.GOOD) return 'good';
  if (score >= SCORE_THRESHOLDS.AVERAGE) return 'average';
  if (score >= SCORE_THRESHOLDS.POOR) return 'poor';
  return 'critical';
}

// Get CSS class based on score
export function getScoreClass(score: number) {
  if (score >= SCORE_THRESHOLDS.GOOD) return 'score-high';
  if (score >= SCORE_THRESHOLDS.AVERAGE) return 'score-medium';
  return 'score-low';
}

// Calculate title tag quality score
export function calculateTitleScore(title: string | null | undefined, targetKeywords: string[] = []) {
  if (!title) return 0;
  
  let score = 0;
  
  // Length check (50-60 characters is ideal)
  const length = title.length;
  if (length >= 50 && length <= 60) {
    score += 100;
  } else if (length >= 40 && length <= 70) {
    score += 70;
  } else if (length > 0) {
    score += 40;
  }
  
  // Keyword presence
  if (targetKeywords.length > 0) {
    const titleLower = title.toLowerCase();
    const keywordMatch = targetKeywords.some(keyword => 
      titleLower.includes(keyword.toLowerCase())
    );
    
    if (keywordMatch) {
      score += 100;
    }
    
    // Return average score
    return Math.round(score / 2);
  }
  
  return score;
}

// Calculate meta description quality score
export function calculateDescriptionScore(description: string | null | undefined, targetKeywords: string[] = []) {
  if (!description) return 0;
  
  let score = 0;
  
  // Length check (150-160 characters is ideal)
  const length = description.length;
  if (length >= 150 && length <= 160) {
    score += 100;
  } else if (length >= 120 && length <= 170) {
    score += 70;
  } else if (length > 0) {
    score += 40;
  }
  
  // Keyword presence
  if (targetKeywords.length > 0) {
    const descLower = description.toLowerCase();
    const keywordMatch = targetKeywords.some(keyword => 
      descLower.includes(keyword.toLowerCase())
    );
    
    if (keywordMatch) {
      score += 100;
    }
    
    // Return average score
    return Math.round(score / 2);
  }
  
  return score;
}

// Calculate headings structure score
export function calculateHeadingsScore(headings: any) {
  if (!headings || !Array.isArray(headings)) return 0;
  
  let score = 0;
  
  // Check if there's an H1
  const hasH1 = headings.some(h => h.type === 'h1');
  if (hasH1) {
    score += 50;
  }
  
  // Check if there's a proper heading hierarchy
  const hasH2 = headings.some(h => h.type === 'h2');
  if (hasH2) {
    score += 25;
  }
  
  // Check if there are too many H1s (should have only one)
  const h1Count = headings.filter(h => h.type === 'h1').length;
  if (h1Count === 1) {
    score += 25;
  } else if (h1Count > 1) {
    score -= 25;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Calculate content quality score (simplified estimate)
export function calculateContentScore(content: string | null | undefined, minWords = 300) {
  if (!content) return 0;
  
  let score = 0;
  
  // Word count
  const words = content.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  
  if (wordCount >= minWords) {
    score += 60;
  } else if (wordCount >= minWords / 2) {
    score += 30;
  }
  
  // Paragraph structure (rough estimate)
  const paragraphs = content.split(/\n\s*\n/);
  if (paragraphs.length >= 3) {
    score += 20;
  }
  
  // Sentence variety (rough estimate)
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).filter(Boolean).length);
  
  const hasVariety = sentenceLengths.some(len => len <= 10) && 
                     sentenceLengths.some(len => len > 15);
  
  if (hasVariety) {
    score += 20;
  }
  
  return score;
}

// Calculate keyword density score
export function calculateKeywordDensityScore(content: string | null | undefined, keyword: string) {
  if (!content || !keyword) return 0;
  
  const contentLower = content.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  
  // Count keyword occurrences
  let count = 0;
  let lastIndex = -1;
  
  while ((lastIndex = contentLower.indexOf(keywordLower, lastIndex + 1)) !== -1) {
    count++;
  }
  
  // Get total words
  const words = contentLower.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  
  if (totalWords === 0) return 0;
  
  // Calculate density percentage
  const density = (count * keywordLower.split(/\s+/).filter(Boolean).length / totalWords) * 100;
  
  // Score based on density (1-3% is generally good)
  if (density >= 1 && density <= 3) {
    return 100;
  } else if (density > 0 && density < 1) {
    return 70;
  } else if (density > 3 && density <= 5) {
    return 50;
  } else if (density > 5) {
    return 30; // Over-optimization
  }
  
  return 0; // No keyword found
}

// Extract domain from URL
export function extractDomain(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    // If URL parsing fails, try basic extraction
    const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/i);
    return match ? match[1] : url;
  }
}

// Format large numbers with commas
export function formatNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Generate recommendation based on score
export function generateRecommendation(factor: string, score: number) {
  const recommendations: Record<string, Record<string, string>> = {
    metaTitle: {
      low: "Your title tag needs improvement. Aim for 50-60 characters and include your primary keyword.",
      medium: "Your title is acceptable but could be improved. Ensure it's compelling and includes your primary keyword.",
      high: "Great job! Your title tag is well-optimized."
    },
    metaDescription: {
      low: "Your meta description needs improvement. Aim for 150-160 characters and include your primary keyword.",
      medium: "Your meta description is acceptable but could be more compelling. Include a call-to-action.",
      high: "Excellent! Your meta description is well-optimized."
    },
    headings: {
      low: "Your heading structure needs improvement. Use one H1 tag and create a logical heading hierarchy.",
      medium: "Your heading structure is acceptable but could be improved. Ensure a logical hierarchy and include keywords in important headings.",
      high: "Great job! Your heading structure is well-organized."
    },
    contentQuality: {
      low: "Your content needs substantial improvement. Aim for at least 300 words of high-quality, original content.",
      medium: "Your content is acceptable but could be improved. Add more detail and ensure it provides value to readers.",
      high: "Excellent! Your content is comprehensive and valuable."
    },
    keywordDensity: {
      low: "Your keyword density is either too low or too high. Aim for 1-3% keyword density for optimal results.",
      medium: "Your keyword density is acceptable but could be improved. Ensure keywords appear naturally throughout the content.",
      high: "Great job! Your keyword density is optimal."
    },
    internalLinks: {
      low: "Your page has too few internal links. Add more to improve navigation and distribute page authority.",
      medium: "Your internal linking is acceptable but could be improved. Use descriptive anchor text and link to relevant pages.",
      high: "Excellent! Your internal linking structure is well-implemented."
    },
    externalLinks: {
      low: "Consider adding more high-quality external links to authoritative sources to improve credibility.",
      medium: "Your external links are acceptable but ensure they all point to high-quality, relevant sources.",
      high: "Great job! Your external links add value to your content."
    },
    imagesAlt: {
      low: "Many of your images are missing alt text. Add descriptive alt text that includes keywords when appropriate.",
      medium: "Some images have good alt text, but others need improvement. Ensure all images have descriptive alt attributes.",
      high: "Excellent! Your images have descriptive alt text."
    },
    pageSpeed: {
      low: "Your page speed needs significant improvement. Optimize images, enable compression, and minimize code.",
      medium: "Your page speed is acceptable but could be improved. Look for specific opportunities to optimize.",
      high: "Great job! Your page loads quickly, which benefits both users and SEO."
    },
    mobileCompatibility: {
      low: "Your page is not mobile-friendly. Implement responsive design to improve mobile user experience.",
      medium: "Your page is somewhat mobile-friendly but has issues. Address specific mobile usability problems.",
      high: "Excellent! Your page is fully mobile-compatible."
    },
    security: {
      low: "Your page is not secure. Implement HTTPS to protect user data and improve SEO.",
      medium: "Your security is acceptable but could be improved. Ensure all resources load over HTTPS.",
      high: "Great job! Your page is properly secured with HTTPS."
    },
    socialMetadata: {
      low: "Your page is missing important social media metadata. Add Open Graph and Twitter Card tags.",
      medium: "Your social metadata is present but could be improved. Ensure all required properties are included.",
      high: "Excellent! Your social media metadata is well-implemented."
    }
  };

  const category = score >= 70 ? 'high' : (score >= 50 ? 'medium' : 'low');
  
  return recommendations[factor]?.[category] || "No specific recommendation available.";
}

// Get score level for UI display
export function getScoreLevel(score: number) {
  if (score >= 80) return { label: 'Excellent', color: 'green' };
  if (score >= 70) return { label: 'Good', color: 'green' };
  if (score >= 50) return { label: 'Average', color: 'yellow' };
  if (score >= 30) return { label: 'Poor', color: 'red' };
  return { label: 'Critical', color: 'red' };
}
