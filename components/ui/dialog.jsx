import React from 'react';

export function Dialog({ children }) { return <div>{children}</div>; }
export function DialogTrigger({ asChild, children, ...props }) { return React.cloneElement(children, props); }
export function DialogContent({ children }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="rounded-lg bg-background p-6 shadow-lg">{children}</div></div>; }
export function DialogHeader({ children }) { return <div className="mb-2">{children}</div>; }
export function DialogFooter({ children }) { return <div className="mt-4 flex justify-end gap-2">{children}</div>; }
export function DialogTitle({ children }) { return <h3 className="text-lg font-semibold">{children}</h3>; }
export function DialogDescription({ children }) { return <p className="text-sm text-muted-foreground">{children}</p>; }
