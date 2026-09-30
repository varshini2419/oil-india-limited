import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, FlaskConical, LineChart, FileText, Gauge } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const QUICK_LINKS = [
  { to: '/', label: 'Field Dashboard', icon: Home },
  { to: '/digital-twin', label: 'Digital Twin', icon: Gauge },
  { to: '/simulation', label: 'Simulation Workstation', icon: FlaskConical },
  { to: '/simulation', label: 'Results & Comparison', icon: LineChart },
  { to: '/reports', label: 'Reports', icon: FileText },
];

export const NotFoundPage: React.FC = () => {
  useDocumentTitle({
    title: 'Page Not Found',
    description: 'The requested Baghewala Digital Twin page does not exist.',
  });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-600">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </div>

      <p className="mt-6 font-mono text-5xl font-black tracking-tight text-slate-900">404</p>
      <h1 className="mt-2 text-lg font-bold uppercase tracking-wide text-slate-800 font-mono">
        Page Not Found
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-500 font-sans">
        The page you are looking for does not exist or was moved. Use the links below to get
        back on track.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-amber-400 hover:text-amber-700"
          >
            <Icon className="h-4 w-4 text-amber-600" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
};
