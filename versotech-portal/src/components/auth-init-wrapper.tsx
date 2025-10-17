'use client'

import dynamic from "next/dynamic";

// Dynamically import AuthInit to prevent chunk loading issues
const AuthInit = dynamic(() => import("../app/auth-init").then(mod => ({ default: mod.AuthInit })), {
  ssr: false,
  loading: () => null
});

export function AuthInitWrapper() {
  return <AuthInit />
}
