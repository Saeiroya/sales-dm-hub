const { upsertLead } = require('../repositories/leads.repository');
const { createMessage } = require('../repositories/messages.repository');
const { classifyIntent } = require('../services/intent.service');
const { calculateLeadScore, mapScoreToStatus } = require('../services/scoring.service');

exports.handleWebhook = async (req, res) => {
  try {
    const tenantId = 1;

    const externalId = req.body.external_id;
    const name = req.body.name || null;
    const phone = req.body.phone || null;
    const message = req.body.message || null;

    if (!externalId) {
      return res.status(400).json({
        success: false,
        message: 'external_id is required',
      });
    }

    const classification = classifyIntent(message);

    const score = calculateLeadScore({
      intent: classification.intent,
      phone,
      name,
      message,
    });

    const status = mapScoreToStatus(score);

    const lead = await upsertLead({
      tenantId,
      externalId,
      name,
      phone,
      score,
      status,
    });

    let savedMessage = null;

    if (message) {
      savedMessage = await createMessage({
        leadId: lead.id,
        tenantId,
        direction: 'inbound',
        content: message,
        intent: classification.intent,
        confidence: classification.confidence,
        rawPayload: req.body,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: {
        lead,
        savedMessage,
        classification,
      },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
