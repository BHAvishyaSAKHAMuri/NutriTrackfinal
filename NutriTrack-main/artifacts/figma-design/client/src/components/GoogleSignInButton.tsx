import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (res: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface Props {
  onSuccess: (credential: string) => void;
  /** px width passed to Google's renderButton — should match your form card width */
  width?: number;
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.658 14.251 17.64 11.943 17.64 9.2z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.954H.957C.347 6.169 0 7.544 0 8.996c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

/** Shown when VITE_GOOGLE_CLIENT_ID is not configured */
function UnconfiguredButton() {
  return (
    <div className="w-full h-[48px] border border-[#e5e7eb] rounded-[12px] flex items-center justify-center gap-3 font-['Inter',sans-serif] text-[14px] font-medium text-gray-400 bg-gray-50 select-none cursor-not-allowed">
      <GoogleIcon />
      Sign in with Google
    </div>
  );
}

export function GoogleSignInButton({ onSuccess, width = 440 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId || !containerRef.current) return;

    const init = () => {
      if (!window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res) => onSuccess(res.credential),
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width,
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
    };

    // GSI script may already be loaded by another instance on the same page
    if (window.google?.accounts?.id) {
      init();
      return;
    }

    const existing = document.querySelector('script[src*="gsi/client"]');
    if (existing) {
      existing.addEventListener("load", init);
      return () => existing.removeEventListener("load", init);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.head.appendChild(script);
    return () => {
      // leave script in DOM — other components may use it
    };
  }, [clientId, width]);

  if (!clientId) return <UnconfiguredButton />;

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-center min-h-[48px]"
    />
  );
}
