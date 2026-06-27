// ==========================================
// STATE MANAGEMENT & INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setInterval(updateDateTime, 1000);
    
    // Register Service Worker for Offline Capabilities
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Error', err));
    }
});

function initApp() {
    updateDateTime();
    generateInvoiceNo();
    document.getElementById('items-body').innerHTML = '';
    addItemRow(); // Add one empty row initially
    resetCalculations();
}

// ==========================================
// DATE & TIME
// ==========================================
function updateDateTime() {
    const now = new Date();
    
    const dateOpts = { day: '2-digit', month: 'short', year: 'numeric' };
    const timeOpts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    
    document.getElementById('current-date').innerText = now.toLocaleDateString('en-GB', dateOpts);
    document.getElementById('current-time').innerText = now.toLocaleTimeString('en-US', timeOpts);
}

function getFormattedDate() {
    return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getFormattedTime() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ==========================================
// INVOICE LOGIC
// ==========================================
function generateInvoiceNo() {
    let lastInvoice = localStorage.getItem('pktech_last_invoice');
    if (!lastInvoice) {
        lastInvoice = 1000; // Starting number
    } else {
        lastInvoice = parseInt(lastInvoice);
    }
    
    // Auto increment logic happens when "New Bill" is clicked. 
    // Here we just display the current ongoing invoice.
    document.getElementById('invoice-no').value = `INV-${lastInvoice}`;
}

function incrementInvoiceNo() {
    let lastInvoice = localStorage.getItem('pktech_last_invoice') || 1000;
    localStorage.setItem('pktech_last_invoice', parseInt(lastInvoice) + 1);
    generateInvoiceNo();
}

// ==========================================
// DYNAMIC TABLE ROWS
// ==========================================
function addItemRow() {
    const tbody = document.getElementById('items-body');
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td><input type="text" class="item-input item-name" placeholder="Item Name"></td>
        <td><input type="number" class="item-input calc-input item-qty" value="1" min="1" onkeyup="calculateRow(this)" onchange="calculateRow(this)"></td>
        <td><input type="number" class="item-input calc-input item-price" value="0" min="0" onkeyup="calculateRow(this)" onchange="calculateRow(this)"></td>
        <td><input type="text" class="item-input calc-input item-total" value="0" readonly></td>
        <td><button class="btn-del" onclick="deleteRow(this)">✕</button></td>
    `;
    tbody.appendChild(tr);
}

function deleteRow(btn) {
    const row = btn.closest('tr');
    const tbody = document.getElementById('items-body');
    
    // Prevent deleting if it's the last row
    if (tbody.children.length > 1) {
        row.remove();
        calculateTotal();
    }
}

// ==========================================
// CALCULATIONS
// ==========================================
function calculateRow(element) {
    const row = element.closest('tr');
    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const total = qty * price;
    
    row.querySelector('.item-total').value = total.toFixed(2);
    calculateTotal();
}

function calculateTotal() {
    let subtotal = 0;
    const rowTotals = document.querySelectorAll('.item-total');
    
    rowTotals.forEach(input => {
        subtotal += parseFloat(input.value) || 0;
    });
    
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const grandTotal = subtotal - discount;
    const paid = parseFloat(document.getElementById('paid-amount').value) || 0;
    let due = grandTotal - paid;
    
    if (due < 0) due = 0; // Prevent negative due

    // Update UI
    document.getElementById('ui-subtotal').innerText = `৳ ${subtotal.toFixed(2)}`;
    document.getElementById('ui-grand-total').innerText = `৳ ${grandTotal.toFixed(2)}`;
    document.getElementById('ui-due').innerText = `৳ ${due.toFixed(2)}`;
}

function resetCalculations() {
    document.getElementById('discount').value = '0';
    document.getElementById('paid-amount').value = '0';
    calculateTotal();
}

// ==========================================
// ACTIONS
// ==========================================
function newBill() {
    if(confirm("Are you sure you want to start a new bill?")) {
        incrementInvoiceNo();
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-mobile').value = '';
        document.getElementById('items-body').innerHTML = '';
        addItemRow();
        resetCalculations();
    }
}

// ==========================================
// PRINT RECEIPT LOGIC
// ==========================================
function printReceipt() {
    // 1. Gather Data from UI
    const invoice = document.getElementById('invoice-no').value;
    let customer = document.getElementById('customer-name').value;
    if(!customer) customer = "Walk-in Customer";
    const mobile = document.getElementById('customer-mobile').value || "N/A";
    
    // 2. Populate Print Layout Header
    document.getElementById('pr-invoice').innerText = invoice;
    document.getElementById('pr-date').innerText = getFormattedDate();
    document.getElementById('pr-time').innerText = getFormattedTime();
    document.getElementById('pr-customer').innerText = customer;
    document.getElementById('pr-mobile').innerText = mobile;

    // 3. Populate Print Layout Items
    const prItemsBody = document.getElementById('pr-items');
    prItemsBody.innerHTML = ''; // clear previous
    
    const rows = document.querySelectorAll('#items-body tr');
    let hasItems = false;

    rows.forEach(row => {
        const name = row.querySelector('.item-name').value;
        const qty = row.querySelector('.item-qty').value;
        const price = row.querySelector('.item-price').value;
        const total = row.querySelector('.item-total').value;
        
        // Only print rows that have a name or total > 0
        if(name.trim() !== '' || parseFloat(total) > 0) {
            hasItems = true;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: left; padding-right:5px;">${name || 'Item'}</td>
                <td style="text-align: center;">${qty}</td>
                <td style="text-align: center;">${price}</td>
                <td style="text-align: right;">${total}</td>
            `;
            prItemsBody.appendChild(tr);
        }
    });

    if(!hasItems) {
        alert("Please add items to the cart before printing.");
        return;
    }

    // 4. Populate Print Layout Totals
    document.getElementById('pr-subtotal').innerText = document.getElementById('ui-subtotal').innerText;
    document.getElementById('pr-discount').innerText = `৳ ${parseFloat(document.getElementById('discount').value || 0).toFixed(2)}`;
    document.getElementById('pr-grand').innerText = document.getElementById('ui-grand-total').innerText;

    // 5. Populate Print Layout Payment
    const method = document.getElementById('payment-method').value;
    const paid = parseFloat(document.getElementById('paid-amount').value || 0).toFixed(2);
    
    document.getElementById('pr-method').innerText = method;
    document.getElementById('pr-paid').innerText = `৳ ${paid}`;
    document.getElementById('pr-due').innerText = document.getElementById('ui-due').innerText;

    // 6. Trigger Browser Print
    window.print();
}
