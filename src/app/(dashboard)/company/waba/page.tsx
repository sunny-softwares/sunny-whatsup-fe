'use client';

import { useMemo } from 'react';
import { UI_MESSAGES } from '@/constants';
import { companyApi } from '@/lib/api/company.api';
import { WabaView, type WabaViewApi } from '@/components/dashboard/WabaView';

export default function WabaPage() {
  const api: WabaViewApi = useMemo(
    () => ({
      listWabas: () => companyApi.listWabas(),
      connectWaba: (payload) => companyApi.connectWaba(payload),
      syncAll: () => companyApi.syncWaba(),
      syncWaba: (wabaAccountId) => companyApi.syncWabaAccount(wabaAccountId),
      activateWaba: (wabaAccountId) => companyApi.activateWaba(wabaAccountId),
      disconnectWaba: (wabaAccountId) => companyApi.disconnectWabaAccount(wabaAccountId),
      addPhoneNumber: (payload) => companyApi.addPhoneNumber(payload),
      addPhoneEmbedded: (payload) => companyApi.addPhoneEmbedded(payload),
      setDefaultPhone: (phoneId) => companyApi.setDefaultPhone(phoneId),
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
