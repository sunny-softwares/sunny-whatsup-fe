// Building blocks for the generated "send message via API" curl snippets the
// super admin hands to companies. Placeholders are angle-bracketed so they are
// obviously values the caller must replace before running the command.
export const EXTERNAL_MESSAGES_PATH = '/external/messages';

export const CURL_PLACEHOLDERS = {
  RECIPIENT_PHONE: '<RECIPIENT_PHONE_E164>',
  HEADER_TEXT: (index: number) => `<HEADER_TEXT_${index}>`,
  MEDIA_ID: '<MEDIA_ID>',
  DOCUMENT_FILENAME: '<FILE_NAME.pdf>',
  BODY_TEXT: (index: number) => `<BODY_TEXT_${index}>`,
  BUTTON_VALUE: (index: number) => `<BUTTON_URL_SUFFIX_${index}>`,
} as const;
