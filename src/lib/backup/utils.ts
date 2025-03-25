
/**
 * Format a date string to a more readable format
 */
export function formatBackupDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString();
  } catch (e) {
    return dateStr;
  }
}

/**
 * Detect if a backup file is a complete backup based on filename
 */
export function isCompleteBackup(filename: string): boolean {
  return filename.toLowerCase().includes('complete');
}
