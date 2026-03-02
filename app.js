/* ===============================
   BARC PO Monitor — Ishwar Pharma
   Google Sheet Connected UI
   Compact Layout FINAL
   =============================== */

let data = [];
let currentSearch = "";

/* ========= GOOGLE SHEET API ========= */
const API_URL = "https://script.google.com/macros/s/AKfycbwwoiEUA2QAaxSMN-OVkoeZ9fbfuLk5G_FXANPa0Cfx-c0JIdMbuI2MkwzappVRsDnh2Q/exec";

/* ========= LOAD DATA ========= */
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

/* ========= RENDER ========= */
function renderList(list) {

  list.sort((a, b) => parseDate(b.date) - parseDate(a.date));

  let html = "";

  list.forEach((o, i) => {

    const qty = Number(o.qty || 0);
    const rate = Number(o.sell_rate || 0);
    const amount = Number(o.line_total || 0);

    html += `
    <div class="po-card">

      <div class="po-top">
        <div class="po-number">PO: ${highlight(o.po_no)}</div>
        <div class="po-date">${formatDate(o.date)}</div>
      </div>

      <div class="po-grid">

        <!-- ITEM FULL WIDTH -->
        <div class="item-row">
          <span class="label">Item</span><br>
          <span class="item-val">${highlight(o.description || "")}</span>
        </div>

        <!-- MFGR + DELIVERY ONE LINE -->
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

        <!-- QTY RATE AMOUNT ONE LINE -->
        <div class="triple-row">
          <div>
            <span class="label">Qty</span><br>
            <span class="qty-val">${formatNum(qty)}</span>
          </div>
          <div>
            <span class="label">Rate</span><br>
            <span class="rate-val">${formatNum(rate)}</span>
          </div>
          <div>
            <span class="label">Amount</span><br>
            <span class="amount">${formatNum(amount)}</span>
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

/* ========= STATUS BUTTON ========= */
function statusBtn(o,i,field,label){
  const on = o[field];
  return `
    <button 
      class="${on ? 'yes' : 'no'}"
      onclick="toggleStatus(${i},'${field}')">
      ${label}: ${on ? "Yes" : "No"}
    </button>
  `;
}

/* ========= SEARCH ========= */
function applySearch(term) {

  currentSearch = term.toLowerCase().trim();

  if (!currentSearch) {
    renderList(data);
    return;
  }

  let filtered = data.filter(o => {
    return (
      o.po_no?.toLowerCase().includes(currentSearch) ||
      o.description?.toLowerCase().includes(currentSearch) ||
      o.mfgr?.toLowerCase().includes(currentSearch)
    );
  });

  renderList(filtered);
}

/* ========= STATUS TOGGLE ========= */
function toggleStatus(index, field){

  const pass = prompt("Enter password:");
  if(pass !== "99") return;

  const po = data[index];
  const newVal = !po[field];

  po[field] = newVal;

  const sheetField = {
    ordered: "ORDERED",
    received: "RECEIVED",
    challan: "DELIVERY CHALLAN",
    invoice: "FINAL INVOICE"
  }[field];

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      po_no: po.po_no,
      field: sheetField,
      value: newVal ? "Yes" : "No"
    })
  });

  applySearch(currentSearch);
}

/* ========= PAYMENT ========= */
function setPayment(index, value){

  data[index].rtgs = value;

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      po_no: data[index].po_no,
      field: "RTGS AMOUNT",
      value: value
    })
  });
}

/* ========= HELPERS ========= */
function highlight(text) {
  if (!currentSearch || !text) return text || "";
  const re = new RegExp(`(${currentSearch})`, "gi");
  return text.replace(re, `<span class="highlight">$1</span>`);
}

function parseDate(d) {
  if (!d) return 0;
  const t = new Date(d);
  return isNaN(t) ? 0 : t.getTime();
}

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return `${dt.getDate()} ${dt.toLocaleString("en",{month:"short"})} ${dt.getFullYear()}`;
}

function formatNum(n) {
  return Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
