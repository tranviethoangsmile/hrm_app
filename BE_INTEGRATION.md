# Hướng dẫn tích hợp Backend (BE Integration Guide)

Tài liệu này mô tả cách frontend (`hrm_app`) đang gọi API, và những endpoint backend cần xây dựng để thay mock data. Mọi request đều đi qua `src/services/apiClient.js` (interceptor tự gắn `Authorization: Bearer <token>` và tự đăng xuất khi 401/403).

> **Trạng thái:** toàn bộ màn hình HRM mới (P3–P5) hiện dùng **mock data** trong file. Tài liệu này là "hợp đồng API" giữa FE và BE — BE trả đúng shape dưới đây là FE render được ngay mà không cần sửa UI.

---

## 1. Quy ước chung

- Base URL: `BASE_URL + PORT + API + VERSION + V1` (xem `src/utils/constans.js`).
- Authentication: header `Authorization: Bearer <jwt>` (tự gắn qua `apiClient`).
- Response envelope chuẩn:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

- Lỗi: HTTP 401 (hết hạn token → app tự đăng xuất), 403 (thiếu quyền → alert), 4xx/5xx (message trả trong `message` hoặc body).

| Màn hình | File | Mock→BE | Endpoint |
|---|---|---|---|
| Lịch làm việc | `src/screens/Schedule.js` | `SHIFT_PATTERN` + API ngày nghỉ (đã có) | `GET /schedule?user_id&month` |
| Thẻ nhân viên | `src/screens/IDCard.js` | `useUserProfile` (đã có) + QR | `GET /users/:id` |
| Danh bạ | `src/screens/Directory.js` | `MOCK_*` | `GET /department` + `GET /users/by-department` |
| Tài liệu | `src/screens/Docs.js` | `MOCK_*` | `GET /documents` |
| Xu hướng lương | `src/screens/SalaryTrend.js` | `MOCK_MONTHS` | `GET /payroll/history?user_id&months=6` |
| Phê duyệt | `src/screens/Approvals.js` | `MOCK_LEAVE`/`MOCK_OVERTIME` | `GET /approvals/pending?user_id` + `POST /approvals/:id/{approve,reject}` |
| Đổi mật khẩu | `src/screens/ChangePassword.js` | mock submit | `POST /auth/change-password` |
| Sửa hồ sơ | `src/screens/EditProfile.js` | mock save | `PUT /users/:id` |
| Hỗ trợ | `src/screens/Support.js` | FAQ tĩnh | `GET /support/faq` |
| Học tập | `src/screens/Learning.js` | `MOCK_COURSES` | `GET /trainings?user_id` |
| Lịch sử phiếu lương | `src/screens/PayslipHistory.js` | `MOCK_MONTHS` | `GET /payroll/history?user_id&months=6` |
| Tổng hợp chấm công | `src/screens/AttendanceSummary.js` | `MOCK_SUMMARIES` | `GET /attendance/summary?user_id&month` |
| Khảo sát | `src/screens/Survey.js` | `MOCK_SURVEYS` | `GET /surveys` + `POST /surveys/:id/answer` |
| Phúc lợi | `src/screens/Benefits.js` | `MOCK_*` | `GET /benefits` |
| Sơ đồ tổ chức | `src/screens/OrgChart.js` | `MOCK_ORG` | `GET /department` + `GET /users/by-department` |
| Đánh giá hiệu quả | `src/screens/Performance.js` | `MOCK_KPIS`/`MOCK_MANAGER_NOTE` | `GET /performances/self?period&user_id` + `POST /performances/self` |
| Giới thiệu nhân viên | `src/screens/Referral.js` | `MOCK_JOBS` | `GET /referrals/jobs` + `POST /referrals` |
| Đổi ca | `src/screens/ShiftSwap.js` | `MOCK_COLLEAGUES` | `GET /shifts?user_id&week` + `POST /shift-swaps` |
| Tài sản | `src/screens/Asset.js` | `MOCK_ASSETS` | `GET /assets?user_id` + `POST /assets/:id/return` |
| Báo cáo/Inventory | `src/screens/Report.js` | dùng `apiClient` (đã fix 401) | `POST .../inventory/search` + `POST .../daily-report/get-all` |

---

## 2. Nguyên tắc ưu tiên BE

1. **Bắt buộc bảo mật:** mọi endpoint dưới đây PHẢI yêu cầu JWT hợp lệ. App đã gắn sẵn token — chỉ cần BE kiểm tra.
2. **Phân quyền:** menu lớn đã ẩn theo role ở FE (`minRole` trong `FeatureTab.js`), BE vẫn phải tự kiểm quyền.
3. **Trả đúng shape:** FE đã viết sẵn mapping theo key mô tả — đừng đổi tên field.

---

## 3. Đặc tả endpoint chi tiết (nhóm HRM mới P5)

### 3.1 Sơ đồ tổ chức — OrgChart

`GET /department` → `GET /users/by-department`

```json
// GET /users/by-department (body: {"department_id": 1})
{
  "success": true,
  "data": { "departments": [
    { "id": 1, "name": "Sản xuất Kim loại", "members": [
      { "id": 10, "full_name": "Nguyễn Văn A", "position": "Trưởng nhóm" }
    ]}
  ]}
}
```

### 3.2 Đánh giá hiệu quả — Performance

`GET /performances/self?user_id&period=H1-2026`

```json
{
  "success": true,
  "data": {
    "period": "H1-2026",
    "kpis": [
      { "key": "productivity", "score": 92 },
      { "key": "quality", "score": 88 },
      { "key": "attendance", "score": 95 },
      { "key": "teamwork", "score": 90 }
    ],
    "manager_note": "Great job this period.",
    "submitted": false
  }
}
```

`POST /performances/self` — body: `{"period":"H1-2026", "rates": {"progress":5, "quality":4, "attitude":5}}`

### 3.3 Giới thiệu nhân viên — Referral

`GET /referrals/jobs`

```json
{
  "success": true,
  "data": { "jobs": [
    { "id": 1, "title": "Kỹ sư QC", "open": true, "bonus": 1000000 }
  ], "total_bonus": 2000000 }
}
```

`POST /referrals` — body: `{"job_id":1, "candidate_name":"...", "candidate_phone":"...", "candidate_email":"..."}`

### 3.4 Đổi ca — ShiftSwap

`GET /shifts?user_id&week=2026-33`

```json
{
  "success": true,
  "data": { "week": [
    { "date": "2026-08-17", "shift": "A", "off": false },
    { "date": "2026-08-22", "off": true }
  ]}
}
```

`POST /shift-swaps` — body: `{"date":"2026-08-19", "target_shift":"day", "colleague_id":2, "reason":"..."}`

### 3.5 Tài sản — Asset

`GET /assets?user_id`

```json
{
  "success": true,
  "data": { "assets": [
    { "id": 1, "code": "PC-0012", "name": "Máy tính PC01",
      "status": "in_use", "issued": "2026-01-15" }
  ]}
}
```

`status` enum: `available | in_use | broken | returned`.

`POST /assets/:id/return` → `{"success":true}`

---

## 4. Translator hiện tại — không cần BE dịch

`src/services/translator.js` gọi trực tiếp MyMemory REST API cho text translation.
STT và TTS vẫn là các thành phần native độc lập trong app:

- STT: `@react-native-voice/voice`.
- Translation: `MyMemoryTranslationService`.
- TTS: `react-native-tts`, đọc bản dịch bằng ngôn ngữ đích.

Không dùng Google Translate, OpenAI, Gemini, DeepSeek, ElevenLabs hoặc backend
interpreter cho pipeline hiện tại.

### 4.1 Giới hạn phạm vi

Translator không có dependency BE trong phiên bản hiện tại. Nếu sau này cần
thay MyMemory bằng backend, đó là một dự án riêng và không được đưa API provider
hoặc secret vào UI/mobile bundle.

---

## 5. Checklist khi gắn BE

- [ ] Mọi endpoint yêu cầu JWT (đã có `Authorization` từ `apiClient`).
- [ ] Trả `{success, data, message}` đúng shape.
- [ ] Field name khớp mô tả trong §3/§4 (không đổi key).
- [ ] 403 vs 404 phân biệt đúng (user không có quyền ≠ không tồn tại).
