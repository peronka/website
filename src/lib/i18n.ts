// Polish URLs predate the English site and remain the default.
const pages = [
  ['/', '/en/'],
  ['/kontakt/', '/en/contact/'],
  ['/status/', '/en/status/'],
  ['/regulamin/', '/en/terms/'],
  ['/polityka-prywatnosci/', '/en/privacy/'],
  ['/zapisano/', '/en/signup-received/'],
  ['/potwierdzono/', '/en/confirmed/'],
  ['/zgloszono-testy/', '/en/application-received/'],
  ['/404/', '/en/404/'],
] as const;

export function isEnglish(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/');
}

export function localizedPath(path: string, en: boolean): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const pathname = path.split(/[?#]/, 1)[0];
  const normalized = pathname.endsWith('/') ? pathname : pathname + '/';
  const pair = pages.find(([pl, eng]) => pl === normalized || eng === normalized);
  return pair ? pair[en ? 1 : 0] + path.slice(pathname.length) : path;
}

// Unknown URLs show the not-found page in the other language.
export function alternatePage(path: string, en: boolean): string {
  const localized = localizedPath(path, en);
  return isEnglish(localized) === en ? localized : localizedPath('/404/', en);
}
