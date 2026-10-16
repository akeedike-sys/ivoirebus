export function uid(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }
  return 'id-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
