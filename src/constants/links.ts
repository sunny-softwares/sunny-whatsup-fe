// External destinations. Kept here (not inline in components) so a URL change
// on Meta's side is a one-line edit.

// Click-to-chat hosts. The web host opens a chat in WhatsApp Web directly;
// wa.me is WhatsApp's universal link, which hands off to the installed app on
// a phone (and falls back to the web client when there is none).
const WHATSAPP_WEB_SEND = 'https://web.whatsapp.com/send';
const WHATSAPP_UNIVERSAL = 'https://wa.me';

// Click-to-chat URLs address a number as bare digits, without + or separators.
const dialableDigits = (phone: string) => phone.replace(/\D/g, '');

export const EXTERNAL_LINKS = {
  // Reference for the error codes Meta returns in a failed message's error
  // payload — linked from the messages listing so users can look up failures.
  META_ERROR_CODES_DOCS:
    'https://developers.facebook.com/documentation/business-messaging/whatsapp/support/error-codes',

  /**
   * WhatsApp Web chat composer for one recipient, optionally prefilled with
   * text. WhatsApp's click-to-chat URL only supports prefilling text — media
   * cannot be attached this way.
   */
  whatsappWebSend: (phone: string, text: string) =>
    `${WHATSAPP_WEB_SEND}?phone=${encodeURIComponent(dialableDigits(phone))}${
      text ? `&text=${encodeURIComponent(text)}` : ''
    }`,

  /**
   * A plain chat with one recipient, nothing prefilled. On a phone this opens
   * the installed WhatsApp app; on a desktop it goes straight to WhatsApp Web,
   * skipping the interstitial wa.me would otherwise show there.
   */
  whatsappChat: (phone: string, onMobile: boolean) => {
    const digits = encodeURIComponent(dialableDigits(phone));
    return onMobile ? `${WHATSAPP_UNIVERSAL}/${digits}` : `${WHATSAPP_WEB_SEND}?phone=${digits}`;
  },

  // Whether a number can be addressed at all — nothing to link to otherwise.
  isDialable: (phone: string) => dialableDigits(phone).length > 0,
} as const;
