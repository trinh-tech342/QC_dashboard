// THAY ĐƯỜNG LINK WEB APP CỦA BẠN VÀO ĐÂY
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpyfvuIrXsBwW0H6xFZlmwC7H3c6UD9gnpie7rfwZtvLs2ASjOQhUOLp9AMWFH5Ub1/exec';

const productForm = document.getElementById('productForm');
const dataTable = document.querySelector('#dataTable tbody');
let entryCount = 0;

// Các biến cho phần tính ngày HSD
const mfgInput = document.getElementById('mfgDate');
const shelfLifeInput = document.getElementById('shelfLife');
const expInput = document.getElementById('expDate');

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = 'Đang gửi...';
    submitBtn.disabled = true;

    // Lấy dữ liệu từ các ô input
    const formData = {
        productName: document.getElementById('productName').value,
        quantity: document.getElementById('quantity').value,
        weight: document.getElementById('weight').value,
        customer: document.getElementById('customer').value,
        batchNo: document.getElementById('batchNo').value,
        mfgDate: document.getElementById('mfgDate').value,
        expDate: document.getElementById('expDate').value,
        qcCode: document.getElementById('qcCode').value
    };

    // 1. Hiển thị lên bảng web
    updateTable(formData);

    // 2. Xuất file PDF
    generatePDF(formData);

    // 3. Gửi dữ liệu tới Google Sheets
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(() => {
        alert('Đã lưu dữ liệu và xuất PDF thành công!');
        productForm.reset();
        // Reset lại ngày mặc định sau khi form reset
        mfgInput.value = new Date().toISOString().split('T')[0];
        calculateEXP();
    })
    .catch(error => console.error('Lỗi:', error))
    .finally(() => {
        submitBtn.innerText = 'Lưu & Xuất Dữ Liệu';
        submitBtn.disabled = false;
    });
});

// HÀM CẬP NHẬT BẢNG (Đã sửa lỗi data.quan thành data.quantity)
function updateTable(data) {
    entryCount++;
    document.getElementById('totalEntries').innerText = entryCount;
    document.getElementById('lastBatch').innerText = data.batchNo;

    const row = `
        <tr style="animation: fadeIn 0.5s ease;">
            <td><strong>${data.productName}</strong></td>
            <td><span class="badge">${data.weight}</span></td>
            <td><span class="badge">${data.quantity}</span></td>
            <td>${data.customer}</td>
            <td><code>${data.batchNo}</code></td>
            <td>${data.mfgDate}</td>
            <td>${data.expDate}</td>
            <td style="color: #2563eb; font-weight: bold;">${data.qcCode}</td>
        </tr>`;
    dataTable.insertAdjacentHTML('afterbegin', row);
}

// HÀM TÍNH HẠN SỬ DỤNG
function calculateEXP() {
    if (!mfgInput.value) return;
    let mfgDate = new Date(mfgInput.value);
    let monthsToAdd = parseInt(shelfLifeInput.value);
    mfgDate.setMonth(mfgDate.getMonth() + monthsToAdd);
    expInput.value = mfgDate.toISOString().split('T')[0];
}

mfgInput.addEventListener('change', calculateEXP);
shelfLifeInput.addEventListener('change', calculateEXP);

// QUÉT MÃ QR
const html5QrCode = new Html5Qrcode("reader");
const scanBtn = document.getElementById('scanBtn');
const stopScanBtn = document.getElementById('stopScanBtn');
const readerContainer = document.getElementById('reader-container');
const qcCodeInput = document.getElementById('qcCode');

scanBtn.addEventListener('click', () => {
    readerContainer.style.display = 'block';
    scanBtn.disabled = true;
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
            qcCodeInput.value = decodedText;
            stopScanning();
            qcCodeInput.style.backgroundColor = "#dcfce7";
            setTimeout(() => qcCodeInput.style.backgroundColor = "white", 1000);
        },
        (errorMessage) => { }
    ).catch(err => {
        alert("Không thể mở camera: " + err);
        stopScanning();
    });
});

stopScanBtn.addEventListener('click', stopScanning);

function stopScanning() {
    html5QrCode.stop().then(() => {
        readerContainer.style.display = 'none';
        scanBtn.disabled = false;
    }).catch(err => console.error("Lỗi dừng camera", err));
}

// XUẤT FILE PDF (Có hỗ trợ tiếng Việt)
async function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Sử dụng font mặc định (Lưu ý: jsPDF mặc định không hỗ trợ dấu tiếng Việt tốt nếu không nhúng font)
    doc.setFontSize(18);
    doc.text("PHIEU KIEM SOAT CHAT LUONG", 105, 20, { align: "center" });
    
    doc.setFontSize(11);
    doc.text(`So lo (Batch): ${data.batchNo}`, 14, 30);
    doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 37);

    doc.autoTable({
        startY: 45,
        head: [["Thong so", "Chi tiet"]],
        body: [
            ["Ten san pham", data.productName],
            ["So luong", data.quantity],
            ["Khoi luong", data.weight],
            ["Khach hang", data.customer],
            ["Ngay san xuat", data.mfgDate],
            ["Han su dung", data.expDate],
            ["Ma QC", data.qcCode],
        ],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Phieu_QC_${data.batchNo}.pdf`);
}

// Tự động điền ngày hôm nay
window.onload = () => {
    const mfgDateEl = document.getElementById('mfgDate');
    if (mfgDateEl) {
        // Chỉ điền ngày mặc định nếu ô này tồn tại
        const today = new Date().toISOString().split('T')[0];
        mfgDateEl.value = today;

        // Cập nhật luôn HSD
        if (typeof calculateEXP === "function") calculateEXP();
    }
};
