/* ===============================
   BARC PO Monitor — Ishwar Pharma
   FINAL LAYOUT
   =============================== */

let data = [];
let currentSearch = "";

const API_URL = "https://script.google.com/macros/s/AKfycbwwoiEUA2QAaxSMN-OVkoeZ9fbfuLk5G_FXANPa0Cfx-c0JIdMbuI2MkwzappVRsDnh2Q/exec";

/* LOAD DATA */
fetch(API_URL)
  .then(r => r.json())
  .then(rows => {

    data = rows.map(o => ({

      po_no: o.PO_No || "",
      description: o.Description || "",
      mfgr: o.Mfgr || "",
      qty: o.Qty || 0,
      sell_rate: o["Sell Rate"] || 0,
      line_total: o.Line_Total || 0,
      date: o.Date || "",
      delivery: o.Delivery_Schedule || "",

      /* GOOGLE SHEET COLUMN MAPPING */
      ordered: (o.ORDERED || "").toString().toLowerCase() === "yes",
      received: (o.RECEIVED || "").toString().toLowerCase() === "yes",
      challan: (o["DELIVERY CHALLAN"] || "").toString().toLowerCase() === "yes",
      invoice: (o["FINAL INVOICE"] || "").toString().toLowerCase() === "yes",

      /* COLUMN W */
      rtgs: o["RTGS AMOUNT"] || ""

    }));

    renderList(data);
  });


/* RENDER */
function renderList(list){

  list.sort((a,b)=>parseDate(b.date)-parseDate(a.date));

  let html="";

  list.forEach((o,i)=>{

    html+=`
    <div class="po-card">

      <div class="po-top">
        <div class="po-number">PO: ${highlight(o.po_no)}</div>
        <div class="po-date">${formatDate(o.date)}</div>
      </div>

      <div class="po-grid">

        <div class="item-row">
          <span class="label">Item</span>
          <div class="item-val">${highlight(o.description)}</div>
        </div>

        <div class="row-2col">
          <div>
            <span class="label">Manufacturer</span>
            <div class="mfgr-val">${highlight(o.mfgr)}</div>
          </div>

          <div>
            <span class="label">Delivery</span>
            <div class="delivery">${formatDate(o.delivery)}</div>
          </div>
        </div>

        <div class="row-3col">
          <div>
            <span class="label">Qty</span>
            <div class="qty-val">${formatNum(o.qty)}</div>
          </div>

          <div>
            <span class="label">Rate</span>
            <div class="rate-val">${formatNum(o.sell_rate)}</div>
          </div>

          <div>
            <span class="label">Amount</span>
            <div class="amount">${formatNum(o.line_total)}</div>
          </div>
        </div>

      </div>

      <div class="status-row">
        ${statusBtn(o,i,"ordered","Ordered")}
        ${statusBtn(o,i,"received","Received")}
        ${statusBtn(o,i,"challan","Challan")}
        ${statusBtn(o,i,"invoice","Invoice")}
      </div>

      <div class="pay-row">
        <span>💰 Payment</span>
        <input type="number"
          value="${o.rtgs}"
          placeholder="Amount received"
          onchange="setPayment(${i},this.value)">
      </div>

    </div>`;
  });

  document.getElementById("poList").innerHTML=html;
}


/* STATUS BUTTON */
function statusBtn(o,i,f,label){
  return `<button class="${o[f]?'yes':'no'}"
    onclick="toggleStatus(${i},'${f}')">
    ${label}: ${o[f]?'Yes':'No'}
  </button>`;
}


/* TOGGLE STATUS */
function toggleStatus(i,f){

  if(prompt("Enter password")!=="99") return;

  const po=data[i];
  po[f]=!po[f];

  const map={
    ordered:"ORDERED",
    received:"RECEIVED",
    challan:"DELIVERY CHALLAN",
    invoice:"FINAL INVOICE"
  };

  fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      po_no:po.po_no,
      field:map[f],
      value:po[f]?"Yes":"No"
    })
  });

  applySearch(currentSearch);
}


/* PAYMENT UPDATE (COLUMN W) */
function setPayment(i,val){

  data[i].rtgs=val;

  fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      po_no:data[i].po_no,
      field:"RTGS AMOUNT",
      value:val
    })
  });
}


/* SEARCH */
function applySearch(t){

  currentSearch=t.toLowerCase().trim();

  if(!currentSearch) return renderList(data);

  const f=data.filter(o=>
    o.po_no.toLowerCase().includes(currentSearch)||
    o.description.toLowerCase().includes(currentSearch)||
    o.mfgr.toLowerCase().includes(currentSearch)
  );

  renderList(f);
}


function highlight(txt){

  if(!currentSearch || !txt) return txt;

  return txt.replace(
    new RegExp(`(${currentSearch})`,"gi"),
    `<span class="highlight">$1</span>`
  );
}


/* HELPERS */
function parseDate(d){
  return d ? new Date(d).getTime() : 0;
}

function formatDate(d){

  if(!d) return "";

  const x=new Date(d);

  return `${x.getDate()} ${x.toLocaleString("en",{month:"short"})} ${x.getFullYear()}`;
}

function formatNum(n){

  return Number(n||0).toLocaleString("en-IN",{
    minimumFractionDigits:2,
    maximumFractionDigits:2
  });
}
