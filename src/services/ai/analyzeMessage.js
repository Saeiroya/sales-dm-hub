// src/services/ai/analyzeMessage.js

/**
 * تحلیل پیام فارسی برای intent, leadScore, replySuggestion
 * فعلاً نسخه‌ی ساده rule-based برای تست end-to-end
 */

/**
 * @param {Object} params
 * @param {number} params.tenantId
 * @param {number} params.messageId
 * @param {string} params.content
 * @param {Object} [params.context]
 */
async function analyzeMessage({ tenantId, messageId, content, context = {} }) {
  if (!content || typeof content !== 'string') {
    return {
      intent: 'unknown',
      leadScore: 0,
      replySuggestion: null,
      tags: [],
      confidence: 0.3,
      metadata: { reason: 'empty_or_invalid_content', model: 'rule-based-v0' }
    };
  }

  const text = content.trim();

  let intent = 'general_question';
  let leadScore = 10;
  let replySuggestion =
    'ممنون از پیام‌تون، لطفاً بفرمایید دقیقاً درباره‌ی کدام محصول یا خدمات سؤال دارید؟';
  const tags = [];
  let confidence = 0.5;

  const pricingKeywords = ['قیمت', 'چنده', 'چند هست', 'هزینه', 'تعرفه', 'فی'];
  const discountKeywords = ['تخفیف', 'آف', 'کوپن', 'کد تخفیف'];
  const availabilityKeywords = ['موجود', 'انبار', 'کی موجود میشه', 'پیش سفارش', 'ارسال دارین'];
  const complaintKeywords = ['شکایت', 'ناراضی', 'مرجوع', 'خراب', 'مشکل', 'پشتیبانی جواب نداد'];
  const greetingKeywords = ['سلام', 'درود', 'وقت بخیر'];
  const buyKeywords = ['می‌خوام بخرم', 'سفارش', 'خرید', 'ثبت سفارش', 'می‌خوام اینو بگیرم'];

  const contains = (list) => list.some((k) => text.includes(k));

  if (contains(pricingKeywords)) {
    intent = 'pricing_question';
    leadScore = 70;
    replySuggestion =
      'سلام، برای راهنمایی دقیق‌تر لطفاً لینک یا نام دقیق محصول رو بفرمایید تا قیمت و شرایط فروش رو خدمت‌تون اعلام کنم.';
    tags.push('pricing');
    confidence = 0.8;
  }

  if (contains(discountKeywords)) {
    intent = intent === 'pricing_question' ? 'pricing_and_discount' : 'discount_question';
    leadScore = Math.max(leadScore, 75);
    replySuggestion =
      'سلام، در حال حاضر برای بعضی محصولات و کمپین‌ها تخفیف فعال داریم. لطفاً بفرمایید درباره‌ی کدام محصول یا دسته‌بندی می‌پرسید؟';
    tags.push('discount');
    confidence = 0.8;
  }

  if (contains(availabilityKeywords)) {
    intent = 'availability_question';
    leadScore = Math.max(leadScore, 60);
    replySuggestion =
      'سلام، لطفاً نام یا لینک محصول رو بفرمایید تا وضعیت موجودی و زمان ارسال رو چک کنم.';
    tags.push('availability');
    confidence = 0.75;
  }

  if (contains(complaintKeywords)) {
    intent = 'complaint';
    leadScore = 40;
    replySuggestion =
      'سلام، از اینکه تجربه‌ی خوبی نداشتید متأسفیم. لطفاً شماره سفارش یا توضیحات دقیق‌تری بفرمایید تا سریع‌تر پیگیری کنیم.';
    tags.push('complaint');
    confidence = 0.85;
  }

  if (contains(greetingKeywords) && text.length <= 30) {
    intent = 'greeting';
    leadScore = 5;
    replySuggestion = 'سلام، وقت شما هم بخیر 🌱 چطور می‌تونم کمکتون کنم؟';
    tags.push('greeting');
    confidence = 0.7;
  }

  if (contains(buyKeywords)) {
    leadScore = Math.max(leadScore, 85);
    tags.push('buy-intent');
  }

  return {
    intent,
    leadScore,
    replySuggestion,
    tags,
    confidence,
    metadata: {
      model: 'rule-based-v0',
      lang: 'fa',
      tenantId,
      messageId,
      contextUsed: !!context && Object.keys(context).length > 0
    }
  };
}

module.exports = {
  analyzeMessage
};
