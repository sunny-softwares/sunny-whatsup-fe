'use client';

import { TEMPLATE_CATEGORY_LABEL, UI_MESSAGES } from '@/constants';
import { formatDate } from '@/lib/utils';
import type { MessageTemplate } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TemplateStatusBadge } from '@/components/dashboard/TemplateStatusBadge';
import { TemplatePreview } from '@/components/dashboard/TemplatePreview';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

interface TemplateDetailsDialogProps {
  template: MessageTemplate | null;
  onClose: () => void;
}

export function TemplateDetailsDialog({ template, onClose }: TemplateDetailsDialogProps) {
  return (
    <Dialog open={!!template} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-w-xl">
        {template ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 pr-6">
                <DialogTitle className="truncate">{template.name}</DialogTitle>
                <TemplateStatusBadge status={template.status} />
              </div>
              <DialogDescription>{UI_MESSAGES.TEMPLATE.DETAILS_TITLE}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <TemplatePreview template={template} />

              {template.rejection_reason ? (
                <div>
                  <div className="text-xs text-muted-foreground">
                    {UI_MESSAGES.TEMPLATE.REJECTION_REASON}
                  </div>
                  <div className="text-sm text-destructive">{template.rejection_reason}</div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label={UI_MESSAGES.TEMPLATE.CATEGORY}
                  value={TEMPLATE_CATEGORY_LABEL[template.category] ?? template.category}
                />
                <Field label={UI_MESSAGES.TEMPLATE.LANGUAGE} value={template.language} />
                <Field label={UI_MESSAGES.TEMPLATE.CREATED} value={formatDate(template.created_at)} />
                <Field label={UI_MESSAGES.TEMPLATE.SYNCED} value={formatDate(template.last_synced_at)} />
                <Field
                  label={UI_MESSAGES.TEMPLATE.VARIABLES}
                  value={`body ${template.variables.body.count}${
                    template.variables.header ? ` · header ${template.variables.header.count}` : ''
                  }${
                    template.variables.buttons.length
                      ? ` · buttons ${template.variables.buttons.length}`
                      : ''
                  }`}
                />
                <Field
                  label={UI_MESSAGES.TEMPLATE.META_ID}
                  value={
                    <span className="break-all text-muted-foreground">
                      {template.meta_template_id ?? '—'}
                    </span>
                  }
                />
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
