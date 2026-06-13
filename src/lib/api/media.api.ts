import { apiClient } from './client';
import { API_ROUTES, MEDIA } from '@/constants';
import type {
  ApiResponseSuccess,
  MessageDocumentUploadResult,
  TemplateDocumentUploadResult,
} from '@/types';

// Setting Content-Type to undefined lets the browser attach the multipart
// boundary itself, overriding the client's default application/json header.
const MULTIPART_CONFIG = {
  headers: { 'Content-Type': undefined as unknown as string },
};

const buildForm = (file: File, fields: Record<string, string> = {}) => {
  const form = new FormData();
  form.append(MEDIA.UPLOAD_FIELD_NAME, file);
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  return form;
};

export const mediaApi = {
  // Uploads a PDF sample for a template DOCUMENT header; returns a header_handle.
  async uploadTemplateDocument(file: File) {
    const { data } = await apiClient.post<ApiResponseSuccess<TemplateDocumentUploadResult>>(
      API_ROUTES.COMPANY.MEDIA_TEMPLATE_DOCUMENT,
      buildForm(file),
      MULTIPART_CONFIG,
    );
    return data;
  },
  // Super-admin variant, scoped to a company.
  async uploadCompanyTemplateDocument(companyId: string, file: File) {
    const { data } = await apiClient.post<ApiResponseSuccess<TemplateDocumentUploadResult>>(
      API_ROUTES.SUPER_ADMIN.COMPANY_MEDIA_TEMPLATE_DOCUMENT(companyId),
      buildForm(file),
      MULTIPART_CONFIG,
    );
    return data;
  },
  // Uploads a PDF to attach to an outgoing message; returns a media_id.
  async uploadMessageDocument(file: File, phoneNumberId?: string) {
    const { data } = await apiClient.post<ApiResponseSuccess<MessageDocumentUploadResult>>(
      API_ROUTES.COMPANY.MEDIA_MESSAGE_DOCUMENT,
      buildForm(file, phoneNumberId ? { phone_number_id: phoneNumberId } : {}),
      MULTIPART_CONFIG,
    );
    return data;
  },
};
