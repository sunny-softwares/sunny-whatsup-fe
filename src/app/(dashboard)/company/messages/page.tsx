'use client';

import { UI_MESSAGES } from '@/constants';
import { companyApi } from '@/lib/api/company.api';
import { MessagesView } from '@/components/dashboard/MessagesView';

export default function CompanyMessagesPage() {
  return (
    <MessagesView
      title={UI_MESSAGES.COMPANY.MESSAGES_TITLE}
      fetchMessages={companyApi.listMessages}
      downloadMessageMedia={companyApi.downloadMessageMedia}
    />
  );
}
