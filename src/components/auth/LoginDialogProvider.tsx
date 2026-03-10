"use client";

import { createContext, useContext, useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginDialog } from "./LoginDialog";

interface LoginDialogContextValue {
  openLoginDialog: (next?: string) => void;
}

const LoginDialogContext = createContext<LoginDialogContextValue>({
  openLoginDialog: () => {},
});

export function useLoginDialog() {
  return useContext(LoginDialogContext);
}

function LoginDialogAutoOpen({ onOpen }: { onOpen: (next: string) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("showLogin") === "1") {
      const next = searchParams.get("next") ?? "/dashboard";
      onOpen(next);
      router.replace(window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function LoginDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState("/dashboard");

  function openLoginDialog(nextPath = "/dashboard") {
    setNext(nextPath);
    setOpen(true);
  }

  return (
    <LoginDialogContext.Provider value={{ openLoginDialog }}>
      <Suspense>
        <LoginDialogAutoOpen onOpen={openLoginDialog} />
      </Suspense>
      <LoginDialog open={open} onOpenChange={setOpen} next={next} />
      {children}
    </LoginDialogContext.Provider>
  );
}
