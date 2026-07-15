function normalizePersianText(input) {
  if (!input || typeof input !== 'string') return '';

  return input
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ') // نیم‌فاصله -> فاصله
    .replace(/[ـ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const RULES = [
  {
    intent: 'buy_request',
    priority: 100,
    keywords: [
      'میخوام',
      'می خوام',
      'می‌خوام',
      'میخام',
      'خرید',
      'بخرم',
      'سفارش',
      'ثبت سفارش',
      'سفارش بدم',
      'میگیرم',
      'می گیرم',
      'لازم دارم',
      'قصد خرید دارم',
    ],
  },
  {
    intent: 'price_inquiry',
    priority: 80,
    keywords: [
      'قیمت',
      'چنده',
      'هزینه',
      'چند',
      'نرخ',
      'قیمتش',
      'قیمتش چنده',
    ],
  },
  {
    intent: 'shipping_inquiry',
    priority: 60,
    keywords: [
      'ارسال',
      'پست',
      'تحویل',
      'ارسال دارید',
      'چطور ارسال',
      'هزینه ارسال',
      'چند روزه میرسه',
      'کی میرسه',
    ],
  },
  {
    intent: 'availability_inquiry',
    priority: 70,
    keywords: [
      'موجوده',
      'موجود دارید',
      'هست',
      'موجود',
      'ناموجود',
      'کی موجود میشه',
    ],
  },
];

function buildConfidence(matchCount, priority) {
  let confidence = 0.35;

  confidence += Math.min(matchCount * 0.18, 0.4);
  confidence += Math.min(priority / 200, 0.25);

  if (confidence > 0.98) confidence = 0.98;
  return Number(confidence.toFixed(2));
}

function classifyIntent(message) {
  if (!message || typeof message !== 'string') {
    return {
      intent: 'unknown',
      confidence: 0,
      matchedKeywords: [],
      normalizedText: '',
    };
  }

  const normalizedText = normalizePersianText(message);

  if (!normalizedText) {
    return {
      intent: 'unknown',
      confidence: 0,
      matchedKeywords: [],
      normalizedText: '',
    };
  }

  const candidates = [];

  for (const rule of RULES) {
    const matchedKeywords = rule.keywords.filter((keyword) => {
      const normalizedKeyword = normalizePersianText(keyword);
      return normalizedText.includes(normalizedKeyword);
    });

    if (matchedKeywords.length > 0) {
      candidates.push({
        intent: rule.intent,
        priority: rule.priority,
        matchedKeywords,
        matchCount: matchedKeywords.length,
        confidence: buildConfidence(matchedKeywords.length, rule.priority),
      });
    }
  }

  if (candidates.length === 0) {
    return {
      intent: 'general_message',
      confidence: 0.3,
      matchedKeywords: [],
      normalizedText,
    };
  }

  candidates.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return b.priority - a.priority;
  });

  const best = candidates[0];

  return {
    intent: best.intent,
    confidence: best.confidence,
    matchedKeywords: best.matchedKeywords,
    normalizedText,
  };
}

module.exports = {
  classifyIntent,
  normalizePersianText,
};
