import { MEDIA } from '@/constants';
import type { MessageLog } from '@/types';

// Shapes inside message_payload.template.components — the exact payload sent to
// Meta, where the filled-in variable values live. Media parameters are keyed by
// their own type ({ type: 'image', image: { id } }), hence the index signature.
interface PayloadParameter {
  type?: string;
  text?: string;
  [key: string]: unknown;
}

interface PayloadComponent {
  type?: string;
  parameters?: PayloadParameter[];
}

const payloadComponents = (log: MessageLog): PayloadComponent[] => {
  const template = log.message_payload?.template as { components?: PayloadComponent[] } | undefined;
  return Array.isArray(template?.components) ? template.components : [];
};

const componentParameters = (log: MessageLog, type: string): PayloadParameter[] =>
  payloadComponents(log).find((c) => c.type === type)?.parameters ?? [];

/** Text parameter values sent for one component type ('header' | 'body'). */
export const parameterTexts = (log: MessageLog, type: string): string[] =>
  componentParameters(log, type).map((p) => (typeof p.text === 'string' ? p.text : ''));

export interface HeaderMedia {
  id: string;
  filename: string | null;
}

/**
 * The media (image/document) attached to this message's template header, or
 * null when the template had no media header — the message carries only the
 * Meta media id, never the file itself.
 */
export const findHeaderMedia = (log: MessageLog): HeaderMedia | null => {
  const param = componentParameters(log, 'header').find(
    (p) => typeof p.type === 'string' && MEDIA.MEDIA_HEADER_PARAM_TYPES.includes(p.type),
  );
  const media = param?.type ? (param[param.type] as { id?: string; filename?: string }) : null;
  if (!media?.id) return null;
  return { id: media.id, filename: media.filename ?? null };
};

export const hasHeaderMedia = (log: MessageLog): boolean => findHeaderMedia(log) !== null;
