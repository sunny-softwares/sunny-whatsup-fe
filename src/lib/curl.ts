import {
  CURL_PLACEHOLDERS,
  ENV,
  EXTERNAL_MESSAGES_PATH,
  MEDIA,
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
// mirroring the shapes the send-message API expects for each section. The
// header is skipped for DOCUMENT templates — those use the one-call multipart
// flow where the attached file becomes the header.
const buildVariablePlaceholders = (template: MessageTemplate) => {
  const spec = template.variables;
  const variables: NonNullable<SendMessageCurlBody['variables']> = {};

  if (spec?.header && spec.header.count > 0) {
    if (spec.header.format === TEMPLATE_HEADER_FORMAT.TEXT) {
      variables.header = Array.from({ length: spec.header.count }, (_, i) =>
        CURL_PLACEHOLDERS.HEADER_TEXT(i + 1),
      );
    } else if (spec.header.format !== TEMPLATE_HEADER_FORMAT.DOCUMENT) {
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

// Escapes a JSON string for embedding inside a double-quoted CMD argument.
const escapeForCmd = (json: string) => json.replace(/"/g, '\\"');

/**
 * Builds a ready-to-run curl command for sending a message with the given
 * template via the external (API token) send-message endpoint. Placeholders
 * (<...>) mark the values the caller must substitute.
 *
 * Emitted in Windows CMD format: double-quoted arguments (inner JSON quotes
 * escaped as \"), `^` line continuations, and each quoted argument kept on a
 * single line — CMD cannot span a quoted string across lines.
 *
 * Templates with a document header get the one-call multipart variant: the
 * PDF is attached as `file` and the API uploads + sends in a single request.
 * All other templates get the plain JSON variant.
 */
export const buildSendMessageCurl = ({
  token,
  template,
}: {
  token: string;
  template: MessageTemplate;
}): string => {
  const url = `${ENV.API_BASE_URL}${EXTERNAL_MESSAGES_PATH}`;
  const variables = buildVariablePlaceholders(template);

  if (template.variables?.header?.format === TEMPLATE_HEADER_FORMAT.DOCUMENT) {
    const lines = [
      `curl -X POST "${url}" ^`,
      `  -H "Authorization: Bearer ${token}" ^`,
      `  -F "recipient_phone=${CURL_PLACEHOLDERS.RECIPIENT_PHONE}" ^`,
      `  -F "template_id=${template.id}" ^`,
    ];
    if (variables) {
      lines.push(`  -F "variables=${escapeForCmd(JSON.stringify(variables))}" ^`);
    }
    lines.push(`  -F "filename=${CURL_PLACEHOLDERS.DOCUMENT_FILENAME}" ^`);
    // `;type=` is required: curl defaults file parts to application/octet-stream
    // (it does not sniff .pdf), and the API only accepts application/pdf.
    lines.push(`  -F "file=@${CURL_PLACEHOLDERS.FILE_PATH};type=${MEDIA.PDF_MIME_TYPE}"`);
    return lines.join('\n');
  }

  const body: SendMessageCurlBody = {
    recipient_phone: CURL_PLACEHOLDERS.RECIPIENT_PHONE,
    template_id: template.id,
  };
  if (variables) body.variables = variables;

  return [
    `curl -X POST "${url}" ^`,
    `  -H "Authorization: Bearer ${token}" ^`,
    `  -H "Content-Type: application/json" ^`,
    `  -d "${escapeForCmd(JSON.stringify(body))}"`,
  ].join('\n');
};

// Whether the template's header carries a document/media attachment — used to
// show the extra media-id hint alongside the generated curl.
export const templateHasMediaHeader = (template: MessageTemplate): boolean => {
  const header = template.variables?.header;
  return !!header && header.count > 0 && header.format !== TEMPLATE_HEADER_FORMAT.TEXT;
};
