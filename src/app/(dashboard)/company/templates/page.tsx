'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  ROUTES,
  TEMPLATE_CATEGORY_LABEL,
  TEMPLATE_CATEGORY_VALUES,
  UI_MESSAGES,
  type TemplateCategory,
} from '@/constants';
import { templateApi } from '@/lib/api/template.api';
import { pickErrorMessage, formatDate } from '@/lib/utils';
import type { MessageTemplate, TemplatesByCategory } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateStatusBadge } from '@/components/dashboard/TemplateStatusBadge';
import { TemplatePreview } from '@/components/dashboard/TemplatePreview';

export default function TemplatesPage() {
  const [grouped, setGrouped] = useState<TemplatesByCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await templateApi.listGrouped();
      setGrouped(res.data);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      await templateApi.sync();
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this template on Meta? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await templateApi.remove(id);
      await load();
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setBusyId(null);
    }
  };

  const totalCount = grouped
    ? TEMPLATE_CATEGORY_VALUES.reduce((acc, cat) => acc + (grouped[cat]?.length ?? 0), 0)
    : 0;

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.COMPANY.TEMPLATES_TITLE}
        description={UI_MESSAGES.COMPANY.TEMPLATES_HINT}
        actions={
          <>
            <Button variant="outline" onClick={handleSync} disabled={syncing || loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing…' : 'Sync from Meta'}
            </Button>
            <Link href={ROUTES.COMPANY.TEMPLATES_NEW}>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create template
              </Button>
            </Link>
          </>
        }
      />

      {loading ? (
        <p className="text-muted-foreground">{UI_MESSAGES.COMMON.LOADING}</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : !grouped || totalCount === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No templates yet</CardTitle>
            <CardDescription>
              Create your first template to start sending WhatsApp messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={ROUTES.COMPANY.TEMPLATES_NEW}>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create template
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {TEMPLATE_CATEGORY_VALUES.map((cat: TemplateCategory) => {
            const items = grouped[cat] ?? [];
            return (
              <section key={cat} id={`cat-${cat}`}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {TEMPLATE_CATEGORY_LABEL[cat]}
                  </h2>
                  <span className="text-xs text-muted-foreground">{items.length} template(s)</span>
                </div>

                {items.length === 0 ? (
                  <p className="rounded-md border border-dashed bg-muted/50 p-4 text-sm text-muted-foreground">
                    {UI_MESSAGES.COMPANY.NO_TEMPLATES_YET}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((t: MessageTemplate) => (
                      <Card key={t.id} className="flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <CardTitle className="truncate text-base">{t.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {t.language} · synced {formatDate(t.last_synced_at)}
                              </CardDescription>
                            </div>
                            <TemplateStatusBadge status={t.status} />
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-3">
                          <TemplatePreview template={t} />
                          {t.rejection_reason ? (
                            <p className="text-xs text-destructive">{t.rejection_reason}</p>
                          ) : null}
                          <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span>
                              Vars: body {t.variables.body.count}
                              {t.variables.header ? ` · header ${t.variables.header.count}` : ''}
                              {t.variables.buttons.length
                                ? ` · buttons ${t.variables.buttons.length}`
                                : ''}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(t.id)}
                              disabled={busyId === t.id}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
