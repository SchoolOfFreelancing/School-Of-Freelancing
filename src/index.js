const SITE_HOST = "schooloffreelancing.com";

/*
 * ==========================================================================
 * Legacy redirects (old URL -> current URL, all 301)
 * ==========================================================================
 * Targets use the no-trailing-slash form, which is how the site is served.
 * Before redirecting, the Worker checks that the target exists. If a target
 * is missing, the redirect is skipped and the normal 404 is served instead,
 * so a wrong slug can never send visitors to a broken page.
 */
const SERVICE_MAP = {
  // confirmed from site footers and homepage
  "linux-server-services": "linux-server-support",
  "ubuntu-linux-services": "ubuntu-linux-support",
  "odysseus-ai-services": "odysseus-ai-setup",
  "goautodial-voip-services": "goautodial-voip-setup",
  "telnyx-sip-trunking-services": "telnyx-voip-setup",
  "hummingbot-installation-services": "hummingbot-installation-support",
  "digitalocean-cloud-services": "digitalocean-cloud-support",
  // inferred from GitHub repo names (skipped automatically if target is missing)
  "centos-linux-services": "centos-linux-support",
  "claude-ai-platform-services": "claude-platform-support",
  "fusionpbx-voip-services": "fusionpbx-voip-setup",
  "github-services": "github-installation-support",
  "gitlab-services": "gitlab-installation-support",
  "jasmin-sms-gateway-services": "jasmin-sms-gateway-setup",
  "local-ai-services": "localai-setup-support",
  "openai-platform-services": "openai-platform-support",
  "openclaw-ai-services": "openclaw-setup-support",
  "telnyx-sms-api-services": "telnyx-sms-setup",
  "twilio-sip-trunking-services": "twilio-voip-setup",
  "twilio-sms-api-services": "twilio-sms-setup",
  "vapi-platform-services": "voice-ai-agent-setup",
  "zeroclaw-ai-services": "zeroclaw-setup-support",
};

const LOCATION_MAP = {
  australia: "en-au",
  austria: "en-at",
  bangladesh: "en-bd",
  belgium: "en-be",
  denmark: "en-dk",
  germany: "en-de",
  iceland: "en-is",
  israel: "en-il",
  liechtenstein: "en-li",
  norway: "en-no",
  singapore: "en-sg",
  sweden: "en-se",
  us: "en-us",
};

const OLD_PAGES = {
  "/training.html": "/freelancing-training",
  "/linux.html": "/freelancing-training/linux-freelancing-training",
  "/contact.html": "/contact-us",
  "/support.html": "/client-support",
  "/testimonials.html": "/resource-center/testimonials",
  "/mentor.html": "/about-us",
  "/sitemap.html": "/",
  "/linux-ai-services": "/client-support",
};

/*
 * Moved from .htaccess ("GSC-FIX" block).
 */
const LEGACY_REDIRECTS = {
  "/resource-center/ai-chatbot": "/resource-center/guides/ai-chatbot",
  "/resource-center/automation": "/resource-center/guides/automation",
  "/resource-center/docker-containerize": "/resource-center/guides/docker-containerize",
  "/resource-center/linux-deployment": "/resource-center/guides/linux-deployment",
  "/resource-center/voip-setup": "/resource-center/guides/voip-setup",
};

function legacyTarget(url) {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  let target = Object.prototype.hasOwnProperty.call(OLD_PAGES, path)
    ? OLD_PAGES[path]
    : null;
  if (!target) {
    let m = path.match(/^\/(?:client-support|linux-ai-services)\/([^/]+)$/);
    if (m && Object.prototype.hasOwnProperty.call(SERVICE_MAP, m[1])) {
      target = "/client-support/" + SERVICE_MAP[m[1]];
    }
    if (!target) {
      m = path.match(/^\/locations\/([^/]+)$/);
      if (m && Object.prototype.hasOwnProperty.call(LOCATION_MAP, m[1])) {
        target = "/locations/" + LOCATION_MAP[m[1]];
      }
    }
  }
  return target || null;
}

async function targetExists(url, target, env) {
  try {
    const res = await env.ASSETS.fetch(
      new Request(new URL(target, url.origin).href, { method: "GET" })
    );
    return res.status >= 200 && res.status < 400;
  } catch (err) {
    return false;
  }
}

async function legacyRedirect(url, env) {
  const target = legacyTarget(url);
  if (!target) {
    return null;
  }
  if (!(await targetExists(url, target, env))) {
    return null;
  }
  return new Response(null, {
    status: 301,
    headers: {
      Location: url.origin + target + url.search,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

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
      qParameter.substring(qParameter.indexOf("=") + 1).trim()
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
  // Exclude both exact base paths and all their descendants.
  const excludedPaths = ["/.well-known", "/api", "/assets", "/cdn-cgi"];
  if (
    excludedPaths.some(
      (path) => url.pathname === path || url.pathname.startsWith(path + "/")
    )
  ) {
    return false;
  }
  const extensionMatch = url.pathname.match(/\.([a-z0-9]+)$/i);
  if (!extensionMatch) {
    return true;
  }
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
      // Separate Markdown images from immediately following headings.
      .replace(/(!\[[^\]]*\]\([^\)\n]*\))(?=#{1,6}[ \t])/g, "$1\n\n")
      // Collapse runs of three or more blank lines to one blank line.
      .replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n")
      .trim() + "\n"
  );
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
        "head", "script", "style", "noscript", "template", "svg",
        "canvas", "iframe", "form", "footer", "aside",
      ].includes(tag)
    ) {
      element.remove();
      return;
    }

    if (
      [
        "html", "body", "main", "article", "section", "div",
        "figure", "figcaption", "span", "nav",
      ].includes(tag)
    ) {
      element.removeAndKeepContent();
      return;
    }

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag.substring(1));
      element.prepend(`${"#".repeat(level)} `, { html: false });
      element.onEndTag((endTag) => {
        endTag.before("\n\n", { html: false });
      });
      element.removeAndKeepContent();
      return;
    }

    if (tag === "p") {
      element.onEndTag((endTag) => {
        endTag.before("\n\n", { html: false });
      });
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
      element.onEndTag((endTag) => {
        endTag.before("**", { html: false });
      });
      element.removeAndKeepContent();
      return;
    }

    if (tag === "em" || tag === "i") {
      element.prepend("*", { html: false });
      element.onEndTag((endTag) => {
        endTag.before("*", { html: false });
      });
      element.removeAndKeepContent();
      return;
    }

    if (tag === "code") {
      element.prepend("`", { html: false });
      element.onEndTag((endTag) => {
        endTag.before("`", { html: false });
      });
      element.removeAndKeepContent();
      return;
    }

    if (tag === "pre") {
      element.prepend("\n\n```\n", { html: false });
      element.onEndTag((endTag) => {
        endTag.before("\n```\n\n", { html: false });
      });
      element.removeAndKeepContent();
      return;
    }

    if (tag === "blockquote") {
      element.prepend("\n\n> ", { html: false });
      element.onEndTag((endTag) => {
        endTag.before("\n\n", { html: false });
      });
      element.removeAndKeepContent();
      return;
    }

    if (tag === "ul" || tag === "ol") {
      element.prepend("\n", { html: false });
      element.onEndTag((endTag) => {
        endTag.before("\n", { html: false });
      });
      element.removeAndKeepContent();
      return;
    }

    if (tag === "li") {
      element.prepend("- ", { html: false });
      element.onEndTag((endTag) => {
        endTag.before("\n", { html: false });
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
      const absolute = absoluteURL(href, this.baseURL);
      element.prepend("[", { html: false });
      element.onEndTag((endTag) => {
        endTag.before(`](${absolute})`, { html: false });
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
      const absolute = absoluteURL(src, this.baseURL);
      element.replace(`![${decodeHTMLEntities(alt)}](${absolute})`, {
        html: false,
      });
      return;
    }

    if (
      ["table", "thead", "tbody", "tfoot", "tr", "th", "td"].includes(tag)
    ) {
      if (tag === "tr") {
        element.onEndTag((endTag) => {
          endTag.before("\n", { html: false });
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
    text.replace(value, { html: false });
  }
}

/*
 * ==========================================================================
 * Markdown response headers
 * ==========================================================================
 */
function updateHeaders(originHeaders) {
  const headers = new Headers(originHeaders);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  /*
   * Static site: markdown content only changes on deployment.
   * Browser revalidates after 5 min, edge caches for 24 hours.
   */
  headers.set("Cache-Control", "public, max-age=300, s-maxage=86400");
  const vary = headers.get("Vary");
  if (vary) {
    const values = vary
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (!values.some((value) => value.toLowerCase() === "accept")) {
      values.push("Accept");
    }
    headers.set("Vary", values.join(", "));
  } else {
    headers.set("Vary", "Accept");
  }
  headers.delete("Content-Length");
  headers.delete("Content-Encoding");
  headers.delete("ETag");
  headers.delete("Last-Modified");
  headers.set("X-Markdown-Content-Negotiation", "text/markdown");
  headers.set("X-Markdown-Source", "Cloudflare-Worker");
  return headers;
}

/*
 * ==========================================================================
 * Asset resilience: cache + stale fallback
 * ==========================================================================
 */

/* Edge cache TTL for successful responses (24 hours). */
const CACHE_TTL_SECONDS = 86400;

/*
 * Shorter TTL for 404 responses (5 minutes). Prevents repeated ASSETS.fetch
 * calls for scanner probes while still allowing new pages to be discovered.
 */
const CACHE_404_TTL_SECONDS = 300;

/* Static asset extensions that benefit from long browser caching. */
const STATIC_ASSET_PATTERN =
  /\.(css|js|mjs|woff2?|ttf|eot|otf|svg|png|jpe?g|gif|ico|webmanifest|webp|avif|map)$/i;

/*
 * Set client-facing Cache-Control headers so browsers and shared caches can
 * cache responses. The original static files may carry
 * "no-cache, no-store, must-revalidate", which would force every page load
 * through the Worker.
 */
function setClientCacheHeaders(response, url) {
  const status = response.status;

  /* Don't touch 5xx errors or responses with Set-Cookie. */
  if (status >= 500) {
    return response;
  }
  if (response.headers.get("Set-Cookie")) {
    return response;
  }

  const headers = new Headers(response.headers);

  if (status === 404) {
    /* 404s: cache for 1 minute so scanner bursts don't hammer ASSETS. */
    headers.set("Cache-Control", "public, max-age=60");
  } else if (status >= 200 && status < 300) {
    if (STATIC_ASSET_PATTERN.test(url.pathname)) {
      /* Static assets: 30 days, immutable (needs versioned filenames). */
      headers.set("Cache-Control", "public, max-age=2592000, immutable");
    } else {
      /* HTML pages: browser revalidates after 5 min, edge caches 24 hours. */
      headers.set("Cache-Control", "public, max-age=300, s-maxage=86400");
    }
  } else {
    /* 3xx and other statuses: leave the origin headers untouched. */
    return response;
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function cachePut(url, response) {
  try {
    /* Only cache 200 and 404. Never cache redirects or other statuses. */
    if (response.status !== 200 && response.status !== 404) {
      return;
    }
    const key = new Request(url, { method: "GET" });
    const cached = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    /* Shorter TTL for cached 404s so a new deploy is picked up quickly. */
    const ttl =
      response.status === 404 ? CACHE_404_TTL_SECONDS : CACHE_TTL_SECONDS;
    cached.headers.set("Cache-Control", `public, max-age=${ttl}`);
    await caches.default.put(key, cached);
  } catch (err) {
    /* Cache write failures must never break the request. */
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
  return new Response(forHead ? null : cached.body, {
    status: cached.status,
    statusText: cached.statusText,
    headers,
  });
}

/*
 * Fetch with resilience:
 * - Successful responses get proper Cache-Control headers.
 * - GET responses are cached (24h for 200s, 5 min for 404s).
 * - If ASSETS.fetch throws or returns 5xx, serve the cached copy.
 * - If there is no cache, return a graceful 503.
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
      response = setClientCacheHeaders(response, new URL(request.url));
      const clone = response.clone();
      ctx.waitUntil(cachePut(request.url, clone));
    }
    return response;
  }

  /* Assets fetch failed or returned 5xx: fall back to cache. */
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

/*
 * ==========================================================================
 * Worker
 * ==========================================================================
 * Requires run_worker_first = true in wrangler.toml [assets], otherwise
 * requests matching a static asset never reach this code.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isRead = request.method === "GET" || request.method === "HEAD";

    /* Path without trailing slashes ("/" stays "/"). */
    const cleanPath = url.pathname.replace(/\/+$/, "") || "/";

    /*
     * Legacy canonical redirects (was: .htaccess "GSC-FIX" block).
     * Matches with or without a trailing slash so it is always ONE hop.
     */
    if (
      Object.prototype.hasOwnProperty.call(LEGACY_REDIRECTS, cleanPath) &&
      isRead
    ) {
      const target = LEGACY_REDIRECTS[cleanPath];
      // Do not create a redirect to a destination that is missing from ASSETS.
      if (await targetExists(url, target, env)) {
        return new Response(null, {
          status: 301,
          headers: {
            Location: url.origin + target + url.search,
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    }

    if (isRead) {
      /*
       * Old URLs that were renamed or removed (GET/HEAD only).
       * Skipped automatically if the target page does not exist.
       * Also matches with a trailing slash, so it is ONE hop.
       */
      const legacy = await legacyRedirect(url, env);
      if (legacy) {
        return legacy;
      }

      /*
       * Canonical slash policy: /path/ -> /path as a permanent 301.
       * Runs in the Worker so the assets layer's 307 is never reached.
       */
      if (url.pathname !== "/" && url.pathname.endsWith("/")) {
        return new Response(null, {
          status: 301,
          headers: {
            Location: url.origin + cleanPath + url.search,
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    /*
     * Explicit fast path for /amp: resolve straight to amp/index.html
     * in a single ASSETS.fetch() call.
     */
    if (url.pathname === "/amp") {
      const assetUrl = new URL(request.url);
      assetUrl.pathname = "/amp/index.html";
      return fetchWithFallback(new Request(assetUrl, request), ctx, env);
    }

    /* Only GET and HEAD are handled specially. */
    if (!isRead) {
      return fetchWithFallback(request, ctx, env);
    }

    /* Normal HTML request or excluded resource. */
    if (!wantsMarkdown(request) || !shouldConvert(url)) {
      return fetchWithFallback(request, ctx, env);
    }

    /*
     * Request HTML from assets even though the client requested Markdown.
     */
    const assetHeaders = new Headers(request.headers);
    assetHeaders.set("Accept", "text/html,application/xhtml+xml");
    const assetRequest = new Request(request, { headers: assetHeaders });
    const assetResponse = await fetchWithFallback(assetRequest, ctx, env);

    const contentType = assetResponse.headers.get("Content-Type") || "";

    /* Do not convert non-HTML responses. */
    if (!contentType.toLowerCase().includes("text/html")) {
      return assetResponse;
    }

    /* HEAD has no body to transform. */
    if (request.method === "HEAD") {
      const headers = updateHeaders(assetResponse.headers);
      return new Response(null, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
    }

    /* HTML -> Markdown transformation. Preserve semantic header content so the
     * hero H1 and introductory answer remain available to Markdown clients. */
    const converter = new MarkdownConverter(url.href);
    const transformed = new HTMLRewriter()
      .onDocument({
        comments(comment) {
          comment.remove();
        },
      })
      .on("*", converter)
      .transform(assetResponse);

    /* Read the transformed stream completely. */
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
