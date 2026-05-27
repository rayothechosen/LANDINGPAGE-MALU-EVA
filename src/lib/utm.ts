/**
 * Captura os parâmetros UTM da URL atual e os anexa a uma URL de destino.
 */
export function appendUtmsToUrl(targetUrl: string): string {
  const currentParams = new URLSearchParams(window.location.search);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "src", "sck", "utm_id"];
  const targetUrlObj = new URL(targetUrl);

  utmKeys.forEach((key) => {
    const value = currentParams.get(key);
    if (value) {
      targetUrlObj.searchParams.set(key, value);
    }
  });

  return targetUrlObj.toString();
}
