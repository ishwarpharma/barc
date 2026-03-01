let data=[];

fetch("data.json")
.then(r=>r.json())
.then(j=>{
data=j.map(o=>({
...o,
ordered:o.ordered||false,
received:o.received||false,
challan:o.challan||false,
invoice:o.invoice||false,
rtgs:o.rtgs||""
}));
renderPOCards();
});

function renderPOCards(){

data.sort((a,b)=>parseDate(b.date)-parseDate(a.date));

let html="";

data.forEach((o,i)=>{

let qty=Number(o.qty||0);
let rate=Number(o.sell_rate||0);
let amt=qty*rate;

html+=`
<div class="po-card">

<div class="po-top">
<div>Sr ${i+1}</div>
<div>${formatDate(o.date)}</div>
</div>

<div class="po-grid">
<div><span class="label">PO No</span><br><span class="value">${o.po_no}</span></div>
<div><span class="label">Delivery</span><br><span class="value">${formatDate(o.delivery)}</span></div>

<div><span class="label">Item</span><br><span class="value">${o.description}</span></div>
<div><span class="label">Mfgr</span><br><span class="value">${o.mfgr}</span></div>

<div><span class="label">Qty</span><br><span class="value">${formatNum(qty)}</span></div>
<div><span class="label">Rate</span><br><span class="value">${formatNum(rate)}</span></div>

<div><span class="label">Amount</span><br><span class="amount">${formatNum(amt)}</span></div>
</div>

<div class="status-row">
<button class="${o.ordered?'on':''}" onclick="toggle(${i},'ordered')">Ordered</button>
<button class="${o.received?'on':''}" onclick="toggle(${i},'received')">Received</button>
<button class="${o.challan?'on':''}" onclick="toggle(${i},'challan')">Challan</button>
<button class="${o.invoice?'on':''}" onclick="toggle(${i},'invoice')">Invoice</button>
</div>

<div class="pay-row">
<span>Payment</span>
<input type="number" value="${o.rtgs}" onchange="setPayment(${i},this.value)">
</div>

</div>
`;
});

document.getElementById("poList").innerHTML=html;
}

function toggle(i,field){
data[i][field]=!data[i][field];
saveJSON();
renderPOCards();
}

function setPayment(i,val){
data[i].rtgs=val;
saveJSON();
}

function parseDate(d){
if(!d) return 0;
return new Date(d).getTime()||0;
}

function formatDate(d){
if(!d) return "";
let dt=new Date(d);
if(isNaN(dt)) return d;
let day=dt.getDate();
let month=dt.toLocaleString('en',{month:'short'});
let year=dt.getFullYear();
return `${day} ${month} ${year}`;
}

function formatNum(n){
return Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
}

function saveJSON(){
let str="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(data,null,2));
let a=document.createElement("a");
a.href=str;
a.download="data.json";
a.click();
}
