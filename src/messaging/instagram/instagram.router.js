const express = require('express');
const router = express.Router();

const handleInstagramWebhook = require('./instagram.webhook');

router.post('/', handleInstagramWebhook);

module.exports = router;
