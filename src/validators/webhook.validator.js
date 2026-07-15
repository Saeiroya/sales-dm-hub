const { z } = require('zod');

const webhookPayloadSchema = z.object({
  tenantId: z.coerce.number().int().positive(),
  channelId: z.coerce.number().int().positive(),
  externalId: z.string().min(1),
  externalMessageId: z.string().min(1).optional(),
  fullName: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  source: z.string().min(1),
  direction: z.enum(['inbound', 'outbound']).default('inbound'),
  messageText: z.string().min(1),
  rawPayload: z.any().optional(),
});

module.exports = {
  webhookPayloadSchema,
};
