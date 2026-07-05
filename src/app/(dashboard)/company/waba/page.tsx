'use client';

import { useMemo } from 'react';
import { UI_MESSAGES } from '@/constants';
import { companyApi } from '@/lib/api/company.api';
import { templateApi } from '@/lib/api/template.api';
import { WabaView, type WabaViewApi } from '@/components/dashboard/WabaView';

export default function WabaPage() {
  const api: WabaViewApi = useMemo(
    () => ({
      getWaba: () => companyApi.getWaba(),
      connectWaba: (payload) => companyApi.connectWaba(payload),
      disconnectWaba: () => companyApi.disconnectWaba(),
      syncWaba: () => companyApi.syncWaba(),
      listTemplates: (params) => templateApi.list(params),
      listMessages: (params) => companyApi.listMessages(params),
      requestPhoneCode: (phoneId, codeMethod) =>
        companyApi.requestPhoneCode(phoneId, { code_method: codeMethod }),
      verifyPhoneCode: (phoneId, code) => companyApi.verifyPhoneCode(phoneId, code),
      registerPhone: (phoneId, pin) => companyApi.registerPhone(phoneId, pin),
    }),
    [],
  );

  return (
    <WabaView
      title={UI_MESSAGES.COMPANY.WABA_TITLE}
      description={UI_MESSAGES.COMPANY.CONNECT_WABA_HINT}
      api={api}
    />
  );
}
