/* ===============================
   BARC PO Monitor — Ishwar Pharma
   Compact FINAL
   =============================== */

let data = [];
let currentSearch = "";

const API_URL = "https://script.google.com/macros/s/AKfycbwwoiEUA2QAaxSMN-OVkoeZ9fbfuLk5G_FXANPa0Cfx-c0JIdMbuI2MkwzappVRsDnh2Q/exec";

/* LOAD */
fetch(API_URL)
  .then(r => r.json())
  .then(rows => {

    data = rows.map(o => ({
      po_no: o.PO_No,
      description: o.Description,
      mfgr: o.Mfgr,
      qty: o.Qty,
      sell_rate: o["Sell Rate"],
      line_total: o.Line_Total,
      date: o.Date,
      delivery: o.Delivery_Schedule,

      ordered: o.ORDERED === "Yes",
      received: o.RECEIVED === "Yes",
      challan: o["DELIVERY CHALLAN"] === "Yes",
      invoice: o["FINAL INVOICE"] === "Yes",
      rtgs: o["RTGS AMOUNT"] || ""
    }));

    renderList(data);
  });

/* RENDER */
function renderList(list) {

  list.sort((a, b) => parseDate(b.date) - parseDate(a.date));

  let html = "";

  list.forEach((o, i) => {

    html += `
    <div class="po-card">

      <div class="po-top">
        <div class="po-number">PO: ${highlight(o.po_no)}</div>
        <div class="po-date">${formatDate(o.date)}</div>
      </div>

      <div class="po-grid">

        <div class="item-row">
          <span class="label">Item</span><br>
          <span class="item-val">${highlight(o.description || "")}</span>
        </div>

        <div class="double-row">
          <div>
            <span class="label">Manufacturer</span><br>
            <span class="mfgr-val">${highlight(o.mfgr || "")}</span>
          </div>
          <div>
            <span class="label">Delivery</span><br>
            <span class="delivery">${formatDate(o.delivery)}</span>
          </div>
        </div>

        <div class="triple-row">
          <div>
            <span class="label">Qty</span><br>
            <span class="qty-val">${formatNum(o.qty)}</span>
          </div>
          <div>
            <span class="label">Rate</span><br>
            <span class="rate-val">${formatNum(o.sell_rate)}</span>
          </div>
          <div>
            <span class="label">Amount</span><br>
            <span class="amount">${formatNum(o.line_total)}</span>
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
        <input
          type="number"
          value="${o.rtgs}"
          placeholder="Amount received"
          onchange="setPayment(${i}, this.value)"
        >
      </div>

    </div>
    `;
  });

  document.getElementById("poList").innerHTML = html;
}

/* STATUS BTN */
function statusBtn(o,i,field,label){
  return `
    <button 
      class="${o[field] ? 'yes' : 'no'}"
      onclick="toggleStatus(${i},'${field}')">
      ${label}: ${o[field] ? "Yes" : "No"}
    </button>
  `;
}

/* SEARCH */
function applySearch(term) {

  currentSearch = term.toLowerCase().trim();

  if (!currentSearch) return renderList(data);

  const filtered = data.filter(o =>
    o.po_no?.toLowerCase().includes(currentSearch) ||
    o.description?.toLowerCase().includes(currentSearch) ||
    o.mfgr?.toLowerCase().includes(currentSearch)
  );

  renderList(filtered);
}

/* TOGGLE */
function toggleStatus(index, field){

  if(prompt("Enter password:") !== "99") return;

  const po = data[index];
  po[field] = !po[field];

  const sheetField = {
    ordered: "ORDERED",
    received: "RECEIVED",
    challan: "DELIVERY CHALLAN",
    invoice: "FINAL INVOICE"
  }[field];

  fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      po_no: po.po_no,
      field: sheetField,
      value: po[field] ? "Yes":"No"
    })
  });

  applySearch(currentSearch);
}

/* PAYMENT */
function setPayment(index,val){
  data[index].rtgs = val;

  fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      po_no:data[index].po_no,
      field:"RTGS AMOUNT",
      value:val
    })
  });
}

/* HELPERS */
function highlight(t){
  if(!currentSearch||!t) return t||"";
  return t.replace(new RegExp(`(${currentSearch})`,"gi"),
    `<span class="highlight">$1</span>`);
}

function parseDate(d){ return d?new Date(d).getTime():0 }

function formatDate(d){
  if(!d) return "";
  const x=new Date(d);
  return `${x.getDate()} ${x.toLocaleString("en",{month:"short"})} ${x.getFullYear()}`;
}

function formatNum(n){
  return Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
}
