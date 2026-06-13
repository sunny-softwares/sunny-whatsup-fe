export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;
export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];

export const DEFAULT_PAGE_SIZE = 20;

// Sortable message-log columns. Must match the backend MESSAGE_SORT_FIELD enum.
export const MESSAGE_SORT_FIELD = {
  CREATED_AT: 'created_at',
  STATUS: 'status',
  RECIPIENT: 'recipient_phone',
  TYPE: 'message_type',
  COMPANY: 'company',
  TEMPLATE: 'template',
  SENT_AT: 'sent_at',
} as const;
export type MessageSortField = (typeof MESSAGE_SORT_FIELD)[keyof typeof MESSAGE_SORT_FIELD];

export const COMPANY_SORT_FIELD = {
  NAME: 'name',
  STATUS: 'status',
  CREATED_AT: 'created_at',
} as const;
export type CompanySortField = (typeof COMPANY_SORT_FIELD)[keyof typeof COMPANY_SORT_FIELD];

export const TEMPLATE_SORT_FIELD = {
  NAME: 'name',
  CATEGORY: 'category',
  STATUS: 'status',
  CREATED_AT: 'created_at',
} as const;
export type TemplateSortField = (typeof TEMPLATE_SORT_FIELD)[keyof typeof TEMPLATE_SORT_FIELD];
