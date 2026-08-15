# HRM App — Hệ thống thiết kế & Roadmap tính năng HRM

## 1. Design System

### 1.1 Màu sắc (brand: Indigo → Violet)

Nguồn sự thật: `src/config/theme.js` (LIGHT_COLORS / DARK_COLORS).

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `primary` | `#4F46E5` | `#818CF8` | Nút chính, link, trạng thái active |
| `primary2` | `#7C3AED` | `#A78BFA` | Điểm nhấn thứ cấp |
| `primaryLight` | `#EEF2FF` | `#1E1B4B` | Nền badge/icon tint nhạt |
| `primaryGradient` | `[#4F46E5, #7C3AED]` | `[#6366F1, #8B5CF6]` | Gradient header/hero card |
| `background` | `#FFFFFF` | `#0F172A` | Nền màn hình |
| `surface` | `#FFFFFF` | `#111827` | Card nổi |
| `text` / `textSecondary` | `#0F172A` / `#64748B` | `#F8FAFC` / `#94A3B8` | Chữ chính/phụ |
| `border` | `#E2E8F0` | `#1F2937` | Viền card/input |
| `success` / `warning` / `danger` | `#10B981` / `#F59E0B` / `#EF4444` | `#34D399` / `#FBBF24` / `#F87171` | Trạng thái |

**Quy tắc:** header màn hình dùng `LinearGradient colors={colors.primaryGradient}`. Icon tint dùng `itemColor + '22'` làm nền. KHÔNG hardcode `#667eea/#764ba2` nữa.

### 1.2 Spacing, radius, shadow

- Spacing theo lưới 8pt: `SIZES.space1..space8` (4/8/12/16/20/24/32).
- Radius: `SIZES.radiusSm (10) / radius (14) / radiusLg (22)`.
- Shadow: `SHADOWS.light/medium/dark` — mềm, bóng màu `#0F172A`; gradient card dùng shadow màu `primary` opacity ~0.25.

### 1.3 Component conventions

- Tất cả component phải chạy đúng cả light + dark mode qua `useTheme()` → `colors`.
- Common components: `src/components/common/`
  - `Header` — header gradient + back (dùng `colors.primaryGradient`).
  - `Card` — nền `colors.surface`, viền `colors.border`.
  - `Button` — variants primary/outline/ghost/success, đọc màu từ theme.
  - `StatCard` — card thống kê icon + label + value + sub.
  - `SectionHeader` — tiêu đề nhóm dạng pill gradient.
  - `AttendanceCalendar`, `MediaViewer`, `Input`…

### 1.4 Pattern màn hình (screen)

```
View (bg = colors.background)
├─ Header (title + onBack)
└─ ScrollView (padding 16)
   ├─ Hero card (LinearGradient primaryGradient, radius 22)
   ├─ SectionHeader + rows
   └─ pendingNote (chờ API)
```

### 1.5 Navigation

- Chuyển hướng SAU khi đã đăng nhập luôn dùng **reset** stack, KHÔNG `navigate`/`replace`:
  `navigation.reset({index: 0, routes: [{name: 'Main'}]})`
- Điểm áp dụng: `Splash`, `Login`, `FirstLoginPassword`, logout (`Control.js` → `clearSession`), 401 interceptor (`apiClient.js`).
- Lý do: tránh tích lũy stack `[Splash, Language, Login, Main]` làm back lòi ra màn hình đăng nhập cũ.

---

## 2. Roadmap tính năng HRM mới

Trạng thái chung: **UI shell hoàn chỉnh, mock data — chờ BE gắn API**. Người dùng xử lý BE; mỗi feature đã register trong `MainNavigator` và xuất hiện trong `FeatureTab`.

| Feature | Screen | File | Trạng thái BE | Endpoint gợi ý |
|---|---|---|---|---|
| Lịch làm việc | `Schedule` | `src/screens/Schedule.js` | Chưa có — cần `GET /schedule?user_id&month` | `CHECKIN/SEARCH` theo ca (đã có) hoặc bảng shift riêng |
| Thẻ nhân viên | `IDCard` | `src/screens/IDCard.js` | Đọc từ `useUserProfile` (đã có sẵn dữ liệu) + cần QR chứa thông tin nhân viên | `GET /users/:id` |
| Danh bạ | `Directory` | `src/screens/Directory.js` | Chưa có — cần `GET /users/by-department` | `GET /department` + `GET /users/by-field` |
| Tài liệu & Hướng dẫn | `Docs` | `src/screens/Docs.js` | Chưa có — cần `GET /documents` | `INFORMATION` public hoặc bảng documents mới |
| Xu hướng lương | `SalaryTrend` | `src/screens/SalaryTrend.js` | Chưa có — cần `GET /payroll/history?user_id&months=6` | `PAYROLL/SEARCH` (có thể dùng dữ liệu sẵn của Salary) |
| Phê duyệt | `Approvals` | `src/screens/Approvals.js` | Chưa có — cần `GET /approvals/pending?user_id` + `POST /approvals/:id/{approve,reject}` | Quản lý đơn nghỉ phép/tăng ca hiện có |
| Đổi mật khẩu | `ChangePassword` | `src/screens/ChangePassword.js` | Chưa có — cần `POST /auth/change-password` | Endpoint auth mới |
| Sửa hồ sơ | `EditProfile` | `src/screens/EditProfile.js` | Chưa có — cần `PUT /users/:id` (giới hạn field được phép sửa) | `USER_URL` hiện có, mở quyền self-edit |
| Hỗ trợ & FAQ | `Support` | `src/screens/Support.js` | Tĩnh (FAQ + contact) — có thể gắn `GET /support/faq` | Bảng FAQ mới |
| Học tập / Đào tạo | `Learning` | `src/screens/Learning.js` | Chưa có — cần `GET /trainings?user_id` | Bảng trainings/courses mới |
| Lịch sử phiếu lương | `PayslipHistory` | `src/screens/PayslipHistory.js` | Chưa có — cần `GET /payroll/history?user_id&months=6` | `PAYROLL/SEARCH` |
| Tổng hợp chấm công | `AttendanceSummary` | `src/screens/AttendanceSummary.js` | Chưa có — cần `GET /attendance/summary?user_id&month` | `CHECKIN/SEARCH` tổng hợp |
| Khảo sát nội bộ | `Survey` | `src/screens/Survey.js` | Chưa có — cần `GET /surveys` + `POST /surveys/:id/answer` | Bảng surveys mới |
| Phúc lợi | `Benefits` | `src/screens/Benefits.js` | Tĩnh — có thể gắn `GET /benefits` | Bảng benefits mới |
| Sơ đồ tổ chức | `OrgChart` | `src/screens/OrgChart.js` | Chưa có — cần `GET /department` + `GET /users/by-department` | `GET /department` (giống Directory) |
| Đánh giá hiệu quả | `Performance` | `src/screens/Performance.js` | Chưa có — cần `GET /performances/self?period&user_id` + `POST /performances/self` | Bảng performance_reviews mới |
| Giới thiệu nhân viên | `Referral` | `src/screens/Referral.js` | Chưa có — cần `GET /referrals/jobs` + `POST /referrals` (gửi HR) | Bảng referrals/job_openings mới |
| Đổi ca làm | `ShiftSwap` | `src/screens/ShiftSwap.js` | Chưa có — cần `GET /shifts?user_id&week` + `POST /shift-swaps` | Bảng shift_swaps mới (dùng `A.s`/`B.s` ca hiện có) |
| Quản lý tài sản | `Asset` | `src/screens/Asset.js` | Chưa có — cần `GET /assets?user_id` + `POST /assets/:id/return` | Bảng assets/asset_assignments mới |
| Dịch thuật âm thanh | `Translator` | `src/screens/Translator.js` | Chưa có — cần `POST /translate/audio` (STT→dịch→TTS, trả `audio_url`), xem `BE_INTEGRATION.md` §4 | Google/Whisper (STT) + Translate + TTS (Google/Azure/ElevenLabs) |

### 2.1 Chi tiết từng màn hình (mock → BE)

**Schedule** (`schedule.*`)
- Hero card: ca hôm nay (ngày/đêm/nghỉ) + giờ.
- Strip 7 ngày trong tuần (ca A/B, nghỉ).
- Thay `SHIFT_PATTERN` + `getShift` bằng dữ liệu từ API; cần map `work_shift` (`NIGHT/DAY`) hiện có ở `todayCheckin`.

**IDCard** (`idcard.*`)
- Thẻ ảo: avatar, tên, mã NV, phòng ban, chức vụ, QR placeholder.
- Row chi tiết: mã NV, phòng ban, chức vụ, phone, email, địa chỉ.
- Đã nối dữ liệu thật qua `useUserProfile` + `authData`.

**Directory** (`directory.*`)
- Search theo tên/chức vụ, nhóm theo phòng ban (`SectionHeader`).
- Nút gọi: hiện đang `Alert`; nâng cấp thành `Linking.openURL('tel:...')` khi có dữ liệu thật.

**Docs** (`docs.*`)
- Grid tài liệu (chính sách, sổ tay, an toàn, quy trình) — badge "Chờ đăng tải".
- Khi BE có: render danh sách file với type (pdf/xlsx/pptx) + preview/viewer.

**SalaryTrend** (`salarytrend.*`)
- 3 summary card (TB, tháng mới nhất, thưởng) + bar chart (View thuần, không thư viện).
- Thay `MOCK_MONTHS` bằng dữ liệu payroll history thật.

**Approvals** (`approval.*`) — vùng role MANAGER/ADMIN (ẩn STAFF ở menu)
- Segmented **Nghỉ phép / Tăng ca**; mỗi đơn: tên NV, avatar initial, loại, thời gian, lý do, nút **Duyệt** (confirm) / **Từ chối** (modal lý do tùy chọn).
- Thay `MOCK_LEAVE`/`MOCK_OVERTIME` bằng `GET /approvals/pending`; hành động gọi `POST approve/reject` rồi xóa khỏi danh sách.

**ChangePassword** (`changepassword.*`) — vào từ Setting
- 3 ô mật khẩu + mắt hiện/ẩn; validate bắt buộc, ≥6 ký tự, trùng khớp. Mock submit; BE: `POST /auth/change-password`.

**EditProfile** (`editprofile.*`) — vào từ Profile (nút bút ở header)
- Họ tên read-only (do HR quản lý); sửa phone/email/address. Prefill từ `useUserProfile`. BE: `PUT /users/:id` với field cho phép.

**Learning** (`learning.*`) — file trước đây trống, đã hoàn thiện
- Hero tiến độ tổng (X/Y bài) + danh sách khóa học (icon gradient, số bài, progress bar, badge Hoàn thành).
- Thay `MOCK_COURSES` bằng `GET /trainings`; mỗi course có `lessons`, `completed_lessons`.

**PayslipHistory** (`paysliph.*`)
- Danh sách tháng (Gross/Net + badge Đã trả/Chờ trả); tap mở rộng Thu nhập/Khấu trừ.
- Thay `MOCK_MONTHS` bằng `GET /payroll/history`; detail mở rộng từ response.

**AttendanceSummary** (`attsum.*`)
- Hero month + prev/next; 4 stat (ngày công, OT, trễ, nghỉ) + breakdown theo tuần.
- Thay `MOCK_SUMMARIES` bằng `GET /attendance/summary?user_id&month`.

**Survey** (`survey.*`)
- Danh sách khảo sát (badge Đang mở/Đã đóng, deadline); modal câu hỏi 4 mức + submit.
- Thay `MOCK_SURVEYS`/`MOCK_OPTIONS` bằng `GET /surveys` + `POST /surveys/:id/answer`.

**Benefits** (`benefits.*`)
- 6 phúc lợi mở rộng mô tả; tĩnh, có thể gắn `GET /benefits`.

**Support** (`support.*`) — vào từ Setting
- Liên hệ (call/email qua `Linking`) + FAQ accordion. Có thể gắn `GET /support/faq` khi BE có.

**OrgChart** (`orgchart.*`)
- Hero: tổng phòng ban + tổng thành viên; danh sách phòng ban icon gradient, tap mở rộng member list.
- Thay `MOCK_ORG` bằng `GET /department` + `GET /users/by-department`.

**Performance** (`performance.*`)
- Hero kỳ đánh giá (H1/H2); KPI mock (năng suất, chất lượng, chuyên cần, teamwork); self-review 1–5 + manager note.
- Thay `MOCK_KPIS`/`MOCK_MANAGER_NOTE` bằng `GET /performances/self?period`; submit gọi `POST /performances/self`.

**Referral** (`referral.*`)
- Hero tổng thưởng + số vị trí đang tuyển; danh sách job (badge Đang tuyển/Đã đóng, bonus VND); modal giới thiệu (họ tên, SĐT, email).
- Thay `MOCK_JOBS` bằng `GET /referrals/jobs`; modal submit gọi `POST /referrals`.

**ShiftSwap** (`shiftswap.*`)
- Strip 7 ngày hiện tại (ca A/B, đỏ = nghỉ cuối tuần) — dùng `A.s`/`B.s`; chọn ca mục tiêu ngày/đêm; chọn đồng nghiệp; lý do; submit.
- Thay `WEEK_DAYS_KEY`/`MOCK_COLLEAGUES` bằng `GET /shifts?user_id&week`; submit gọi `POST /shift-swaps`.

**Asset** (`asset.*`)
- Hero 3 stat (tổng, đang dùng, hỏng); danh sách tài sản (icon gradient, code, ngày bàn giao, badge trạng thái); nút **Trả tài sản** với confirm Alert.
- Thay `MOCK_ASSETS` bằng `GET /assets?user_id`; trả tài sản gọi `POST /assets/:id/return`.

**Translator** (`translator.*`) — audio-in → audio-out ⭐
- **Luồng chính (voice):** giữ-nhấn mic → mock STT (`mockRecognize`) → mock dịch (`translateText`) → **tự phát lại bằng giọng nói ngôn ngữ đích** (`mockSynthesize` + `synthDurationMs`). Người dùng chọn ngôn ngữ đích = ngôn ngữ nhận lại âm thanh.
- Card kết quả đích có **audio row**: trạng thái "Đang phát âm..." + waveform animation + nút Play/Stop; văn bản vẫn hiển thị kèm Copy.
- Chế độ text giữ nguyên (TextInput + Dịch), cũng phát âm kết quả.
- Khi BE có: thay mock bằng `POST /translate/audio` (multipart) → phát `audio_url` bằng `react-native-sound`/`expo-av`; xem `BE_INTEGRATION.md` §4.

### 2.2 i18n

Mọi key mới phải thêm đủ **4 locale**: `locales/{vi,en,ja,pt}.json`. Namespace hiện tại: `schedule.*`, `idcard.*`, `directory.*`, `docs.*`, `salarytrend.*`, `approval.*`, `changepassword.*`, `editprofile.*`, `support.*`, `learning.*`, `paysliph.*`, `attsum.*`, `survey.*`, `benefits.*`, `orgchart.*`, `performance.*`, `referral.*`, `shiftswap.*`, `asset.*`, `translator.*`, `feat.cat.hrm`.

---

## 3. Verification checklist

- `node` + `@babel/core` parse từng file đã đổi (KHÔNG dùng `npx babel` — máy có babel 5 cũ).
- `npx eslint --fix` trên các file mới/sửa → 0 error.
- `JSON.parse` các file locale.
- Cập nhật `TODO.md` + `SKILL.md` sau mỗi milestone.
