import { EXTERNAL_LINKS, TEMPLATE_HEADER_FORMAT } from '@/constants';
import { authBodyText } from '@/lib/authTemplate';
import { parameterTexts } from '@/lib/messagePayload';
import type { MessageLog } from '@/types';

const substituteVars = (text: string, vars: string[]) =>
  text.replace(/{{\s*(\d+)\s*}}/g, (_, n) => vars[Number(n) - 1] || `{{${n}}}`);

/**
 * Reconstructs the human-readable text of a sent template message from the
 * template's component definitions plus the parameter values recorded in
 * message_payload: text header (if any) and body, variables substituted.
 * Media headers are omitted — WhatsApp's click-to-chat URL cannot carry media.
 */
export function buildMessageText(log: MessageLog): string {
  const components = log.template?.components ?? [];
  const parts: string[] = [];

  const header = components.find((c) => c.type === 'HEADER');
  if (header?.format === TEMPLATE_HEADER_FORMAT.TEXT && header.text) {
    parts.push(substituteVars(header.text, parameterTexts(log, 'header')));
  }

  // An authentication BODY created here carries no text until synced from
  // Meta (only its add_security_recommendation flag), so rebuild Meta's text.
  const body = components.find((c) => c.type === 'BODY');
  const bodyText =
    body?.text ??
    (body?.add_security_recommendation !== undefined
      ? authBodyText(body.add_security_recommendation)
      : null);
  if (bodyText) {
    parts.push(substituteVars(bodyText, parameterTexts(log, 'body')));
  }

  return parts.join('\n\n');
}

/**
 * WhatsApp Web composer URL for manually resending a failed message: opens the
 * recipient's chat with the reconstructed message text prefilled, ready to
 * send. When the text cannot be reconstructed (e.g. the template row was
 * deleted), the chat still opens with an empty composer.
 */
export function buildWhatsappWebResendUrl(log: MessageLog): string {
  return EXTERNAL_LINKS.whatsappWebSend(log.recipient_phone, buildMessageText(log));
}
