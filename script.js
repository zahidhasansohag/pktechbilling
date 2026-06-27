let invoice = localStorage.getItem("invoice") || 1;

document.getElementById("invoice").value =
  "INV-" + String(invoice).padStart(6, "0");

addItem();

function addItem() {

    let tbody = document.getElementById("tbody");

    let row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <input type="text" class="item"
            placeholder="Item Name">
        </td>

        <td>
            <input type="number"
            class="qty"
            value="1"
            min="1"
            oninput="calculate()">
        </td>

        <td>
            <input type="number"
            class="price"
            value="0"
            min="0"
            oninput="calculate()">
        </td>

        <td class="lineTotal">0</td>

        <td>
            <button onclick="removeItem(this)">✕</button>
        </td>
    `;

    tbody.appendChild(row);

    calculate();

}

function removeItem(btn){

    btn.parentElement.parentElement.remove();

    calculate();

}

function calculate(){

    let rows = document.querySelectorAll("#tbody tr");

    let subtotal = 0;

    rows.forEach(row=>{

        let qty = Number(row.querySelector(".qty").value);

        let price = Number(row.querySelector(".price").value);

        let total = qty * price;

        row.querySelector(".lineTotal").innerText = total.toFixed(2);

        subtotal += total;

    });

    let discount =
    Number(document.getElementById("discount").value);

    let grand = subtotal - discount;

    if(grand<0)
        grand=0;

    document.getElementById("grandTotal").innerText =
    grand.toFixed(2);

    let paid =
    Number(document.getElementById("paid").value);

    let due = grand-paid;

    if(due<0)
        due=0;

}

document.getElementById("discount")
.addEventListener("input",calculate);

document.getElementById("paid")
.addEventListener("input",calculate);

window.onbeforeprint=function(){

    calculate();

    localStorage.setItem("invoice",++invoice);

}