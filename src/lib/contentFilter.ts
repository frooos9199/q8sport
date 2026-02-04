/**
 * Content Filtering and Moderation Utility
 * Filters objectionable content using bad words list and pattern matching
 */

import { prisma } from './prisma';

// Common bad words in Arabic and English (can be extended via database)
const DEFAULT_BAD_WORDS_AR = [
  'كلب', 'حمار', 'غبي', 'احمق', 'قذر', 'لعنة', 'وسخ',
  // Add more Arabic bad words
];

const DEFAULT_BAD_WORDS_EN = [
  'fuck', 'shit', 'damn', 'bitch', 'ass', 'bastard', 'idiot', 'stupid',
  // Add more English bad words
];

// Patterns for spam and suspicious content
const SPAM_PATTERNS = [
  /اربح المال/gi,
  /earn money/gi,
  /click here/gi,
  /اضغط هنا/gi,
  /free money/gi,
  /مال مجاني/gi,
  /guaranteed win/gi,
  /فوز مضمون/gi,
];

// Suspicious URL patterns
const SUSPICIOUS_URL_PATTERNS = [
  /bit\.ly/gi,
  /tinyurl/gi,
  /goo\.gl/gi,
];

interface FilterResult {
  isClean: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  matchedWords: string[];
  warnings: string[];
}

/**
 * Get bad words from database
 */
async function getBadWords(language: 'ar' | 'en'): Promise<string[]> {
  try {
    const words = await prisma.badWord.findMany({
      where: {
        language,
        active: true,
      },
      select: {
        word: true,
      },
    });
    return words.map(w => w.word);
  } catch (error) {
    console.error('Error fetching bad words:', error);
    return language === 'ar' ? DEFAULT_BAD_WORDS_AR : DEFAULT_BAD_WORDS_EN;
  }
}

/**
 * Check if text contains bad words
 */
export async function filterContent(text: string): Promise<FilterResult> {
  const result: FilterResult = {
    isClean: true,
    severity: 'LOW',
    matchedWords: [],
    warnings: [],
  };

  if (!text || text.trim().length === 0) {
    return result;
  }

  const lowerText = text.toLowerCase();
  
  // Get bad words from database
  const arabicBadWords = await getBadWords('ar');
  const englishBadWords = await getBadWords('en');
  const allBadWords = [...arabicBadWords, ...englishBadWords];

  // Check for bad words
  for (const word of allBadWords) {
    if (lowerText.includes(word.toLowerCase())) {
      result.isClean = false;
      result.matchedWords.push(word);
      result.severity = 'HIGH';
    }
  }

  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      result.isClean = false;
      result.warnings.push('محتوى دعائي مشبوه / Spam detected');
      result.severity = 'MEDIUM';
    }
  }

  // Check for suspicious URLs
  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(text)) {
      result.warnings.push('روابط مشبوهة / Suspicious links detected');
      result.severity = 'MEDIUM';
    }
  }

  // Check for excessive capitalization (spam indicator)
  const capitalLetters = (text.match(/[A-ZА-Я]/g) || []).length;
  const totalLetters = (text.match(/[A-Za-zА-Яа-я]/g) || []).length;
  if (totalLetters > 20 && capitalLetters / totalLetters > 0.7) {
    result.warnings.push('استخدام مفرط للأحرف الكبيرة / Excessive caps');
  }

  return result;
}

/**
 * Clean text by replacing bad words with asterisks
 */
export async function cleanText(text: string): Promise<string> {
  const arabicBadWords = await getBadWords('ar');
  const englishBadWords = await getBadWords('en');
  const allBadWords = [...arabicBadWords, ...englishBadWords];

  let cleanedText = text;
  
  for (const word of allBadWords) {
    const regex = new RegExp(word, 'gi');
    cleanedText = cleanedText.replace(regex, '*'.repeat(word.length));
  }

  return cleanedText;
}

/**
 * Check if user has violated content policy multiple times
 */
export async function checkUserViolations(userId: string): Promise<{
  violationCount: number;
  shouldBan: boolean;
  shouldWarn: boolean;
}> {
  try {
    // Count resolved reports where user's content was removed
    const violations = await prisma.moderationAction.count({
      where: {
        targetId: userId,
        actionType: {
          in: ['CONTENT_REMOVED', 'WARNING', 'USER_SUSPENDED'],
        },
        createdAt: {
          // Count violations in last 30 days
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      violationCount: violations,
      shouldBan: violations >= 5, // Ban after 5 violations
      shouldWarn: violations >= 2, // Warn after 2 violations
    };
  } catch (error) {
    console.error('Error checking user violations:', error);
    return {
      violationCount: 0,
      shouldBan: false,
      shouldWarn: false,
    };
  }
}

/**
 * Check if content is banned
 */
export async function isContentBanned(
  contentType: string,
  contentId: string
): Promise<boolean> {
  try {
    const banned = await prisma.bannedContent.findUnique({
      where: {
        contentType_contentId: {
          contentType: contentType as any,
          contentId,
        },
      },
    });

    if (!banned) return false;

    // Check if temporary ban has expired
    if (!banned.permanent && banned.expiresAt && banned.expiresAt < new Date()) {
      // Remove expired ban
      await prisma.bannedContent.delete({
        where: { id: banned.id },
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking if content is banned:', error);
    return false;
  }
}

/**
 * Check if user is blocked
 */
export async function isUserBlocked(
  userId: string,
  blockedUserId: string
): Promise<boolean> {
  try {
    const blocked = await prisma.blockedUser.findUnique({
      where: {
        userId_blockedById: {
          userId: blockedUserId,
          blockedById: userId,
        },
      },
    });

    return !!blocked;
  } catch (error) {
    console.error('Error checking if user is blocked:', error);
    return false;
  }
}
