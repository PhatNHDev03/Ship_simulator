// =============================================================================
// FILE CẤU HÌNH API - CHỈ SỬA Ở ĐÂY KHI THAY ĐỔI PORT HOẶC SERVER
// =============================================================================

const API_CONFIG = {
    // Thay đổi port hoặc địa chỉ server tại đây
    DEFAULT_ENDPOINT: 'http://localhost:5000',

    // Hoặc sử dụng các môi trường khác nhau:
    // DEFAULT_ENDPOINT: 'http://localhost:5219',
    // DEFAULT_ENDPOINT: 'http://192.168.1.100:5000',
    // DEFAULT_ENDPOINT: 'https://api.yourserver.com',

    // Timeout cho các request (milliseconds)
    REQUEST_TIMEOUT: 30000,

    // Có tự động refresh sau khi cập nhật không?
    AUTO_REFRESH_AFTER_UPDATE: true,
    AUTO_REFRESH_DELAY: 500, // milliseconds

    // Hiển thị thông báo alert khi cập nhật thành công?
    SHOW_SUCCESS_ALERT: true,

    // Hiển thị thông báo alert khi cập nhật thất bại?
    SHOW_ERROR_ALERT: false, // false = chỉ log, không popup
};

// Export để sử dụng trong app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}