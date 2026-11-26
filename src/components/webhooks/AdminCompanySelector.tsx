'use client';

import { UI_MESSAGES } from '@/constants';
import type { Company } from '@/types';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface AdminCompanySelectorProps {
  companies: Company[];
  value: string;
  onChange: (id: string) => void;
  error: string | null;
}

// Company picker for the super-admin webhook pages.
export function AdminCompanySelector({
  companies,
  value,
  onChange,
  error,
}: AdminCompanySelectorProps) {
  return (
    <div className="min-w-[220px] flex-1 sm:max-w-xs">
      <label className="mb-1 block text-xs text-muted-foreground">
        {UI_MESSAGES.ADMIN.SELECT_COMPANY_LABEL}
      </label>
      <SearchableSelect
        options={companies.map((c) => ({ value: c.id, label: c.name }))}
        value={value}
        onChange={onChange}
        placeholder={UI_MESSAGES.ADMIN.SELECT_COMPANY_PLACEHOLDER}
      />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
