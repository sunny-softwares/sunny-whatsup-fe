// External Meta destinations for WABA billing.
//
// Meta exposes no public Graph API for a WABA's outstanding balance, payment
// method, or billing cycle — those live only in Meta's own Billing Hub. So the
// Billing page owns no data of its own and simply hands the user off to Meta.
// Keep these here (not inline in the page) so a URL change on Meta's side is a
// one-line edit.
const META_BILLING_HUB_ACCOUNTS = 'https://business.facebook.com/latest/billing_hub/accounts';

export const BILLING_LINKS = {
  // Billing Hub without an asset selected. Meta lands the user on whichever
  // business portfolio it last used, so this is only the fallback for when no
  // WABA is connected yet.
  META_BILLING_HUB: META_BILLING_HUB_ACCOUNTS,

  /**
   * Billing Hub deep link for one specific WABA.
   *
   * `asset_id` is the WABA ID — the same value the Billing Hub shows as "ID"
   * under the account name — and it is what pins the page to the right business
   * portfolio when the signed-in user owns several. Meta's own URL also carries
   * `payment_account_id` and `global_scope_id`, but neither is available to us
   * (no API exposes them) and `asset_id` alone resolves the account.
   */
  metaBillingHubForWaba: (wabaId: string) =>
    `${META_BILLING_HUB_ACCOUNTS}?asset_id=${encodeURIComponent(wabaId)}`,
} as const;
