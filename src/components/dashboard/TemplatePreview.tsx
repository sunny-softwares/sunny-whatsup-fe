import type { MessageTemplate, TemplateComponent } from '@/types';
import { TEMPLATE_HEADER_FORMAT } from '@/constants';

const findComponent = (components: TemplateComponent[], type: TemplateComponent['type']) =>
  components.find((c) => c.type === type);

export function TemplatePreview({ template }: { template: MessageTemplate }) {
  const header = findComponent(template.components, 'HEADER');
  const body = findComponent(template.components, 'BODY');
  const footer = findComponent(template.components, 'FOOTER');
  const buttons = findComponent(template.components, 'BUTTONS');

  return (
    <div className="rounded-lg border bg-emerald-50 p-3 text-sm">
      {header ? (
        <div className="mb-2 font-semibold">
          {header.format === TEMPLATE_HEADER_FORMAT.TEXT && header.text
            ? header.text
            : `[${header.format} header]`}
        </div>
      ) : null}
      {body?.text ? (
        <div className="whitespace-pre-wrap text-foreground">{body.text}</div>
      ) : null}
      {footer?.text ? (
        <div className="mt-2 text-xs text-muted-foreground">{footer.text}</div>
      ) : null}
      {buttons?.buttons && buttons.buttons.length > 0 ? (
        <div className="mt-3 space-y-1.5">
          {buttons.buttons.map((b, i) => (
            <div
              key={`${b.text}-${i}`}
              className="rounded border border-emerald-200 bg-background px-3 py-1.5 text-center text-xs text-primary"
            >
              {b.text}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
