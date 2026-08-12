'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';
import {
  ROUTES,
  TEMPLATE_CATEGORY_LABEL,
  TEMPLATE_CATEGORY_VALUES,
  TEMPLATE_HEADER_FORMAT,
  TEMPLATE_STATUS,
  MEDIA_MESSAGES,
  UI_MESSAGES,
  isUploadableHeaderFormat,
} from '@/constants';
import { companyApi } from '@/lib/api/company.api';
import { templateApi } from '@/lib/api/template.api';
import { mediaApi } from '@/lib/api/media.api';
import { pickErrorMessage } from '@/lib/utils';
import type {
  MessageHeaderVariable,
  MessageMediaUploadResult,
  MessageTemplate,
  WabaAccount,
} from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplatePreview } from '@/components/dashboard/TemplatePreview';
import { MediaUpload } from '@/components/dashboard/MediaUpload';

const padToLength = (arr: string[], n: number) => {
  if (arr.length === n) return arr;
  if (arr.length > n) return arr.slice(0, n);
  return [...arr, ...Array.from({ length: n - arr.length }, () => '')];
};

export default function SendMessagePage() {
  const [waba, setWaba] = useState<WabaAccount | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [phoneNumberId, setPhoneNumberId] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('');
  const [recipient, setRecipient] = useState('');
  const [headerVars, setHeaderVars] = useState<string[]>([]);
  const [bodyVars, setBodyVars] = useState<string[]>([]);
  const [buttonVars, setButtonVars] = useState<string[]>([]);
  // File attached for a template whose header is a DOCUMENT or IMAGE.
  const [headerMedia, setHeaderMedia] = useState<MessageMediaUploadResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [wabaRes, tplRes] = await Promise.all([
          companyApi.getWaba(),
          templateApi.list({ status: TEMPLATE_STATUS.APPROVED, pageSize: 100 }),
        ]);
        if (cancelled) return;
        setWaba(wabaRes.data);
        const def = wabaRes.data?.phoneNumbers?.find((p) => p.is_default) || wabaRes.data?.phoneNumbers?.[0];
        if (def) setPhoneNumberId(def.id);
        setTemplates(tplRes.data ?? []);
        if (tplRes.data && tplRes.data.length > 0) {
          setTemplateId(tplRes.data[0].id);
        }
      } catch (err) {
        if (!cancelled) setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const template = useMemo(() => templates.find((t) => t.id === templateId) || null, [templates, templateId]);

  const headerFormat = template?.variables.header?.format;
  // DOCUMENT/IMAGE headers are filled by uploading a file rather than typing values.
  const mediaHeaderFormat = isUploadableHeaderFormat(headerFormat) ? headerFormat : null;
  const isTextHeader = headerFormat === TEMPLATE_HEADER_FORMAT.TEXT;

  // Resize variable arrays whenever the selected template changes.
  useEffect(() => {
    setHeaderMedia(null);
    if (!template) {
      setHeaderVars([]);
      setBodyVars([]);
      setButtonVars([]);
      return;
    }
    // Media headers carry a media id, not positional text values.
    const headerCount = template.variables.header?.format === TEMPLATE_HEADER_FORMAT.TEXT
      ? template.variables.header.count
      : 0;
    setHeaderVars((prev) => padToLength(prev, headerCount));
    setBodyVars((prev) => padToLength(prev, template.variables.body.count));
    setButtonVars((prev) => padToLength(prev, template.variables.buttons.length));
  }, [template]);

  // Media uploads are scoped to a phone number, so a previously uploaded file
  // no longer applies once the sender changes.
  useEffect(() => {
    setHeaderMedia(null);
  }, [phoneNumberId]);

  const grouped = useMemo(() => {
    const out: Record<string, MessageTemplate[]> = {};
    for (const t of templates) {
      const k = t.category || 'utility';
      if (!out[k]) out[k] = [];
      out[k].push(t);
    }
    return out;
  }, [templates]);

  const wabaConnected = waba?.status === 'connected' && (waba?.phoneNumbers?.length ?? 0) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mediaHeaderFormat && !headerMedia) {
      setError(MEDIA_MESSAGES.REQUIRED[mediaHeaderFormat]);
      return;
    }

    setSending(true);
    try {
      // `filename` is the recipient-facing document name; images take only the id.
      const header: MessageHeaderVariable[] = mediaHeaderFormat
        ? headerMedia
          ? [
              mediaHeaderFormat === TEMPLATE_HEADER_FORMAT.DOCUMENT
                ? { id: headerMedia.media_id, filename: headerMedia.file_name }
                : { id: headerMedia.media_id },
            ]
          : []
        : headerVars;

      await companyApi.sendMessage({
        recipient_phone: recipient,
        template_id: templateId,
        phone_number_id: phoneNumberId || undefined,
        variables: {
          ...(header.length > 0 ? { header } : {}),
          ...(bodyVars.length > 0 ? { body: bodyVars } : {}),
          ...(buttonVars.length > 0 ? { buttons: buttonVars } : {}),
        },
      });
      setSuccess('Message sent successfully');
      setRecipient('');
      setHeaderMedia(null);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setSending(false);
    }
  };

  const uploadMedia = async (file: File) => {
    const res = await mediaApi.uploadMessageMedia(file, phoneNumberId || undefined);
    return res.data;
  };

  if (loading) {
    return (
      <>
        <PageHeader title={UI_MESSAGES.COMPANY.SEND_MESSAGE_TITLE} />
        <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
      </>
    );
  }

  if (!wabaConnected) {
    return (
      <>
        <PageHeader title={UI_MESSAGES.COMPANY.SEND_MESSAGE_TITLE} />
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">{UI_MESSAGES.COMPANY.CONNECT_WABA}</CardTitle>
            <CardDescription className="text-yellow-800">
              {UI_MESSAGES.COMPANY.NO_WABA_YET}
            </CardDescription>
          </CardHeader>
        </Card>
      </>
    );
  }

  if (templates.length === 0) {
    return (
      <>
        <PageHeader title={UI_MESSAGES.COMPANY.SEND_MESSAGE_TITLE} />
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">No approved templates</CardTitle>
            <CardDescription className="text-yellow-800">
              {UI_MESSAGES.COMPANY.NO_APPROVED_TEMPLATES}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={ROUTES.COMPANY.TEMPLATES_NEW}>
              <Button>Create a template</Button>
            </Link>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.COMPANY.SEND_MESSAGE_TITLE}
        description="Pick an approved template, fill in variables, and send."
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recipient & template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from">From phone number</Label>
              <select
                id="from"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {waba?.phoneNumbers?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_phone_number} ({p.phone_number_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">Recipient phone (with country code, e.g. +14155551234)</Label>
              <Input id="to" required value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <select
                id="template"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {TEMPLATE_CATEGORY_VALUES.map((cat) =>
                  grouped[cat] && grouped[cat].length > 0 ? (
                    <optgroup key={cat} label={TEMPLATE_CATEGORY_LABEL[cat]}>
                      {grouped[cat].map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.language})
                        </option>
                      ))}
                    </optgroup>
                  ) : null,
                )}
              </select>
            </div>

            {template && mediaHeaderFormat ? (
              <div className="space-y-2">
                <Label>
                  {mediaHeaderFormat === TEMPLATE_HEADER_FORMAT.IMAGE
                    ? 'Image attachment (JPEG/PNG)'
                    : 'Document attachment (PDF)'}
                </Label>
                <MediaUpload<MessageMediaUploadResult>
                  format={mediaHeaderFormat}
                  fileName={headerMedia?.file_name ?? null}
                  upload={uploadMedia}
                  onChange={(next) => setHeaderMedia(next?.result ?? null)}
                />
              </div>
            ) : null}

            {template && isTextHeader && template.variables.header!.count > 0 ? (
              <div className="space-y-2">
                <Label>Header variables</Label>
                {headerVars.map((v, i) => (
                  <Input
                    key={`h-${i}`}
                    placeholder={`Value for header {{${i + 1}}}`}
                    value={v}
                    onChange={(e) => {
                      const next = [...headerVars];
                      next[i] = e.target.value;
                      setHeaderVars(next);
                    }}
                    required
                  />
                ))}
              </div>
            ) : null}

            {template && template.variables.body.count > 0 ? (
              <div className="space-y-2">
                <Label>Body variables</Label>
                {bodyVars.map((v, i) => (
                  <Input
                    key={`b-${i}`}
                    placeholder={`Value for body {{${i + 1}}}`}
                    value={v}
                    onChange={(e) => {
                      const next = [...bodyVars];
                      next[i] = e.target.value;
                      setBodyVars(next);
                    }}
                    required
                  />
                ))}
              </div>
            ) : null}

            {template && template.variables.buttons.length > 0 ? (
              <div className="space-y-2">
                <Label>Button URL variables</Label>
                {buttonVars.map((v, i) => (
                  <Input
                    key={`btn-${i}`}
                    placeholder={`Value for button ${template.variables.buttons[i]?.index + 1} {{1}}`}
                    value={v}
                    onChange={(e) => {
                      const next = [...buttonVars];
                      next[i] = e.target.value;
                      setButtonVars(next);
                    }}
                    required
                  />
                ))}
              </div>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-green-600">{success}</p> : null}
          </CardContent>
          <div className="flex justify-end px-6 pb-6">
            <Button type="submit" disabled={sending}>
              <Send className="mr-2 h-4 w-4" />
              {sending ? UI_MESSAGES.COMMON.LOADING : 'Send'}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Template preview</CardTitle>
              <CardDescription>Variables are substituted live for preview only.</CardDescription>
            </CardHeader>
            <CardContent>
              {template ? (
                <TemplatePreview template={withVariablesSubstituted(template, { header: headerVars, body: bodyVars })} />
              ) : (
                <p className="text-sm text-muted-foreground">Pick a template to preview.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
}

/**
 * Returns a shallow copy of the template with {{N}} substituted in HEADER + BODY text
 * for preview purposes. Original template is not mutated.
 */
function withVariablesSubstituted(
  template: MessageTemplate,
  values: { header: string[]; body: string[] },
): MessageTemplate {
  const substitute = (text: string | undefined, vars: string[]) =>
    text ? text.replace(/{{\s*(\d+)\s*}}/g, (_, n) => vars[Number(n) - 1] || `{{${n}}}`) : text;

  return {
    ...template,
    components: template.components.map((c) => {
      if (c.type === 'HEADER' && c.format === 'TEXT') {
        return { ...c, text: substitute(c.text, values.header) };
      }
      if (c.type === 'BODY') {
        return { ...c, text: substitute(c.text, values.body) };
      }
      return c;
    }),
  };
}
