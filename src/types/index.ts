import type { Role } from '@/constants';

export * from './template';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  role: Role;
  status: 'active' | 'inactive';
  company_id: string | null;
  company: {
    id: string;
    name: string;
    status: string;
  } | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Company {
  id: string;
  name: string;
  legal_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_active: boolean;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  users?: { id: string; email: string; first_name: string; last_name: string | null }[];
}

export interface PhoneNumber {
  id: string;
  waba_account_id: string;
  phone_number_id: string;
  display_phone_number: string;
  verified_name: string | null;
  quality_rating: string | null;
  status: string;
  is_default: boolean;
}

export interface WabaAccount {
  id: string;
  company_id: string;
  waba_id: string;
  business_name: string | null;
  status: 'connected' | 'disconnected' | 'error';
  connection_flow: 'embedded_new' | 'embedded_existing' | 'manual_token' | null;
  connected_at: string;
  disconnected_at: string | null;
  phoneNumbers?: PhoneNumber[];
}

export interface MessageLog {
  id: string;
  company_id: string;
  company: { id: string; name: string } | null;
  recipient_phone: string;
  message_type: string;
  template_id: string | null;
  template: { id: string | null; name: string } | null;
  message_payload?: Record<string, unknown>;
  meta_message_id: string | null;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  error_payload?: Record<string, unknown> | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  failed_at: string | null;
  created_at: string;
  phoneNumber?: { id: string; display_phone_number: string; phone_number_id: string } | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface MessageListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  company?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface CompanyListParams {
  status?: string;
  search?: string;
  is_active?: boolean;
  page?: number;
  pageSize?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface TemplateListParams {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface ApiResponseSuccess<T> {
  success: true;
  message?: string;
  data: T;
  meta?: { pagination?: Pagination };
}

export interface ApiResponseError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export interface SuperAdminStats {
  companies: { total: number; pending: number; approved: number };
  users: number;
  waba_accounts: number;
  messages: {
    total: number;
    sent: number;
    failed: number;
    by_day: { day: string; count: number }[];
  };
}

export interface CompanyStats {
  messages: {
    total: number;
    sent: number;
    failed: number;
    by_day: { day: string; count: number }[];
  };
  waba_connected: boolean;
}
