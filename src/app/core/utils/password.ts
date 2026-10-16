/**
 * Hache un mot de passe côté client (MVP sans backend).
 * Utilise l'API Web Crypto (SHA-256) lorsqu'elle est disponible et
 * retombe sur un hachage déterministe simple dans les environnements de test
 * ou les navigateurs qui ne l'exposent pas.
 */
export async function hashPassword(value: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const data = new TextEncoder().encode(value);
    const digest = await subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(index)) | 0;
  }
  return 'djb2:' + (hash >>> 0).toString(16);
}
