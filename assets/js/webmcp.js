/**
 * webmcp.js — minimal WebMCP (https://webmachinelearning.github.io/webmcp/) helper.
 *
 * The spec's canonical surface is document.modelContext; many current agent
 * scanners still read navigator.modelContext, so this registers into both and
 * installs a small polyfill on whichever surface has no native implementation
 * yet. Same pattern already proven working in production on the homepage.
 *
 * Usage: window.WebMCPRegister([{ name, description, inputSchema, execute }, ...])
 */
(function () {
  function makePolyfill() {
    var reg = new Map();
    var api = {
      registerTool: function (tool, options) {
        reg.set(tool.name, tool);
        var signal = options && options.signal;
        if (signal && typeof signal.addEventListener === "function") {
          signal.addEventListener("abort", function () { reg.delete(tool.name); });
        }
        return Promise.resolve();
      },
      provideContext: function (context) {
        reg.clear();
        ((context && context.tools) || []).forEach(function (t) { reg.set(t.name, t); });
      },
      getTools: function () { return Promise.resolve(Array.from(reg.values())); },
      listTools: function () { return Array.from(reg.values()); },
      executeTool: function (name, args) {
        var tool = reg.get(name);
        if (!tool) return Promise.reject(new Error("Tool not found: " + name));
        return Promise.resolve(tool.execute(args));
      }
    };
    Object.defineProperty(api, "tools", { enumerable: true, get: function () { return Array.from(reg.values()); } });
    Object.defineProperty(api, "availableTools", { enumerable: true, get: function () { return Array.from(reg.values()); } });
    return api;
  }

  function registerInto(ctx, tools, registerOptions) {
    if (!ctx) return;
    if (typeof ctx.registerTool === "function") {
      tools.forEach(function (tool) {
        try { ctx.registerTool(tool, registerOptions); }
        catch (e) { try { ctx.registerTool(tool); } catch (e2) {} }
      });
    }
    if (typeof ctx.provideContext === "function") {
      try { ctx.provideContext({ tools: tools }); } catch (e) {}
    }
  }

  window.WebMCPRegister = function (tools) {
    if (!window.navigator) return;
    var ac = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var registerOptions = ac ? { signal: ac.signal } : {};

    function ensureAndRegister() {
      try {
        if (!navigator.modelContext) { navigator.modelContext = makePolyfill(); }
        registerInto(navigator.modelContext, tools, registerOptions);
      } catch (e) {}
      try {
        if (!document.modelContext) {
          try { document.modelContext = navigator.modelContext || makePolyfill(); } catch (e2) {}
        }
        registerInto(document.modelContext, tools, registerOptions);
      } catch (e) {}
    }

    ensureAndRegister();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ensureAndRegister);
    }
    window.addEventListener("load", ensureAndRegister);

    return ac;
  };
})();
