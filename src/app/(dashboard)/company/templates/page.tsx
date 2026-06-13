'use client';

import { ROUTES, UI_MESSAGES } from '@/constants';
import { templateApi } from '@/lib/api/template.api';
import { TemplatesView, type TemplatesApi } from '@/components/dashboard/TemplatesView';

const api: TemplatesApi = {
  list: (params) => templateApi.list(params),
  sync: () => templateApi.sync(),
  remove: (id) => templateApi.remove(id),
};

export default function TemplatesPage() {
  return (
    <TemplatesView
      title={UI_MESSAGES.COMPANY.TEMPLATES_TITLE}
      description={UI_MESSAGES.COMPANY.TEMPLATES_HINT}
      createHref={ROUTES.COMPANY.TEMPLATES_NEW}
      api={api}
    />
  );
}
