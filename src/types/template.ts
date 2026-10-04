import type {
  TemplateCategory,
  TemplateStatus,
  TemplateHeaderFormat,
  TemplateButtonType,
  TemplateOtpType,
  TEMPLATE_OTP_BUTTON_TYPE,
} from '@/constants';

export interface TemplateButtonComponent {
  type: TemplateButtonType;
  text: string;
  url?: string;
  phone_number?: string;
  example?: string[];
}

// An Android app allowed to receive one-tap / zero-tap verification codes.
export interface AuthSupportedApp {
  package_name: string;
  signature_hash: string;
}

// The single button of an authentication template, as stored / synced from Meta.
export interface TemplateOtpButtonComponent {
  type: typeof TEMPLATE_OTP_BUTTON_TYPE;
  otp_type?: TemplateOtpType;
  text?: string;
  autofill_text?: string;
  supported_apps?: AuthSupportedApp[];
  zero_tap_terms_accepted?: boolean;
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: TemplateHeaderFormat;
  text?: string;
  example?: Record<string, unknown>;
  buttons?: (TemplateButtonComponent | TemplateOtpButtonComponent)[];
  // Authentication templates only.
  add_security_recommendation?: boolean;
  code_expiration_minutes?: number;
}

export interface TemplateVariableSpec {
  header: { format: TemplateHeaderFormat; count: number } | null;
  body: { count: number };
  buttons: { index: number; type: TemplateButtonType; count: number }[];
  // Set for authentication templates: body {{1}} is the verification code and
  // the backend reuses it for the OTP button.
  otp?: { button_index: number; otp_type: TemplateOtpType } | null;
}

export interface MessageTemplate {
  id: string;
  company_id: string;
  waba_account_id: string;
  meta_template_id: string | null;
  name: string;
  language: string;
  category: TemplateCategory;
  status: TemplateStatus;
  components: TemplateComponent[];
  parameter_format: string;
  quality_score: Record<string, unknown> | null;
  rejection_reason: string | null;
  last_synced_at: string | null;
  raw_metadata: Record<string, unknown> | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
  variables: TemplateVariableSpec;
}

export type TemplatesByCategory = Record<TemplateCategory, MessageTemplate[]>;

export interface CreateTemplateInput {
  name: string;
  language: string;
  category: TemplateCategory;
  header?: {
    format: TemplateHeaderFormat;
    text?: string;
    examples?: string[];
    // Resumable Upload API file handle for a media (DOCUMENT/IMAGE) header sample.
    header_handle?: string;
  };
  // Required for marketing / utility; not allowed for authentication.
  body?: {
    text: string;
    examples?: string[];
  };
  footer?: { text: string };
  buttons?: TemplateButtonComponent[];
  // Required for authentication; not allowed for other categories.
  authentication?: AuthenticationTemplateSettings;
}

export interface AuthenticationTemplateSettings {
  otp_type: TemplateOtpType;
  add_security_recommendation: boolean;
  code_expiration_minutes?: number;
  message_send_ttl_seconds?: number;
  copy_code_text?: string;
  autofill_text?: string;
  supported_apps?: AuthSupportedApp[];
  zero_tap_terms_accepted?: boolean;
}

// A file attached to an outgoing message's header, referencing media uploaded to
// Meta by id (never a public URL). `filename` is a document-only display name.
export interface MessageMediaParam {
  id: string;
  filename?: string;
}

export type MessageHeaderVariable = string | MessageMediaParam;

export interface SendTemplateInput {
  recipient_phone: string;
  template_id: string;
  phone_number_id?: string;
  variables?: {
    header?: MessageHeaderVariable[];
    body?: string[];
    buttons?: string[];
  };
}

// Returned by the template-media upload endpoint (Resumable Upload API).
export interface TemplateMediaUploadResult {
  header_handle: string;
  file_name: string;
  mime_type: string;
  // Header format the uploaded file maps to: PDF → DOCUMENT, JPEG/PNG → IMAGE.
  header_format: TemplateHeaderFormat;
}

// Returned by the message-media upload endpoint (phone-number media store).
export interface MessageMediaUploadResult {
  media_id: string;
  file_name: string;
  mime_type: string;
  header_format: TemplateHeaderFormat;
  phone_number_id: string;
}
