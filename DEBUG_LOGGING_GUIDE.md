# 🔍 Hướng Dẫn Debug Logging - Kiểm Tra Dữ Liệu Gửi Lên Server

## 🎯 Mục đích

Thêm logging để kiểm tra dữ liệu gửi lên server và response trả về, giúp debug các vấn đề về API integration.

## ✅ Logging đã thêm

### 1. **Debug Logs cho Validation**

#### **Validation Debug**
```javascript
// Debug log
console.log('Debug - selectedReasonType:', selectedReasonType);
console.log('Debug - reason:', reason);
console.log('Debug - customReason:', customReason);
console.log('Debug - finalReason:', finalReason);
```

### 2. **Request Logs**

#### **Dữ liệu gửi lên server**
```javascript
// Log dữ liệu gửi lên server
console.log('=== DỮ LIỆU GỬI LÊN SERVER ===');
console.log('Field data:', JSON.stringify(field, null, 2));
console.log('API URL:', `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${CREATE}`);
console.log('================================');
```

#### **Response từ server**
```javascript
// Log response từ server
console.log('=== RESPONSE TỪ SERVER ===');
console.log('Status:', paidleave?.status);
console.log('Response data:', JSON.stringify(paidleave?.data, null, 2));
console.log('==========================');
```

### 3. **Error Logs**

#### **Error khi gửi dữ liệu**
```javascript
console.error('=== ERROR KHI GỬI DỮ LIỆU ===');
console.error('Error:', error);
console.error('Error message:', error?.message);
console.error('Error response:', error?.response?.data);
console.error('Error status:', error?.response?.status);
console.error('==============================');
```

## 🔍 Cách sử dụng Debug Logs

### **1. Mở Developer Console**

#### **React Native Debugger**
1. Mở React Native Debugger
2. Chọn tab "Console"
3. Xem logs khi submit form

#### **Metro Console**
1. Mở terminal chạy Metro
2. Xem logs trong terminal
3. Logs sẽ hiển thị real-time

#### **Chrome DevTools**
1. Mở Chrome DevTools
2. Chọn tab "Console"
3. Xem logs khi submit

### **2. Test Cases để Debug**

#### **Test Case 1: Chọn lý do có sẵn**
1. **Chọn "Có việc riêng"**
2. **Submit**
3. **Xem console logs:**
```
Debug - selectedReasonType: personal
Debug - reason: Có việc riêng
Debug - customReason: 
Debug - finalReason: Có việc riêng

=== DỮ LIỆU GỬI LÊN SERVER ===
Field data: {
  "user_id": 123,
  "reason": "Có việc riêng",
  "leader_id": "leader123",
  "date_request": "2024-01-15",
  "is_paid": true,
  "date_leave": "2024-01-16",
  "position": "employee",
  "is_half": false
}
API URL: https://api.example.com/v1/paid-leave/create
================================

=== RESPONSE TỪ SERVER ===
Status: 200
Response data: {
  "success": true,
  "message": "Leave request created successfully",
  "data": {
    "id": 456,
    "status": "pending"
  }
}
==========================
```

#### **Test Case 2: Chọn "Khác" và nhập lý do**
1. **Chọn "Khác"**
2. **Nhập "Lý do tùy chỉnh"**
3. **Submit**
4. **Xem console logs:**
```
Debug - selectedReasonType: other
Debug - reason: 
Debug - customReason: Lý do tùy chỉnh
Debug - finalReason: Lý do tùy chỉnh

=== DỮ LIỆU GỬI LÊN SERVER ===
Field data: {
  "user_id": 123,
  "reason": "Lý do tùy chỉnh",
  "leader_id": "leader123",
  "date_request": "2024-01-15",
  "is_paid": true,
  "date_leave": "2024-01-16",
  "position": "employee",
  "is_half": false
}
API URL: https://api.example.com/v1/paid-leave/create
================================
```

#### **Test Case 3: Chọn "Khác" nhưng không nhập gì**
1. **Chọn "Khác"**
2. **Submit ngay**
3. **Xem console logs:**
```
Debug - selectedReasonType: other
Debug - reason: 
Debug - customReason: 
Debug - finalReason: 

// Error message hiển thị: "Vui lòng nhập lý do cụ thể"
// Không có API call vì validation fail
```

#### **Test Case 4: Error từ server**
1. **Submit form**
2. **Server trả về error**
3. **Xem console logs:**
```
=== ERROR KHI GỬI DỮ LIỆU ===
Error: AxiosError: Request failed with status code 400
Error message: Request failed with status code 400
Error response: {
  "success": false,
  "message": "Invalid data",
  "errors": {
    "reason": "Reason is required"
  }
}
Error status: 400
==============================
```

## 🔧 Troubleshooting

### **1. Vấn đề về Reason Null**

#### **Kiểm tra logs:**
```
Debug - selectedReasonType: other
Debug - reason: 
Debug - customReason: Lý do tùy chỉnh
Debug - finalReason: Lý do tùy chỉnh
```

**Nếu `finalReason` là empty:**
- Kiểm tra `customReason` có được set đúng không
- Kiểm tra logic `selectedReasonType === 'other'`

**Nếu `finalReason` có giá trị nhưng server nhận null:**
- Kiểm tra API endpoint có đúng không
- Kiểm tra field name có đúng không
- Kiểm tra server có nhận được data không

### **2. Vấn đề về API Response**

#### **Kiểm tra response logs:**
```
=== RESPONSE TỪ SERVER ===
Status: 200
Response data: {
  "success": true,
  "message": "Success",
  "data": {...}
}
==========================
```

**Nếu status không phải 200:**
- Kiểm tra API endpoint
- Kiểm tra authentication
- Kiểm tra server logs

**Nếu success = false:**
- Kiểm tra error message từ server
- Kiểm tra validation rules
- Kiểm tra data format

### **3. Vấn đề về Error Handling**

#### **Kiểm tra error logs:**
```
=== ERROR KHI GỬI DỮ LIỆU ===
Error: Network Error
Error message: Network Error
Error response: undefined
Error status: undefined
==============================
```

**Network Error:**
- Kiểm tra internet connection
- Kiểm tra API endpoint có accessible không
- Kiểm tra CORS settings

**Status 400/500:**
- Kiểm tra request data format
- Kiểm tra server validation
- Kiểm tra server logs

## 📱 Mobile Debugging

### **1. React Native Debugger**
- **Download:** [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- **Setup:** Enable debug mode trong app
- **Usage:** Xem console logs real-time

### **2. Flipper**
- **Download:** [Flipper](https://fbflipper.com/)
- **Setup:** Add Flipper plugin
- **Usage:** Xem network requests và logs

### **3. Metro Console**
- **Location:** Terminal chạy Metro
- **Usage:** Xem logs trong development
- **Filter:** Có thể filter logs theo keyword

## 🎯 Best Practices

### **1. Log Levels**
- **console.log** - General information
- **console.warn** - Warnings
- **console.error** - Errors
- **console.info** - Important information

### **2. Log Format**
- **Consistent format** - Sử dụng format nhất quán
- **Clear messages** - Messages rõ ràng, dễ hiểu
- **Structured data** - Sử dụng JSON.stringify cho objects

### **3. Performance**
- **Remove logs in production** - Xóa logs khi build production
- **Conditional logging** - Chỉ log khi cần thiết
- **Log levels** - Sử dụng log levels phù hợp

## 🎉 Kết quả

Debug logging đã được thêm hoàn chỉnh:

- **✅ Validation logs** - Kiểm tra dữ liệu validation
- **✅ Request logs** - Kiểm tra dữ liệu gửi lên server
- **✅ Response logs** - Kiểm tra response từ server
- **✅ Error logs** - Kiểm tra errors chi tiết
- **✅ Easy debugging** - Dễ dàng debug các vấn đề
- **✅ Real-time monitoring** - Monitor real-time
- **✅ Comprehensive coverage** - Bao phủ tất cả cases

**Lưu ý**: Hãy mở console và test các trường hợp khác nhau để xem logs chi tiết!
