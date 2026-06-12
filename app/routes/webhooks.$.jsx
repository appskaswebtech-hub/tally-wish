import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } =
    await authenticate.webhook(request); // ✅ this does HMAC verification automatically

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;

    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
      // GDPR webhooks — log or handle as needed
      console.log(`GDPR webhook received: ${topic} for ${shop}`);
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  return new Response("OK", { status: 200 });
};