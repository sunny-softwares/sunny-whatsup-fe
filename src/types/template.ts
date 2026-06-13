import type {
  TemplateCategory,
  TemplateStatus,
  TemplateHeaderFormat,
  TemplateButtonType,
} from '@/constants';

export interface TemplateButtonComponent {
  type: TemplateButtonType;
  text: string;
  url?: string;
  phone_number?: string;
  example?: string[];
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: TemplateHeaderFormat;
  text?: string;
  example?: Record<string, unknown>;
  buttons?: TemplateButtonComponent[];
}

export interface TemplateVariableSpec {
  header: { format: TemplateHeaderFormat; count: number } | null;
  body: { count: number };
  buttons: { index: number; type: TemplateButtonType; count: number }[];
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
    // Resumable Upload API file handle for a media (DOCUMENT) header sample.
    header_handle?: string;
  };
  body: {
    text: string;
    examples?: string[];
  };
  footer?: { text: string };
  buttons?: TemplateButtonComponent[];
}

// A document attached to an outgoing message's header, referencing media uploaded
// to Meta by id (never a public URL).
export interface MessageDocumentParam {
  id: string;
  filename?: string;
}

export type MessageHeaderVariable = string | MessageDocumentParam;

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

// Returned by the template-document upload endpoint (Resumable Upload API).
export interface TemplateDocumentUploadResult {
  header_handle: string;
  file_name: string;
  mime_type: string;
}

// Returned by the message-document upload endpoint (phone-number media store).
export interface MessageDocumentUploadResult {
  media_id: string;
  file_name: string;
  mime_type: string;
  phone_number_id: string;
}
