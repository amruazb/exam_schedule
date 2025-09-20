import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
