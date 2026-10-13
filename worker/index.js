/**
 * Lightweight Cloudflare Worker entry point for the static portfolio.
 * Sites supplies the ASSETS binding from the packaged client directory.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      url.pathname = "/index.html";
    }

    return env.ASSETS.fetch(new Request(url, request));
  },
};
