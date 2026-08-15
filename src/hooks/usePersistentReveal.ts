import { useEffect, useRef, useState } from "react";

/**
 * Mantém conteúdos liberados pelo player visíveis depois da primeira exibição.
 * O player pode tentar ocultá-los novamente quando o vídeo é reiniciado, mas a
 * liberação funciona como uma trava permanente durante a sessão da página.
 */
export function usePersistentReveal<T extends HTMLElement>(displayValue = "block") {
  const elementRef = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let unlocked = false;

    const isVisible = () => (
      !element.hidden
      && element.style.display !== "none"
      && window.getComputedStyle(element).display !== "none"
    );

    const keepUnlocked = () => {
      if (!unlocked) {
        if (isVisible()) {
          unlocked = true;
          setRevealed(true);
        }
        return;
      }

      if (!isVisible()) {
        element.hidden = false;
        element.style.setProperty("display", displayValue, "important");
      }
    };

    const observer = new MutationObserver(keepUnlocked);
    observer.observe(element, {
      attributes: true,
      attributeFilter: ["style", "class", "hidden"],
    });
    keepUnlocked();

    return () => observer.disconnect();
  }, [displayValue]);

  return { elementRef, revealed };
}
