import type { ReactNode } from 'react';

type IconProps = { size?: number; className?: string };
type IconName =
  | 'Activity'
  | 'ArrowUp'
  | 'ArrowUpRight'
  | 'Check'
  | 'ChevronDown'
  | 'CircleHelp'
  | 'FileImage'
  | 'Fingerprint'
  | 'LoaderCircle'
  | 'LockKeyhole'
  | 'Plus'
  | 'RefreshCw'
  | 'ScanSearch'
  | 'ShieldCheck'
  | 'Sparkles'
  | 'Trash2'
  | 'UploadCloud'
  | 'X';

const artwork: Record<IconName, ReactNode> = {
  Activity: <><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>,
  ArrowUp: <><path d="M12 19V5M5 12l7-7 7 7" /></>,
  ArrowUpRight: <><path d="M7 17 17 7M7 7h10v10" /></>,
  Check: <><path d="m5 12 4 4L19 6" /></>,
  ChevronDown: <><path d="m6 9 6 6 6-6" /></>,
  CircleHelp: <><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01" /></>,
  FileImage: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 15l2-2 4 4 2-2 2 2" /><circle cx="10" cy="9" r="1" /></>,
  Fingerprint: <><path d="M12 11a2 2 0 0 0-2 2c0 3-.5 5-1.5 7M14 13c0 4-.5 6-1.5 8M8 13a4 4 0 0 1 8 0c0 3-.2 5-1 7M6 14c0-4 2-7 6-7s6 3 6 7M4 13a8 8 0 0 1 16 0M12 3a10 10 0 0 1 10 10" /></>,
  LoaderCircle: <><path d="M21 12a9 9 0 1 1-6.2-8.6" /></>,
  LockKeyhole: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2" /></>,
  Plus: <><path d="M12 5v14M5 12h14" /></>,
  RefreshCw: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" /></>,
  ScanSearch: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4M8 11h6m-3-3v6" /></>,
  ShieldCheck: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11" /><path d="m9 12 2 2 4-4" /></>,
  Sparkles: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3ZM19 14l1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14ZM5 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" /></>,
  Trash2: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v7m6-7v7" /></>,
  UploadCloud: <><path d="M12 16V4m-5 5 5-5 5 5" /><path d="M20 16.5A4.5 4.5 0 0 0 18 8h-1.2A7 7 0 1 0 5 17" /><path d="M8 16h8" /></>,
  X: <><path d="m18 6-12 12M6 6l12 12" /></>,
};

function createIcon(name: IconName) {
  return function Icon({ size = 16, className }: IconProps) {
    return (
      <svg
        aria-hidden="true"
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {artwork[name]}
      </svg>
    );
  };
}

export const Activity = createIcon('Activity');
export const ArrowUp = createIcon('ArrowUp');
export const ArrowUpRight = createIcon('ArrowUpRight');
export const Check = createIcon('Check');
export const ChevronDown = createIcon('ChevronDown');
export const CircleHelp = createIcon('CircleHelp');
export const FileImage = createIcon('FileImage');
export const Fingerprint = createIcon('Fingerprint');
export const LoaderCircle = createIcon('LoaderCircle');
export const LockKeyhole = createIcon('LockKeyhole');
export const Plus = createIcon('Plus');
export const RefreshCw = createIcon('RefreshCw');
export const ScanSearch = createIcon('ScanSearch');
export const ShieldCheck = createIcon('ShieldCheck');
export const Sparkles = createIcon('Sparkles');
export const Trash2 = createIcon('Trash2');
export const UploadCloud = createIcon('UploadCloud');
export const X = createIcon('X');
