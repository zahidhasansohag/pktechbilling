# PK TECH - Professional POS System

A standalone, completely client-side Point of Sale (POS) Billing software built strictly with HTML5, CSS3, and Vanilla JavaScript.

## Features
- **Zero Dependencies:** No React, No Database, No Bootstrap. Pure Vanilla code.
- **Offline Capable:** Implements a Service Worker (`sw.js`) and Manifest for PWA functionality. It works without internet.
- **Thermal Printing:** Specialized CSS rules output a precise 80mm B&W receipt hiding the UI completely.
- **Smart Auto-Calculations:** Live calculation of Line Totals, Subtotal, Grand Total, and Due Amounts.
- **Persistent Invoices:** Utilizes `localStorage` to retain the auto-incrementing Invoice Number.

## Installation & Setup
1. Extract all files into a single folder.
2. Place your company logo in the folder and name it exactly `logo.png`.
3. Open `index.html` in any modern web browser (Google Chrome or Microsoft Edge recommended for thermal printing).

## Printing Instructions
- Ensure your thermal printer is set to 80mm roll width.
- Click "Print Receipt" from the software.
- The browser print dialog will appear. Ensure:
  - **Margins:** Set to 'None' or 'Minimum'.
  - **Headers and Footers:** Unchecked.

## Technical Structure
- `index.html`: Contains the App UI and the hidden Print layout.
- `style.css`: Contains CSS variables, modern shadows, layout structures, and specific `@media print` rules for 80mm roll paper.
- `script.js`: DOM manipulation, mathematical calculations, and printing data hand-off.
- `manifest.json` & `sw.js`: Enables offline support.
