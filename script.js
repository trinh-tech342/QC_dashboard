// THAY ĐƯỜNG LINK WEB APP CỦA BẠN VÀO ĐÂY
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpyfvuIrXsBwW0H6xFZlmwC7H3c6UD9gnpie7rfwZtvLs2ASjOQhUOLp9AMWFH5Ub1/exec';

const productForm = document.getElementById('productForm');
const dataTable = document.querySelector('#dataTable tbody');
const mfgInput = document.getElementById('mfgDate');
const shelfLifeInput = document.getElementById('shelfLife');
const expInput = document.getElementById('expDate');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

let entryCount = 0;
let currentData = null; 

// 1. XỬ LÝ KHI NHẤN NÚT LƯU
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = 'Đang lưu...';
    submitBtn.disabled = true;

    // Lấy dữ liệu từ các ô input
    currentData = {
        productName: document.getElementById('productName').value,
        quantity: document.getElementById('quantity').value,
        weight: document.getElementById('weight').value,
        customer: document.getElementById('customer').value,
        batchNo: document.getElementById('batchNo').value,
        mfgDate: document.getElementById('mfgDate').value,
        expDate: document.getElementById('expDate').value,
        qcCode: document.getElementById('qcCode').value
    };

    // Gửi dữ liệu tới Google Sheets
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
    })
    .then(() => {
        // Cập nhật bảng hiển thị
        updateTable(currentData);
        alert('Đã lưu vào Google Sheets thành công!');
        
        // Hiện nút PDF để người dùng nhấn nếu muốn
        if(downloadPdfBtn) downloadPdfBtn.style.display = 'block'; 
        
        submitBtn.innerText = '💾 Lưu Tiếp';
        submitBtn.disabled = false;
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Lỗi kết nối! Vui lòng kiểm tra mạng.');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Lưu Dữ Liệu';
    });
});

// 2. XỬ LÝ XUẤT PDF RIÊNG BIỆT
if(downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
        if (currentData) {
            generatePDF(currentData);
            downloadPdfBtn.style.display = 'none'; // Tải xong thì ẩn đi
            productForm.reset(); // Reset form
            
            // Đặt lại ngày mặc định sau khi reset
            const today = new Date().toISOString().split('T')[0];
            mfgInput.value = today;
            calculateEXP();
        }
    });
}

// 3. HÀM CẬP NHẬT BẢNG
function updateTable(data) {
    entryCount++;
    if(document.getElementById('totalEntries')) document.getElementById('totalEntries').innerText = entryCount;
    if(document.getElementById('lastBatch')) document.getElementById('lastBatch').innerText = data.batchNo;

    const row = `
        <tr style="animation: fadeIn 0.5s ease;">
            <td><strong>${data.productName}</strong></td>
            <td><span class="badge">${data.weight}</span></td>
            <td><span class="badge">${data.quantity}</span></td>
            <td><code>${data.batchNo}</code></td>
            <td>${data.expDate}</td>
            <td style="color: #2563eb; font-weight: bold;">${data.qcCode}</td>
        </tr>`;
    dataTable.insertAdjacentHTML('afterbegin', row);
}

// 4. HÀM TÍNH HẠN SỬ DỤNG
function calculateEXP() {
    if (!mfgInput || !mfgInput.value) return;
    let mfgDate = new Date(mfgInput.value);
    let monthsToAdd = parseInt(shelfLifeInput.value) || 12;
    mfgDate.setMonth(mfgDate.getMonth() + monthsToAdd);
    expInput.value = mfgDate.toISOString().split('T')[0];
}

mfgInput.addEventListener('change', calculateEXP);
shelfLifeInput.addEventListener('change', calculateEXP);

// 5. QUÉT MÃ QR (Giữ nguyên logic của bạn)
const html5QrCode = new Html5Qrcode("reader");
const scanBtn = document.getElementById('scanBtn');
const stopScanBtn = document.getElementById('stopScanBtn');
const readerContainer = document.getElementById('reader-container');
const qcCodeInput = document.getElementById('qcCode');

if(scanBtn) {
    scanBtn.addEventListener('click', () => {
        readerContainer.style.display = 'block';
        scanBtn.disabled = true;
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 150 } },
            (decodedText) => {
                qcCodeInput.value = decodedText;
                stopScanning();
            },
            (errorMessage) => { }
        ).catch(err => {
            alert("Không thể mở camera: " + err);
            stopScanning();
        });
    });
}

function stopScanning() {
    html5QrCode.stop().then(() => {
        readerContainer.style.display = 'none';
        scanBtn.disabled = false;
    }).catch(err => console.error("Lỗi dừng camera", err));
}

if(stopScanBtn) stopScanBtn.addEventListener('click', stopScanning);

// 6. XUẤT FILE PDF
async function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("PHIEU KIEM SOAT CHAT LUONG", 105, 20, { align: "center" });
    doc.setFontSize(11);
    doc.text(`So lo (Batch): ${data.batchNo}`, 14, 30);
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

// 7. KHỞI TẠO KHI LOAD TRANG
window.onload = () => {
    if (mfgInput) {
        const today = new Date().toISOString().split('T')[0];
        mfgInput.value = today;
        calculateEXP();
    }
};
