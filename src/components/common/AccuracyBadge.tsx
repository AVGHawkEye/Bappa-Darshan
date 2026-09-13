import React from 'react';
import { AccuracyBracket } from '../../types';
import { evaluateGpsAccuracy } from '../../utils/geo';
import { ShieldCheck, AlertCircle, AlertTriangle, Crosshair } from 'lucide-react';

interface AccuracyBadgeProps {
  accuracyMeters: number;
  showDetails?: boolean;
}

export const AccuracyBadge: React.FC<AccuracyBadgeProps> = ({ accuracyMeters, showDetails = false }) => {
  const evalResult = evaluateGpsAccuracy(accuracyMeters);

  const getIcon = (bracket: AccuracyBracket) => {
    switch (bracket) {
      case 'auto_accept':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ask_confirmation':
        return <Crosshair className="w-3.5 h-3.5 text-amber-400" />;
      case 'manual_select':
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />;
      case 'approximate_warning':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const getBadgeClass = (bracket: AccuracyBracket) => {
    switch (bracket) {
      case 'auto_accept':
        return 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300';
      case 'ask_confirmation':
        return 'bg-amber-950/70 border-amber-500/40 text-amber-300';
      case 'manual_select':
        return 'bg-orange-950/70 border-orange-500/40 text-orange-300';
      case 'approximate_warning':
        return 'bg-rose-950/70 border-rose-500/40 text-rose-300';
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium tracking-tight ${getBadgeClass(
          evalResult.bracket
        )}`}
      >
        {getIcon(evalResult.bracket)}
        <span>±{Math.round(accuracyMeters)}m GPS</span>
        <span className="text-[10px] opacity-75 uppercase font-mono">
          {evalResult.bracket === 'auto_accept' ? 'Rule 2 Auto' : 'Verified'}
        </span>
      </div>
      {showDetails && (
        <p className="text-[11px] text-neutral-400 leading-tight">
          {evalResult.description}
        </p>
      )}
    </div>
  );
};
