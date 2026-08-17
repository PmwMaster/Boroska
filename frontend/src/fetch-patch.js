// Patch fetch BEFORE anything else loads
const _origFetch = window.fetch;
window.fetch = function(url, opts) {
  if (opts && opts.headers) {
    const clean = {};
    const src = opts.headers instanceof Headers
      ? Object.fromEntries(opts.headers.entries())
      : Array.isArray(opts.headers)
        ? Object.fromEntries(opts.headers)
        : opts.headers;
    for (const [k, v] of Object.entries(src)) {
      clean[k] = typeof v === 'string' ? v.replace(/[^\x20-\x7E]/g, '') : v;
    }
    opts = { ...opts, headers: clean };
  }
  return _origFetch.call(this, url, opts);
};
