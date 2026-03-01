let data=[];

fetch("data.json")
.then(r=>r.json())
.then(j=>{
data=j;
renderPOCards();
});

function renderPOCards(){

// sort latest date first
data.sort((a,b)=> new Date(b.date)-new Date(a.date));

let html="";

data.forEach((o,i)=>{

html+=`
<div class="po-card">

<div class="po-header">
<b>Sr ${i+1}</b> | PO: ${o.po_no}
</div>

<div>PO Date: ${o.date}</div>
<div>Item: ${o.description}</div>
<div>Mfgr: ${o.mfgr}</div>
<div>Qty: ${o.qty}</div>
<div>Rate: ${o.sell_rate}</div>
<div>Amount: ${o.line_total}</div>
<div>Delivery By: ${o.delivery}</div>

<div class="status-row">

<button class="${o.ordered?'on':''}" onclick="toggle(${i},'ordered')">Ordered</button>
<button class="${o.received?'on':''}" onclick="toggle(${i},'received')">Received</button>
<button class="${o.challan?'on':''}" onclick="toggle(${i},'challan')">Challan</button>
<button class="${o.invoice?'on':''}" onclick="toggle(${i},'invoice')">Invoice</button>

</div>

<div class="pay-row">
Payment:
<input type="number" value="${o.rtgs||''}" 
onchange="setPayment(${i},this.value)">
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

function saveJSON(){
let str="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(data,null,2));
let a=document.createElement("a");
a.href=str;
a.download="data.json";
a.click();
}
