const INTENT_RULES = [
  {
    intent: 'purchase',
    priority: 'high',
    stage: 'qualified',
    scoreDelta: 50,
    keywords: ['خرید', 'میخرم', 'سفارش', 'ثبت سفارش', 'نحوه خرید'],
  },
  {
    intent: 'pricing',
    priority: 'high',
    stage: 'qualified',
    scoreDelta: 30,
    keywords: ['قیمت', 'هزینه', 'چنده', 'چقدر', 'تخفیف'],
  },
  {
    intent: 'availability',
    priority: 'high',
    stage: 'qualified',
    scoreDelta: 20,
    keywords: ['موجود', 'موجودی', 'دارید'],
  },
  {
    intent: 'support',
    priority: 'medium',
    stage: 'engaged',
    scoreDelta: 10,
    keywords: ['پشتیبانی', 'مشکل', 'خراب', 'خطا', 'گارانتی'],
  },
];

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
    .replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\u200c/g, ' ').replace(/\s+/g, ' ');
}

function classifyIntent(text) {
  const normalizedText = normalizeText(text);
  if (!normalizedText) return { intent: 'unknown', priority: 'normal', scoreDelta: 0, stage: 'incoming' };

  let bestMatch = null;
  for (const rule of INTENT_RULES) {
    const matchedKeywords = rule.keywords.filter(kw => normalizedText.includes(normalizeText(kw)));
    if (matchedKeywords.length > 0) {
      if (!bestMatch || matchedKeywords.length > bestMatch.matchedKeywords.length) {
        bestMatch = { ...rule, matchedKeywords };
      }
    }
  }

  return bestMatch || { intent: 'general', priority: 'normal', scoreDelta: 5, stage: 'incoming', matchedKeywords: [] };
}

module.exports = { classifyIntent };
