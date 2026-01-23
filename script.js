// THAY ĐƯỜNG LINK WEB APP CỦA BẠN VÀO ĐÂY
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfZZuCEdqfzZudnDas5djWH3ft6XG50n7qAdTn6-FBdMdYYdbNi8NMtK96i0NPejEQ/exec';

const productForm = document.getElementById('productForm');
const dataTable = document.querySelector('#dataTable tbody');

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = 'Đang gửi...';
    submitBtn.disabled = true;

    // Lấy dữ liệu từ các ô input
    const formData = {
        productName: document.getElementById('productName').value,
        weight: document.getElementById('weight').value,
        customer: document.getElementById('customer').value,
        batchNo: document.getElementById('batchNo').value,
        mfgDate: document.getElementById('mfgDate').value,
        expDate: document.getElementById('expDate').value,
        qcCode: document.getElementById('qcCode').value
    };

    // 1. Hiển thị tạm thời lên bảng trên web
    updateTable(formData);

    // 2. Gửi dữ liệu tới Google Apps Script
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Quan trọng để tránh lỗi CORS
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(() => {
        alert('Đã lưu dữ liệu thành công!');
        productForm.reset();
    })
    .catch(error => console.error('Lỗi:', error))
    .finally(() => {
        submitBtn.innerText = 'Lưu & Xuất Dữ Liệu';
        submitBtn.disabled = false;
    });
});

function updateTable(data) {
    const row = `<tr>
        <td>${data.productName}</td>
        <td>${data.weight}</td>
        <td>${data.customer}</td>
        <td>${data.batchNo}</td>
        <td>${data.mfgDate}</td>
        <td>${data.expDate}</td>
        <td>${data.qcCode}</td>
    </tr>`;
    dataTable.insertAdjacentHTML('afterbegin', row);
}
let entryCount = 0;

function updateTable(data) {
    // Tăng số lượng thống kê
    entryCount++;
    document.getElementById('totalEntries').innerText = entryCount;
    document.getElementById('lastBatch').innerText = data.batchNo;

    const row = `
        <tr style="animation: fadeIn 0.5s ease;">
            <td><strong>${data.productName}</strong></td>
            <td><span class="badge">${data.weight}</span></td>
            <td>${data.customer}</td>
            <td><code>${data.batchNo}</code></td>
            <td>${data.mfgDate}</td>
            <td>${data.expDate}</td>
            <td style="color: var(--primary); font-weight: bold;">${data.qcCode}</td>
        </tr>`;
    dataTable.insertAdjacentHTML('afterbegin', row);
}
