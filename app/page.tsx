"use client";

import React, { useState } from "react";

function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function loadHtml2Pdf() {
  if ((window as any).html2pdf) return (window as any).html2pdf;
  return new Promise<any>((resolve, reject) => {
    const existing = document.querySelector('script[data-html2pdf="1"]');
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
 * Generate PDF from a full HTML string by writing it into a hidden iframe (so <head> styles apply),
 * then running html2pdf on the iframe document.body. This avoids blank PDFs caused by passing a full
 * document string into a detached container.
 */
async function generatePdfFromHtmlString(html: string, filename = "document.pdf") {
  try {
    const html2pdf = await loadHtml2Pdf();

    // Create hidden iframe and write the supplied HTML into it using srcdoc.
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    // Give the iframe page a close size matching A4 — helps html2canvas layout.
    iframe.style.width = "210mm";
    iframe.style.height = "297mm";
    // Use srcdoc to write the full HTML document
    iframe.srcdoc = html;

    document.body.appendChild(iframe);

    // Wait for the iframe to load (styles and fonts ready)
    await new Promise<void>((resolve, reject) => {
      const onLoad = () => {
        // small timeout so fonts/CSS can settle (optional but helps)
        setTimeout(() => resolve(), 250);
      };
      const onError = () => reject(new Error("Iframe failed to load PDF content"));
      iframe.addEventListener("load", onLoad, { once: true });
      iframe.addEventListener("error", onError, { once: true });

      // Safety timeout
      setTimeout(() => {
        // If iframe hasn't loaded in 8s, continue anyway (avoid forever waiting).
        resolve();
      }, 8000);
    });

    // Access the body of the iframe and run html2pdf on it
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      throw new Error("Could not access iframe document");
    }
    const element = doc.body;

    // Use html2pdf to save the iframe body as PDF
    await html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      })
      .save();

    // cleanup
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
  } catch (err) {
    console.error("PDF generation failed, falling back to print:", err);
    // fallback: open print window (user can Save as PDF)
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

function generateOfficeHTML(d: any) {
  const bags = toNumber(d.bags);
  const rate = toNumber(d.rate);
  const bharti = toNumber(d.bharti);
  const hammali = toNumber(d.hammali);
  const amountOnHold = toNumber(d.amountOnHold);

  // Basic estimate: bags * rate
  const estimateWithoutHold = bags * rate;
  // Example final calculation: estimate - bharti - hammali - amountOnHold
  const finalAmount = estimateWithoutHold - bharti - hammali - amountOnHold;

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
    .row { margin-bottom: 8px; }
    .label { font-weight: 600; display:inline-block; width:180px; vertical-align:top; }
    .calc { margin-top: 12px; padding: 8px; border: 1px solid #ddd; background:#f9f9f9; width:100%; box-sizing:border-box; }
    .highlight { font-weight:700; }
    .remark-box { margin-top: 10px; padding:8px; border:1px dashed #ccc; background:#fff9e6; white-space:pre-wrap; }
    h1,h2,h3 { margin:6px 0 }
  </style>
</head>
<body>
  <h1>Sapna Trading Company — Office Copy</h1>

  <div class="row"><span class="label">Purchaser:</span> ${d.purchaserName || ""}</div>
  <div class="row"><span class="label">Date:</span> ${d.date || ""}</div>
  <div class="row"><span class="label">Village:</span> ${d.villageName || ""}</div>
  <div class="row"><span class="label">Kisan:</span> ${d.kisanName || ""}</div>

  <hr/>

  <div class="row"><span class="label">Variety:</span> ${d.variety || ""}</div>
  <div class="row"><span class="label">Bags:</span> ${d.bags || ""}</div>
  <div class="row"><span class="label">Bharti:</span> ${d.bharti || ""}</div>
  <div class="row"><span class="label">Rate / qtl:</span> ${d.rate || ""}</div>
  <div class="row"><span class="label">Vehicle No:</span> ${d.vehicleNo || ""}</div>
  <div class="row"><span class="label">Kisan Bank Name:</span> ${d.kisanBankName || ""}</div>
  <div class="row"><span class="label">Hammali / qtl:</span> ${d.hammali || ""}</div>

  <hr/>

  <h3>Advance / Hold Details</h3>
  <div class="row"><span class="label">Advance Payment:</span> ${advanceChecked}</div>
  <div class="row"><span class="label">Advance Mode:</span> ${advanceMode}</div>
  <div class="row"><span class="label">Amount on Hold:</span> ${amountOnHold.toFixed(2)}</div>

  <div class="calc">
    <div><span class="label">Estimate (without amount on hold):</span> <span class="highlight">${estimateWithoutHold.toFixed(2)}</span></div>
    <div><span class="label">Deductions (bharti + hammali + hold):</span> <span class="highlight">${(bharti + hammali + amountOnHold).toFixed(2)}</span></div>
    <div style="margin-top:8px;"><span class="label">Final Amount (after hold):</span> <span class="highlight">${finalAmount.toFixed(2)}</span></div>
  </div>

  <h3>Remark</h3>
  <div class="remark-box">${escapeHtml(remark)}</div>

</body>
</html>
`;
}

function generateUnloaderFromPurchaserHTML(d: any) {
  const bags = toNumber(d.bags);
  const rate = toNumber(d.rate);
  const bharti = toNumber(d.bharti);
  const hammali = toNumber(d.hammali);
  const amountOnHold = toNumber(d.amountOnHold);

  const estimateWithoutHold = bags * rate;
  const finalAmount = estimateWithoutHold - bharti - hammali - amountOnHold;

  const advanceChecked = d.advancePayment ? "Yes" : "No";
  const advanceMode = d.advancePaymentMode || "";
  const remark = d.purchaserRemark || "";

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Unloader From Purchaser</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color:#111 }
    .row { margin-bottom: 8px; }
    .label { font-weight: 600; display:inline-block; width:150px; vertical-align:top; }
    .calc { margin-top: 12px; padding: 8px; border: 1px solid #ddd; background:#fff; width:100%; box-sizing:border-box; }
    .highlight { font-weight:700; }
    .remark-box { margin-top: 10px; padding:8px; border:1px dashed #ccc; background:#f0f8ff; white-space:pre-wrap; }
  </style>
</head>
<body>
  <h2>Unloader — Purchaser Details</h2>

  <div class="row"><span class="label">Kisan:</span> ${d.kisanName || ""}</div>
  <div class="row"><span class="label">Variety:</span> ${d.variety || ""}</div>
  <div class="row"><span class="label">Bags:</span> ${d.bags || ""}</div>
  <div class="row"><span class="label">Bharti:</span> ${d.bharti || ""}</div>
  <div class="row"><span class="label">Rate / qtl:</span> ${d.rate || ""}</div>

  <hr/>

  <div class="row"><span class="label">Advance Payment:</span> ${advanceChecked}</div>
  <div class="row"><span class="label">Advance Mode:</span> ${advanceMode}</div>
  <div class="row"><span class="label">Amount on Hold:</span> ${amountOnHold.toFixed(2)}</div>

  <div class="calc">
    <div><span class="label">Estimate (without hold):</span> <span class="highlight">${estimateWithoutHold.toFixed(2)}</span></div>
    <div style="margin-top:6px;"><span class="label">Final Amount (after hold):</span> <span class="highlight">${finalAmount.toFixed(2)}</span></div>
  </div>

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
  <title>Unloader</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color:#111 }
    .row { margin-bottom: 6px; }
    .remark-box { margin-top: 10px; padding:8px; border:1px dashed #ccc; background:#fff; white-space:pre-wrap; }
  </style>
</head>
<body>
  <h2>Unloader Slip</h2>
  <div class="row"><strong>Unloader Name:</strong> ${d.unloaderName || ""}</div>
  <div class="row"><strong>Date:</strong> ${d.date || ""}</div>
  <div class="row"><strong>Village:</strong> ${d.villageName || ""}</div>
  <div class="row"><strong>Kisan:</strong> ${d.kisanName || ""}</div>
  <div class="row"><strong>Variety:</strong> ${d.variety || ""}</div>
  <div class="row"><strong>Bags:</strong> ${d.bags || ""}</div>
  <div class="row"><strong>Bharti:</strong> ${d.bharti || ""}</div>
  <div class="row"><strong>Vehicle No:</strong> ${d.vehicleNo || ""}</div>
  <div class="row"><strong>Kaata Weight:</strong> ${d.kaataWeight || ""} kg</div>

  <h3>Remark</h3>
  <div class="remark-box">${escapeHtml(remark)}</div>

</body>
</html>
`;
}

function escapeHtml(s: string) {
  if (!s) return "";
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   MAIN APP
========================= */

export default function Page() {
  const [mode, setMode] = useState<"home" | "purchaser" | "unloader">("home");
  const [data, setData] = useState<any>({});

  const input = (ph: string, key: string) => (
    <input
      placeholder={ph}
      onChange={(e) => setData({ ...data, [key]: e.target.value })}
      value={data[key] || ""}
      style={{ display: "block", marginBottom: 10, padding: 8, width: "100%" }}
    />
  );

  const textarea = (ph: string, key: string) => (
    <textarea
      placeholder={ph}
      onChange={(e) => setData({ ...data, [key]: e.target.value })}
      value={data[key] || ""}
      style={{ display: "block", marginBottom: 10, padding: 8, width: "100%", minHeight: 80 }}
    />
  );

  const checkbox = (label: string, key: string) => (
    <label style={{ display: "block", marginBottom: 10 }}>
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
      <div style={{ padding: 40 }}>
        <h1>Sapna Trading Company</h1>
        <button onClick={() => setMode("purchaser")}>Purchaser</button>
        <br /><br />
        <button onClick={() => setMode("unloader")}>Unloader</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => setMode("home")}>← Back</button>

      {mode === "purchaser" && (
        <>
          <h2>Purchaser Form</h2>
          {input("Purchaser Name", "purchaserName")}
          {input("Date (DD/MM/YY)", "date")}
          {input("Village Name", "villageName")}
          {input("Kisan Name", "kisanName")}

          {/* New fields inserted after Kisan as requested */}
          {checkbox("Advance Payment", "advancePayment")}
          {input("Advance Payment Mode (e.g., Cash/UPI/Bank)", "advancePaymentMode")}
          {input("Amount on Hold", "amountOnHold")}

          {/* Remark for purchaser */}
          {textarea("Remark (Purchaser)", "purchaserRemark")}

          {/* existing fields */}
          {input("Variety", "variety")}
          {input("Bags", "bags")}
          {input("Bharti", "bharti")}
          {input("Rate / qtl", "rate")}
          {input("Vehicle No", "vehicleNo")}
          {input("Kisan Bank Name", "kisanBankName")}
          {input("Hammali / qtl", "hammali")}

          <br />
          <button
            onClick={async () => {
              const html = generateOfficeHTML(data);
              await generatePdfFromHtmlString(html, "office_copy.pdf");
            }}
          >
            Download Office PDF
          </button>

          <br /><br />

          <button
            onClick={async () => {
              const html = generateUnloaderFromPurchaserHTML(data);
              await generatePdfFromHtmlString(html, "unloader_from_purchaser.pdf");
            }}
          >
            Download Unloader PDF
          </button>
        </>
      )}

      {mode === "unloader" && (
        <>
          <h2>Unloader Form</h2>
          {input("Unloader Name", "unloaderName")}
          {input("Date (DD/MM/YY)", "date")}
          {input("Village Name", "villageName")}
          {input("Kisan Name", "kisanName")}
          {input("Variety", "variety")}
          {input("Bags", "bags")}
          {input("Bharti", "bharti")}
          {input("Vehicle No", "vehicleNo")}
          {input("Kaata Weight (kg)", "kaataWeight")}

          {/* Remark for unloader */}
          {textarea("Remark (Unloader)", "unloaderRemark")}

          <br />
          <button
            onClick={async () => {
              const html = generateUnloaderHTML(data);
              await generatePdfFromHtmlString(html, "unloader_slip.pdf");
            }}
          >
            Download Unloader PDF
          </button>
        </>
      )}
    </div>
  );
}
