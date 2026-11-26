'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Download, Loader2 } from 'lucide-react';
import { UI_MESSAGES } from '@/constants';
import { pickErrorMessage } from '@/lib/utils';
import { pickBlobErrorMessage, saveBlob } from '@/lib/download';
import type { WebhookGuideApi } from '@/lib/api/webhook.api';
import type { WebhookGuide } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { WebhookCopyButton } from '@/components/webhooks/WebhookCopyButton';

const M = UI_MESSAGES.WEBHOOKS;
const SECONDS_PER_MINUTE = 60;

interface WebhookGuideViewProps {
  api: WebhookGuideApi;
  // The webhook settings page for this audience.
  backHref: string;
}

/**
 * The integration guide: what a receiving endpoint must do, a code example per
 * language, and a signing test vector, with the full guide as a PDF download.
 * Everything shown comes from the API, so it always matches the server.
 */
export function WebhookGuideView({ api, backHref }: WebhookGuideViewProps) {
  const apiRef = useRef(api);
  apiRef.current = api;

  const [guide, setGuide] = useState<WebhookGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [exampleKey, setExampleKey] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiRef.current.getGuide();
      setGuide(res.data);
      setExampleKey((current) => current || res.data.examples[0]?.key || '');
    } catch (err) {
      setLoadError(pickErrorMessage(err, M.GUIDE_LOAD_FAILED));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const file = await apiRef.current.downloadPdf();
      // The file name header is not readable cross-origin; the guide carries it.
      saveBlob({ ...file, filename: guide?.pdf_filename ?? file.filename });
    } catch (err) {
      setDownloadError(await pickBlobErrorMessage(err, M.GUIDE_DOWNLOAD_FAILED));
    } finally {
      setDownloading(false);
    }
  };

  const example = guide?.examples.find((e) => e.key === exampleKey) ?? guide?.examples[0] ?? null;

  return (
    <>
      <div>
        <Link
          href={backHref}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {M.BACK_TO_WEBHOOKS}
        </Link>
        <PageHeader
          title={M.GUIDE_TITLE}
          description={M.GUIDE_SUBTITLE}
          actions={
            <Button size="sm" onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {downloading ? M.GUIDE_DOWNLOADING : M.GUIDE_DOWNLOAD}
            </Button>
          }
        />
      </div>

      {downloadError ? <p className="text-sm text-destructive">{downloadError}</p> : null}

      {loading && !guide ? (
        <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
      ) : loadError && !guide ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
            <p className="text-sm text-destructive">{loadError}</p>
            <Button variant="outline" size="sm" onClick={load}>
              {M.GUIDE_RETRY}
            </Button>
          </CardContent>
        </Card>
      ) : guide ? (
        <>
          {/* What the endpoint must do */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{M.GUIDE_GLANCE_TITLE}</CardTitle>
              <CardDescription>{M.GUIDE_GLANCE_DESCRIPTION(guide.payload_version)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-4 sm:grid-cols-3">
                {[
                  [
                    M.GUIDE_GLANCE_GET_TITLE,
                    M.GUIDE_GLANCE_GET_BODY(
                      guide.verification.challenge_param,
                      guide.verification.timeout_seconds,
                    ),
                  ],
                  [
                    M.GUIDE_GLANCE_POST_TITLE,
                    M.GUIDE_GLANCE_POST_BODY(
                      guide.signing.algorithm,
                      guide.signing.payload_separator,
                      guide.signing.headers.SIGNATURE,
                      guide.signing.headers.TIMESTAMP,
                      Math.round(guide.signing.tolerance_seconds / SECONDS_PER_MINUTE),
                    ),
                  ],
                  [
                    M.GUIDE_GLANCE_ANSWER_TITLE,
                    M.GUIDE_GLANCE_ANSWER_BODY(
                      guide.verification.timeout_seconds,
                      guide.delivery.max_attempts,
                    ),
                  ],
                ].map(([stepTitle, body], index) => (
                  <li key={stepTitle} className="rounded-lg border p-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <p className="mt-3 text-sm font-medium">{stepTitle}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Code examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{M.GUIDE_EXAMPLES_TITLE}</CardTitle>
              <CardDescription>{M.GUIDE_EXAMPLES_DESCRIPTION(guide.secret_env_var)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                options={guide.examples.map((e) => ({ value: e.key, label: e.label }))}
                value={example?.key ?? ''}
                onChange={setExampleKey}
              />
              {example ? (
                <div role="tabpanel" className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <dl className="min-w-0 space-y-1 text-sm">
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-muted-foreground">{M.GUIDE_NEEDS}</dt>
                        <dd>{example.requirements}</dd>
                      </div>
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-muted-foreground">{M.GUIDE_RUN}</dt>
                        <dd>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{example.run}</code>
                        </dd>
                      </div>
                    </dl>
                    <WebhookCopyButton value={example.code} label={M.GUIDE_COPY_CODE} />
                  </div>
                  <div className="overflow-hidden rounded-md border">
                    <div className="border-b bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
                      {example.filename}
                    </div>
                    <pre className="max-h-[32rem] overflow-auto bg-muted/50 p-3 text-xs leading-relaxed">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Signing test vector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{M.GUIDE_VECTOR_TITLE}</CardTitle>
              <CardDescription>{M.GUIDE_VECTOR_DESCRIPTION}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {[
                  [M.GUIDE_VECTOR_SECRET, guide.test_vector.secret],
                  [guide.signing.headers.TIMESTAMP, guide.test_vector.timestamp],
                  [M.GUIDE_VECTOR_BODY, guide.test_vector.body],
                  [
                    M.GUIDE_VECTOR_EXPECTED(guide.signing.headers.SIGNATURE),
                    guide.test_vector.signature_header,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-1">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="flex items-start gap-2">
                      <code className="min-w-0 flex-1 break-all rounded-md border bg-muted px-3 py-2 text-xs">
                        {value}
                      </code>
                      <WebhookCopyButton value={value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </>
      ) : null}
    </>
  );
}
