import type { ScanRecord } from '@/lib/types';

let _scans: ScanRecord[] = [];

export function addScanRecord(scan: ScanRecord): void {
  _scans = [scan, ..._scans];
}

export function getAllScans(): ScanRecord[] {
  return _scans;
}

export function getScansByEvent(eventId: string): ScanRecord[] {
  return _scans.filter(s => s.eventId === eventId);
}

export function getSuccessfulScans(eventId?: string): ScanRecord[] {
  const all = eventId ? getScansByEvent(eventId) : _scans;
  return all.filter(s => s.result === 'SUCCESS');
}

export function getScannedTicketIds(): Set<string> {
  return new Set(_scans.filter(s => s.result === 'SUCCESS').map(s => s.ticketId));
}
