/**
 * Utility functions for Direct Links, Fullscreen and Kiosk sharing
 */

export function isFullscreenRequestedInUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase();
  return (
    searchParams.get('fullscreen') === 'true' ||
    searchParams.get('fullscreen') === '1' ||
    searchParams.get('kiosk') === 'true' ||
    searchParams.get('kiosk') === '1' ||
    searchParams.get('modo') === 'telacheia' ||
    hash.includes('fullscreen') ||
    hash.includes('telacheia')
  );
}

export function getCleanAppUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin + window.location.pathname;
}

export function getFullscreenShareUrl(): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('fullscreen', 'true');
  return url.toString();
}

export function getSectorShareUrl(sectorId: string, fullscreen: boolean = false): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  if (sectorId && sectorId !== 'todos') {
    url.searchParams.set('sector', sectorId);
  }
  if (fullscreen) {
    url.searchParams.set('fullscreen', 'true');
  }
  return url.toString();
}

export function getUserShareUrl(userId: string, fullscreen: boolean = false): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  if (userId) {
    url.searchParams.set('user', userId);
  }
  if (fullscreen) {
    url.searchParams.set('fullscreen', 'true');
  }
  return url.toString();
}

export function getWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export async function triggerBrowserFullscreen(): Promise<boolean> {
  try {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        return true;
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
        return true;
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
        return true;
      }
    }
    return false;
  } catch (err) {
    console.warn('Fullscreen request could not be completed:', err);
    return false;
  }
}

export async function exitBrowserFullscreen(): Promise<boolean> {
  try {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        return true;
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
        return true;
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
        return true;
      }
    }
    return false;
  } catch (err) {
    console.warn('Exit fullscreen request could not be completed:', err);
    return false;
  }
}

