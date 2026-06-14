import { PageHeader } from '@/components/layout/PageHeader';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { DeleteAccountCard } from '@/components/settings/DeleteAccountCard';
import { UI_MESSAGES } from '@/constants';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title={UI_MESSAGES.SETTINGS.SECURITY_TITLE}
        description={UI_MESSAGES.SETTINGS.SECURITY_SUBTITLE}
      />
      <ChangePasswordForm />
      {/* Renders only for company admins; super admins have no company to delete. */}
      <DeleteAccountCard />
    </div>
  );
}
