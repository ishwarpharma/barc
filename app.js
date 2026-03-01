let data = [];

// Load data
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
    renderPOCards();
  });


// Render PO cards
function renderPOCards() {

  // Latest PO first
  data.sort((a, b) => parseDate(b.date) - parseDate(a.date));

  let html = "";

  data.forEach((o, i) => {

    const qty = Number(o.qty || 0);
    const rate = Number(o.sell_rate || 0);
    const amount = Number(o.line_total || 0);   // use Excel Line_Total

    html += `
      <div class="po-card">

        <div class="po-top">
          <div class="po-number">PO: ${o.po_no}</div>
          <div class="po-date">${formatDate(o.date)}</div>
        </div>

        <div class="po-grid">
          <div>
            <span class="label">Item</span><br>
            <span class="item-val">${o.description || ""}</span>
          </div>

          <div>
            <span class="label">Manufacturer</span><br>
            <span class="mfgr-val">${o.mfgr || ""}</span>
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
          <button class="${o.ordered ? 'on' : ''}" onclick="toggle(${i},'ordered')">Ordered</button>
          <button class="${o.received ? 'on' : ''}" onclick="toggle(${i},'received')">Received</button>
          <button class="${o.challan ? 'on' : ''}" onclick="toggle(${i},'challan')">Challan</button>
          <button class="${o.invoice ? 'on' : ''}" onclick="toggle(${i},'invoice')">Invoice</button>
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


// Toggle status
function toggle(index, field) {
  data[index][field] = !data[index][field];
  saveJSON();
  renderPOCards();
}


// Set payment
function setPayment(index, value) {
  data[index].rtgs = value;
  saveJSON();
}


// Date parsing
function parseDate(d) {
  if (!d) return 0;
  const t = new Date(d);
  return isNaN(t) ? 0 : t.getTime();
}


// Format date → 1 Mar 2026
function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  const day = dt.getDate();
  const month = dt.toLocaleString("en", { month: "short" });
  const year = dt.getFullYear();
  return `${day} ${month} ${year}`;
}


// Number format (2 decimals)
function formatNum(n){
  return Number(n||0).toLocaleString("en-IN",{
    minimumFractionDigits:2,
    maximumFractionDigits:2
  });
}


// Save JSON
function saveJSON() {
  const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const a = document.createElement("a");
  a.href = str;
  a.download = "data.json";
  a.click();
}
