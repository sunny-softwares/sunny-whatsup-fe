'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import {
  DEFAULT_TEMPLATE_LANGUAGE,
  ROUTES,
  TEMPLATE_BUTTON_TYPE,
  TEMPLATE_CATEGORY,
  TEMPLATE_CATEGORY_LABEL,
  TEMPLATE_CATEGORY_VALUES,
  TEMPLATE_HEADER_FORMAT,
  TEMPLATE_LANGUAGES,
  UI_MESSAGES,
  type TemplateButtonType,
  type TemplateCategory,
} from '@/constants';
import { templateApi } from '@/lib/api/template.api';
import { pickErrorMessage } from '@/lib/utils';
import type { CreateTemplateInput, TemplateButtonComponent } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const PLACEHOLDER_RE = /{{\s*(\d+)\s*}}/g;

const countPlaceholders = (text: string) => {
  let max = 0;
  let m: RegExpExecArray | null;
  while ((m = PLACEHOLDER_RE.exec(text)) !== null) {
    const n = Number.parseInt(m[1] ?? '0', 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max;
};

const padToLength = (arr: string[], n: number) => {
  if (arr.length === n) return arr;
  if (arr.length > n) return arr.slice(0, n);
  return [...arr, ...Array.from({ length: n - arr.length }, () => '')];
};

export default function NewTemplatePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [language, setLanguage] = useState<string>(DEFAULT_TEMPLATE_LANGUAGE);
  const [category, setCategory] = useState<TemplateCategory>(TEMPLATE_CATEGORY.UTILITY);

  const [includeHeader, setIncludeHeader] = useState(false);
  const [headerText, setHeaderText] = useState('');
  const [headerExamples, setHeaderExamples] = useState<string[]>([]);

  const [bodyText, setBodyText] = useState('');
  const [bodyExamples, setBodyExamples] = useState<string[]>([]);

  const [includeFooter, setIncludeFooter] = useState(false);
  const [footerText, setFooterText] = useState('');

  const [buttons, setButtons] = useState<TemplateButtonComponent[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headerPlaceholders = useMemo(() => countPlaceholders(headerText), [headerText]);
  const bodyPlaceholders = useMemo(() => countPlaceholders(bodyText), [bodyText]);

  // Keep example arrays sized to the number of placeholders.
  const headerExamplesSized = useMemo(
    () => padToLength(headerExamples, headerPlaceholders),
    [headerExamples, headerPlaceholders],
  );
  const bodyExamplesSized = useMemo(
    () => padToLength(bodyExamples, bodyPlaceholders),
    [bodyExamples, bodyPlaceholders],
  );

  const updateExampleArray = (
    setter: (next: string[]) => void,
    current: string[],
    index: number,
    value: string,
  ) => {
    const next = [...current];
    next[index] = value;
    setter(next);
  };

  const addButton = (type: TemplateButtonType) => {
    if (buttons.length >= 3) return;
    const base: TemplateButtonComponent = { type, text: '' };
    if (type === TEMPLATE_BUTTON_TYPE.URL) base.url = 'https://';
    if (type === TEMPLATE_BUTTON_TYPE.PHONE_NUMBER) base.phone_number = '';
    setButtons([...buttons, base]);
  };

  const updateButton = (index: number, patch: Partial<TemplateButtonComponent>) => {
    setButtons(buttons.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  const removeButton = (index: number) => setButtons(buttons.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: CreateTemplateInput = {
        name,
        language,
        category,
        body: {
          text: bodyText,
          ...(bodyPlaceholders > 0 ? { examples: bodyExamplesSized } : {}),
        },
      };

      if (includeHeader && headerText.trim()) {
        payload.header = {
          format: TEMPLATE_HEADER_FORMAT.TEXT,
          text: headerText,
          ...(headerPlaceholders > 0 ? { examples: headerExamplesSized } : {}),
        };
      }

      if (includeFooter && footerText.trim()) {
        payload.footer = { text: footerText };
      }

      if (buttons.length > 0) {
        payload.buttons = buttons;
      }

      await templateApi.create(payload);
      router.push(ROUTES.COMPANY.TEMPLATES);
    } catch (err) {
      setError(pickErrorMessage(err, UI_MESSAGES.AUTH.GENERIC_ERROR));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={UI_MESSAGES.COMPANY.NEW_TEMPLATE_TITLE}
        description="Submit a new message template to Meta for review."
        actions={
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basics</CardTitle>
              <CardDescription>Template identity and category as Meta requires them.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    pattern="[a-z0-9_]{1,512}"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. order_confirmation"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lowercase letters, digits, and underscores only.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {TEMPLATE_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label} ({l.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_CATEGORY_VALUES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        category === c
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {TEMPLATE_CATEGORY_LABEL[c]}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Header (optional)</CardTitle>
              <CardDescription>A short text shown above the body. Up to 60 characters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                />
                Include a text header
              </label>
              {includeHeader ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="header_text">Header text</Label>
                    <Input
                      id="header_text"
                      maxLength={60}
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="e.g. Hello {{1}}"
                    />
                  </div>
                  {headerPlaceholders > 0 ? (
                    <div className="space-y-2">
                      <Label>Header examples</Label>
                      {headerExamplesSized.map((ex, i) => (
                        <Input
                          key={i}
                          placeholder={`Example value for {{${i + 1}}}`}
                          value={ex}
                          onChange={(e) => updateExampleArray(setHeaderExamples, headerExamplesSized, i, e.target.value)}
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Body</CardTitle>
              <CardDescription>
                Use {'{{1}}, {{2}}'} for variables. Provide one example per variable so Meta can review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="body_text">Body text</Label>
                <Textarea
                  id="body_text"
                  required
                  maxLength={1024}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder={'Hello {{1}}, your order {{2}} has shipped.'}
                  className="min-h-[120px]"
                />
              </div>
              {bodyPlaceholders > 0 ? (
                <div className="space-y-2">
                  <Label>Body examples</Label>
                  {bodyExamplesSized.map((ex, i) => (
                    <Input
                      key={i}
                      placeholder={`Example value for {{${i + 1}}}`}
                      value={ex}
                      onChange={(e) => updateExampleArray(setBodyExamples, bodyExamplesSized, i, e.target.value)}
                    />
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Footer (optional)</CardTitle>
              <CardDescription>A short subtitle shown below the body.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeFooter}
                  onChange={(e) => setIncludeFooter(e.target.checked)}
                />
                Include a footer
              </label>
              {includeFooter ? (
                <Input
                  maxLength={60}
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="e.g. Powered by Sunny WhatsUp"
                />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Buttons (optional)</CardTitle>
              <CardDescription>Up to 3 quick reply or URL buttons.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addButton(TEMPLATE_BUTTON_TYPE.QUICK_REPLY)}
                  disabled={buttons.length >= 3}
                >
                  <Plus className="mr-2 h-3 w-3" /> Quick reply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addButton(TEMPLATE_BUTTON_TYPE.URL)}
                  disabled={buttons.length >= 3}
                >
                  <Plus className="mr-2 h-3 w-3" /> URL
                </Button>
              </div>

              {buttons.map((btn, i) => (
                <div key={i} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Button {i + 1} · {btn.type}
                    </span>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeButton(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Button label"
                      maxLength={25}
                      value={btn.text}
                      onChange={(e) => updateButton(i, { text: e.target.value })}
                    />
                    {btn.type === TEMPLATE_BUTTON_TYPE.URL ? (
                      <Input
                        placeholder="https://example.com or with {{1}}"
                        value={btn.url ?? ''}
                        onChange={(e) => updateButton(i, { url: e.target.value })}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {UI_MESSAGES.COMMON.CANCEL}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit to Meta'}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>How the message will look in WhatsApp.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-emerald-50 p-3 text-sm">
                {includeHeader && headerText ? (
                  <div className="mb-2 font-semibold">{headerText}</div>
                ) : null}
                <div className="whitespace-pre-wrap text-foreground">
                  {bodyText || <span className="text-muted-foreground">Body text…</span>}
                </div>
                {includeFooter && footerText ? (
                  <div className="mt-2 text-xs text-muted-foreground">{footerText}</div>
                ) : null}
                {buttons.length > 0 ? (
                  <div className="mt-3 space-y-1.5">
                    {buttons.map((b, i) => (
                      <div
                        key={i}
                        className="rounded border border-emerald-200 bg-background px-3 py-1.5 text-center text-xs text-primary"
                      >
                        {b.text || `Button ${i + 1}`}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
}
