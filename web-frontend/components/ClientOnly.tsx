"use client";

import React, { useSyncExternalStore } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps) {
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
