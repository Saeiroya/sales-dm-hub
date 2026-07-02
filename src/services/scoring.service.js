function calculateLeadScore({ intent, phone, name, message }) {
  let score = 0;

  if (phone) score += 20;
  if (name) score += 10;
  if (message) score += 5;

  switch (intent) {
    case 'buy_request':
      score += 50;
      break;
    case 'price_inquiry':
      score += 35;
      break;
    case 'shipping_inquiry':
      score += 20;
      break;
    default:
      score += 5;
      break;
  }

  if (score > 100) score = 100;
  return score;
}

function mapScoreToStatus(score) {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

module.exports = {
  calculateLeadScore,
  mapScoreToStatus,
};
