import { Copy } from 'lucide-react';
import type { MessageTemplate, TemplateComponent } from '@/types';
import { TEMPLATE_CATEGORY, TEMPLATE_HEADER_FORMAT } from '@/constants';
import {
  authBodyText,
  authFooterText,
  isOtpButton,
  otpButtonComponentLabel,
  showsCopyIcon,
} from '@/lib/authTemplate';

const findComponent = (components: TemplateComponent[], type: TemplateComponent['type']) =>
  components.find((c) => c.type === type);

export function TemplatePreview({ template }: { template: MessageTemplate }) {
  const header = findComponent(template.components, 'HEADER');
  const body = findComponent(template.components, 'BODY');
  const footer = findComponent(template.components, 'FOOTER');
  const buttons = findComponent(template.components, 'BUTTONS');

  // An authentication template we created stores only its settings until a
  // sync brings back Meta's generated text, so render that text from them.
  const isAuthentication = template.category === TEMPLATE_CATEGORY.AUTHENTICATION;
  const bodyText =
    body?.text ||
    (isAuthentication ? authBodyText(body?.add_security_recommendation !== false) : null);
  const footerText = footer?.text || authFooterText(footer?.code_expiration_minutes);

  return (
    <div className="rounded-lg border bg-emerald-50 p-3 text-sm">
      {header ? (
        <div className="mb-2 font-semibold">
          {header.format === TEMPLATE_HEADER_FORMAT.TEXT && header.text
            ? header.text
            : `[${header.format} header]`}
        </div>
      ) : null}
      {bodyText ? (
        <div className="whitespace-pre-wrap text-foreground">{bodyText}</div>
      ) : null}
      {footerText ? (
        <div className="mt-2 text-xs text-muted-foreground">{footerText}</div>
      ) : null}
      {buttons?.buttons && buttons.buttons.length > 0 ? (
        <div className="mt-3 space-y-1.5">
          {buttons.buttons.map((b, i) => (
            <div
              key={`${b.text}-${i}`}
              className="flex items-center justify-center gap-1.5 rounded border border-emerald-200 bg-background px-3 py-1.5 text-xs text-primary"
            >
              {isAuthentication && showsCopyIcon(b) ? <Copy className="h-3 w-3" /> : null}
              {isOtpButton(b) ? otpButtonComponentLabel(b) : b.text}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
