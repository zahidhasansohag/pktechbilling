// ==========================================
// STATE MANAGEMENT & INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setInterval(updateDateTime, 1000);
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
    }
});

function initApp() {
    updateDateTime();
    generateInvoiceNo();
    document.getElementById('items-body').innerHTML = '';
    addItemRow();
    resetCalculations();
}

// ==========================================
// LOGO FALLBACK HANDLER (PREMIUM FEATURE)
// ==========================================
function handleLogoError() {
    const container = document.getElementById('logo-container');
    // If image fails to load, replace with a sleek CSS initial
    container.innerHTML = '<span class="logo-fallback-text">PK</span>';
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
    let lastInvoice = localStorage.getItem('pktech_last_invoice') || 1000;
    document.getElementById('invoice-no').value = `INV-${lastInvoice}`;
}

function incrementInvoiceNo() {
    let lastInvoice = localStorage.getItem('pktech_last_invoice') || 1000;
    localStorage.setItem('pktech_last_invoice', parseInt(lastInvoice) + 1);
    generateInvoiceNo();
}

// ==========================================
// DYNAMIC TABLE ROWS (WITH ANIMATION)
// ==========================================
function addItemRow() {
    const tbody = document.getElementById('items-body');
    const tr = document.createElement('tr');
    tr.className = 'row-animate'; // Adds sliding animation
    
    tr.innerHTML = `
        <td><input type="text" class="item-input item-name" placeholder="Search or type item name..."></td>
        <td><input type="number" class="item-input calc-input item-qty" value="1" min="1" onkeyup="calculateRow(this)" onchange="calculateRow(this)"></td>
        <td><input type="number" class="item-input calc-input item-price" value="0" min="0" onkeyup="calculateRow(this)" onchange="calculateRow(this)"></td>
        <td><input type="text" class="item-input calc-input item-total" value="0.00" readonly></td>
        <td><button class="btn-del" onclick="deleteRow(this)" title="Remove Item">✕</button></td>
    `;
    tbody.appendChild(tr);
    
    // Auto-focus the new input
    const inputs = tr.querySelectorAll('.item-name');
    if(inputs.length > 0) inputs[0].focus();
}

function deleteRow(btn) {
    const row = btn.closest('tr');
    const tbody = document.getElementById('items-body');
    
    if (tbody.children.length > 1) {
        // Fade out animation before removing
        row.style.opacity = '0';
        row.style.transform = 'translateX(-10px)';
        row.style.transition = 'all 0.2s';
        
        setTimeout(() => {
            row.remove();
            calculateTotal();
        }, 200);
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
    
    // Smooth number update effect could be added here, but direct assignment is instant and reliable
    document.getElementById('ui-subtotal').innerText = `৳ ${subtotal.toFixed(2)}`;
    document.getElementById('ui-grand-total').innerText = `৳ ${subtotal.toFixed(2)}`;
}

function resetCalculations() {
    calculateTotal();
}

// ==========================================
// ACTIONS
// ==========================================
function newBill() {
    // Custom styled confirm could replace this standard one later
    if(confirm("Start a new bill? Current data will be cleared.")) {
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
    const invoice = document.getElementById('invoice-no').value;
    let customer = document.getElementById('customer-name').value || "Walk-in Customer";
    const mobile = document.getElementById('customer-mobile').value || "N/A";
    
    document.getElementById('pr-invoice').innerText = invoice;
    document.getElementById('pr-date').innerText = getFormattedDate();
    document.getElementById('pr-time').innerText = getFormattedTime();
    document.getElementById('pr-customer').innerText = customer;
    document.getElementById('pr-mobile').innerText = mobile;

    const prItemsBody = document.getElementById('pr-items');
    prItemsBody.innerHTML = '';
    
    const rows = document.querySelectorAll('#items-body tr');
    let hasItems = false;

    rows.forEach(row => {
        const name = row.querySelector('.item-name').value;
        const qty = row.querySelector('.item-qty').value;
        const price = row.querySelector('.item-price').value;
        const total = row.querySelector('.item-total').value;
        
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
        alert("Please add at least one item to the cart before printing.");
        return;
    }

    document.getElementById('pr-subtotal').innerText = document.getElementById('ui-subtotal').innerText;
    document.getElementById('pr-grand').innerText = document.getElementById('ui-grand-total').innerText;

    // Trigger Print Dialog
    window.print();
}
