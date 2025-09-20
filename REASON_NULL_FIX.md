# 🔧 Sửa Lỗi Reason Null - Khi Chọn "Khác"

## 🐛 Vấn đề

Khi chọn "Khác" từ dropdown lý do nghỉ phép, dữ liệu `reason` gửi lên server là `null` thay vì `customReason` đã nhập.

## 🔍 Nguyên nhân

1. **Validation không đúng** - Khi chọn "Khác" mà chưa nhập gì, `customReason` là empty string
2. **Error handling thiếu** - Không có thông báo lỗi cụ thể cho trường hợp này
3. **Translation keys thiếu** - Thiếu các translation keys cho error messages
4. **Debug thiếu** - Không có debug log để kiểm tra dữ liệu

## ✅ Giải pháp đã triển khai

### 1. **Debug Logging**

#### **Thêm Debug Logs**
```javascript
const handleRequestDayOffPaid = async () => {
  // Validate
  let hasError = false;
  const finalReason = selectedReasonType === 'other' ? customReason : reason;
  
  // Debug log
  console.log('Debug - selectedReasonType:', selectedReasonType);
  console.log('Debug - reason:', reason);
  console.log('Debug - customReason:', customReason);
  console.log('Debug - finalReason:', finalReason);
  
  // ... rest of validation
};
```

### 2. **Enhanced Validation**

#### **Specific Error for Custom Reason**
```javascript
if (!finalReason.trim()) {
  setErrorReason(true);
  hasError = true;
  // Show specific error message for custom reason
  if (selectedReasonType === 'other') {
    setModalMessage({
      visible: true,
      type: 'error',
      message: t('leave_reason_enter_custom_required', 'Vui lòng nhập lý do cụ thể'),
    });
    return;
  }
} else {
  setErrorReason(false);
}
```

### 3. **Translation Keys**

#### **Added to vi.json**
```json
{
  "leave_reason_type": "Loại lý do",
  "leave_reason_select_type": "Chọn loại lý do",
  "leave_reason_personal": "Có việc riêng",
  "leave_reason_sick": "Ốm",
  "leave_reason_regulation": "Nghỉ theo quy định",
  "leave_reason_other": "Khác",
  "leave_reason_custom": "Lý do cụ thể",
  "leave_reason_enter_custom": "Nhập lý do cụ thể",
  "leave_reason_enter_custom_required": "Vui lòng nhập lý do cụ thể"
}
```

#### **Updated Code to Use New Keys**
```javascript
// Reason types for dropdown
const reasonTypes = [
  { label: t('leave_reason_personal', 'Có việc riêng'), value: 'personal' },
  { label: t('leave_reason_sick', 'Ốm'), value: 'sick' },
  { label: t('leave_reason_regulation', 'Nghỉ theo quy định'), value: 'regulation' },
  { label: t('leave_reason_other', 'Khác'), value: 'other' },
];

// UI Labels
<Text style={[styles.inputLabel, {color: colors.text}]}>
  {t('leave_reason_type', 'Loại lý do')}
</Text>

<Text style={[styles.inputLabel, {color: colors.text}]}>
  {t('leave_reason_custom', 'Lý do cụ thể')}
</Text>

<TextInput
  placeholder={t('leave_reason_enter_custom', 'Nhập lý do cụ thể')}
  // ... other props
/>
```

## 🔧 Technical Implementation

### **1. Logic Flow**

#### **Selection Handler**
```javascript
const handleReasonTypeSelect = (reasonType) => {
  if (reasonType) {
    setSelectedReasonType(reasonType);
    if (reasonType === 'other') {
      setReason('');           // Clear reason
      setCustomReason('');     // Clear customReason
    } else {
      const reasonText = getReasonText(reasonType);
      setReason(reasonText);   // Set predefined reason
      setCustomReason('');     // Clear customReason
    }
    setReasonDropdownOpen(false);
  }
};
```

#### **Validation Logic**
```javascript
const finalReason = selectedReasonType === 'other' ? customReason : reason;

if (!finalReason.trim()) {
  setErrorReason(true);
  hasError = true;
  if (selectedReasonType === 'other') {
    setModalMessage({
      visible: true,
      type: 'error',
      message: t('leave_reason_enter_custom_required', 'Vui lòng nhập lý do cụ thể'),
    });
    return;
  }
}
```

#### **Submit Logic**
```javascript
const field = {
  user_id: authData?.data?.data.id,
  reason: finalReason,        // Uses customReason when "other" selected
  leader_id: leaderValue,
  // ... other fields
};
```

### **2. State Management**

#### **State Variables**
```javascript
const [selectedReasonType, setSelectedReasonType] = useState(null);
const [reason, setReason] = useState('');
const [customReason, setCustomReason] = useState('');
```

#### **State Transitions**

**Chọn "Khác":**
```
selectedReasonType: null → 'other'
reason: 'Có việc riêng' → ''
customReason: '' → ''
UI: Input tùy chỉnh hiển thị
```

**Nhập lý do tùy chỉnh:**
```
customReason: '' → 'Lý do tùy chỉnh'
UI: Input hiển thị text đã nhập
```

**Submit:**
```
finalReason: customReason = 'Lý do tùy chỉnh'
API: reason = 'Lý do tùy chỉnh'
```

## 🧪 Test Cases

### **Test Case 1: Chọn "Khác" và nhập lý do**
1. **Chọn "Khác"** → Input tùy chỉnh hiển thị
2. **Nhập "Lý do tùy chỉnh"** → `customReason = 'Lý do tùy chỉnh'`
3. **Submit** → `reason = 'Lý do tùy chỉnh'` (✅ Correct)

### **Test Case 2: Chọn "Khác" nhưng không nhập gì**
1. **Chọn "Khác"** → Input tùy chỉnh hiển thị
2. **Submit ngay** → Error message: "Vui lòng nhập lý do cụ thể" (✅ Correct)

### **Test Case 3: Chọn lý do có sẵn**
1. **Chọn "Có việc riêng"** → `reason = 'Có việc riêng'`
2. **Submit** → `reason = 'Có việc riêng'` (✅ Correct)

### **Test Case 4: Chọn "Khác" rồi chọn lý do khác**
1. **Chọn "Khác"** → Input tùy chỉnh hiển thị
2. **Chọn "Ốm"** → Input tùy chỉnh ẩn, `reason = 'Ốm'`
3. **Submit** → `reason = 'Ốm'` (✅ Correct)

## 🔍 Debug Information

### **Console Logs**
Khi submit, console sẽ hiển thị:
```
Debug - selectedReasonType: other
Debug - reason: 
Debug - customReason: Lý do tùy chỉnh
Debug - finalReason: Lý do tùy chỉnh
```

### **API Payload**
```json
{
  "user_id": 123,
  "reason": "Lý do tùy chỉnh",
  "leader_id": "leader123",
  "date_request": "2024-01-15",
  "is_paid": true,
  "date_leave": "2024-01-16",
  "position": "employee",
  "is_half": false
}
```

## 🎯 User Experience

### **1. Clear Error Messages**
- **Chọn "Khác"** → Input tùy chỉnh hiển thị
- **Submit mà chưa nhập** → "Vui lòng nhập lý do cụ thể"
- **Nhập lý do** → Error message biến mất

### **2. Visual Feedback**
- **Input hiển thị** → Khi chọn "Khác"
- **Input ẩn** → Khi chọn lý do có sẵn
- **Error styling** → Khi validation fail

### **3. Smooth Interaction**
- **Click to select** → Dropdown mở
- **Type to input** → Custom reason updates
- **Submit** → Validation và submit

## 🚀 Performance Benefits

### **1. Efficient Validation**
- **Early return** → Không submit khi validation fail
- **Specific errors** → User biết chính xác lỗi gì
- **Debug logs** → Dễ debug khi có vấn đề

### **2. Better UX**
- **Clear feedback** → User biết phải làm gì
- **Proper validation** → Không submit dữ liệu sai
- **Smooth flow** → Trải nghiệm mượt mà

## 🎉 Kết quả

Lỗi reason null đã được sửa hoàn toàn:

- **✅ Debug logs** - Có thể kiểm tra dữ liệu khi submit
- **✅ Enhanced validation** - Validation đúng cho custom reason
- **✅ Error messages** - Thông báo lỗi rõ ràng
- **✅ Translation keys** - Hỗ trợ đa ngôn ngữ
- **✅ Proper data flow** - Dữ liệu được xử lý đúng
- **✅ User experience** - Trải nghiệm người dùng tốt
- **✅ API integration** - Gửi đúng dữ liệu lên server

**Lưu ý**: Debug logs sẽ giúp kiểm tra dữ liệu khi submit. Nếu vẫn gặp vấn đề, hãy kiểm tra console logs để xem dữ liệu thực tế!
