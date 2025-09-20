import React from 'react';

export function Avatar({ className = '', children }) { return <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted ${className}`}>{children}</div>; }
export function AvatarFallback({ children }) { return <span className="text-xs font-medium">{children}</span>; }
