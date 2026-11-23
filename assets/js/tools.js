/*
 * WebMCP tools for schooloffreelancing.com
 * Include on EVERY page (the scanner loads the homepage):
 *   <script src="/assets/js/tools.js" defer></script>
 */
(function () {
  "use strict";

  var mc =
    (typeof document !== "undefined" && document.modelContext) ||
    (typeof navigator !== "undefined" && navigator.modelContext);
  if (!mc || typeof mc.registerTool !== "function") return;

  var controller = new AbortController();
  var opts = { signal: controller.signal };
  var ORIGIN = "https://schooloffreelancing.com";

  function ok(data) {
    return { content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data) }] };
  }
  function fail(message) {
    return { isError: true, content: [{ type: "text", text: message }] };
  }

  // Find a form control by name/id first, then by its visible label text.
  function findField(root, key, labelRe) {
    var el = root.querySelector('[name="' + key + '"], [id="' + key + '"]');
    if (el) return el;
    var labels = root.querySelectorAll("label");
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      if (!labelRe.test(label.textContent || "")) continue;
      if (label.control) return label.control;
      if (label.htmlFor) {
        var byFor = root.querySelector('[id="' + label.htmlFor + '"]');
        if (byFor) return byFor;
      }
      var inner = label.querySelector("input, select, textarea");
      if (inner) return inner;
    }
    return null;
  }

  function getFields(root) {
    return {
      fullName: findField(root, "fullName", /full\s*name/i),
      email: findField(root, "email", /email/i),
      trainingOrService: findField(root, "trainingOrService", /training|service/i),
      paymentMethod: findField(root, "paymentMethod", /payment\s*method/i),
      transactionId: findField(root, "transactionId", /transaction|reference/i)
    };
  }

  function selectOptions(select) {
    var groups = {};
    Array.prototype.forEach.call(select.options, function (o, i) {
      var text = (o.text || "").trim();
      if (!text || (i === 0 && (!o.value || /^select/i.test(text)))) return;
      var group = o.parentElement && o.parentElement.tagName === "OPTGROUP" ? o.parentElement.label : "options";
      (groups[group] = groups[group] || []).push(text);
    });
    return groups;
  }

  function setValue(el, value) {
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setSelect(select, wanted) {
    var w = String(wanted).trim().toLowerCase();
    for (var i = 0; i < select.options.length; i++) {
      var o = select.options[i];
      if ((o.text || "").trim().toLowerCase() === w || (o.value || "").toLowerCase() === w) {
        setValue(select, o.value);
        return true;
      }
    }
    return false;
  }

  // 1. Site map for agents
  mc.registerTool(
    {
      name: "list_site_sections",
      description: "List the main sections of School Of Freelancing: training catalog, Linux and AI services, registration, contact and LLM-friendly content.",
      inputSchema: { type: "object", properties: {} },
      execute: async function () {
        return ok({
          training_catalog: ORIGIN + "/freelancing-training",
          services_catalog: ORIGIN + "/client-support",
          registration: ORIGIN + "/register/",
          contact: ORIGIN + "/contact-us/",
          llms_txt: ORIGIN + "/llms.txt",
          llms_full_txt: ORIGIN + "/llms-full.txt",
          agent_auth: ORIGIN + "/auth.md"
        });
      }
    },
    opts
  );

  // 2. Valid values accepted by the registration form (read live from /register/)
  mc.registerTool(
    {
      name: "get_registration_form_options",
      description: "Return the valid training/service names and payment methods accepted by confirm_registration_payment.",
      inputSchema: { type: "object", properties: {} },
      execute: async function () {
        var root = document;
        if (!getFields(document).trainingOrService) {
          var res = await fetch("/register/", { credentials: "same-origin" });
          if (!res.ok) return fail("Could not load the registration page (HTTP " + res.status + ").");
          root = new DOMParser().parseFromString(await res.text(), "text/html");
        }
        var f = getFields(root);
        if (!f.trainingOrService || !f.paymentMethod) return fail("Registration form fields were not found.");
        return ok({
          trainingOrService: selectOptions(f.trainingOrService),
          paymentMethod: selectOptions(f.paymentMethod)
        });
      }
    },
    opts
  );

  // 3. Fill the payment-confirmation form. Never submits: a human reviews and confirms.
  mc.registerTool(
    {
      name: "confirm_registration_payment",
      description: "Fill the registration payment-confirmation form on /register/. Does not submit; the human must review the form and press the confirm button themselves.",
      inputSchema: {
        type: "object",
        properties: {
          fullName: { type: "string", description: "Student's full name" },
          email: { type: "string", description: "Student's email address" },
          trainingOrService: { type: "string", description: "Exact training or service name (see get_registration_form_options)" },
          paymentMethod: { type: "string", description: "Exact payment method (see get_registration_form_options)" },
          transactionId: { type: "string", description: "Payment transaction ID or reference" }
        },
        required: ["fullName", "email", "trainingOrService", "paymentMethod", "transactionId"]
      },
      execute: async function (args) {
        var f = getFields(document);
        if (!f.fullName || !f.trainingOrService || !f.paymentMethod) {
          return fail("Open " + ORIGIN + "/register/ first, then call this tool again.");
        }
        setValue(f.fullName, args.fullName);
        if (f.email) setValue(f.email, args.email);
        if (f.transactionId) setValue(f.transactionId, args.transactionId);
        if (!setSelect(f.trainingOrService, args.trainingOrService)) {
          return fail("Unknown trainingOrService. Call get_registration_form_options for valid values.");
        }
        if (!setSelect(f.paymentMethod, args.paymentMethod)) {
          return fail("Unknown paymentMethod. Call get_registration_form_options for valid values.");
        }
        return ok("Form filled. Ask the user to review the details and press the confirm button themselves. Nothing has been submitted.");
      }
    },
    opts
  );

  window.addEventListener("pagehide", function () {
    controller.abort();
  });
})();
