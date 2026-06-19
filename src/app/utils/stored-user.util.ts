export function getStoredUserId(): string {
  const raw = localStorage.getItem('idUser');
  if (raw === null || raw === undefined || raw === '') {
    return '';
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      return parsed;
    }
    if (parsed === null || parsed === undefined) {
      return '';
    }
    return String(parsed);
  } catch {
    return raw;
  }
}
