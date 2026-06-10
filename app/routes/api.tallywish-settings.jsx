// app/routes/tallywish-settings.jsx
// Public API route — called by the storefront widget JS
// Returns JSON settings for a given shop (no auth required, read-only public data)

import { json } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request }) {
  const url  = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Missing shop param" }, { status: 400 });
  }

  const setting = await db.tallyWishSetting.findUnique({
    where: { shop },
  });

  if (!setting) {
    return json({ enabled: false });
  }

  // Only expose what the widget needs — never expose secrets to the storefront
  return json(
    {
      enabled:          !!setting.enabled,
      button_type:      setting.button_type,
      bottom_offset:    setting.bottom_offset,
      right_offset:     setting.right_offset,
      bg_color:         setting.bg_color,
      button_text:      setting.button_text,
      btn_bg:           setting.btn_bg,
      btn_color:        setting.btn_color,
      btn_radius:       setting.btn_radius,
      store_id:         setting.store_id,
      store_secure_key: setting.store_secure_key,
    },
    {
      headers: {
        // Allow Shopify storefronts to fetch this
        "Access-Control-Allow-Origin": "*",
        // Cache for 60 s on CDN, serve stale for 5 min while revalidating
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    }
  );
}
