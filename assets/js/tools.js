// Copyright (C) 2015-2026 SOF (School Of Freelancing)
// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * WebMCP tools for schooloffreelancing.com
 * Include on EVERY page:
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

  function findField(root, selectors, labelRe) {
    for (var s = 0; s < selectors.length; s++) {
      var el = root.querySelector(selectors[s]);
      if (el) return el;
    }
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
      firstName: findField(root, ['[name="firstName"]', '[name="first_name"]', '[id*="first"]'], /first\s*name/i),
      lastName: findField(root, ['[name="lastName"]', '[name="last_name"]', '[id*="last"]'], /last\s*name/i),
      email: findField(root, ['[type="email"]', '[name="email"]', '[id*="email"]'], /email/i),
      phone: findField(root, ['[type="tel"]', '[name="phone"]', '[id*="phone"]'], /phone/i),
      subject: findField(root, ['select[name="subject"]', 'select[id*="subject"]', 'select'], /subject/i),
      message: findField(root, ['textarea[name="message"]', 'textarea[id*="message"]', 'textarea'], /message/i)
    };
  }

  function selectOptions(select) {
    var list = [];
    Array.prototype.forEach.call(select.options, function (o, i) {
      var text = (o.text || "").trim();
      if (!text || (i === 0 && (!o.value || /^select/i.test(text)))) return;
      list.push(text);
    });
    return list;
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

  mc.registerTool(
    {
      name: "list_site_sections",
      description: "List the main sections of School Of Freelancing: training catalog, Linux and AI services, contact/registration, and LLM-friendly content.",
      inputSchema: { type: "object", properties: {} },
      execute: async function () {
        return ok({
          training_catalog: ORIGIN + "/freelancing-training",
          services_catalog: ORIGIN + "/client-support",
          contact_and_registration: ORIGIN + "/contact-us/",
          llms_txt: ORIGIN + "/llms.txt",
          llms_full_txt: ORIGIN + "/llms-full.txt",
          agent_auth: ORIGIN + "/auth.md"
        });
      }
    },
    opts
  );

  mc.registerTool(
    {
      name: "get_contact_form_options",
      description: "Return the valid subject topics accepted by fill_contact_registration_form on /contact-us/.",
      inputSchema: { type: "object", properties: {} },
      execute: async function () {
        var root = document;
        if (!getFields(document).subject) {
          var res = await fetch("/contact-us/", { credentials: "same-origin" });
          if (!res.ok) return fail("Could not load /contact-us/ (HTTP " + res.status + ").");
          root = new DOMParser().parseFromString(await res.text(), "text/html");
        }
        var f = getFields(root);
        if (!f.subject) return fail("Contact form subject field was not found.");
        return ok({ subject: selectOptions(f.subject) });
      }
    },
    opts
  );

  mc.registerTool(
    {
      name: "fill_contact_registration_form",
      description: "Fill the inquiry and registration form on /contact-us/. Does not submit; the human must review the form and press Send Message themselves.",
      inputSchema: {
        type: "object",
        properties: {
          firstName: { type: "string", description: "User's first name" },
          lastName: { type: "string", description: "User's last name" },
          email: { type: "string", description: "User's email address" },
          phone: { type: "string", description: "User's phone number (optional)" },
          subject: { type: "string", description: "Exact topic from get_contact_form_options (e.g. Training Inquiry, Enrollment Help, Payment Issue, Technical Support)" },
          message: { type: "string", description: "Detailed inquiry, training/service name, or payment confirmation details" }
        },
        required: ["firstName", "lastName", "email", "subject", "message"]
      },
      execute: async function (args) {
        var f = getFields(document);
        if (!f.firstName || !f.email || !f.subject || !f.message) {
          return fail("Open " + ORIGIN + "/contact-us/ first, then call this tool again.");
        }
        setValue(f.firstName, args.firstName);
        if (f.lastName && args.lastName) setValue(f.lastName, args.lastName);
        setValue(f.email, args.email);
        if (f.phone && args.phone) setValue(f.phone, args.phone);
        if (!setSelect(f.subject, args.subject)) {
          return fail("Unknown subject. Call get_contact_form_options for valid topics.");
        }
        setValue(f.message, args.message);
        return ok("Form filled on /contact-us/. Ask the user to review the details and press Send Message to open WhatsApp. Nothing has been submitted.");
      }
    },
    opts
  );

  window.addEventListener("pagehide", function () {
    controller.abort();
  });
})();
