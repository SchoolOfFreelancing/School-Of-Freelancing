/**
 * School of Freelancing — Static Site Worker
 * Serves static assets with:
 *  - Legacy URL → working URL 301 redirects (LEGACY_REDIRECTS)
 *  - Sitemap old-slug → canonical-slug 301 redirects (included in LEGACY_REDIRECTS)
 *  - Stopgap fallback 301s for canonical pages that intermittently 404 (STOPGAP_FALLBACKS)
 *  - Trailing-slash normalization (301)
 *  - Markdown content negotiation (Accept: text/markdown)
 *  - Agent discovery headers (Link)
 *  - Stale-cache fallback for availability
 *  - Security headers (CSP, Permissions-Policy, X-Frame-Options, etc.)
 *
 * Redirect audit: 2026-09-17
 * Based on: direct-fetch verification + Cloudflare analytics 404 report (2-day window)
 */

const SITE_HOST = "schooloffreelancing.com";

// ─── Security Headers ──────────────────────────────────────────────────────
const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), encrypted-media=(), picture-in-picture=(), sync-xhr=()",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

// ─── 301 Redirect Map (broken/legacy URL → canonical working URL) ───────────
// All targets use no-trailing-slash form to avoid redirect chains with the
// trailing-slash normalization step below.
const LEGACY_REDIRECTS = {
  // ── resource-center guide restructure (existing) ──
  "/resource-center/ai-chatbot": "/resource-center/guides/ai-chatbot",
  "/resource-center/automation": "/resource-center/guides/automation",
  "/resource-center/docker-containerize": "/resource-center/guides/docker-containerize",
  "/resource-center/linux-deployment": "/resource-center/guides/linux-deployment",
  "/resource-center/voip-setup": "/resource-center/guides/voip-setup",

  // ── .html page redirects → clean URLs (confirmed 404, accepted) ──
  "/contact.html": "/contact-us",
  "/mentor.html": "/freelancing-training",
  "/training.html": "/freelancing-training",

  // ── /Linux — confirmed 404, referenced in old README ──
  "/Linux": "/freelancing-training",

  // ── Location redirects (plain country name → locale code, accepted) ──
  "/locations/belgium": "/locations/en-be",
  "/locations/norway": "/locations/en-no",
  // sweden: no verified en-se slug exists, send to hub
  "/locations/sweden": "/locations",

  // ── Feed redirect (accepted) ──
  "/feed": "/atom.xml",

  // ── Sitemap legacy slugs → current canonical service pages ──
  // All verified live 200 on both old+new; old slugs are in sitemap.xml,
  // new slugs are linked from the /client-support/ hub. 301 consolidates
  // duplicate content and fixes crawl-budget waste.
  "/client-support/centos-linux-support": "/client-support/centos-linux-services",
  "/client-support/claude-platform-support": "/client-support/claude-ai-platform-services",
  "/client-support/digitalocean-cloud-support": "/client-support/digitalocean-cloud-services",
  "/client-support/docker-job-support": "/client-support/docker-engineer-services",
  "/client-support/fusionpbx-voip-setup": "/client-support/fusionpbx-voip-services",
  "/client-support/github-installation-support": "/client-support/github-services",
  "/client-support/gitlab-installation-support": "/client-support/gitlab-services",
  "/client-support/hermes-agent-setup": "/client-support/hermes-agent-services",
  "/client-support/hummingbot-installation-support": "/client-support/hummingbot-installation-services",
  "/client-support/jasmin-sms-gateway-setup": "/client-support/jasmin-sms-gateway-services",
  "/client-support/linux-server-support": "/client-support/linux-server-services",
  "/client-support/localai-setup-support": "/client-support/local-ai-services",
  "/client-support/odysseus-ai-setup": "/client-support/odysseus-ai-services",
  "/client-support/openai-platform-support": "/client-support/openai-platform-services",
  "/client-support/openclaw-setup-support": "/client-support/openclaw-ai-services",
  "/client-support/telnyx-sms-setup": "/client-support/telnyx-sms-api-services",
  "/client-support/twilio-sms-setup": "/client-support/twilio-sms-api-services",
  "/client-support/twilio-voip-setup": "/client-support/twilio-sip-trunking-services",
  "/client-support/ubuntu-linux-support": "/client-support/ubuntu-linux-services",
  "/client-support/zeroclaw-setup-support": "/client-support/zeroclaw-ai-services",
};

// ─── Stopgap Fallback Map (post-404 only) ───────────────────────────────────
// These are CANONICAL pages that appeared as 404 in Cloudflare analytics,
// suggesting an origin regression (bad deploy / routing issue), NOT a rename.
// They are checked ONLY after the asset fetch returns 404, so when the page
// is working normally visitors see the real page with no redirect.
// When the page 404s, visitors are redirected to the hub instead of seeing
// a broken page. Remove these entries once the origin issue is resolved.
const STOPGAP_FALLBACKS = {
  "/client-support/digitalocean-cloud-services": "/client-support",
  "/client-support/vapi-platform-services": "/client-support",
  "/client-support/odysseus-ai-services": "/client-support",
};

// ─── Agent discovery Link header ──────────────────────────────────────────
const AGENT_LINK_HEADER = '<https://schooloffreelancing.com/.well-known/api-catalog>; rel="api-catalog", <https://schooloffreelancing.com/service-desc>; rel="service-desc", <https://schooloffreelancing.com/.well-known/oauth-protected-resource/mcp>; rel="oauth-protected-resource", <https://schooloffreelancing.com/.well-known/oauth-authorization-server>; rel="oauth-authorization-server"';

// ─── Apply security headers to a response ──────────────────────────────────
function applySecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) {
      headers.set(name, value);
    }
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ─── Markdown content negotiation ──────────────────────────────────────────

function wantsMarkdown(request) {
  const accept = request.headers.get("Accept") || "";
  return accept.split(",").some((item) => {
    const parts = item.trim().split(";");
    const mediaType = (parts.shift() || "").trim().toLowerCase();
    if (mediaType !== "text/markdown") return false;
    const qParameter = parts.find((part) => part.trim().toLowerCase().startsWith("q="));
    if (!qParameter) return true;
    const q = Number(qParameter.substring(qParameter.indexOf("=") + 1).trim());
    return Number.isFinite(q) && q > 0;
  });
}

function shouldConvert(url) {
  if (url.hostname !== SITE_HOST) return false;
  const excludedPaths = ["/.well-known/", "/api/", "/assets/", "/cdn-cgi/"];
  if (excludedPaths.some((path) => url.pathname.startsWith(path))) return false;
  const extensionMatch = url.pathname.match(/\.([a-z0-9]+)$/i);
  if (!extensionMatch) return true;
  const extension = extensionMatch[1].toLowerCase();
  const excludedExtensions = new Set([
    "css", "js", "json", "xml", "txt", "md",
    "jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "bmp", "avif",
    "pdf", "zip", "gz", "tar",
    "mp3", "wav", "mp4", "webm", "mov", "avi", "m4v",
    "woff", "woff2", "ttf", "otf", "eot",
  ]);
  return !excludedExtensions.has(extension);
}

function absoluteURL(value, baseURL) {
  if (!value) return "";
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

function normalizeMarkdown(value) {
  return (
    value
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&#x2F;/gi, "/")
      .replace(/^\s*<!doctype\s+html>\s*/i, "")
      .replace(/^[ \t]*#{1,6}[ \t]*$/gm, "")
      .replace(/^[ \t]+$/gm, "")
      .replace(/\n[ \t]*\n[ \t]*\n[ \t]*\n+/g, "\n\n")
      .trim() + "\n"
  );
}

// ─── Markdown converter (HTMLRewriter handler) ──────────────────────────────

class MarkdownConverter {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  element(element) {
    const tag = element.tagName.toLowerCase();

    if (["head", "script", "style", "noscript", "template", "svg", "canvas", "iframe", "form", "header", "footer", "aside"].includes(tag)) {
      element.remove();
      return;
    }

    if (["html", "body", "main", "article", "section", "div", "figure", "figcaption", "span", "nav"].includes(tag)) {
      element.removeAndKeepContent();
      return;
    }

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag.substring(1));
      element.prepend("#".repeat(level) + " ", { html: false });
      element.onEndTag((endTag) => endTag.before("\n\n", { html: false }));
      element.removeAndKeepContent();
      return;
    }

    if (tag === "p") {
      element.onEndTag((endTag) => endTag.before("\n\n", { html: false }));
      element.removeAndKeepContent();
      return;
    }

    if (tag === "br") {
      element.replace("\n", { html: false });
      return;
    }

    if (tag === "hr") {
      element.replace("\n\n---\n\n", { html: false });
      return;
    }

    if (tag === "strong" || tag === "b") {
      element.prepend("**", { html: false });
      element.onEndTag((endTag) => endTag.before("**", { html: false }));
      element.removeAndKeepContent();
      return;
    }

    if (tag === "em" || tag === "i") {
      element.prepend("*", { html: false });
      element.onEndTag((endTag) => endTag.before("*", { html: false }));
      element.removeAndKeepContent();
      return;
    }

    if (tag === "code") {
      element.prepend("`", { html: false });
      element.onEndTag((endTag) => endTag.before("`", { html: false }));
      element.removeAndKeepContent();
      return;
    }

    if (tag === "pre") {
      element.prepend("\n\n```\n", { html: false });
      element.onEndTag((endTag) => endTag.before("\n```\n\n", { html: false }));
      element.removeAndKeepContent();
      return;
    }

    if (tag === "blockquote") {
      element.prepend("\n\n> ", { html: false });
      element.onEndTag((endTag) => endTag.before("\n\n", { html: false }));
      element.removeAndKeepContent();
      return;
    }

    if (tag === "ul" || tag === "ol") {
      element.prepend("\n", { html: false });
      element.onEndTag((endTag) => endTag.before("\n", { html: false }));
      element.removeAndKeepContent();
      return;
    }

    if (tag === "li") {
      element.prepend("- ", { html: false });
      element.onEndTag((endTag) => endTag.before("\n", { html: false }));
      element.removeAndKeepContent();
      return;
    }

    if (tag === "a") {
      const href = element.getAttribute("href");
      if (!href) {
        element.removeAndKeepContent();
        return;
      }
      const absolute = absoluteURL(href, this.baseURL);
      element.prepend("[", { html: false });
      element.onEndTag((endTag) => endTag.before(`](${absolute})`, { html: false }));
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
      const absolute = absoluteURL(src, this.baseURL);
      element.replace(`![${decodeHTMLEntities(alt)}](${absolute})`, { html: false });
      return;
    }

    if (["table", "thead", "tbody", "tfoot", "tr", "th", "td"].includes(tag)) {
      if (tag === "tr") {
        element.onEndTag((endTag) => endTag.before("\n", { html: false }));
      }
      element.removeAndKeepContent();
      return;
    }

    element.removeAndKeepContent();
  }

  text(text) {
    if (text.removed) return;
    const value = normalizeText(text.text);
    if (!value) return;
    text.replace(value, { html: false });
  }
}

// ─── Header helpers ─────────────────────────────────────────────────────────

function addAgentDiscoveryHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("Link", AGENT_LINK_HEADER);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) {
      headers.set(name, value);
    }
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function updateHeaders(originHeaders) {
  const headers = new Headers(originHeaders);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  const vary = headers.get("Vary");
  if (vary) {
    const values = vary.split(",").map((v) => v.trim()).filter(Boolean);
    if (!values.some((v) => v.toLowerCase() === "accept")) values.push("Accept");
    headers.set("Vary", values.join(", "));
  } else {
    headers.set("Vary", "Accept");
  }
  headers.delete("Content-Length");
  headers.delete("Content-Encoding");
  headers.delete("ETag");
  headers.delete("Last-Modified");
  headers.set("Link", AGENT_LINK_HEADER);
  headers.set("X-Markdown-Content-Negotiation", "text/markdown");
  headers.set("X-Markdown-Source", "Cloudflare-Worker");
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) {
      headers.set(name, value);
    }
  }
  return headers;
}

// ─── Cache helpers ──────────────────────────────────────────────────────────

const CACHE_TTL_SECONDS = 300;

function isCacheableResponse(response) {
  if (!response || !response.ok) return false;
  const cacheControl = response.headers.get("Cache-Control") || "";
  if (/no-store|no-cache|private/i.test(cacheControl)) return false;
  if (response.headers.get("Set-Cookie")) return false;
  const contentType = response.headers.get("Content-Type") || "";
  return /text\/html|text\/markdown|text\/plain|application\/json/i.test(contentType);
}

async function cachePut(url, response) {
  try {
    const key = new Request(url, { method: "GET" });
    const cached = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    cached.headers.set("Cache-Control", `public, max-age=${CACHE_TTL_SECONDS}`);
    await caches.default.put(key, cached);
  } catch (err) {}
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
  return new Response(forHead ? null : cached.body, {
    status: cached.status,
    statusText: cached.statusText,
    headers,
  });
}

// ─── Asset fetch with fallback ───────────────────────────────────────────────

async function fetchWithFallback(request, ctx, env) {
  const isGet = request.method === "GET";
  let response;
  try {
    response = await env.ASSETS.fetch(request);
    if (response && response.status === 404 && (request.method === "GET" || request.method === "HEAD")) {
      const reqUrl = new URL(request.url);
      if (!/\.[a-z0-9]+$/i.test(reqUrl.pathname)) {
        const indexUrl = new URL(request.url);
        indexUrl.pathname = indexUrl.pathname.replace(/\/?$/, "/") + "index.html";
        const indexRequest = new Request(indexUrl, request);
        try {
          const indexResponse = await env.ASSETS.fetch(indexRequest);
          if (indexResponse && indexResponse.status !== 404) {
            response = indexResponse;
          }
        } catch (err) {}
      }
    }
  } catch (err) {
    response = null;
  }

  if (response && response.status < 500) {
    if (isGet && isCacheableResponse(response)) {
      const clone = response.clone();
      ctx.waitUntil(cachePut(request.url, clone));
    }
    return response;
  }

  const cached = await cacheGet(request.url);
  if (cached) {
    return staleFromCache(cached, request.method === "HEAD");
  }

  return new Response("Site temporarily unavailable. Please retry shortly.", {
    status: 503,
    headers: {
      "Retry-After": "60",
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

// ─── Stopgap fallback check ─────────────────────────────────────────────────
// Returns a 301 Response if the path is in STOPGAP_FALLBACKS and the asset
// returned 404; otherwise returns null (caller continues with the response).

function checkStopgap(response, normalizedPath, url) {
  if (response && response.status === 404 && STOPGAP_FALLBACKS[normalizedPath]) {
    const target = new URL(STOPGAP_FALLBACKS[normalizedPath], url);
    return Response.redirect(target.toString(), 301);
  }
  return null;
}

// ─── Main entry ──────────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Legacy 301 redirects — normalize trailing slash before lookup so
    //    both "/feed" and "/feed/" resolve in a single hop.
    const normalizedPath = url.pathname.replace(/\/+$/, "") || "/";
    if (LEGACY_REDIRECTS[normalizedPath]) {
      const target = new URL(LEGACY_REDIRECTS[normalizedPath], url);
      return Response.redirect(target.toString(), 301);
    }

    // 2. Trailing-slash normalization (301 → canonical no-slash URL)
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      const target = new URL(url);
      target.pathname = url.pathname.slice(0, -1);
      return Response.redirect(target.toString(), 301);
    }

    // 3. Non-GET/HEAD pass-through
    if (request.method !== "GET" && request.method !== "HEAD") {
      const response = await fetchWithFallback(request, ctx, env);
      return addAgentDiscoveryHeaders(response);
    }

    // 4. If not requesting markdown, serve the asset directly
    if (!wantsMarkdown(request) || !shouldConvert(url)) {
      const response = await fetchWithFallback(request, ctx, env);
      // Stopgap: redirect to hub if a canonical page 404'd (origin regression)
      const stopgap = checkStopgap(response, normalizedPath, url);
      if (stopgap) return stopgap;
      return addAgentDiscoveryHeaders(response);
    }

    // 5. Markdown content negotiation
    const assetHeaders = new Headers(request.headers);
    assetHeaders.set("Accept", "text/html,application/xhtml+xml");
    const assetRequest = new Request(request, { headers: assetHeaders });
    const assetResponse = await fetchWithFallback(assetRequest, ctx, env);

    // Stopgap check for markdown requests too
    const stopgap = checkStopgap(assetResponse, normalizedPath, url);
    if (stopgap) return stopgap;

    const contentType = assetResponse.headers.get("Content-Type") || "";
    if (!contentType.toLowerCase().includes("text/html")) {
      return addAgentDiscoveryHeaders(assetResponse);
    }

    if (request.method === "HEAD") {
      const headers = updateHeaders(assetResponse.headers);
      return new Response(null, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
    }

    const converter = new MarkdownConverter(url.href);
    const transformed = new HTMLRewriter()
      .onDocument({
        comments(comment) {
          comment.remove();
        },
      })
      .on("*", converter)
      .transform(assetResponse);

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
