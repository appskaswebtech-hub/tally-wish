// app/routes/app.settings.jsx
// React Router v7 + Shopify Remix — NO Polaris
// Handles: load settings (loader) + save settings (action)

import { useState, useEffect } from "react";
import { useLoaderData, useActionData, Form, useNavigation } from "react-router";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server"; // your Prisma or DB client

// ─── LOADER ──────────────────────────────────────────────────────────────────
export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const setting = await db.tallyWishSetting.findUnique({
    where: { shop },
  });

  return json({ setting, shop });
}

// ─── ACTION ──────────────────────────────────────────────────────────────────
export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();

  const data = {
    store_id:        formData.get("store_id")        || "",
    store_secure_key:formData.get("store_secure_key")|| "",
    button_type:     formData.get("button_type")     || "both",
    bottom_offset:   parseInt(formData.get("bottom_offset") || "20"),
    right_offset:    parseInt(formData.get("right_offset")  || "20"),
    bg_color:        formData.get("bg_color")        || "#ff4081",
    button_text:     formData.get("button_text")     || "❤ Add to TallyWish",
    btn_bg:          formData.get("btn_bg")          || "#ff4081",
    btn_color:       formData.get("btn_color")       || "#ffffff",
    btn_radius:      parseInt(formData.get("btn_radius") || "5"),
    enabled:         formData.get("enabled") === "1" ? 1 : 0,
  };

  await db.tallyWishSetting.upsert({
    where: { shop },
    update: data,
    create: { shop, ...data },
  });

  return json({ success: true });
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Settings() {
  const { setting, shop } = useLoaderData();
  const actionData    = useActionData();
  const navigation    = useNavigation();
  const isSaving      = navigation.state === "submitting";

  // Live preview state
  const [btnBg,     setBtnBg]     = useState(setting?.btn_bg     ?? "#ff4081");
  const [btnColor,  setBtnColor]  = useState(setting?.btn_color  ?? "#ffffff");
  const [btnRadius, setBtnRadius] = useState(setting?.btn_radius ?? 5);
  const [btnText,   setBtnText]   = useState(setting?.button_text ?? "❤ Add to TallyWish");
  const [bgColor,   setBgColor]   = useState(setting?.bg_color   ?? "#ff4081");

  return (
    <>
      <style>{CSS}</style>

      <div className="tw-wrap">

        {/* HEADER */}
        <header className="tw-header">
          <div className="tw-logo-mark">TW</div>
          <div>
            <h1 className="tw-brand">TallyWish</h1>
            <p className="tw-tagline">Connect your store with TallyWish</p>
          </div>
        </header>

        <h2 className="tw-page-title">App Settings</h2>

        {actionData?.success && (
          <div className="tw-toast">✓ Settings saved successfully</div>
        )}

        <Form method="POST">
          <input type="hidden" name="shop" value={shop} />

          {/* ── CONNECTION ── */}
          <section className="tw-section">
            <h3 className="tw-section-title">
              <span className="tw-icon">🔗</span> Connection
            </h3>

            <div className="tw-field">
              <label>Store ID</label>
              <input
                type="text"
                name="store_id"
                placeholder="Enter Store ID"
                defaultValue={setting?.store_id ?? ""}
              />
            </div>

            <div className="tw-field">
              <label>Secure Key</label>
              <input
                type="text"
                name="store_secure_key"
                placeholder="Enter Secure Key"
                defaultValue={setting?.store_secure_key ?? ""}
              />
            </div>
          </section>

          {/* ── DISPLAY OPTIONS ── */}
          <section className="tw-section">
            <h3 className="tw-section-title">
              <span className="tw-icon">🧩</span> Display Options
            </h3>

            <div className="tw-field">
              <label>Display Mode</label>
              <select name="button_type" defaultValue={setting?.button_type ?? "both"}>
                <option value="both">Both (Recommended)</option>
                <option value="floating">Floating Icon Only</option>
                <option value="product">Product Button Only</option>
              </select>
            </div>
          </section>

          {/* ── FLOATING ICON ── */}
          <section className="tw-section">
            <h3 className="tw-section-title">
              <span className="tw-icon">📍</span> Floating Icon Settings
            </h3>

            <div className="tw-row">
              <div className="tw-field">
                <label>Bottom Offset (px)</label>
                <input
                  type="number"
                  name="bottom_offset"
                  defaultValue={setting?.bottom_offset ?? 20}
                />
              </div>
              <div className="tw-field">
                <label>Right Offset (px)</label>
                <input
                  type="number"
                  name="right_offset"
                  defaultValue={setting?.right_offset ?? 20}
                />
              </div>
            </div>

            <div className="tw-field">
              <label>Floating Background Color</label>
              <div className="tw-color-row">
                <input
                  type="color"
                  name="bg_color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                />
                <div
                  className="tw-color-preview"
                  style={{ background: bgColor }}
                />
                <span className="tw-color-hex">{bgColor}</span>
              </div>

              {/* Floating icon live preview */}
              <div className="tw-float-preview">
                <div
                  className="tw-float-demo"
                  style={{ background: bgColor }}
                >❤</div>
                <span className="tw-preview-label">Preview</span>
              </div>
            </div>
          </section>

          {/* ── BUTTON SETTINGS ── */}
          <section className="tw-section">
            <h3 className="tw-section-title">
              <span className="tw-icon">🔘</span> Button Settings
            </h3>

            <div className="tw-field">
              <label>Button Text</label>
              <input
                type="text"
                name="button_text"
                value={btnText}
                onChange={e => setBtnText(e.target.value)}
              />
            </div>

            <div className="tw-row">
              <div className="tw-field">
                <label>Button Background</label>
                <div className="tw-color-row">
                  <input
                    type="color"
                    id="btn_bg"
                    name="btn_bg"
                    value={btnBg}
                    onChange={e => setBtnBg(e.target.value)}
                  />
                  <div
                    className="tw-color-preview"
                    style={{ background: btnBg }}
                  />
                  <span className="tw-color-hex">{btnBg}</span>
                </div>
              </div>

              <div className="tw-field">
                <label>Button Text Color</label>
                <div className="tw-color-row">
                  <input
                    type="color"
                    id="btn_color"
                    name="btn_color"
                    value={btnColor}
                    onChange={e => setBtnColor(e.target.value)}
                  />
                  <div
                    className="tw-color-preview"
                    style={{ background: btnColor }}
                  />
                  <span className="tw-color-hex">{btnColor}</span>
                </div>
              </div>
            </div>

            <div className="tw-field tw-field--half">
              <label>Border Radius (px)</label>
              <input
                type="number"
                name="btn_radius"
                value={btnRadius}
                onChange={e => setBtnRadius(Number(e.target.value))}
              />
            </div>

            {/* Live button preview */}
            <div className="tw-field">
              <label>Button Preview</label>
              <div className="tw-btn-preview-wrap">
                <button
                  type="button"
                  className="tw-btn-demo"
                  style={{
                    background:   btnBg,
                    color:        btnColor,
                    borderRadius: btnRadius + "px",
                  }}
                >
                  {btnText}
                </button>
              </div>
            </div>
          </section>

          {/* ── ACTIVATION ── */}
          <section className="tw-section">
            <h3 className="tw-section-title">
              <span className="tw-icon">⚙️</span> Activation
            </h3>

            <label className="tw-toggle">
              <input
                type="checkbox"
                name="enabled"
                value="1"
                defaultChecked={!!setting?.enabled}
              />
              <span className="tw-toggle-track" />
              <span className="tw-toggle-label">Enable TallyWish on your storefront</span>
            </label>
          </section>

          {/* ── SAVE ── */}
          <div className="tw-actions">
            <button
              type="submit"
              className="tw-save-btn"
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save Settings"}
            </button>
          </div>

        </Form>
      </div>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .tw-wrap {
    max-width: 680px;
    margin: 0 auto;
    padding: 32px 24px 80px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    color: #1a1a2e;
    background: #f7f8fc;
    min-height: 100vh;
  }

  /* Header */
  .tw-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 28px;
  }
  .tw-logo-mark {
    width: 46px; height: 46px;
    background: linear-gradient(135deg, #ff4081, #f50057);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 800; font-size: 15px;
    letter-spacing: 0.5px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(255,64,129,.35);
  }
  .tw-brand {
    font-size: 20px; font-weight: 700;
    color: #1a1a2e; line-height: 1;
  }
  .tw-tagline {
    font-size: 13px; color: #888; margin-top: 3px;
  }
  .tw-page-title {
    font-size: 22px; font-weight: 700;
    margin-bottom: 20px; color: #1a1a2e;
  }

  /* Toast */
  .tw-toast {
    background: #e8f5e9;
    border: 1px solid #a5d6a7;
    color: #2e7d32;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 20px;
    font-weight: 500;
    font-size: 14px;
  }

  /* Section */
  .tw-section {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 16px;
    border: 1px solid #eaeaf0;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
  }
  .tw-section-title {
    font-size: 15px; font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 18px;
    display: flex; align-items: center; gap: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f7;
  }
  .tw-icon { font-size: 16px; }

  /* Fields */
  .tw-field {
    margin-bottom: 18px;
  }
  .tw-field:last-child { margin-bottom: 0; }
  .tw-field--half { max-width: 200px; }

  .tw-field label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #444;
    margin-bottom: 7px;
  }
  .tw-field input[type="text"],
  .tw-field input[type="number"],
  .tw-field select {
    width: 100%;
    padding: 9px 12px;
    border: 1.5px solid #e0e0ed;
    border-radius: 8px;
    font-size: 14px;
    color: #1a1a2e;
    background: #fafafa;
    transition: border-color .15s;
    outline: none;
    appearance: none;
  }
  .tw-field input:focus,
  .tw-field select:focus {
    border-color: #ff4081;
    background: #fff;
  }
  .tw-field select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23888' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
    cursor: pointer;
  }

  /* Two-column row */
  .tw-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 480px) {
    .tw-row { grid-template-columns: 1fr; }
  }

  /* Color picker row */
  .tw-color-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .tw-field input[type="color"] {
    width: 44px; height: 36px;
    padding: 2px;
    border: 1.5px solid #e0e0ed;
    border-radius: 8px;
    cursor: pointer;
    background: #fff;
    flex-shrink: 0;
  }
  .tw-color-preview {
    width: 36px; height: 36px;
    border-radius: 8px;
    border: 1px solid #e0e0ed;
    flex-shrink: 0;
    transition: background .1s;
  }
  .tw-color-hex {
    font-size: 12px; font-family: monospace;
    color: #888;
  }

  /* Floating icon preview */
  .tw-float-preview {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
  }
  .tw-float-demo {
    width: 50px; height: 50px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,.15);
    transition: background .1s;
    cursor: default;
  }
  .tw-preview-label {
    font-size: 12px; color: #aaa; font-style: italic;
  }

  /* Button preview */
  .tw-btn-preview-wrap {
    margin-top: 8px;
    padding: 16px;
    background: #f7f8fc;
    border-radius: 8px;
    border: 1px dashed #ddd;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
  }
  .tw-btn-demo {
    padding: 10px 18px;
    border: none;
    cursor: default;
    font-size: 14px;
    font-weight: 600;
    transition: background .1s, color .1s, border-radius .1s;
  }

  /* Toggle */
  .tw-toggle {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;
  }
  .tw-toggle input[type="checkbox"] {
    display: none;
  }
  .tw-toggle-track {
    width: 44px; height: 24px;
    background: #ddd;
    border-radius: 99px;
    position: relative;
    transition: background .2s;
    flex-shrink: 0;
  }
  .tw-toggle-track::after {
    content: "";
    position: absolute;
    top: 3px; left: 3px;
    width: 18px; height: 18px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0,0,0,.2);
    transition: left .2s;
  }
  .tw-toggle input:checked ~ .tw-toggle-track {
    background: #ff4081;
  }
  .tw-toggle input:checked ~ .tw-toggle-track::after {
    left: 23px;
  }
  .tw-toggle-label {
    font-size: 14px; color: #444; font-weight: 500;
  }

  /* Actions */
  .tw-actions {
    margin-top: 24px;
  }
  .tw-save-btn {
    padding: 13px 32px;
    background: linear-gradient(135deg, #ff4081, #f50057);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(255,64,129,.4);
    transition: opacity .15s, transform .1s;
    letter-spacing: 0.3px;
  }
  .tw-save-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
  .tw-save-btn:active:not(:disabled) { transform: translateY(0); }
  .tw-save-btn:disabled { opacity: .6; cursor: not-allowed; }
`;
