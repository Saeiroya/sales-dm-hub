const {
  processInstagramWebhook,
} = require('./instagram.service');

async function handleInstagramWebhook(req, res, next) {
  try {
    const payload = req.body;

    const result = await processInstagramWebhook(payload);

    return res.status(200).json({
      success: true,
      message: 'Instagram webhook received successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = handleInstagramWebhook;
