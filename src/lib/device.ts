const MOBILE_UA_RE = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile/i;

interface UserAgentData {
  mobile?: boolean;
}

/**
 * Whether this is a phone or tablet, used to decide between handing a link to
 * a native app and opening a web client.
 *
 * Must be called after mount — on the server there is no navigator, and
 * branching on it during render would desync hydration.
 */
export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;

  // Chromium exposes this directly; everywhere else, fall back to the agent
  // string. iPadOS reports itself as a Mac, so touch points disambiguate it.
  const uaData = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
  if (typeof uaData?.mobile === 'boolean') return uaData.mobile;

  const ua = navigator.userAgent;
  const isIpadOs = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return MOBILE_UA_RE.test(ua) || isIpadOs;
};
