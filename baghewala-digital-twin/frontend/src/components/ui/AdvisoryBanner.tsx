import React from 'react';
import { ShieldAlert } from 'lucide-react';

/** The single advisory-only disclaimer used across the whole app. */
export const ADVISORY_DISCLAIMER =
  'This digital twin is advisory-only decision support: it does not actuate or control any field equipment. All outputs are model-based recommendations for engineering review; verify against documented operating procedures before acting.';

export interface AdvisoryBannerProps {
  className?: string;
}

/** Renders the ONE global advisory banner. Mount once in the app shell, not per page. */
export const AdvisoryBanner: React.FC<AdvisoryBannerProps> = ({ className }) => (
  <div
    role="note"
    className={`flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900 ${className ?? ''}`}
  >
    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
    <p className="leading-relaxed">
      <strong className="font-semibold">Advisory only.</strong> {ADVISORY_DISCLAIMER}
    </p>
  </div>
);
