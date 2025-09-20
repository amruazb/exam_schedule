import React, { useState } from 'react';

export function AlertDialog({ children }) { return <div>{children}</div>; }
export function AlertDialogTrigger({ asChild, children, ...props }) { return React.cloneElement(children, props); }
export function AlertDialogContent({ children }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="rounded-lg bg-background p-6 shadow-lg">{children}</div></div>; }
export function AlertDialogHeader({ children }) { return <div className="mb-2">{children}</div>; }
export function AlertDialogFooter({ children }) { return <div className="mt-4 flex justify-end gap-2">{children}</div>; }
export function AlertDialogTitle({ children }) { return <h3 className="text-lg font-semibold">{children}</h3>; }
export function AlertDialogDescription({ children }) { return <p className="text-sm text-muted-foreground">{children}</p>; }
export function AlertDialogAction({ children, ...props }) { return <button className="bg-primary text-primary-foreground px-3 py-2 rounded-md" {...props}>{children}</button>; }
export function AlertDialogCancel({ children, ...props }) { return <button className="border px-3 py-2 rounded-md" {...props}>{children}</button>; }
