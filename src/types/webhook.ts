import type {
  WebhookDeliveryStatus,
  WebhookDisabledReason,
  WebhookEndpointStatus,
  WebhookEventType,
} from '@/constants/webhooks';

export interface WebhookEndpointStats {
  succeeded_24h: number;
  failed_24h: number;
  // Events waiting to be sent: retrying, or held while paused.
  pending: number;
}

// The company's own endpoint. Secrets are never part of it.
export interface WebhookEndpoint {
  id: string;
  url: string;
  status: WebhookEndpointStatus;
  subscribed_fields: string[];
  secret_hint: string;
  secret_rotated_at: string | null;
  // Set while requests are signed with both the new and the previous secret.
  previous_secret_expires_at: string | null;
  verified_at: string | null;
  last_verification_at: string | null;
  last_verification_error: string | null;
  disabled_reason: WebhookDisabledReason | null;
  disabled_at: string | null;
  consecutive_failures: number;
  last_success_at: string | null;
  last_failure_at: string | null;
  created_at: string;
  updated_at: string;
  stats: WebhookEndpointStats | null;
}

export interface WebhookFieldInfo {
  key: string;
  description: string;
}

// How requests are signed and how URLs are verified, as the API describes them.
export interface WebhookSigningContract {
  headers: Record<'EVENT_ID' | 'EVENT_TYPE' | 'TIMESTAMP' | 'SIGNATURE', string>;
  algorithm: string;
  prefix: string;
  separator: string;
  payload_separator: string;
  tolerance_seconds: number;
}

export interface WebhookDeliveryContract {
  max_attempts: number;
  retry_schedule_seconds: number[];
  disable_after_failures: number;
  disable_after_hours: number;
  resume_window_hours: number;
  secret_rotation_grace_hours: number;
  retention_days: number;
}

export interface WebhookOverview {
  feature_enabled: boolean;
  endpoint: WebhookEndpoint | null;
  fields: WebhookFieldInfo[];
  signing: WebhookSigningContract;
  verification: { challenge_param: string; timeout_seconds: number };
  delivery: WebhookDeliveryContract;
}

// `secret` is present only the first time the endpoint is verified.
export interface WebhookSaveResult {
  endpoint: WebhookEndpoint;
  secret: string | null;
}

export interface WebhookSecretResult {
  secret: string;
}

export interface WebhookRotateResult {
  secret: string;
  endpoint: WebhookEndpoint;
}

export interface WebhookDeliveryAttempt {
  attempt: number;
  at: string;
  http_status: number | null;
  error: string | null;
  duration_ms: number | null;
}

export interface WebhookDeliverySummary {
  id: string;
  event_id: string;
  event_type: WebhookEventType;
  // Our message id; null for test events.
  message_id: string | null;
  meta_message_id: string | null;
  recipient_phone: string | null;
  status: WebhookDeliveryStatus;
  attempt_count: number;
  max_attempts: number;
  next_attempt_at: string | null;
  last_attempt_at: string | null;
  last_http_status: number | null;
  last_error: string | null;
  last_duration_ms: number | null;
  skip_reason: string | null;
  failure_reason: string | null;
  succeeded_at: string | null;
  failed_at: string | null;
  created_at: string;
}

export interface WebhookDelivery extends WebhookDeliverySummary {
  payload: Record<string, unknown>;
  attempts: WebhookDeliveryAttempt[];
  last_response_body: string | null;
}

export interface WebhookDeliveryListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  event_type?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}
