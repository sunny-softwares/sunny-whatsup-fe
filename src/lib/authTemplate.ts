import {
  AUTH_TEMPLATE_TEXT,
  TEMPLATE_OTP_BUTTON_TYPE,
  TEMPLATE_OTP_TYPE,
  isAutofillOtpType,
  type TemplateOtpType,
} from '@/constants';
import type { TemplateComponent, TemplateOtpButtonComponent } from '@/types';

// Meta writes an authentication template's text itself, so a template we just
// created has no body/footer text until it is synced. These build the English
// preview from the template's settings.

export const authBodyText = (addSecurityRecommendation: boolean) =>
  addSecurityRecommendation
    ? `${AUTH_TEMPLATE_TEXT.BODY} ${AUTH_TEMPLATE_TEXT.SECURITY_RECOMMENDATION}`
    : AUTH_TEMPLATE_TEXT.BODY;

export const authFooterText = (codeExpirationMinutes?: number | null) =>
  codeExpirationMinutes ? AUTH_TEMPLATE_TEXT.FOOTER(codeExpirationMinutes) : null;

// One-tap and zero-tap messages show an autofill button; copy code shows a copy button.
export const otpButtonLabel = (
  otpType: TemplateOtpType,
  copyCodeText?: string,
  autofillText?: string,
) =>
  isAutofillOtpType(otpType)
    ? autofillText?.trim() || AUTH_TEMPLATE_TEXT.AUTOFILL_BUTTON
    : copyCodeText?.trim() || AUTH_TEMPLATE_TEXT.COPY_CODE_BUTTON;

export const isOtpButton = (
  button: NonNullable<TemplateComponent['buttons']>[number],
): button is TemplateOtpButtonComponent => button.type === TEMPLATE_OTP_BUTTON_TYPE;

export const otpButtonComponentLabel = (button: TemplateOtpButtonComponent) =>
  otpButtonLabel(button.otp_type ?? TEMPLATE_OTP_TYPE.COPY_CODE, button.text, button.autofill_text);

// WhatsApp draws a copy icon on the copy-code button itself (it can't be part
// of the label), so previews add it for every authentication button except autofill.
export const showsCopyIcon = (button: NonNullable<TemplateComponent['buttons']>[number]) =>
  !(isOtpButton(button) && isAutofillOtpType(button.otp_type ?? TEMPLATE_OTP_TYPE.COPY_CODE));
