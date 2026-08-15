'use client';

import { UI_MESSAGES } from '@/constants';
import { superAdminApi } from '@/lib/api/superAdmin.api';
import { MessagesView } from '@/components/dashboard/MessagesView';

export default function AdminMessagesPage() {
  return (
    <MessagesView
      title={UI_MESSAGES.ADMIN.MESSAGES_TITLE}
      description="Delivery activity across all tenants"
      showCompany
      fetchMessages={superAdminApi.listMessages}
      downloadMessageMedia={superAdminApi.downloadMessageMedia}
    />
  );
}
