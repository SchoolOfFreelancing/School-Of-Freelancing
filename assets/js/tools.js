/**
 * tools.js — WebMCP tool registration for schooloffreelancing.com/register/
 *
 * Requires webmcp.js loaded first:
 * <script src="/assets/js/webmcp.js"></script>
 * <script src="/assets/js/tools.js"></script>
 */

(function () {
  if (typeof window.WebMCPRegister !== "function") {
    console.warn("tools.js: WebMCPRegister not loaded, skipping tool registration");
    return;
  }

  const TRAINING_SERVICE_OPTIONS = [
    "Linux Freelancing Training", "Hermes Agent Training", "Odysseus AI Workspace Training",
    "OpenClaw Hands-on Training", "LocalAI Hands-on Training", "ZeroClaw Hands-on Training",
    "Docker Training", "GitLab Hands-on Training", "GitHub Hands-on Training",
    "FusionPBX VoIP Training", "Goautodial VoIP Training", "Call Center Setup Training",
    "Ubuntu Linux Training", "CentOS Linux Training", "Debian Linux Training",
    "OpenAI Platform Training", "Claude Platform Training", "Telnyx SMS API Training",
    "Twilio SMS API Training", "Jasmin SMS Gateway Training", "Bulk SMS Engineering Training",
    "Linux Server Services", "Hermes Agent Support", "Odysseus AI Workspace Support",
    "OpenClaw AI Agent Support", "LocalAI Support", "ZeroClaw Support",
    "Docker Engineer Services", "GitLab Community Edition Setup", "GitHub Enterprise Server Setup",
    "Telnyx VoIP SIP Support", "Twilio VoIP SIP Support", "FusionPBX VoIP Support",
    "Goautodial VoIP Support", "Ubuntu Linux Support", "CentOS Linux Support",
    "OpenAI Platform Support", "Claude Platform Support", "Telnyx SMS API Setup & Support",
    "Twilio SMS API Support", "Jasmin SMS Gateway Support", "DigitalOcean Cloud Support",
    "Hummingbot Installation Support", "Vapi Platform Support", "Other"
  ];

  const PAYMENT_METHODS = ["PayPal", "bKash", "Wise", "Other"];

  window.WebMCPRegister([
    {
      name: "confirm_registration_payment",
      description: "Fill the School of Freelancing payment confirmation form (/register/) so the " +
        "human can review and send it. This does not submit anything on its own: it opens WhatsApp " +
        "with the details pre-filled and the user still has to press send.",
      inputSchema: {
        type: "object",
        properties: {
          fullName: { type: "string", description: "Registrant's full name" },
          email: { type: "string", description: "Registrant's email address" },
          trainingOrService: {
            type: "string",
            description: "Exact name of the training or service paid for",
            enum: TRAINING_SERVICE_OPTIONS
          },
          paymentMethod: {
            type: "string",
            description: "Payment method used",
            enum: PAYMENT_METHODS
          },
          transactionId: { type: "string", description: "Transaction ID / payment reference" }
        },
        required: ["fullName", "email", "trainingOrService", "paymentMethod", "transactionId"]
      },
      execute: function (args) {
        const nameField = document.getElementById("pf-name");
        const emailField = document.getElementById("pf-email");
        const serviceField = document.getElementById("pf-program");
        const paymentField = document.getElementById("pf-method");
        const txnField = document.getElementById("pf-txn");

        const missing = [];
        if (!nameField) missing.push("fullName field");
        if (!emailField) missing.push("email field");
        if (!serviceField) missing.push("training/service field");
        if (!paymentField) missing.push("payment method field");
        if (!txnField) missing.push("transaction ID field");

        if (missing.length) {
          return {
            content: [{
              type: "text",
              text: `Could not find on page: ${missing.join(", ")}. ` +
                `Make sure you are on https://www.schooloffreelancing.com/register/ .`
            }],
            isError: true
          };
        }

        if (!TRAINING_SERVICE_OPTIONS.includes(args.trainingOrService)) {
          return {
            content: [{ type: "text", text: `"${args.trainingOrService}" is not a valid training/service option.` }],
            isError: true
          };
        }
        if (!PAYMENT_METHODS.includes(args.paymentMethod)) {
          return {
            content: [{ type: "text", text: `"${args.paymentMethod}" is not a valid payment method.` }],
            isError: true
          };
        }

        nameField.value = args.fullName;
        nameField.dispatchEvent(new Event("input", { bubbles: true }));

        emailField.value = args.email;
        emailField.dispatchEvent(new Event("input", { bubbles: true }));

        serviceField.value = args.trainingOrService;
        serviceField.dispatchEvent(new Event("change", { bubbles: true }));

        paymentField.value = args.paymentMethod;
        paymentField.dispatchEvent(new Event("change", { bubbles: true }));

        txnField.value = args.transactionId;
        txnField.dispatchEvent(new Event("input", { bubbles: true }));

        // Do NOT auto-click submit — this opens WhatsApp with a pre-filled message;
        // let the human review and send it themselves.
        return {
          content: [{
            type: "text",
            text: "Form filled. Review the details, then click 'Confirm Payment via WhatsApp' to send."
          }]
        };
      }
    },
    {
      name: "get_registration_form_options",
      description: "Returns the valid training/service names and payment method names accepted by " +
        "the confirm_registration_payment tool.",
      inputSchema: { type: "object", properties: {} },
      execute: function () {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              trainingOrService: TRAINING_SERVICE_OPTIONS,
              paymentMethod: PAYMENT_METHODS
            })
          }]
        };
      }
    }
  ]);
})();
