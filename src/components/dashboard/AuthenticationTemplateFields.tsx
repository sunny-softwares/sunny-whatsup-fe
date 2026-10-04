'use client';

import { Plus, Trash2 } from 'lucide-react';
import {
  AUTH_PACKAGE_NAME_RE,
  AUTH_SIGNATURE_HASH_RE,
  AUTH_TEMPLATE_LIMITS,
  AUTH_TEMPLATE_TEXT,
  AUTH_TEMPLATE_TTL_OPTIONS,
  DEFAULT_AUTH_TEMPLATE_TTL_SECONDS,
  EXTERNAL_LINKS,
  TEMPLATE_OTP_TYPE,
  TEMPLATE_OTP_TYPE_DESCRIPTION,
  TEMPLATE_OTP_TYPE_LABEL,
  TEMPLATE_OTP_TYPE_VALUES,
  isAutofillOtpType,
  type TemplateOtpType,
} from '@/constants';
import type { AuthSupportedApp, AuthenticationTemplateSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AuthTemplateFormState {
  otpType: TemplateOtpType;
  zeroTapTermsAccepted: boolean;
  supportedApps: AuthSupportedApp[];
  copyCodeText: string;
  autofillText: string;
  addSecurityRecommendation: boolean;
  includeExpiration: boolean;
  codeExpirationMinutes: string;
  customTtl: boolean;
  ttlSeconds: number;
}

const EMPTY_APP: AuthSupportedApp = { package_name: '', signature_hash: '' };

export const DEFAULT_AUTH_TEMPLATE_FORM: AuthTemplateFormState = {
  otpType: TEMPLATE_OTP_TYPE.COPY_CODE,
  zeroTapTermsAccepted: false,
  supportedApps: [EMPTY_APP],
  copyCodeText: '',
  autofillText: '',
  addSecurityRecommendation: true,
  includeExpiration: false,
  codeExpirationMinutes: String(AUTH_TEMPLATE_LIMITS.DEFAULT_CODE_EXPIRATION_MINUTES),
  customTtl: true,
  ttlSeconds: DEFAULT_AUTH_TEMPLATE_TTL_SECONDS,
};

const packageNameError = (value: string) => {
  if (!value.trim()) return 'Enter the app’s package name.';
  if (!AUTH_PACKAGE_NAME_RE.test(value.trim())) {
    return 'Use at least two dot-separated parts, each starting with a letter (e.g. com.example.app).';
  }
  return null;
};

const signatureHashError = (value: string) => {
  if (!value.trim()) return 'Enter the app signature hash.';
  if (!AUTH_SIGNATURE_HASH_RE.test(value.trim())) {
    return `The signature hash must be exactly ${AUTH_TEMPLATE_LIMITS.SIGNATURE_HASH_LENGTH} characters (letters, digits, +, /, =).`;
  }
  return null;
};

const parseExpirationMinutes = (value: string) => {
  const n = Number(value);
  return Number.isInteger(n) &&
    n >= AUTH_TEMPLATE_LIMITS.CODE_EXPIRATION_MIN_MINUTES &&
    n <= AUTH_TEMPLATE_LIMITS.CODE_EXPIRATION_MAX_MINUTES
    ? n
    : null;
};

/** First problem that would stop Meta accepting the template, or null. */
export const validateAuthTemplateForm = (state: AuthTemplateFormState): string | null => {
  if (state.otpType === TEMPLATE_OTP_TYPE.ZERO_TAP && !state.zeroTapTermsAccepted) {
    return 'Accept the zero-tap terms to use zero-tap autofill.';
  }
  if (isAutofillOtpType(state.otpType)) {
    for (const [i, app] of state.supportedApps.entries()) {
      const problem = packageNameError(app.package_name) ?? signatureHashError(app.signature_hash);
      if (problem) return `App ${i + 1}: ${problem}`;
    }
    const keys = state.supportedApps.map((a) => `${a.package_name.trim()}::${a.signature_hash.trim()}`);
    if (new Set(keys).size !== keys.length) return 'Each app (package name + signature hash) can only be added once.';
  }
  if (state.includeExpiration && parseExpirationMinutes(state.codeExpirationMinutes) === null) {
    return `Code expiration must be a whole number from ${AUTH_TEMPLATE_LIMITS.CODE_EXPIRATION_MIN_MINUTES} to ${AUTH_TEMPLATE_LIMITS.CODE_EXPIRATION_MAX_MINUTES} minutes.`;
  }
  return null;
};

/** The `authentication` block of the create-template request. */
export const toAuthenticationSettings = (
  state: AuthTemplateFormState,
): AuthenticationTemplateSettings => {
  const settings: AuthenticationTemplateSettings = {
    otp_type: state.otpType,
    add_security_recommendation: state.addSecurityRecommendation,
  };
  const minutes = state.includeExpiration ? parseExpirationMinutes(state.codeExpirationMinutes) : null;
  if (minutes) settings.code_expiration_minutes = minutes;
  if (state.customTtl) settings.message_send_ttl_seconds = state.ttlSeconds;
  if (state.copyCodeText.trim()) settings.copy_code_text = state.copyCodeText.trim();
  if (isAutofillOtpType(state.otpType)) {
    if (state.autofillText.trim()) settings.autofill_text = state.autofillText.trim();
    settings.supported_apps = state.supportedApps.map((a) => ({
      package_name: a.package_name.trim(),
      signature_hash: a.signature_hash.trim(),
    }));
  }
  if (state.otpType === TEMPLATE_OTP_TYPE.ZERO_TAP) settings.zero_tap_terms_accepted = true;
  return settings;
};

interface AuthenticationTemplateFieldsProps {
  value: AuthTemplateFormState;
  onChange: (patch: Partial<AuthTemplateFormState>) => void;
}

export function AuthenticationTemplateFields({ value, onChange }: AuthenticationTemplateFieldsProps) {
  const autofill = isAutofillOtpType(value.otpType);
  const expirationMinutes = value.includeExpiration
    ? parseExpirationMinutes(value.codeExpirationMinutes)
    : null;
  // Meta recommends the message expire no later than the code it carries.
  const ttlOutlivesCode =
    value.customTtl && expirationMinutes !== null && value.ttlSeconds > expirationMinutes * 60;

  const updateApp = (index: number, patch: Partial<AuthSupportedApp>) =>
    onChange({
      supportedApps: value.supportedApps.map((a, i) => (i === index ? { ...a, ...patch } : a)),
    });

  const addApp = () => {
    if (value.supportedApps.length >= AUTH_TEMPLATE_LIMITS.MAX_SUPPORTED_APPS) return;
    onChange({ supportedApps: [...value.supportedApps, EMPTY_APP] });
  };

  const removeApp = (index: number) =>
    onChange({ supportedApps: value.supportedApps.filter((_, i) => i !== index) });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Code delivery setup</CardTitle>
          <CardDescription>
            Choose how customers get the code from WhatsApp into your app. Meta writes the
            message text for authentication templates, so there is no header, body or footer to
            fill in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {TEMPLATE_OTP_TYPE_VALUES.map((type) => (
            <div key={type} className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="otp_type"
                  className="mt-1 h-4 w-4 accent-primary"
                  checked={value.otpType === type}
                  onChange={() => onChange({ otpType: type })}
                />
                <span>
                  <span className="block text-sm font-medium">{TEMPLATE_OTP_TYPE_LABEL[type]}</span>
                  <span className="block text-xs text-muted-foreground">
                    {TEMPLATE_OTP_TYPE_DESCRIPTION[type]}
                  </span>
                </span>
              </label>

              {type === TEMPLATE_OTP_TYPE.ZERO_TAP && value.otpType === TEMPLATE_OTP_TYPE.ZERO_TAP ? (
                <label className="ml-7 flex cursor-pointer items-start gap-3 rounded-md border bg-muted/40 p-3 text-xs">
                  <Checkbox
                    className="mt-0.5"
                    checked={value.zeroTapTermsAccepted}
                    onChange={(e) => onChange({ zeroTapTermsAccepted: e.target.checked })}
                  />
                  <span>
                    By selecting zero-tap, I understand that my business’s use of zero-tap
                    authentication is subject to the{' '}
                    <a
                      href={EXTERNAL_LINKS.WHATSAPP_BUSINESS_TERMS}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      WhatsApp Business Terms of Service
                    </a>
                    . It’s my business’s responsibility to ensure its customers expect that the code
                    will be automatically filled in on their behalf when they choose to receive the
                    zero-tap code through WhatsApp.
                  </span>
                </label>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      {autofill ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">App setup</CardTitle>
            <CardDescription>
              The Android apps that can receive the code. You can add up to{' '}
              {AUTH_TEMPLATE_LIMITS.MAX_SUPPORTED_APPS} apps.{' '}
              <a
                href={EXTERNAL_LINKS.META_AUTH_TEMPLATES_DOCS}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                How to find these values
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {value.supportedApps.map((app, i) => {
              const pkgError = app.package_name ? packageNameError(app.package_name) : null;
              const hashError = app.signature_hash ? signatureHashError(app.signature_hash) : null;
              return (
                <div key={i} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>App {i + 1}</span>
                    {value.supportedApps.length > 1 ? (
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeApp(i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="space-y-1 md:col-span-2">
                      <Label htmlFor={`package_name_${i}`}>Package name</Label>
                      <Input
                        id={`package_name_${i}`}
                        maxLength={AUTH_TEMPLATE_LIMITS.PACKAGE_NAME_MAX}
                        value={app.package_name}
                        onChange={(e) => updateApp(i, { package_name: e.target.value })}
                        placeholder="com.example.myapplication"
                        aria-invalid={Boolean(pkgError)}
                      />
                      {pkgError ? <p className="text-xs text-destructive">{pkgError}</p> : null}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`signature_hash_${i}`}>App signature hash</Label>
                      <Input
                        id={`signature_hash_${i}`}
                        maxLength={AUTH_TEMPLATE_LIMITS.SIGNATURE_HASH_LENGTH}
                        value={app.signature_hash}
                        onChange={(e) => updateApp(i, { signature_hash: e.target.value })}
                        placeholder="K8a/AINcGX7"
                        aria-invalid={Boolean(hashError)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {app.signature_hash.length}/{AUTH_TEMPLATE_LIMITS.SIGNATURE_HASH_LENGTH}
                      </p>
                      {hashError ? <p className="text-xs text-destructive">{hashError}</p> : null}
                    </div>
                  </div>
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addApp}
              disabled={value.supportedApps.length >= AUTH_TEMPLATE_LIMITS.MAX_SUPPORTED_APPS}
            >
              <Plus className="mr-2 h-3 w-3" /> Add another app
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content</CardTitle>
          <CardDescription>
            The message text is set by Meta. You can add the extra content below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <Checkbox
              className="mt-0.5"
              checked={value.addSecurityRecommendation}
              onChange={(e) => onChange({ addSecurityRecommendation: e.target.checked })}
            />
            <span>
              Add security recommendation
              <span className="block text-xs text-muted-foreground">
                Adds “{AUTH_TEMPLATE_TEXT.SECURITY_RECOMMENDATION}”
              </span>
            </span>
          </label>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox
                className="mt-0.5"
                checked={value.includeExpiration}
                onChange={(e) => onChange({ includeExpiration: e.target.checked })}
              />
              <span>
                Add expiration time for the code
                <span className="block text-xs text-muted-foreground">
                  Shown as a footer. After the code expires, the autofill button is disabled.
                </span>
              </span>
            </label>
            {value.includeExpiration ? (
              <div className="ml-7 max-w-xs space-y-1">
                <Label htmlFor="code_expiration_minutes">Expires in (minutes)</Label>
                <Input
                  id="code_expiration_minutes"
                  type="number"
                  min={AUTH_TEMPLATE_LIMITS.CODE_EXPIRATION_MIN_MINUTES}
                  max={AUTH_TEMPLATE_LIMITS.CODE_EXPIRATION_MAX_MINUTES}
                  step={1}
                  value={value.codeExpirationMinutes}
                  onChange={(e) => onChange({ codeExpirationMinutes: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  {AUTH_TEMPLATE_LIMITS.CODE_EXPIRATION_MIN_MINUTES}–
                  {AUTH_TEMPLATE_LIMITS.CODE_EXPIRATION_MAX_MINUTES} minutes.
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Button text (optional)</CardTitle>
          <CardDescription>
            Leave blank to use WhatsApp’s default labels, translated into the template language.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="copy_code_text">Copy code button</Label>
            <Input
              id="copy_code_text"
              maxLength={AUTH_TEMPLATE_LIMITS.BUTTON_TEXT_MAX}
              value={value.copyCodeText}
              onChange={(e) => onChange({ copyCodeText: e.target.value })}
              placeholder={AUTH_TEMPLATE_TEXT.COPY_CODE_BUTTON}
            />
            {autofill ? (
              <p className="text-xs text-muted-foreground">Used when autofill isn’t possible.</p>
            ) : null}
          </div>
          {autofill ? (
            <div className="space-y-1">
              <Label htmlFor="autofill_text">Autofill button</Label>
              <Input
                id="autofill_text"
                maxLength={AUTH_TEMPLATE_LIMITS.BUTTON_TEXT_MAX}
                value={value.autofillText}
                onChange={(e) => onChange({ autofillText: e.target.value })}
                placeholder={AUTH_TEMPLATE_TEXT.AUTOFILL_BUTTON}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Message validity period</CardTitle>
          <CardDescription>
            If the message isn’t delivered within this time, it is dropped: you aren’t charged and
            the customer never sees an outdated code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <Checkbox
              className="mt-0.5"
              checked={value.customTtl}
              onChange={(e) => onChange({ customTtl: e.target.checked })}
            />
            <span>
              Set a custom validity period for your message
              <span className="block text-xs text-muted-foreground">
                Without one, WhatsApp’s standard 10-minute validity period applies.
              </span>
            </span>
          </label>
          {value.customTtl ? (
            <div className="ml-7 max-w-xs space-y-1">
              <Label htmlFor="ttl_seconds">Validity period</Label>
              <select
                id="ttl_seconds"
                value={value.ttlSeconds}
                onChange={(e) => onChange({ ttlSeconds: Number(e.target.value) })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {AUTH_TEMPLATE_TTL_OPTIONS.map((o) => (
                  <option key={o.seconds} value={o.seconds}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {ttlOutlivesCode ? (
            <p className="text-xs text-amber-600">
              The validity period is longer than the code expiration. Meta recommends a validity
              period no longer than the code’s lifetime.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
