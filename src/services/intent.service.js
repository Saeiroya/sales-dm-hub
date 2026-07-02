function classifyIntent(message) {
  if (!message || typeof message !== 'string') {
    return {
      intent: 'unknown',
      confidence: 0,
      matchedKeywords: [],
    };
  }

  const text = message.toLowerCase();

  const rules = [
    {
      intent: 'buy_request',
      confidence: 0.95,
      keywords: ['میخوام', 'می‌خوام', 'خرید', 'سفارش', 'ثبت سفارش'],
    },
    {
      intent: 'price_inquiry',
      confidence: 0.9,
      keywords: ['قیمت', 'چنده', 'هزینه'],
    },
    {
      intent: 'shipping_inquiry',
      confidence: 0.8,
      keywords: ['ارسال', 'پست', 'تحویل'],
    },
  ];

  for (const rule of rules) {
    const matchedKeywords = rule.keywords.filter((k) => text.includes(k));
    if (matchedKeywords.length > 0) {
      return {
        intent: rule.intent,
        confidence: rule.confidence,
        matchedKeywords,
      };
    }
  }

  return {
    intent: 'general_message',
    confidence: 0.4,
    matchedKeywords: [],
  };
}

module.exports = {
  classifyIntent,
};
