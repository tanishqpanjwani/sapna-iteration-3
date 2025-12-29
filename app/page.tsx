"use client";

import React, { useState } from "react";

function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Office Print</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .row { margin-bottom: 6px; }
    .label { font-weight: 600; display:inline-block; width:160px; }
    .calc { margin-top: 12px; padding: 8px; border: 1px solid #ddd; background:#f9f9f9; width:fit-content; }
    .highlight { font-weight:700; }
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

  <br/><br/>
  <script>window.print()</script>
</body>
</html>
`;
}

function generateUnloaderFromPurchaserHTML(d: any) {
  // Similar to office HTML but trimmed for unloader usage; include the same fields
  const bags = toNumber(d.bags);
  const rate = toNumber(d.rate);
  const amountOnHold = toNumber(d.amountOnHold);

  const estimateWithoutHold = bags * rate;
  const finalAmount = estimateWithoutHold - toNumber(d.bharti) - toNumber(d.hammali) - amountOnHold;

  const advanceChecked = d.advancePayment ? "Yes" : "No";
  const advanceMode = d.advancePaymentMode || "";

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Unloader From Purchaser</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .row { margin-bottom: 6px; }
    .label { font-weight: 600; display:inline-block; width:140px; }
    .calc { margin-top: 12px; padding: 8px; border: 1px solid #ddd; background:#fff; width:fit-content; }
    .highlight { font-weight:700; }
  </style>
</head>
<body>
  <h2>Unloader — Purchaser Details</h2>

  <div class="row"><span class="label">Kisan:</span> ${d.kisanName || ""}</div>
  <div class="row"><span class="label">Variety:</span> ${d.variety || ""}</div>
  <div class="row"><span class="label">Bags:</span> ${d.bags || ""}</div>
  <div class="row"><span class="label">Rate / qtl:</span> ${d.rate || ""}</div>

  <hr/>

  <div class="row"><span class="label">Advance Payment:</span> ${advanceChecked}</div>
  <div class="row"><span class="label">Advance Mode:</span> ${advanceMode}</div>
  <div class="row"><span class="label">Amount on Hold:</span> ${amountOnHold.toFixed(2)}</div>

  <div class="calc">
    <div><span class="label">Estimate (without hold):</span> <span class="highlight">${estimateWithoutHold.toFixed(2)}</span></div>
    <div style="margin-top:6px;"><span class="label">Final Amount (after hold):</span> <span class="highlight">${finalAmount.toFixed(2)}</span></div>
  </div>

  <script>window.print()</script>
</body>
</html>
`;
}

function generateUnloaderHTML(d: any) {
  // Unloader-specific print remains mostly the same as before; keep kaataWeight etc.
  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Unloader</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
  </style>
</head>
<body>
  <h2>Unloader Slip</h2>
  <div>Unloader Name: ${d.unloaderName || ""}</div>
  <div>Date: ${d.date || ""}</div>
  <div>Village: ${d.villageName || ""}</div>
  <div>Kisan: ${d.kisanName || ""}</div>
  <div>Variety: ${d.variety || ""}</div>
  <div>Bags: ${d.bags || ""}</div>
  <div>Bharti: ${d.bharti || ""}</div>
  <div>Vehicle No: ${d.vehicleNo || ""}</div>
  <div class="kaata">Kaata Weight: ${d.kaataWeight || ""} kg</div>
  <script>window.print()</script>
</body>
</html>
`;
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
      style={{ display: "block", marginBottom: 10, padding: 8, width: "100%" }}
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
            onClick={() => {
              const w = window.open("");
              w?.document.write(generateOfficeHTML(data));
              w?.document.close();
            }}
          >
            Print Office PDF
          </button>

          <br /><br />

          <button
            onClick={() => {
              const w = window.open("");
              w?.document.write(generateUnloaderFromPurchaserHTML(data));
              w?.document.close();
            }}
          >
            Print Unloader PDF
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

          <br />
          <button
            onClick={() => {
              const w = window.open("");
              w?.document.write(generateUnloaderHTML(data));
              w?.document.close();
            }}
          >
            Print Unloader PDF
          </button>
        </>
      )}
    </div>
  );
}
