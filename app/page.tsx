"use client";

import React, { useState } from "react";

/* =========================
   Helpers
========================= */

function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function escapeHtml(s: string) {
  if (!s) return "";
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadHtml2Pdf() {
  if ((window as any).html2pdf) return (window as any).html2pdf;

  return new Promise<any>((resolve, reject) => {
    const existing = document.querySelector('script[data-html2pdf="1"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).html2pdf));
      existing.addEventListener("error", () => reject(new Error("Failed to load html2pdf")));
      return;
    }

    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js";
    s.async = true;
    s.setAttribute("data-html2pdf", "1");
    s.onload = () => resolve((window as any).html2pdf);
    s.onerror = () => reject(new Error("Failed to load html2pdf"));
    document.body.appendChild(s);
  });
}

/**
 * FIXED: html2pdf/html2canvas often produces blank PDFs when you pass an element
 * from an iframe document. So we parse the full HTML string, extract styles,
 * inject into a hidden container in the SAME document, then render that.
 */
async function generatePdfFromHtmlString(html: string, filename = "document.pdf") {
  try {
    const html2pdf = await loadHtml2Pdf();

    const parsed = new DOMParser().parseFromString(html, "text/html");
    const styles = Array.from(parsed.querySelectorAll("style"))
      .map((s) => s.innerHTML)
      .join("\n");

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px"; // approx A4 width at 96dpi
    container.style.background = "#ffffff";

    container.innerHTML = `
      <style>${styles}</style>
      ${parsed.body.innerHTML}
    `;

    document.body.appendChild(container);

    // Let layout settle
    await new Promise((r) => setTimeout(r, 200));

    await html2pdf()
      .from(container)
      .set({
        margin: 10,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      })
      .save();

    document.body.removeChild(container);
  } catch (err) {
    console.error("PDF generation failed, falling back to print:", err);
    const w = window.open("");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    } else {
      alert("Unable to create or download PDF. Please allow popups or try on a desktop.");
    }
  }
}

/* =========================
   HTML Generators (with your ORIGINAL calc)
   - 1 bag = 50kg
   - quantity (qtl) = bags / 2
   - rough cost = qtl * rate
   - total rough cost = rough + (qtl * hammali)
   - show estimate without hold = total rough cost
   - show estimate after hold = total rough cost - amountOnHold
========================= */

function generateOfficeHTML(d: any) {
  const bagsNum = toNumber(d.bags);
  const rateNum = toNumber(d.rate);
  const hammaliNum = toNumber(d.hammali);
  const amountOnHoldNum = toNumber(d.amountOnHold);
  const advanceAmountNum = toNumber(d.advanceAmount);

  const quantityQtl = bagsNum / 2;
  const roughCropCost = quantityQtl * rateNum;
  const totalRoughCost = roughCropCost + quantityQtl * hammaliNum;

  const estimateWithoutHold = totalRoughCost;
  const estimateAfterHold = totalRoughCost - amountOnHoldNum;
  const balanceAfterAdvance = estimateAfterHold - advanceAmountNum;

  const advanceChecked = d.advancePayment ? "Yes" : "No";
  const advanceMode = d.advancePaymentMode || "";
  const remark = d.purchaserRemark || "";

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Office Copy</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color:#111 }
    h1 { margin: 0 0 12px 0; }
    hr { margin: 12px 0; }
    .row { margin-bottom: 8px; }
    .label { font-weight: 600; display:inline-block; width:220px; vertical-align:top; }
    .calc { margin-top: 12px; padding: 12px; border: 1px solid #ddd; background:#f9f9f9; width:100%; box-sizing:border-box; }
    .highlight { font-weight:700; }
    .remark-box { margin-top: 10px; padding:10px; border:1px dashed #ccc; background:#fff9e6; white-space:pre-wrap; }
    .small { font-size: 12px; color: #444; margin-top: 6px; }
  </style>
</head>
<body>
  <h1>Sapna Trading Company — Purchase Report (Office)</h1>

  <div class="row"><span class="label">Purchaser:</span> ${escapeHtml(d.purchaserName || "")}</div>
  <div class="row"><span class="label">Date (DD/MM/YY):</span> ${escapeHtml(d.date || "")}</div>
  <div class="row"><span class="label">Village Name:</span> ${escapeHtml(d.villageName || "")}</div>
  <div class="row"><span class="label">Kisan Name:</span> ${escapeHtml(d.kisanName || "")}</div>

  <hr/>

  <div class="row"><span class="label">Advance Payment:</span> ${advanceChecked}</div>
  <div class="row"><span class="label">Advance Payment Mode:</span> ${escapeHtml(advanceMode)}</div>
  <div class="row"><span class="label">Advance Amount:</span> ₹${advanceAmountNum.toFixed(2)}</div>
  <div class="row"><span class="label">Amount on Hold:</span> ₹${amountOnHoldNum.toFixed(2)}</div>

  <hr/>

  <div class="row"><span class="label">Variety:</span> ${escapeHtml(d.variety || "")}</div>
  <div class="row"><span class="label">Bags:</span> ${bagsNum ? bagsNum : escapeHtml(d.bags || "")}</div>
  <div class="row"><span class="label">Bharti (info only):</span> ${escapeHtml(d.bharti || "")}</div>
  <div class="row"><span class="label">Rate / per qtl:</span> ₹${rateNum.toFixed(2)}</div>
  <div class="row"><span class="label">Vehicle No:</span> ${escapeHtml(d.vehicleNo || "")}</div>

  <hr/>

  <div class="row"><span class="label">Kisan Bank Name:</span> ${escapeHtml(d.kisanBankName || "")}</div>
  <div class="row"><span class="label">Hammali / per qtl:</span> ₹${hammaliNum.toFixed(2)}</div>

  <div class="calc">
    <div class="row"><span class="label">Quantity (qtl):</span> <span class="highlight">${quantityQtl.toFixed(2)}</span></div>
    <div class="row"><span class="label">Rough Crop Cost:</span> <span class="highlight">₹${roughCropCost.toFixed(2)}</span></div>
    <div class="row"><span class="label">Total Rough Cost (with Hammali):</span> <span class="highlight">₹${totalRoughCost.toFixed(2)}</span></div>

    <hr/>

    <div class="row"><span class="label">Estimate (without amount on hold):</span> <span class="highlight">₹${estimateWithoutHold.toFixed(2)}</span></div>
    <div class="row"><span class="label">Estimate (after amount on hold):</span> <span class="highlight">₹${estimateAfterHold.toFixed(2)}</span></div>
    <div class="row"><span class="label">Balance (after advance & hold):</span> <span class="highlight">₹${balanceAfterAdvance.toFixed(2)}</span></div>
    <div class="small">* Rough estimates for internal reference</div>
  </div>

  <h3>Remark</h3>
  <div class="remark-box">${escapeHtml(remark)}</div>

</body>
</html>
`;
}

function generateUnloaderFromPurchaserHTML(d: any) {
  const bagsNum = toNumber(d.bags);
  const bharti = d.bharti || "";
  const remark = d.purchaserRemark || "";

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Unloader Copy</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color:#111 }
    h1 { margin: 0 0 12px 0; }
    .row { margin-bottom: 8px; }
    .label { font-weight: 600; display:inline-block; width:180px; vertical-align:top; }
    .remark-box { margin-top: 10px; padding:10px; border:1px dashed #ccc; background:#f0f8ff; white-space:pre-wrap; }
  </style>
</head>
<body>
  <h1>Sapna Trading Company — Unloader Report</h1>

  <div class="row"><span class="label">Purchaser Name:</span> ${escapeHtml(d.purchaserName || "")}</div>
  <div class="row"><span class="label">Date (DD/MM/YY):</span> ${escapeHtml(d.date || "")}</div>
  <div class="row"><span class="label">Village Name:</span> ${escapeHtml(d.villageName || "")}</div>
  <div class="row"><span class="label">Kisan Name:</span> ${escapeHtml(d.kisanName || "")}</div>
  <div class="row"><span class="label">Variety:</span> ${escapeHtml(d.variety || "")}</div>
  <div class="row"><span class="label">Bags:</span> ${bagsNum ? bagsNum : escapeHtml(d.bags || "")}</div>
  <div class="row"><span class="label">Bharti:</span> ${escapeHtml(String(bharti))}</div>
  <div class="row"><span class="label">Vehicle No:</span> ${escapeHtml(d.vehicleNo || "")}</div>

  <h3>Remark</h3>
  <div class="remark-box">${escapeHtml(remark)}</div>
</body>
</html>
`;
}

function generateUnloaderHTML(d: any) {
  const remark = d.unloaderRemark || "";

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Unloader Slip</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color:#111 }
    h1 { margin: 0 0 12px 0; }
    .row { margin-bottom: 8px; }
    .label { font-weight: 600; display:inline-block; width:180px; vertical-align:top; }
    .kaata { margin-top: 14px; padding: 12px; border: 1px solid #ddd; background:#fff9e6; font-size: 18px; font-weight: 700; }
    .remark-box { margin-top: 10px; padding:10px; border:1px dashed #ccc; background:#fff; white-space:pre-wrap; }
  </style>
</head>
<body>
  <h1>Sapna Trading Company — Unloader Report</h1>

  <div class="row"><span class="label">Unloader Name:</span> ${escapeHtml(d.unloaderName || "")}</div>
  <div class="row"><span class="label">Date (DD/MM/YY):</span> ${escapeHtml(d.date || "")}</div>
  <div class="row"><span class="label">Village Name:</span> ${escapeHtml(d.villageName || "")}</div>
  <div class="row"><span class="label">Kisan Name:</span> ${escapeHtml(d.kisanName || "")}</div>
  <div class="row"><span class="label">Variety:</span> ${escapeHtml(d.variety || "")}</div>
  <div class="row"><span class="label">Bags:</span> ${escapeHtml(d.bags || "")}</div>
  <div class="row"><span class="label">Bharti:</span> ${escapeHtml(d.bharti || "")}</div>
  <div class="row"><span class="label">Vehicle No:</span> ${escapeHtml(d.vehicleNo || "")}</div>

  <div class="kaata">Kaata Weight: ${escapeHtml(d.kaataWeight || "")} kg</div>

  <h3>Remark</h3>
  <div class="remark-box">${escapeHtml(remark)}</div>
</body>
</html>
`;
}

/* =========================
   MAIN UI
========================= */

export default function Page() {
  const [mode, setMode] = useState<"home" | "purchaser" | "unloader">("home");
  const [data, setData] = useState<any>({
    advancePayment: false,
    advancePaymentMode: "",
    advanceAmount: "",
    amountOnHold: "",
    purchaserRemark: "",
    unloaderRemark: "",
  });

  const input = (label: string, key: string, type: string = "text", placeholder?: string) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <input
        placeholder={placeholder || label}
        type={type}
        onChange={(e) => setData({ ...data, [key]: e.target.value })}
        value={data[key] || ""}
        style={{ display: "block", padding: 10, width: "100%", fontSize: 16 }}
      />
    </div>
  );

  const textarea = (label: string, key: string, placeholder?: string) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <textarea
        placeholder={placeholder || label}
        onChange={(e) => setData({ ...data, [key]: e.target.value })}
        value={data[key] || ""}
        style={{ display: "block", padding: 10, width: "100%", minHeight: 90, fontSize: 16 }}
      />
    </div>
  );

  const checkbox = (label: string, key: string) => (
    <label style={{ display: "block", marginBottom: 10, fontWeight: 600 }}>
      <input
        type="checkbox"
        checked={!!data[key]}
        onChange={(e) => setData({ ...data, [key]: e.target.checked })}
        style={{ marginRight: 8 }}
      />
      {label}
    </label>
  );

  if (mode === "home") {
    return (
      <div style={{ padding: 30, maxWidth: 520, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 18 }}>Sapna Trading Company</h1>
        <button
          onClick={() => setMode("purchaser")}
          style={{ width: "100%", padding: 14, fontSize: 18, marginBottom: 12 }}
        >
          Purchaser
        </button>
        <button onClick={() => setMode("unloader")} style={{ width: "100%", padding: 14, fontSize: 18 }}>
          Unloader
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 30, maxWidth: 680, margin: "0 auto" }}>
      <button onClick={() => setMode("home")} style={{ marginBottom: 16 }}>
        ← Back
      </button>

      {mode === "purchaser" && (
        <>
          <h2>Purchaser Form</h2>

          {input("Purchaser Name", "purchaserName")}
          {input("Date (DD/MM/YY)", "date", "text", "27/12/25")}
          {input("Village Name", "villageName")}
          {input("Kisan Name", "kisanName")}

          <hr style={{ margin: "16px 0" }} />

          {checkbox("Advance Payment", "advancePayment")}
          {input("Advance Payment Mode (blank to fill)", "advancePaymentMode")}
          {input("Advance Amount (₹)", "advanceAmount", "number")}
          {input("Amount on Hold (₹)", "amountOnHold", "number")}

          {textarea("Remark (Purchaser)", "purchaserRemark")}

          <hr style={{ margin: "16px 0" }} />

          {input("Variety", "variety")}
          {input("Bags (decimals allowed)", "bags", "number")}
          {input("Bharti (info only)", "bharti", "number")}
          {input("Rate / per qtl", "rate", "number")}
          {input("Vehicle No", "vehicleNo")}
          {input("Kisan Bank Name", "kisanBankName")}
          {input("Hammali / per qtl", "hammali", "number")}

          <div style={{ marginTop: 14 }}>
            <button
              onClick={async () => {
                const html = generateOfficeHTML(data);
                await generatePdfFromHtmlString(html, `office_${data.date || "report"}.pdf`);
              }}
              style={{ padding: 14, fontSize: 16, marginRight: 10 }}
            >
              Download Office PDF
            </button>

            <button
              onClick={async () => {
                const html = generateUnloaderFromPurchaserHTML(data);
                await generatePdfFromHtmlString(html, `unloader_${data.date || "report"}.pdf`);
              }}
              style={{ padding: 14, fontSize: 16 }}
            >
              Download Unloader PDF
            </button>
          </div>
        </>
      )}

      {mode === "unloader" && (
        <>
          <h2>Unloader Form</h2>

          {input("Unloader Name", "unloaderName")}
          {input("Date (DD/MM/YY)", "date", "text", "27/12/25")}
          {input("Village Name", "villageName")}
          {input("Kisan Name", "kisanName")}
          {input("Variety", "variety")}
          {input("Bags (decimals allowed)", "bags", "number")}
          {input("Bharti (info only)", "bharti", "number")}
          {input("Vehicle No", "vehicleNo")}
          {input("Kaata Weight (kg)", "kaataWeight", "number")}

          {textarea("Remark (Unloader)", "unloaderRemark")}

          <div style={{ marginTop: 14 }}>
            <button
              onClick={async () => {
                const html = generateUnloaderHTML(data);
                await generatePdfFromHtmlString(html, `unloader_slip_${data.date || "report"}.pdf`);
              }}
              style={{ padding: 14, fontSize: 16 }}
            >
              Download Unloader PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
