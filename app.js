// =============================================================================
// GHN SHIPPER SIMULATOR - MAIN APPLICATION (Based on original structure)
// =============================================================================

// Toggle config section
function toggleConfig() {
    const content = document.getElementById('configContent');
    const toggle = document.getElementById('configToggle');
    content.classList.toggle('open');
    toggle.classList.toggle('open');
}

// Load saved endpoint from localStorage
window.onload = function () {
    const savedEndpoint = localStorage.getItem('apiEndpoint');
    if (savedEndpoint) {
        document.getElementById('apiEndpoint').value = savedEndpoint;
        addLog('info', `Đã tải endpoint: ${savedEndpoint}`);
    } else {
        const defaultEndpoint = API_CONFIG.DEFAULT_ENDPOINT;
        document.getElementById('apiEndpoint').value = defaultEndpoint;
        addLog('info', `Sử dụng endpoint mặc định: ${defaultEndpoint}`);
    }
};

// Save endpoint to localStorage
function saveEndpoint() {
    const endpoint = document.getElementById('apiEndpoint').value.trim();
    if (!endpoint) {
        alert('Vui lòng nhập endpoint!');
        return;
    }

    const cleanEndpoint = endpoint.replace(/\/$/, '');
    localStorage.setItem('apiEndpoint', cleanEndpoint);
    document.getElementById('apiEndpoint').value = cleanEndpoint;

    addLog('success', `✅ Đã lưu endpoint: ${cleanEndpoint}`);
    alert('Đã lưu endpoint thành công!');
}

// Get current endpoint
function getEndpoint() {
    const saved = localStorage.getItem('apiEndpoint');
    return saved || document.getElementById('apiEndpoint').value.trim().replace(/\/$/, '');
}

// Fetch order detail
async function fetchOrderDetail() {
    const ghnCode = document.getElementById('orderIdInput').value.trim();

    if (!ghnCode) {
        alert('Vui lòng nhập Mã GHN!');
        addLog('error', '❌ Lỗi: Chưa nhập Mã GHN');
        return;
    }

    const endpoint = getEndpoint();
    const url = `${endpoint}/api/Order/shipper-detail?GHNCode=${encodeURIComponent(ghnCode)}`;

    addLog('info', `🔄 Đang lấy thông tin đơn hàng: ${ghnCode}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (response.ok && (result.data || result.Data)) {
            const orderData = result.data || result.Data;
            displayOrderDetail(orderData);
            addLog('success', `✅ Đã tải thông tin đơn hàng - Status: ${orderData.status || orderData.Status}`);
        } else {
            const errorMsg = result.message || result.Message || response.statusText;
            addLog('error', `❌ Lỗi: ${errorMsg}`);
            alert(`Không thể lấy thông tin đơn hàng: ${errorMsg}`);
        }
    } catch (error) {
        addLog('error', `❌ Lỗi kết nối: ${error.message}`);
        alert(`Lỗi kết nối: ${error.message}`);
        console.error('Error:', error);
    }
}

// Display order detail - CHỈ 3 THÔNG TIN
function displayOrderDetail(order) {
    const section = document.getElementById('orderDetailSection');
    const content = document.getElementById('orderDetailContent');

    section.style.display = 'block';

    const getStatusClass = (status) => {
        return `status-${(status || '').toLowerCase().replace(/ /g, '_')}`;
    };

    const getValue = (obj, key) => {
        return obj[key] || obj[key.charAt(0).toLowerCase() + key.slice(1)] || obj[key.charAt(0).toUpperCase() + key.slice(1)];
    };

    // Chuyển đổi status sang tiếng Việt
    const translateStatus = (status) => {
        const statusMap = {
            'Pending': 'Chờ Xác Nhận',
            'Confirmed': 'Đã Xác Nhận',
            'ReadyToPick': 'Sẵn Sàng Lấy Hàng',
            'Picking': 'Đang Lấy Hàng',
            'Picked': 'Đã Lấy Hàng',
            'Storing': 'Đang Nhập Kho',
            'Transporting': 'Đang Vận Chuyển',
            'Sorting': 'Đang Phân Loại',
            'Delivering': 'Đang Giao Hàng',
            'Delivered': 'Đã Giao Hàng',
            'Received': 'Đã Nhận Hàng',
            'DeliveryFail': 'Giao Hàng Thất Bại',
            'Returning': 'Đang Hoàn Hàng',
            'Returned': 'Đã Hoàn Hàng',
            'Exception': 'Gặp Sự Cố',
            'Damage': 'Hàng Hư Hỏng',
            'Lost': 'Hàng Thất Lạc',
            'Cancelled': 'Đã Hủy',
            'Refunded': 'Đã Hoàn Tiền'
        };
        return statusMap[status] || status;
    };

    const currentStatus = getValue(order, 'status');
    const vietnameseStatus = translateStatus(currentStatus);

    // CHỈ HIỂN THỊ 3 THÔNG TIN
    let html = `
        <div class="detail-grid">
            <div class="detail-item">
                <div class="detail-label">🆔 Order ID</div>
                <div class="detail-value">${getValue(order, 'id')}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">📦 Mã GHN</div>
                <div class="detail-value">${getValue(order, 'ghnorderCode') || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">📊 Trạng thái</div>
                <div class="detail-value">
                    <span class="status-badge ${getStatusClass(currentStatus)}">${vietnameseStatus}</span>
                </div>
            </div>
        </div>
    `;

    // Order History
    const orderHistories = getValue(order, 'orderHistories') || [];
    if (orderHistories && orderHistories.length > 0) {
        html += `
            <div class="order-history">
                <h3>📜 Lịch sử đơn hàng (${orderHistories.length} records)</h3>
        `;

        const sortedHistories = [...orderHistories].sort((a, b) => {
            const timeA = getValue(a, 'time') || getValue(a, 'createdAt') || '';
            const timeB = getValue(b, 'time') || getValue(b, 'createdAt') || '';
            return timeB.localeCompare(timeA);
        });

        sortedHistories.forEach(history => {
            const description = getValue(history, 'description') || getValue(history, 'status') || 'N/A';
            const time = getValue(history, 'time') || getValue(history, 'createdAt') || 'N/A';
            const note = getValue(history, 'note');

            html += `
                <div class="history-item">
                    <div class="history-time">🕐 ${time}</div>
                    <div class="history-status">📊 ${description}</div>
                    ${note ? `<div style="margin-top: 5px; font-size: 13px; color: #6c757d;">📝 ${note}</div>` : ''}
                </div>
            `;
        });

        html += `</div>`;
    }

    content.innerHTML = html;
}

// Add log entry
function addLog(type, message) {
    const logContainer = document.getElementById('logContainer');
    if (!logContainer) return; // Skip if log container doesn't exist

    const timestamp = new Date().toLocaleTimeString('vi-VN');

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.innerHTML = `
        <span class="log-timestamp">[${timestamp}]</span>
        <span>${message}</span>
    `;

    logContainer.insertBefore(logEntry, logContainer.firstChild);
}

// Clear log
function clearLog() {
    const logContainer = document.getElementById('logContainer');
    if (!logContainer) return;

    logContainer.innerHTML = '';
    addLog('info', 'Đã xóa tất cả log');
}

// Call API - MATCHING OLD STRUCTURE
async function callApi(action) {
    const ghnCode = document.getElementById('orderIdInput').value.trim();

    if (!ghnCode) {
        alert('Vui lòng nhập Mã GHN!');
        addLog('error', '❌ Lỗi: Chưa nhập Mã GHN');
        return;
    }

    const endpoint = getEndpoint();
    const url = `${endpoint}/api/Order/${action}`;

    const button = event.target;
    button.disabled = true;
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading"></span> Đang xử lý...';

    addLog('info', `🔄 Đang gọi API: ${action} cho Mã GHN: ${ghnCode}`);

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ghnCode)
        });

        const data = await response.json();

        if (response.ok) {
            const successMsg = data.message || data.Message || 'Đã cập nhật trạng thái thành công!';
            addLog('success', `✅ Thành công: ${action} - ${successMsg}`);

            // Show success alert if enabled
            if (API_CONFIG.SHOW_SUCCESS_ALERT) {
                alert(`✅ Cập nhật thành công!\n\n${successMsg}`);
            }

            // Auto refresh after delay if enabled
            if (API_CONFIG.AUTO_REFRESH_AFTER_UPDATE) {
                setTimeout(() => {
                    fetchOrderDetail();
                }, API_CONFIG.AUTO_REFRESH_DELAY);
            }
        } else {
            const errorMsg = data.message || data.Message || response.statusText;
            addLog('error', `❌ Lỗi: ${action} - ${errorMsg}`);

            // Show error alert if enabled
            if (API_CONFIG.SHOW_ERROR_ALERT) {
                alert(`❌ Cập nhật thất bại!\n\n${errorMsg}`);
            }
        }
    } catch (error) {
        addLog('error', `❌ Lỗi kết nối: ${error.message}`);
        console.error('Error:', error);
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// Keyboard shortcut
document.addEventListener('DOMContentLoaded', function () {
    const orderInput = document.getElementById('orderIdInput');
    if (orderInput) {
        orderInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                fetchOrderDetail();
            }
        });
    }
});