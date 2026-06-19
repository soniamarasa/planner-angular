export function projectIconClass(icon?: string | null): string {
  if (!icon) {
    return 'pi pi-folder';
  }
  if (icon.startsWith('pi pi-')) {
    return icon;
  }
  if (icon.startsWith('pi-')) {
    return `pi ${icon}`;
  }
  return `pi pi-${icon}`;
}
