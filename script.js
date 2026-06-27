/* ===========================
   PK TECH Billing System
   script.js - Part 1
=========================== */

// Invoice Number
let invoice = localStorage.getItem("pktech_invoice") || 1;

document.getElementById("invoice").value =
    "INV-" + String(invoice).padStart(6, "0");

// Date & Time
function updateDateTime() {

    const now = new Date();

    document.getElementById("date").value =
        now.toLocaleDateString("en-GB");

    document.getElementById("time").value =
        now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

}

updateDateTime();

// ==========================
// Item Table
// ==========================

const itemBody = document.getElementById("itemBody");
const addItemBtn = document.getElementById("addItemBtn");

addItemBtn.addEventListener("click", addItem);

// প্রথম Row
addItem();

function addItem() {

    const tr = document.createElement("tr");

    tr.innerHTML = `

<td>

<input
type="text"
class="itemName"
placeholder="Item Name">

</td>

<td>

<input
type="number"
class="qty"
value="1"
min="1">

</td>

<td>

<input
type="number"
class="price"
value="0"
min="0">

</td>

<td class="lineTotal">

0.00

</td>

<td>

<button
class="remove">

✕

</button>

</td>

`;

    itemBody.appendChild(tr);

}

// ==========================
// Remove Item
// ==========================

itemBody.addEventListener("click", function(e){

    if(e.target.classList.contains("remove")){

        e.target.closest("tr").remove();

    }

});

/* ===========================
   Calculation
=========================== */

document.addEventListener("input", function (e) {

    if (
        e.target.classList.contains("qty") ||
        e.target.classList.contains("price") ||
        e.target.id === "discount" ||
        e.target.id === "paid"
    ) {

        calculateBill();

    }

});

function calculateBill() {

    let subtotal = 0;

    document.querySelectorAll("#itemBody tr").forEach(row => {

        const qty = parseFloat(row.querySelector(".qty").value) || 0;

        const price = parseFloat(row.querySelector(".price").value) || 0;

        const total = qty * price;

        row.querySelector(".lineTotal").innerText =
            total.toFixed(2);

        subtotal += total;

    });

    document.getElementById("subtotal").innerText =
        "৳" + subtotal.toFixed(2);

    const discount =
        parseFloat(document.getElementById("discount").value) || 0;

    let grandTotal = subtotal - discount;

    if (grandTotal < 0)
        grandTotal = 0;

    document.getElementById("grandTotal").innerText =
        "৳" + grandTotal.toFixed(2);

    const paid =
        parseFloat(document.getElementById("paid").value) || 0;

    let due = grandTotal - paid;

    if (due < 0)
        due = 0;

    document.getElementById("due").value =
        due.toFixed(2);

}

/* প্রথমবার চালু হলে */

calculateBill();

/* ===========================
   PK TECH Billing System
   script.js - Part 3
=========================== */

// Print Button
document.getElementById("printBtn").addEventListener("click", function () {

    const customer = document.getElementById("customer").value.trim();

    if (customer === "") {
        alert("Please enter Customer Name.");
        document.getElementById("customer").focus();
        return;
    }

    calculateBill();

    window.print();

    // Auto Next Invoice
    invoice++;

    localStorage.setItem("pktech_invoice", invoice);

    document.getElementById("invoice").value =
        "INV-" + String(invoice).padStart(6, "0");

    // Update Date & Time
    updateDateTime();

});

// ======================
// Clear Button
// ======================

document.getElementById("clearBtn").addEventListener("click", function () {

    document.getElementById("customer").value = "";
    document.getElementById("mobile").value = "";

    document.getElementById("discount").value = 0;

    document.getElementById("paid").value = 0;

    document.getElementById("due").value = 0;

    document.getElementById("payment").selectedIndex = 0;

    itemBody.innerHTML = "";

    addItem();

    calculateBill();

});

// ======================
// Payment Logic
// ======================

document.getElementById("payment").addEventListener("change", function () {

    const method = this.value;

    const paid = document.getElementById("paid");

    if (method === "Cash" || method === "Online Payment") {

        paid.value = document
            .getElementById("grandTotal")
            .innerText.replace("৳", "");

    }

    if (method === "Due") {

        paid.value = 0;

    }

    calculateBill();

});

// প্রথমবার Payment হিসাব
document.getElementById("payment").dispatchEvent(new Event("change"));