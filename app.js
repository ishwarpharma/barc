/* ===============================
   BARC PO Monitor — Ishwar Pharma
   FINAL SYSTEM
   =============================== */

let data = [];
let currentSearch = "";

const API_URL = "https://script.google.com/macros/s/AKfycbwwoiEUA2QAaxSMN-OVkoeZ9fbfuLk5G_FXANPa0Cfx-c0JIdMbuI2MkwzappVRsDnh2Q/exec";

/* ===============================
   LOAD DATA FROM GOOGLE SHEET
   =============================== */

fetch(API_URL)
.then(r => r.json())
.then(rows => {

data = rows.map(o => ({

po_no: o.PO_No || "",
ref_no: o.Ref_No || "",
description: o.Description || "",
mfgr: o.Mfgr || "",
pack: o.Pack || "",
qty: o.Qty || 0,
unit: o.Unit || "",
sell_rate: o["Sell Rate"] || 0,
line_total: o.Line_Total || 0,
gst: o["GST RATE"] || "",
bill_amount: o["BILL Amount"] || "",
hsn: o["HSN CODE"] || "",
batch: o["BATCH NUMBER"] || "",
mfg: o["MFG DATE"] || "",
exp: o["EXP DATE"] || "",

date: o.Date || "",
delivery: o.Delivery_Schedule || "",

ordered: (o.ORDERED || "").toLowerCase() === "yes",
received: (o.RECEIVED || "").toLowerCase() === "yes",
challan: (o["DELIVERY CHALLAN"] || "").toLowerCase() === "yes",
invoice: (o["FINAL INVOICE"] || "").toLowerCase() === "yes",

rtgs: o["RTGS AMOUNT"] || ""

}));

renderList(data);

});


/* ===============================
   RENDER PO LIST
   =============================== */

function renderList(list){

list.sort((a,b)=>parseDate(b.date)-parseDate(a.date));

let html="";

list.forEach((o,i)=>{

html += `
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

<button class="new-btn" onclick="generateInvoice(${i})">
📄 Generate Invoice
</button>

</div>

</div>
`;
});

document.getElementById("poList").innerHTML = html;

}


/* ===============================
   STATUS BUTTON
   =============================== */

function statusBtn(o,i,f,label){

return `
<button class="${o[f]?'yes':'no'}"
onclick="toggleStatus(${i},'${f}')">
${label}: ${o[f]?'Yes':'No'}
</button>
`;

}


/* ===============================
   TOGGLE STATUS (PASSWORD)
   =============================== */

function toggleStatus(index,field){

const pass = prompt("Enter password to change status");

if(pass !== "99"){
alert("Wrong password");
return;
}

const po = data[index];

const newValue = !po[field];

po[field] = newValue;

const map = {
ordered:"ORDERED",
received:"RECEIVED",
challan:"DELIVERY CHALLAN",
invoice:"FINAL INVOICE"
};

fetch(API_URL,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
po_no: po.po_no,
field: map[field],
value: newValue ? "Yes":"No"
})
});

renderList(data);

}


/* ===============================
   UPDATE PAYMENT
   =============================== */

function setPayment(index,value){

data[index].rtgs = value;

fetch(API_URL,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
po_no:data[index].po_no,
field:"RTGS AMOUNT",
value:value
})
});

}


/* ===============================
   GENERATE EXCEL INVOICE
   =============================== */

function generateInvoice(index){

const po = data[index];

const today = new Date().toLocaleDateString("en-GB");

const invoiceData = [

["ISHWAR PHARMA"],
["BARC INVOICE"],

[],

["PO Number",po.po_no],
["Reference",po.ref_no],
["Invoice Date",today],

[],

["Description",po.description],
["Manufacturer",po.mfgr],
["Pack",po.pack],

[],

["Qty",po.qty],
["Unit",po.unit],
["Rate",po.sell_rate],
["Line Total",po.line_total],

[],

["GST Rate",po.gst],
["Bill Amount",po.bill_amount || po.line_total],

[],

["HSN Code",po.hsn],
["Batch",po.batch],
["MFG Date",po.mfg],
["EXP Date",po.exp]

];

const ws = XLSX.utils.aoa_to_sheet(invoiceData);

const wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb,ws,"Invoice");

const safePO = po.po_no.replace(/[\/]/g,"_");

XLSX.writeFile(wb,"BARC_Invoice_"+safePO+".xlsx");

}


/* ===============================
   SEARCH
   =============================== */

function applySearch(term){

currentSearch = term.toLowerCase().trim();

if(!currentSearch){
renderList(data);
return;
}

const filtered = data.filter(o =>
o.po_no.toLowerCase().includes(currentSearch) ||
o.description.toLowerCase().includes(currentSearch) ||
o.mfgr.toLowerCase().includes(currentSearch)
);

renderList(filtered);

}


function highlight(text){

if(!currentSearch || !text) return text;

return text.replace(
new RegExp(`(${currentSearch})`,"gi"),
`<span class="highlight">$1</span>`
);

}


/* ===============================
   HELPERS
   =============================== */

function parseDate(d){
return d ? new Date(d).getTime() : 0;
}

function formatDate(d){

if(!d) return "";

const x = new Date(d);

return `${x.getDate()} ${x.toLocaleString("en",{month:"short"})} ${x.getFullYear()}`;

}

function formatNum(n){

return Number(n||0).toLocaleString("en-IN",{
minimumFractionDigits:2,
maximumFractionDigits:2
});

}
