import { useEffect } from "react";

const HISTORY_MARKER = "__maluBackRedirect";
const HISTORY_GUARDS = 3;

function appendCurrentQuery(targetUrl: string) {
  const destination = new URL(targetUrl);
  const currentQuery = new URLSearchParams(window.location.search);

  currentQuery.forEach((value, key) => {
    destination.searchParams.append(key, value);
  });

  return destination.toString();
}

export function useBackRedirect(targetUrl: string) {
  useEffect(() => {
    const redirectUrl = appendCurrentQuery(targetUrl);
    const currentState = window.history.state ?? {};

    // Evita inserir estados duplicados durante o StrictMode do React.
    if (currentState[HISTORY_MARKER] !== redirectUrl) {
      for (let index = 0; index < HISTORY_GUARDS; index += 1) {
        window.history.pushState(
          { ...window.history.state, [HISTORY_MARKER]: redirectUrl },
          "",
          window.location.href,
        );
      }
    }

    let redirecting = false;
    const handleBack = () => {
      if (redirecting) return;
      redirecting = true;

      window.setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1);
    };

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [targetUrl]);
}
