const SITE_HOST = "schooloffreelancing.com";
/*
 * ==========================================================================
 * Legacy canonical redirects (moved from .htaccess)
 * ==========================================================================
 */
const LEGACY_REDIRECTS = {
  "/resource-center/ai-chatbot": "/resource-center/guides/ai-chatbot",
  "/resource-center/automation": "/resource-center/guides/automation",
  "/resource-center/docker-containerize": "/resource-center/guides/docker-containerize",
  "/resource-center/linux-deployment": "/resource-center/guides/linux-deployment",
  "/resource-center/voip-setup": "/resource-center/guides/voip-setup",
};
/*
 * ==========================================================================
 * Markdown content negotiation
 * ==========================================================================
 */
function wantsMarkdown(request) {
  const accept = request.headers.get("Accept") || "";
  return accept.split(",").some((item) => {
    const parts = item.trim().split(";");
    const mediaType = (parts.shift() || "").trim().toLowerCase();
    if (mediaType !== "text/markdown") {
      return false;
    }
    const qParameter = parts.find((part) => {
      return part.trim().toLowerCase().startsWith("q=");
    });
    if (!qParameter) {
      return true;
    }
    const q = Number(
      qParameter.substring(
        qParameter.indexOf("=") + 1
      ).trim()
    );
    return Number.isFinite(q) && q > 0;
  });
}
function shouldConvert(url) {
  if (url.hostname !== SITE_HOST) {
    return false;
  }
  if (url.pathname === "/amp" || url.pathname.startsWith("/amp/")) {
    return false;
  }
  const excludedPaths = [
    "/.well-known/",
    "/api/",
    "/assets/",
    "/cdn-cgi/",
  ];
  if (
    excludedPaths.some((path) =>
      url.pathname.startsWith(path)
    )
  ) {
    return false;
  }
  const extensionMatch = url.pathname.match(
    /\.([a-z0-9]+)$/i
  );
  if (!extensionMatch) {
    return true;
  }
  const extension = extensionMatch[1].toLowerCase();
  const excludedExtensions = new Set([
    "css",
    "js",
    "json",
    "xml",
    "txt",
    "md",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "ico",
    "bmp",
    "avif",
    "pdf",
    "zip",
    "gz",
    "tar",
    "mp3",
    "wav",
    "mp4",
    "webm",
    "mov",
    "avi",
    "m4v",
    "woff",
    "woff2",
    "ttf",
    "otf",
    "eot",
  ]);
  return !excludedExtensions.has(extension);
}
/*
 * ==========================================================================
 * Helpers
 * ==========================================================================
 */
function absoluteURL(value, baseURL) {
  if (!value) {
    return "";
  }
  try {
    return new URL(value, baseURL).href;
  } catch {
    return value;
  }
}
function decodeHTMLEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/");
}
function normalizeText(value) {
  return decodeHTMLEntities(
    value
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
  );
}
/*
 * ==========================================================================
 * Markdown body cleanup
 * ==========================================================================
 */
function normalizeMarkdown(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(
      /^\s*<!doctype\s+html>\s*/i,
      ""
    )
    .replace(
      /^[ \t]*#{1,6}[ \t]*$/gm,
      ""
    )
    .replace(
      /^[ \t]+$/gm,
      ""
    )
    .replace(
      /\n[ \t]*\n[ \t]*\n[ \t]*\n+/g,
      "\n\n"
    )
    .trim() + "\n";
}
/*
 * ==========================================================================
 * Markdown converter
 * ==========================================================================
 */
class MarkdownConverter {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  element(element) {
    const tag = element.tagName.toLowerCase();
    if (
      [
        "head",
        "script",
        "style",
        "noscript",
        "template",
        "svg",
        "canvas",
        "iframe",
        "form",
        "header",
        "footer",
        "aside",
      ].includes(tag)
    ) {
      element.remove();
      return;
    }
    if (
      [
        "html",
        "body",
        "main",
        "article",
        "section",
        "div",
        "figure",
        "figcaption",
        "span",
        "nav",
      ].includes(tag)
    ) {
      element.removeAndKeepContent();
      return;
    }
    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag.substring(1));
      element.prepend(
        `${"#".repeat(level)} `,
        { html: false }
      );
      element.onEndTag((endTag) => {
        endTag.before(
          "\n\n",
          { html: false }
        );
      });
      element.removeAndKeepContent();
      return;
    }
    if (tag === "p") {
      element.onEndTag((endTag) => {
        endTag.before(
          "\n\n",
          { html: false }
        );
      });
      element.removeAndKeepContent();
      return;
    }
    if (tag === "br") {
      element.replace(
        "\n",
        { html: false }
      );
      return;
    }
    if (tag === "hr") {
      element.replace(
        "\n\n---\n\n",
        { html: false }
      );
      return;
    }
    if (tag === "strong" || tag === "b") {
      element.prepend(
        "**",
        { html: false }
      );
      element.onEndTag((endTag) => {
        endTag.before(
          "**",
          { html: false }
        );
      });
      element.removeAndKeepContent();
      return;
    }
    if (tag === "em" || tag === "i") {
      element.prepend(
        "*",
        { html: false }
      );
      element.onEndTag((endTag) => {
        endTag.before(
          "*",
          { html: false }
        );
      });
      element.removeAndKeepContent();
      return;
    }
    if (tag === "code") {
      element.prepend(
        "`",
        { html: false }
      );
      element.onEndTag((endTag) => {
        endTag.before(
          "`",
          { html: false }
        );
      });
      element.removeAndKeepContent();
      return;
    }
    if (tag === "pre") {
      element.prepend(
        "\n\n```\n",
        { html: false }
      );
      element.onEndTag((endTag) => {
        endTag.before(
          "\n```\n\n",
          { html: false }
        );
      });
      element.removeAndKeepContent();
      return;
    }
    if (tag === "blockquote") {
      element.prepend(
        "\n\n> ",
        { html: false }
      );
      element.onEndTag((endTag) => {
        endTag.before(
          "\n\n",
          { html: false }
        );
      });
      element.removeAndKeepContent();
      return;
    }
    if (tag === "ul") {
      element.prepend(
        "\n",
        { html: false }
      );
      element.onEndTag((endTag) => {
        endTag.before(
          "\n",
          { html: false }
        );
      });
      element.removeAndKeepContent();
      return;
    }
    if (tag === "ol") {
      element.prepend(
        "\n",
        { html: false }
      );
      element.onEndTag((endTag) => {
        endTag.before(
          "\n",
          { html: false }
        );
      });
      element.removeAndKeepContent();
      return;
    }
    if (tag === "li") {
      element.prepend(
        "- ",
        { html: false }
      );
      element.onEndTag((endTag) => {
        endTag.before(
          "\n",
          { html: false }
        );
      });
      element.removeAndKeepContent();
      return;
    }
    if (tag === "a") {
      const href = element.getAttribute("href");
      if (!href) {
        element.removeAndKeepContent();
        return;
      }
      const absolute = absoluteURL(
        href,
        this.baseURL
      );
      element.prepend(
        "[",
        { html: false }
      );
      element.onEndTag((endTag) => {
        endTag.before(
          `](${absolute})`,
          { html: false }
        );
      });
      element.removeAndKeepContent();
      return;
    }
    if (tag === "img") {
      const src = element.getAttribute("src");
      const alt = element.getAttribute("alt") || "";
      if (!src) {
        element.remove();
        return;
      }
      const absolute = absoluteURL(
        src,
        this.baseURL
      );
      element.replace(
        `![${decodeHTMLEntities(alt)}](${absolute})`,
        { html: false }
      );
      return;
    }
    if (
      [
        "table",
        "thead",
        "tbody",
        "tfoot",
        "tr",
        "th",
        "td",
      ].includes(tag)
    ) {
      if (tag === "tr") {
        element.onEndTag((endTag) => {
          endTag.before(
            "\n",
            { html: false }
          );
        });
      }
      element.removeAndKeepContent();
      return;
    }
    element.removeAndKeepContent();
  }
  text(text) {
    if (text.removed) {
      return;
    }
    const value = normalizeText(text.text);
    if (!value) {
      return;
    }
    text.replace(
      value,
      { html: false }
    );
  }
}
/*
 * ==========================================================================
 * Markdown response headers
 * ==========================================================================
 */
function updateHeaders(originHeaders) {
  const headers = new Headers(originHeaders);
  headers.set(
    "Content-Type",
    "text/markdown; charset=utf-8"
  );
  const vary = headers.get("Vary");
  if (vary) {
    const values = vary
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (
      !values.some(
        (value) =>
          value.toLowerCase() === "accept"
      )
    ) {
      values.push("Accept");
    }
    headers.set(
      "Vary",
      values.join(", ")
    );
  } else {
    headers.set(
      "Vary",
      "Accept"
    );
  }
  headers.delete("Content-Length");
  headers.delete("Content-Encoding");
  headers.delete("ETag");
  headers.delete("Last-Modified");
  headers.set(
    "X-Markdown-Content-Negotiation",
    "text/markdown"
  );
  headers.set(
    "X-Markdown-Source",
    "Cloudflare-Worker"
  );
  return headers;
}
/*
 * ==========================================================================
 * Asset resilience: cache + stale fallback
 * ==========================================================================
 */
const CACHE_TTL_SECONDS = 300;
const STATIC_ASSET_PATTERN = /\.(css|js|woff2?|ttf|eot|otf|svg|png|jpe?g|gif|ico|webmanifest|webp|avif)$/i;
function isCacheableResponse(response) {
  if (!response || !response.ok) {
    return false;
  }
  const cacheControl =
    response.headers.get("Cache-Control") || "";
  if (/no-store|no-cache|private/i.test(cacheControl)) {
    return false;
  }
  if (response.headers.get("Set-Cookie")) {
    return false;
  }
  const contentType =
    response.headers.get("Content-Type") || "";
  return /text\/html|text\/markdown|text\/plain|application\/json/i.test(
    contentType
  );
}
async function cachePut(url, response) {
  try {
    const key = new Request(url, { method: "GET" });
    const cached = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    cached.headers.set(
      "Cache-Control",
      `public, max-age=${CACHE_TTL_SECONDS}`
    );
    await caches.default.put(key, cached);
  } catch (err) {
    /*
     * Cache write failures must never break the request.
     */
  }
}
async function cacheGet(url) {
  try {
    const key = new Request(url, { method: "GET" });
    return await caches.default.match(key);
  } catch (err) {
    return null;
  }
}
function staleFromCache(cached, forHead) {
  const headers = new Headers(cached.headers);
  headers.set("Warning", '110 - "Response is stale"');
  headers.set("X-Origin-Fallback", "stale-cache");
  return new Response(
    forHead ? null : cached.body,
    {
      status: cached.status,
      statusText: cached.statusText,
      headers,
    }
  );
}
/*
 * Fetch with resilience:
 * - Successful responses are cached (GET only, 5-minute TTL).
 * - If ASSETS.fetch throws or returns 5xx, serve the cached copy.
 * - If there is no cache, return a graceful 503 instead of an error.
 */
async function fetchWithFallback(request, ctx, env) {
  const isGet = request.method === "GET";
  let response;
  try {
    response = await env.ASSETS.fetch(request);
  } catch (err) {
    response = null;
  }
  if (response && response.status < 500) {
    if (isGet) {
      const clone = response.clone();
      ctx.waitUntil(cachePut(request.url, clone));
    }
    return response;
  }
  /*
   * Assets fetch failed or returned 5xx — fall back to cache.
   */
  const cached = await cacheGet(request.url);
  if (cached) {
    return staleFromCache(cached, request.method === "HEAD");
  }
  return new Response(
    "Site temporarily unavailable. Please retry shortly.",
    {
      status: 503,
      headers: {
        "Retry-After": "60",
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    }
  );
}
/*
 * ==========================================================================
 * Worker
 * ==========================================================================
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    /*
     * Legacy canonical redirects (was: .htaccess "GSC-FIX" block).
     */
    if (LEGACY_REDIRECTS[url.pathname]) {
      const target = new URL(LEGACY_REDIRECTS[url.pathname], url);
      return Response.redirect(target.toString(), 301);
    }
    /*
     * Trailing-slash redirects are handled by the assets system
     * (html_handling = "drop-trailing-slash" in wrangler.toml).
     * The Worker no longer needs to do this manually.
     */
    /*
     * Explicit fast path for /amp: resolve straight to amp/index.html
     * in a single ASSETS.fetch() call.
     */
    if (url.pathname === "/amp") {
      const assetUrl = new URL(request.url);
      assetUrl.pathname = "/amp/index.html";
      const response = await fetchWithFallback(
        new Request(assetUrl, request),
        ctx,
        env
      );
      return response;
    }
    /*
     * Only GET and HEAD are handled specially.
     */
    if (
      request.method !== "GET" &&
      request.method !== "HEAD"
    ) {
      const response = await fetchWithFallback(request, ctx, env);
      return response;
    }
    /*
     * Normal HTML request or excluded resource.
     */
    if (
      !wantsMarkdown(request) ||
      !shouldConvert(url)
    ) {
      const response = await fetchWithFallback(request, ctx, env);
      return response;
    }
    /*
     * Request HTML from assets even though the client requested Markdown.
     */
    const assetHeaders = new Headers(request.headers);
    assetHeaders.set("Accept", "text/html,application/xhtml+xml");
    const assetRequest = new Request(request, {
      headers: assetHeaders,
    });
    const assetResponse = await fetchWithFallback(assetRequest, ctx, env);
    const contentType =
      assetResponse.headers.get("Content-Type") || "";
    /*
     * Do not convert non-HTML responses.
     */
    if (!contentType.toLowerCase().includes("text/html")) {
      return assetResponse;
    }
    /*
     * HEAD has no body to transform.
     */
    if (request.method === "HEAD") {
      const headers = updateHeaders(assetResponse.headers);
      return new Response(null, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
    }
    /*
     * HTML -> Markdown transformation.
     */
    const converter = new MarkdownConverter(url.href);
    const transformed = new HTMLRewriter()
      .onDocument({
        comments(comment) {
          comment.remove();
        },
      })
      .on("*", converter)
      .transform(assetResponse);
    /*
     * Read the transformed stream completely.
     */
    const transformedText = await new Response(transformed.body).text();
    const markdown = normalizeMarkdown(transformedText);
    const headers = updateHeaders(transformed.headers);
    return new Response(markdown, {
      status: transformed.status,
      statusText: transformed.statusText,
      headers,
    });
  },
};
