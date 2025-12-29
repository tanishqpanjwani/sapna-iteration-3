"use client";

import { useState } from "react";

/* -------------------------
   HTML generators
--------------------------*/

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
</style>
</head>
<body>
<div class="box">
<h1>Sapna Trading Company<br/>Purchase Report</h1>

<div class="row"><div class="label">Purchaser</div>${d.purchaserName}</div>
<div class="row"><div class="label">Date</div>${d.date}</div>
<div class="row"><div class="label">Village</div>${d.villageName}</div>
<div class="row"><div class="label">Kisan</div>${d.kisanName}</div>
<div class="row"><div class="label">Variety</div>${d.variety}</div>
<div class="row"><div class="label">Bags</div>${d.bags}</div>
<div class="row"><div class="label">Bharti</div>${d.bharti}</div>
<div class="row"><div class="label">Vehicle</div>${d.vehicleNo}</div>

<hr/>

<div class="row"><div class="label">Bank</div>${d.kisanBankName}</div>
<div class="row"><div class="label">Hammali/qtl</div>${d.hammali}</div>

<div class="cost">
<b>Quantity (qtl):</b> ${qtl.toFixed(2)}<br/>
<b>Rough Cost:</b> ₹${rough.toFixed(2)}<br/>
<b>Total Rough Cost:</b> ₹${total.toFixed(2)}
</div>

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
.kaata { font-size:22px; font-weight:bold; background:#fff3e0; padding:10px; }
</style>
</head>
<body>
<div class="box">
<h1>Sapna Trading Company<br/>Unloader Report</h1>

<div class="row"><div class="label">Name</div>${d.unloaderName}</div>
<div class="row"><div class="label">Date</div>${d.date}</div>
<div class="row"><div class="label">Village</div>${d.villageName}</div>
<div class="row"><div class="label">Kisan</div>${d.kisanName}</div>
<div class="row"><div class="label">Variety</div>${d.variety}</div>
<div class="row"><div class="label">Bags</div>${d.bags}</div>
<div class="row"><div class="label">Bharti</div>${d.bharti}</div>
<div class="row"><div class="label">Vehicle</div>${d.vehicleNo}</div>

<div class="kaata">Kaata Weight: ${d.kaataWeight} kg</div>

</div>
<script>window.print()</script>
</body>
</html>
`;
}

/* -------------------------
   App UI
--------------------------*/

export default function Page() {
  const [mode, setMode] = useState<"home"|"purchaser"|"unloader">("home");
  const [data, setData] = useState<any>({});

  if (mode === "home") {
    return (
      <div style={{ padding:40 }}>
        <h1>Sapna Trading Company</h1>
        <button onClick={() => setMode("purchaser")}>Purchaser</button>
        <br/><br/>
        <button onClick={() => setMode("unloader")}>Unloader</button>
      </div>
    );
  }

  return (
    <div style={{ padding:40 }}>
      <button onClick={() => setMode("home")}>← Back</button>

      <pre style={{ display:"none" }}>{JSON.stringify(data)}</pre>

      {mode === "purchaser" && (
        <>
          <h2>Purchaser Form</h2>
          <input placeholder="Purchaser Name" onChange={e=>setData({...data,purchaserName:e.target.value})}/>
          <input placeholder="Date DD/MM/YY" onChange={e=>setData({...data,date:e.target.value})}/>
          <input placeholder="Village" onChange={e=>setData({...data,villageName:e.target.value})}/>
          <input placeholder="Kisan" onChange={e=>setData({...data,kisanName:e.target.value})}/>
          <input placeholder="Variety" onChange={e=>setData({...data,variety:e.target.value})}/>
          <input placeholder="Bags" onChange={e=>setData({...data,bags:e.target.value})}/>
          <input placeholder="Bharti" onChange={e=>setData({...data,bharti:e.target.value})}/>
          <input placeholder="Rate/qtl" onChange={e=>setData({...data,rate:e.target.value})}/>
          <input placeholder="Vehicle" onChange={e=>setData({...data,vehicleNo:e.target.value})}/>
          <input placeholder="Bank" onChange={e=>setData({...data,kisanBankName:e.target.value})}/>
          <input placeholder="Hammali/qtl" onChange={e=>setData({...data,hammali:e.target.value})}/>

          <br/><br/>
          <button onClick={()=>{
            const w = window.open("");
            w?.document.write(generateOfficeHTML(data));
            w?.document.close();
          }}>
            Print Office PDF
          </button>
        </>
      )}

      {mode === "unloader" && (
        <>
          <h2>Unloader Form</h2>
          <input placeholder="Unloader Name" onChange={e=>setData({...data,unloaderName:e.target.value})}/>
          <input placeholder="Date DD/MM/YY" onChange={e=>setData({...data,date:e.target.value})}/>
          <input placeholder="Village" onChange={e=>setData({...data,villageName:e.target.value})}/>
          <input placeholder="Kisan" onChange={e=>setData({...data,kisanName:e.target.value})}/>
          <input placeholder="Variety" onChange={e=>setData({...data,variety:e.target.value})}/>
          <input placeholder="Bags" onChange={e=>setData({...data,bags:e.target.value})}/>
          <input placeholder="Bharti" onChange={e=>setData({...data,bharti:e.target.value})}/>
          <input placeholder="Vehicle" onChange={e=>setData({...data,vehicleNo:e.target.value})}/>
          <input placeholder="Kaata Weight (kg)" onChange={e=>setData({...data,kaataWeight:e.target.value})}/>

          <br/><br/>
          <button onClick={()=>{
            const w = window.open("");
            w?.document.write(generateUnloaderHTML(data));
            w?.document.close();
          }}>
            Print Unloader PDF
          </button>
        </>
      )}
    </div>
  );
}
