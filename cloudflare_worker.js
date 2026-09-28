export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const contentType = request.headers.get("content-type") || "";
      let payload = {};
      const uploadedFiles = [];

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const rawPayload = formData.get("payload") || formData.get("data") || "{}";
        payload = typeof rawPayload === "string" ? JSON.parse(rawPayload) : rawPayload;

        const files = formData.getAll("files");
        for (const file of files) {
          if (file && typeof file !== "string") {
            uploadedFiles.push(file);
          }
        }
      } else {
        payload = await request.json();
      }

      const { customer, fulfillment, order } = payload;

      const customerEmail = customer?.email || "";

      const subject = encodeURIComponent(`Blooms Cupcakes Order Update - ${customer?.name || "Customer"}`);
      const mailtoUrl = `mailto:${customerEmail}?subject=${subject}`;

      const customerField =
        `**Name:** ${customer?.name || "N/A"}\n` +
        `**Email:** [${customerEmail}](${mailtoUrl}) ✉️ *(Click to Email)*\n` +
        `**Phone:** ${customer?.phone ? `[${customer.phone}](tel:${customer.phone})` : "N/A"}\n` +
        `**Contact Pref:** ${customer?.contactPreference || "Email"}`;

      const itemsList = order?.items
        ?.map(
          (item) =>
            `• **${item.productTitle}** (${item.quantity}x)\n` +
            `  - Pack: ${item.packSize} | Flavour: ${item.flavour}` +
            (item.filling ? ` | Filling: ${item.filling}` : "") +
            `\n  - Price: $${(item.pricePerUnit * item.quantity).toFixed(2)}`
        )
        .join("\n\n") || "No items specified";

      const discordPayload = {
        username: "Order Bot",
        embeds: [
          {
            title: "🧁 New Order Inquiry Received!",
            color: 0xE91E63,
            fields: [
              {
                name: "👤 Customer Details",
                value: customerField,
                inline: false,
              },
              {
                name: "🚗 Fulfillment",
                value: `**Method:** ${(fulfillment?.method || "pickup").toUpperCase()}\n**Address:** ${fulfillment?.address || "Pickup"}\n**Date:** ${order?.pickupDate || "Not specified"}`,
                inline: false,
              },
              {
                name: "📦 Items Ordered",
                value: itemsList,
                inline: false,
              },
              {
                name: "💰 Order Summary",
                value: `**Total:** $${order?.total || "0.00"}`,
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };

      if (order?.notes) {
        discordPayload.embeds[0].fields.push({
          name: "📝 Customer Notes",
          value: order.notes,
          inline: false,
        });
      }

      if (env.DISCORD_WEBHOOK_URL) {
        const discordForm = new FormData();
        discordForm.append("payload_json", JSON.stringify(discordPayload));

        uploadedFiles.forEach((file, index) => {
          const fileName = file.name || `uploaded-image-${index + 1}.png`;
          discordForm.append(`files[${index}]`, file, fileName);
        });

        const response = await fetch(env.DISCORD_WEBHOOK_URL, {
          method: "POST",
          body: discordForm,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Discord API call failed: ${text || response.statusText}`);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};