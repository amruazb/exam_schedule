import React, { useState } from 'react';

export function Select({ value, onValueChange, children }) {
  return <div data-select>{React.Children.map(children, child => React.cloneElement(child, { value, onValueChange }))}</div>;
}
export function SelectTrigger({ children }) { return <div className="flex h-10 items-center justify-between rounded-md border bg-background px-3 py-2 text-sm shadow-sm">{children}</div>; }
export function SelectValue({ placeholder }) { return <span className="text-muted-foreground">{placeholder}</span>; }
export function SelectContent({ children }) { return <div className="mt-2 rounded-md border bg-popover p-1 shadow-md">{children}</div>; }
export function SelectItem({ value, children, onValueChange }) {
  return <div className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent" onClick={() => onValueChange(value)}>{children}</div>;
}
