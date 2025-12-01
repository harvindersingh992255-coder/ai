'use client';

import { cn } from '@/lib/utils';

type CircularProgressProps = {
  value: number;
  className?: string;
};

export const CircularProgress = ({ value, className }: CircularProgressProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const scoreColor = value >= 80 ? 'text-accent' : value >= 60 ? 'text-yellow-500' : 'text-destructive';

  return (
    <div className={cn('relative h-40 w-40', className)}>
      <svg className="h-full w-full" viewBox="0 0 100 100">
        <circle
          className="text-border"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          className={cn('transition-all duration-1000 ease-out', scoreColor)}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold">{value}%</span>
      </div>
    </div>
  );
};
