"use client";

import { useState } from "react";

/* =========================
   HTML GENERATORS
========================= */

function generateOfficeHTML(d: any) {
  const bags = Number(d.bags || 0);
  const rate = Number(d.rate || 0);
  const hammali = Number(d.hammali || 0);
  const qtl = bags / 2;
  const rough = qtl * rate;
  const total = rough + qtl * hammali;

  return `
<html>
<head>
<title>Sapna Trading Company - Office</title>
<style>
body { font-family: Arial; padding: 40px; background:#f5f1e8; }
.box { background:#fff; padding:30px; border-radius:8px; }
h1 { text-align:center; color:#8B4513; }
.row { display:flex; margin-bottom:10px; }
.label { width:180px; font-weight:bold; }
.cost { margin-top:20px; background:#fff3e0; padding:15px; }
.note { font-size:12px; color:#555; }
</style>
</head>
<body>
<div class="box">
<h1>Sapna Trading Company<br/>Purchase Report (Office)</h1>

<div class="row"><div class="label">Purchaser</div>${d.purchaserName || ""}</div>
<div class="row"><div class="label">Date</div>${d.date || ""}</div>
<div class="row"><div class="label">Village</div>${d.villageName || ""}</div>
<div class="row"><div class="label">Kisan</div>${d.kisanName || ""}</div>
<div class="row"><div class="label">Variety</div>${d.variety || ""}</div>
<div class="row"><div class="label">Bags</div>${d.bags || ""}</div>
<div class="row"><div class="label">Bharti</div>${d.bharti || ""}</div>
<div class="row"><div class="label">Vehicle</div>${d.vehicleNo || ""}</div>

<hr/>

<div class="row"><div class="label">Bank</div>${d.kisanBankName || ""}</div>
<div class="row"><div class="label">Hammali / qtl</div>${d.hammali || "0"}</div>

<div class="cost">
<b>Quantity (qtl):</b> ${qtl.toFixed(2)}<br/>
<b>Rough Crop Cost:</b> ₹${rough.toFixed(2)}<br/>
<b>Total Rough Cost:</b> ₹${total.toFixed(2)}
<div class="note">* Rough internal estimate</div>
</div>

</div>
<script>window.print()</script>
</body>
</html>
`;
}

function generateUnloaderFromPurchaserHTML(d: any) {
  return `
<html>
<head>
<title>Sapna Trading Company - Unloader</title>
<style>
body { font-family: Arial; padding: 40px; background:#f5f1e8; }
.box { background:#fff; padding:30px; border-radius:8px; }
h1 { text-align:center; color:#8B4513; }
.row { display:flex; margin-bottom:10px; }
.label { width:180px; font-weight:bold; }
</style>
</head>
<body>
<div class="box">
<h1>Sapna Trading Company<br/>Unloader Report</h1>

<div class="row"><div class="label">Purchaser</div>${d.purchaserName || ""}</div>
<div class="row"><div class="label">Date</div>${d.date || ""}</div>
<div class="row"><div class="label">Village</div>${d.villageName || ""}</div>
<div class="row"><div class="label">Kisan</div>${d.kisanName || ""}</div>
<div class="row"><div class="label">Variety</div>${d.variety || ""}</div>
<div class="row"><div class="label">Bags</div>${d.bags || ""}</div>
<div class="row"><div class="label">Bharti</div>${d.bharti || ""}</div>
<div class="row"><div class="label">Vehicle</div>${d.vehicleNo || ""}</div>

</div>
<script>window.print()</script>
</body>
</html>
`;
}

function generateUnloaderHTML(d: any) {
  return `
<html>
<head>
<title>Sapna Trading Company - Unloader</title>
<style>
body { font-family: Arial; padding: 40px; background:#f5f1e8; }
.box { background:#fff; padding:30px; border-radius:8px; }
h1 { text-align:center; color:#8B4513; }
.row { display:flex; margin-bottom:10px; }
.label { width:180px; font-weight:bold; }
.kaata { margin-top:20px; padding:15px; background:#fff3e0; font-size:22px; font-weight:bold; }
</style>
</head>
<body>
<div class="box">
<h1>Sapna Trading Company<br/>Unloader Report</h1>

<div class="row"><div class="label">Unloader</div>${d.unloaderName || ""}</div>
<div class="row"><div class="label">Date</div>${d.date || ""}</div>
<div class="row"><div class="label">Village</div>${d.villageName || ""}</div>
<div class="row"><div class="label">Kisan</div>${d.kisanName || ""}</div>
<div class="row"><div class="label">Variety</div>${d.variety || ""}</div>
<div class="row"><div class="label">Bags</div>${d.bags || ""}</div>
<div class="row"><div class="label">Bharti</div>${d.bharti || ""}</div>
<div class="row"><div class="label">Vehicle</div>${d.vehicleNo || ""}</div>

<div class="kaata">Kaata Weight: ${d.kaataWeight || ""} kg</div>

</div>
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
