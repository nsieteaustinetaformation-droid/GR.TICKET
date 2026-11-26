import type { ScanRecord } from '@/lib/types';
import { persistScan } from '@/lib/supabase/write';
import { notifyStoreChange } from './subscribe';

// Local mirror of the Supabase "scans" table.
let _scans: ScanRecord[] = [];

export function setScans(scans: ScanRecord[]): void {
  _scans = scans;
  notifyStoreChange();
}

export function addScanRecord(scan: ScanRecord): void {
  _scans = [scan, ..._scans];
  notifyStoreChange();
  void persistScan(scan);
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
