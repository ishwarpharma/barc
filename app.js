let data=[];

fetch("data.json")
.then(r=>r.json())
.then(j=>{
data=j;
renderPO();
fillPOSelects();
});

function showTab(id){
document.querySelectorAll(".tab").forEach(t=>t.style.display="none");
document.getElementById(id).style.display="block";
}
showTab("po");

function savePO(){
let obj={
po_no:po_no.value,
date:date.value,
ref_no:ref_no.value,
description:desc.value,
mfgr:mfgr.value,
pack:pack.value,
qty:qty.value,
unit:unit.value,
sell_rate:sell.value,
line_total:qty.value*sell.value,
delivery:delivery.value,
reminder:"",
hsn:"",
batch:"",
mfg:"",
exp:"",
sup_qty:"",
invoice_no:"",
rtgs:""
};

data.push(obj);
saveJSON();
renderPO();
fillPOSelects();
alert("PO Saved");
}

function renderPO(){
let s=search.value.toLowerCase();
let html="<tr><th>PO</th><th>Item</th><th>Qty</th><th>Delivery</th></tr>";

data.filter(d=>d.po_no.toLowerCase().includes(s))
.forEach(d=>{
html+=`<tr>
<td>${d.po_no}</td>
<td>${d.description}</td>
<td>${d.qty}</td>
<td>${d.delivery}</td>
</tr>`;
});

poTable.innerHTML=html;
}

function fillPOSelects(){
let opts=data.map(d=>`<option>${d.po_no}</option>`).join("");
rem_po.innerHTML=opts;
inv_po.innerHTML=opts;
pay_po.innerHTML=opts;
print_po.innerHTML=opts;
}

function saveReminder(){
let o=data.find(d=>d.po_no==rem_po.value);
o.reminder=rem_text.value;
saveJSON();
alert("Saved");
}

function saveInvoice(){
let o=data.find(d=>d.po_no==inv_po.value);
o.hsn=hsn.value;
o.batch=batch.value;
o.mfg=mfg.value;
o.exp=exp.value;
o.sup_qty=sup_qty.value;
o.invoice_no=inv_no.value;
saveJSON();
alert("Saved");
}

function savePayment(){
let o=data.find(d=>d.po_no==pay_po.value);
o.rtgs=rtgs.value;
saveJSON();
alert("Saved");
}

function printPO(){
let o=data.find(d=>d.po_no==print_po.value);
alert(JSON.stringify(o,null,2));
}

function saveJSON(){
let str="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(data,null,2));
let a=document.createElement("a");
a.href=str;
a.download="data.json";
a.click();
}
