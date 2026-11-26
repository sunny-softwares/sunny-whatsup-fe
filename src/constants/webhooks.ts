// Outbound webhooks — a company's own endpoint for message status updates.
// Values mirror the backend's src/constants/webhook.js. Field descriptions and
// the signing/retry contract come from the API (GET /company/webhook), so they
// are not duplicated here.

export const WEBHOOK_FIELD = {
  MESSAGES: 'messages',
} as const;
export type WebhookField = (typeof WEBHOOK_FIELD)[keyof typeof WEBHOOK_FIELD];

export const WEBHOOK_ENDPOINT_STATUS = {
  UNVERIFIED: 'unverified',
  ACTIVE: 'active',
  DISABLED: 'disabled',
} as const;
export type WebhookEndpointStatus =
  (typeof WEBHOOK_ENDPOINT_STATUS)[keyof typeof WEBHOOK_ENDPOINT_STATUS];

export const WEBHOOK_DISABLED_REASON = {
  MANUAL: 'manual',
  FAILURE_THRESHOLD: 'failure_threshold',
  GONE: 'gone',
} as const;
export type WebhookDisabledReason =
  (typeof WEBHOOK_DISABLED_REASON)[keyof typeof WEBHOOK_DISABLED_REASON];

export const WEBHOOK_DELIVERY_STATUS = {
  PENDING: 'pending',
  IN_FLIGHT: 'in_flight',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  SKIPPED: 'skipped',
} as const;
export type WebhookDeliveryStatus =
  (typeof WEBHOOK_DELIVERY_STATUS)[keyof typeof WEBHOOK_DELIVERY_STATUS];

export const WEBHOOK_EVENT_TYPE = {
  MESSAGE_SENT: 'message.sent',
  MESSAGE_DELIVERED: 'message.delivered',
  MESSAGE_READ: 'message.read',
  MESSAGE_FAILED: 'message.failed',
  TEST: 'test',
} as const;
export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPE)[keyof typeof WEBHOOK_EVENT_TYPE];
export const WEBHOOK_EVENT_TYPE_VALUES = Object.values(WEBHOOK_EVENT_TYPE);

export const WEBHOOK_SKIP_REASON = {
  UNSUBSCRIBED: 'unsubscribed',
  FEATURE_DISABLED: 'feature_disabled',
} as const;

export const WEBHOOK_FAILURE_REASON = {
  RETRIES_EXHAUSTED: 'retries_exhausted',
  GONE: 'gone',
  EXPIRED: 'expired',
} as const;

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'muted' | 'secondary';

export const WEBHOOK_ENDPOINT_STATUS_LABEL: Record<WebhookEndpointStatus, string> = {
  [WEBHOOK_ENDPOINT_STATUS.UNVERIFIED]: 'Not verified',
  [WEBHOOK_ENDPOINT_STATUS.ACTIVE]: 'Active',
  [WEBHOOK_ENDPOINT_STATUS.DISABLED]: 'Paused',
};

export const WEBHOOK_ENDPOINT_STATUS_VARIANT: Record<WebhookEndpointStatus, BadgeVariant> = {
  [WEBHOOK_ENDPOINT_STATUS.UNVERIFIED]: 'destructive',
  [WEBHOOK_ENDPOINT_STATUS.ACTIVE]: 'success',
  [WEBHOOK_ENDPOINT_STATUS.DISABLED]: 'destructive',
};

// Filter options for the delivery log, in the order they are offered.
export const WEBHOOK_DELIVERY_STATUS_LABEL: Record<WebhookDeliveryStatus, string> = {
  [WEBHOOK_DELIVERY_STATUS.SUCCEEDED]: 'Delivered',
  [WEBHOOK_DELIVERY_STATUS.PENDING]: 'Waiting / retrying',
  [WEBHOOK_DELIVERY_STATUS.IN_FLIGHT]: 'Sending',
  [WEBHOOK_DELIVERY_STATUS.FAILED]: 'Failed',
  [WEBHOOK_DELIVERY_STATUS.SKIPPED]: 'Skipped',
};
