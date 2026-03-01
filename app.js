/* ===============================
   BARC PO Monitor — Ishwar Pharma
   =============================== */

let data = [];
let currentSearch = "";


/* ========= LOAD DATA ========= */
fetch("data.json")
  .then(r => r.json())
  .then(j => {
    data = j.map(o => ({
      ...o,
      ordered: o.ordered || false,
      received: o.received || false,
      challan: o.challan || false,
      invoice: o.invoice || false,
      rtgs: o.rtgs || ""
    }));
    renderList(data);
  });


/* ========= MAIN RENDER ========= */
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

        <div>
          <span class="label">Item</span><br>
          <span class="item-val">${highlight(o.description || "")}</span>
        </div>

        <div>
          <span class="label">Manufacturer</span><br>
          <span class="mfgr-val">${highlight(o.mfgr || "")}</span>
        </div>

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

        <div>
          <span class="label">Delivery</span><br>
          <span class="delivery">${formatDate(o.delivery)}</span>
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


/* ========= HIGHLIGHT ========= */
function highlight(text) {
  if (!currentSearch || !text) return text || "";
  const re = new RegExp(`(${currentSearch})`, "gi");
  return text.replace(re, `<span class="highlight">$1</span>`);
}


/* ========= STATUS TOGGLE (PASSWORD) ========= */
function toggleStatus(index, field){

  const pass = prompt("Enter password to change status:");

  if(pass !== "99") return;

  data[index][field] = !data[index][field];

  saveJSON();
  applySearch(currentSearch);
}


/* ========= PAYMENT ========= */
function setPayment(index, value) {
  data[index].rtgs = value;
  saveJSON();
}


/* ========= DATE ========= */
function parseDate(d) {
  if (!d) return 0;
  const t = new Date(d);
  return isNaN(t) ? 0 : t.getTime();
}

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  const day = dt.getDate();
  const month = dt.toLocaleString("en", { month: "short" });
  const year = dt.getFullYear();
  return `${day} ${month} ${year}`;
}


/* ========= NUMBER ========= */
function formatNum(n) {
  return Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


/* ========= SAVE ========= */
function saveJSON() {
  const str =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(data, null, 2));

  const a = document.createElement("a");
  a.href = str;
  a.download = "data.json";
  a.click();
}
