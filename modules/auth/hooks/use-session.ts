"use client";

import { authClient } from "@/modules/auth/lib/auth-client";

export function useSession() {
  return authClient.useSession();
}
