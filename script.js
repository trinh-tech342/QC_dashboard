// THAY ĐƯỜNG LINK WEB APP CỦA BẠN VÀO ĐÂY
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzrBKSjcjD1CfQRXmo7MWvC4HwN3xjkEsLW6nuBEo8/dev';

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
