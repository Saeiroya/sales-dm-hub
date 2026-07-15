function isValidIranianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;

  const normalized = phone.replace(/[^\d]/g, '');

  return (
    /^09\d{9}$/.test(normalized) ||
    /^989\d{9}$/.test(normalized) ||
    /^00989\d{9}$/.test(normalized)
  );
}

function getMessageStrength(message) {
  if (!message || typeof message !== 'string') return 0;

  const text = message.trim();
  if (!text) return 0;

  let score = 0;

  if (text.length >= 5) score += 5;
  if (text.length >= 15) score += 5;
  if (text.length >= 40) score += 5;

  const strongSignals = [
    'خرید',
    'سفارش',
    'ثبت سفارش',
    'قیمت',
    'موجوده',
    'ارسال',
    'شماره',
    'تماس',
    'پرداخت',
  ];

  const matchedSignals = strongSignals.filter((word) => text.includes(word));
  score += Math.min(matchedSignals.length * 4, 20);

  return score;
}

function getIntentScore(intent) {
  switch (intent) {
    case 'buy_request':
      return 45;
    case 'price_inquiry':
      return 30;
    case 'availability_inquiry':
      return 25;
    case 'shipping_inquiry':
      return 18;
    case 'general_message':
      return 8;
    case 'unknown':
    default:
      return 0;
  }
}

function calculateLeadScore({ intent, phone, name, message }) {
  let score = 0;

  if (isValidIranianPhone(phone)) {
    score += 25;
  } else if (phone) {
    score += 8;
  }

  if (name && typeof name === 'string' && name.trim().length >= 2) {
    score += 10;
  }

  score += getMessageStrength(message);
  score += getIntentScore(intent);

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  return score;
}

function mapScoreToStatus(score) {
  if (score >= 75) return 'hot';
  if (score >= 45) return 'warm';
  return 'cold';
}

module.exports = {
  calculateLeadScore,
  mapScoreToStatus,
  isValidIranianPhone,
};
