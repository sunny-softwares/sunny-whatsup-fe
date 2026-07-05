import {
  CURL_PLACEHOLDERS,
  ENV,
  EXTERNAL_MESSAGES_PATH,
  TEMPLATE_HEADER_FORMAT,
} from '@/constants';
import type { MessageHeaderVariable, MessageTemplate } from '@/types';

interface SendMessageCurlBody {
  recipient_phone: string;
  template_id: string;
  variables?: {
    header?: MessageHeaderVariable[];
    body?: string[];
    buttons?: string[];
  };
}

// Derives the placeholder `variables` payload from a template's variable spec,
// mirroring the shapes the send-message API expects for each section:
// text header values, media header { id, filename }, body strings, and dynamic
// URL button suffixes.
const buildVariablePlaceholders = (template: MessageTemplate) => {
  const spec = template.variables;
  const variables: NonNullable<SendMessageCurlBody['variables']> = {};

  if (spec?.header && spec.header.count > 0) {
    if (spec.header.format === TEMPLATE_HEADER_FORMAT.TEXT) {
      variables.header = Array.from({ length: spec.header.count }, (_, i) =>
        CURL_PLACEHOLDERS.HEADER_TEXT(i + 1),
      );
    } else if (spec.header.format === TEMPLATE_HEADER_FORMAT.DOCUMENT) {
      variables.header = [
        { id: CURL_PLACEHOLDERS.MEDIA_ID, filename: CURL_PLACEHOLDERS.DOCUMENT_FILENAME },
      ];
    } else {
      // Other media headers (image/video) take a Meta media id.
      variables.header = [{ id: CURL_PLACEHOLDERS.MEDIA_ID }];
    }
  }

  if (spec?.body && spec.body.count > 0) {
    variables.body = Array.from({ length: spec.body.count }, (_, i) =>
      CURL_PLACEHOLDERS.BODY_TEXT(i + 1),
    );
  }

  if (Array.isArray(spec?.buttons) && spec.buttons.length > 0) {
    variables.buttons = spec.buttons.map((_, i) => CURL_PLACEHOLDERS.BUTTON_VALUE(i + 1));
  }

  return Object.keys(variables).length > 0 ? variables : undefined;
};

/**
 * Builds a ready-to-run curl command for sending a message with the given
 * template via the external (API token) send-message endpoint. Placeholders
 * (<...>) mark the values the caller must substitute.
 */
export const buildSendMessageCurl = ({
  token,
  template,
}: {
  token: string;
  template: MessageTemplate;
}): string => {
  const body: SendMessageCurlBody = {
    recipient_phone: CURL_PLACEHOLDERS.RECIPIENT_PHONE,
    template_id: template.id,
  };
  const variables = buildVariablePlaceholders(template);
  if (variables) body.variables = variables;

  const url = `${ENV.API_BASE_URL}${EXTERNAL_MESSAGES_PATH}`;
  const json = JSON.stringify(body, null, 2);

  return [
    `curl -X POST '${url}' \\`,
    `  -H 'Authorization: Bearer ${token}' \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  -d '${json}'`,
  ].join('\n');
};

// Whether the template's header carries a document/media attachment — used to
// show the extra media-id hint alongside the generated curl.
export const templateHasMediaHeader = (template: MessageTemplate): boolean => {
  const header = template.variables?.header;
  return !!header && header.count > 0 && header.format !== TEMPLATE_HEADER_FORMAT.TEXT;
};
