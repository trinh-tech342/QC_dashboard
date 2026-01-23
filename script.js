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
const mfgInput = document.getElementById('mfgDate');
const shelfLifeInput = document.getElementById('shelfLife');
const expInput = document.getElementById('expDate');

function calculateEXP() {
    if (!mfgInput.value) return;

    let mfgDate = new Date(mfgInput.value);
    let monthsToAdd = parseInt(shelfLifeInput.value);

    // Cộng thêm số tháng
    mfgDate.setMonth(mfgDate.getMonth() + monthsToAdd);

    // Chuyển định dạng về YYYY-MM-DD để hiển thị lên input date
    let expDateString = mfgDate.toISOString().split('T')[0];
    expInput.value = expDateString;
}

// Lắng nghe sự kiện khi thay đổi ngày hoặc thời hạn
mfgInput.addEventListener('change', calculateEXP);
shelfLifeInput.addEventListener('change', calculateEXP);

// Tự động điền ngày hôm nay vào Ngày sản xuất khi mở trang
window.onload = () => {
    const today = new Date().toISOString().split('T')[0];
    mfgInput.value = today;
    calculateEXP(); // Tính luôn HSD cho ngày hôm nay
};
const html5QrCode = new Html5Qrcode("reader");
const scanBtn = document.getElementById('scanBtn');
const stopScanBtn = document.getElementById('stopScanBtn');
const readerContainer = document.getElementById('reader-container');
const qcCodeInput = document.getElementById('qcCode');

// Cấu hình quét
const qrConfig = { fps: 10, qrbox: { width: 250, height: 150 } };

scanBtn.addEventListener('click', () => {
    readerContainer.style.display = 'block';
    scanBtn.disabled = true;

    html5QrCode.start(
        { facingMode: "environment" }, // Ưu tiên camera sau
        qrConfig,
        (decodedText) => {
            // Khi quét thành công
            qcCodeInput.value = decodedText;
            stopScanning();
            // Hiệu ứng nháy xanh để báo thành công
            qcCodeInput.style.backgroundColor = "#dcfce7";
            setTimeout(() => qcCodeInput.style.backgroundColor = "white", 1000);
        },
        (errorMessage) => { /* Không log lỗi liên tục để tránh nặng máy */ }
    )
    .catch(err => {
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
async function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Tải font hỗ trợ Tiếng Việt (Roboto-Regular)
    // Lưu ý: Để đơn giản, ta sẽ dùng bảng mã Unicode chuẩn của jsPDF
    doc.addFont("https://cdn.jsdelivr.net/gh/lovasoa/bad-pdf@master/fonts/Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    // 1. Tiêu đề (Đã có thể viết có dấu)
    doc.setFontSize(18);
    doc.text("PHIẾU KIỂM SOÁT CHẤT LƯỢNG", 105, 20, { align: "center" });
    
    doc.setFontSize(11);
    doc.text(`Số lô (Batch): ${data.batchNo}`, 14, 30);
    doc.text(`Ngày xuất phiếu: ${new Date().toLocaleDateString('vi-VN')}`, 14, 37);

    // 2. Tạo bảng chi tiết sản phẩm
    const columns = ["Thông số", "Chi tiết cụ thể"];
    const rows = [
        ["Tên sản phẩm", data.productName],
        ["Khối lượng", data.weight],
        ["Khách hàng", data.customer],
        ["Ngày sản xuất", data.mfgDate],
        ["Hạn sử dụng", data.expDate],
        ["Mã QC (Kiểm soát)", data.qcCode],
    ];

    doc.autoTable({
        startY: 45,
        head: [columns],
        body: rows,
        theme: 'grid',
        headStyles: { 
            fillColor: [37, 99, 235],
            font: "Roboto", // Áp dụng font cho header
            fontStyle: 'normal'
        },
        styles: { 
            font: "Roboto", // Áp dụng font cho body
            fontStyle: 'normal'
        }
    });

    // 3. Phần chữ ký
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFont("Roboto", "normal");
    doc.text("Người lập phiếu", 30, finalY);
    doc.text("(Ký và ghi rõ họ tên)", 25, finalY + 7);
    
    doc.text("Kiểm soát viên", 140, finalY);
    doc.text("(Ký và xác nhận)", 140, finalY + 7);

    // 4. Xuất file
    doc.save(`Phieu_QC_${data.batchNo}.pdf`);
}
