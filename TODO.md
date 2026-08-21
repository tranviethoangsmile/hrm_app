# TODO — hrm_app

Source of truth for mobile-app implementation progress. Tasks below make the app compatible with the backend security changes (hrmMetal **TASK-001 → 004**):

> Translator scope has been reset. Do not use historical Translator entries in
> this file; `TODO_TRANSLATOR.md` is the only active Translator task list.

- **TASK-001** — all routes now require a valid JWT (except login/register).
- **TASK-002** — `GET /users` restricted to ADMIN/MANAGER; `PUT /users/:id` restricted to ADMIN/MANAGER/SELF.
- **TASK-003** — several routes restricted to ADMIN (dayoffs create/delete/update, overtime getAll, taxdependent update-status, dependent confirm).
- **TASK-004** — token/login payload shrunk (removed `is_officer`, `dob`, `employee_id`, `department`, salary fields, ...); values must now be fetched via `GET /users/:id` etc.

Mark `[x]` only when all acceptance criteria are satisfied and verified.

---

## 🟣 P0 — Redesign: Product dashboard & IA (quick wins)

Quyết định sản phẩm: giữ phong cách iOS-ish hiện tại, thống nhất component dùng chung; làm **IA + Dashboard trước**; phạm vi giai đoạn đầu = **P0 quick wins chỉ (N1–N5)**.

### REDESIGN-001 — Component thống nhất: StatCard + SectionHeader
- **File:** `src/components/common/StatCard.js` (mới), `src/components/common/SectionHeader.js` (mới)
- **Problem:** Home dashboard và FeatureTab cần bộ hiển thị dùng chung (thẻ thống kê, tiêu đề nhóm). Hiện không tồn tại — mỗi màn hình tự vẽ (HomeTab, FeatureTab) nên không nhất quán.
- **Implementation:**
  - `StatCard`: `{icon, iconColor, iconBg, label, value, sub, onPress}` — dùng `useTheme()`, `SIZES.radius`, `SIZES.padding`, không hardcode màu.
  - `SectionHeader`: `{title, subtitle?, icon?}` tiêu đề nhóm (phong cách `#667eea`/`#764ba2` dùng cho nhóm feature).
- **Acceptance criteria:**
  - [x] Component parse sạch (Babel), dùng theme light/dark.
  - [x] Không thêm lỗi eslint mới.

### REDESIGN-002 (N5) — FeatureTab: nhóm category + ô tìm kiếm
- **File:** `src/components/tabs/FeatureTab.js`
- **Problem:** Grid 9 feature trộn lẫn (inventory, order, AI, uniform, leave, plan, daily, overtime, important) không nhóm, không tìm kiếm → khó khám phá.
- **Implementation:**
  - Thêm `category` cho mỗi feature: `attendance` (Leave, OvertimeConfirm, Checkin), `work` (Order, Daily, PlanProduction, Report), `admin` (Uniform, Important), `other` (Ai — giữ `hideForRoles:['STAFF']`).
  - Render theo nhóm với `SectionHeader` + `StatCard`-style button; giữ `labelKey` i18n cũ (KHÔNG đổi key).
  - Thêm `TextInput` tìm kiếm lọc feature theo tên (khớp trên `t(labelKey)` lowercased).
  - Thêm nhãn nhóm vào cả 4 locale: `feat.cat.attendance`, `feat.cat.work`, `feat.cat.admin`, `feat.cat.other` (+ placeholder `feat.search_placeholder`).
- **Acceptance criteria:**
  - [x] Feature được nhóm theo category, nhãn nhóm đúng ngôn ngữ.
  - [x] Gõ từ khóa lọc đúng feature còn lại; xóa text hiển thị đủ.
  - [x] Ai vẫn ẩn với STAFF; không phá vỡ `navigation` của feature hiện có.
  - [x] `npm run check-i18n` pass với key mới.

### REDESIGN-003 (N1) — Home Dashboard — 🚫 HUỶ (quyết định người dùng)
- **File:** `src/components/tabs/HomeTab.js`
- **Status:** User ✖ chọn KUỐNG — không thêm khối dashboard/StatCard vào Home. Home giữ nguyên feed tin hiện tại. (Nếu sau này muốn, ứng dụng theo spec bên dưới.)
- **Implementation:**
  - Thêm khối dashboard phía trên feed (sau header gradient, trước danh sách tin): 3 `StatCard`:
    - *Chấm công hôm nay* — từ `POST checkin/search` `{user_id, date: đầu tháng}`, lọc bản ghi `date === hôm nay` → hiện "Đã chấm công" / "Chưa chấm công"; nếu `is_paid_leave` → "Nghỉ phép"; nếu weekend → "Cuối tuần". Tap → Checkin.
    - *Ngày phép còn lại* — `paid_days` từ `useUserProfile()`; **ẩn (null)** nếu backend chưa trả. Tap → Leave.
    - *Thông báo mới* — đếm chưa đọc từ same logic Main (notification searchbyid); tap → Notifications.
  - Banner ngày nghỉ nếu hôm nay thuộc `GET /dayoffs/getall` (list month hiện tại, so sánh date).
  - Hàng quick-action: Chấm công · Order · Nghỉ phép · Lương (nút dùng `SIZES`, `colors`).
  - Fetch trong `useEffect` (gộp cùng luồng hiện có, `axios` đã injected token qua `apiClient` mặc định), cache module-level nếu cần.
- **Acceptance criteria:**
  - [ ] Trạng thái chấm công hôm nay đúng (đã check-in/ngày nghỉ/cuối tuần/chưa).
  - [ ] StatCard ngày phép ẩn mềm khi `paid_days` không có trong response.
  - [ ] Đếm thông báo chưa đọc khớp logic Main.
  - [ ] Feed tin vẫn hoạt động; pull-to-refresh làm mới cả dashboard + feed.
  - [ ] Dark mode đúng (không hardcode).

### REDESIGN-004 (N2) — Hiển thị số ngày phép còn lại
- **File:** `src/screens/Leave.js` (banner), `src/screens/Profile.js` (row hồ sơ)
- **Problem:** User không biết còn bao nhiêu ngày phép năm hiện tại; `paid_days` có trong DB nhưng chưa hiện UI.
- **Implementation:**
  - `Leave.js`: banner "Còn lại X ngày phép" phía trên (dùng `useUserProfile` → `paid_days`), ẩn khi null.
  - `Profile.js`: thêm row hiển thị `paid_days` trong expanded details (từ `GET /users/:id` → `userInfo.paid_days`).
- **Phụ thuộc BE:** `GET /users/:id` phải trả `paid_days` (hrmMetal TASK-024). App ẩn mềm khi chưa có.
- **Acceptance criteria:**
  - [x] Leave & Profile hiện số ngày phép khi BE trả `paid_days`.
  - [x] Không crash khi field vắng.

### REDESIGN-005 (N3) — Lịch chấm công tháng
- **File:** `src/components/common/AttendanceCalendar.js` (mới), `src/screens/Profile.js`
- **Problem:** Danh sách check-in theo tháng khó thấy tổng quan. Muốn view dạng lịch.
- **Implementation:**
  - `AttendanceCalendar.js`: `{year, month, checkins, dayoffs}` → lưới 7 cột (moment), mỗi ngày chấm màu theo trạng thái: đi làm=blue `#4FACFE`, OT=orange `#FF9500`, phép=green `#00D4AA`, ngày nghỉ/off=xám, weekend=nhạt; highlight "hôm nay".
  - `Profile.js`: toggle **Lịch / Danh sách** trên block chấm công tháng (dữ liệu `checkin/search` + `dayoffs/getall` đã fetch).
- **Acceptance criteria:**
  - [x] Lịch render đúng ngày của tháng (kể cả tháng lệch ngày đầu tuần Chủ nhật).
  - [x] Đánh dấu đúng trạng thái theo data; tap ngày → hiện chi tiết (hoặc noop nếu không có).
  - [x] Vẫn giữ view danh sách hiện tại qua toggle.

### REDESIGN-006 (N4) — Payslip polish
- **File:** `src/screens/Salary.js`
- **Problem:** Đã là payslip (month + summary + sections) nhưng cần nhấn mạnh *Thực nhận* và dễ đọc hơn.
- **Implementation:**
  - Nhấn nổi bật `net_salary` (chữ to, màu `primary`); section *Thu nhập*/*Khấu trừ* có header rõ ràng.
  - Chip "so với tháng trước" khi có dữ liệu 2 tháng liền (fetch prev month nếu dữ liệu hiện có).
- **Acceptance criteria:**
  - [x] Net salary nổi bật; phân chia thu nhập/khấu trừ rõ ràng.
  - [x] Không đổi hành vi fetch hiện tại; tất cả function giữ nguyên.
- **Ghi chú:** chỉ làm phần polish (net 20→24 + section title accent bar) — **bỏ chip so sánh tháng trước** vì cần thêm fetch tháng liền kề, mâu thuẫn "không đổi hành vi fetch".

---

## 🔷 P1 — Modern UI + Fix navigation + Feature HRM mới

Đợt tiếp theo sau P0: nâng cấp thẩm mỹ (brand Indigo→Violet), sửa lỗi navigation, thêm màn hình chức năng HRM mới (UI shell, mock data, chờ BE).

### UI-001 — Fix bug navigation (stack reset)
- **File:** `src/screens/Splash.js`, `Login.js`, `FirstLoginPassword.js`, `LanguageSelectionScreen.js`, `src/components/Control.js`, `src/services/apiClient.js`
- **Problem:** Sau login, back vẫn về được Language/Splash vì stack tích lũy `[Splash, Language, Main]` (do `navigate`/`replace` không reset). Logout cũng `navigate('Login')` mà không xoá token.
- **Implementation:**
  - Mọi chuyển hướng sau đăng nhập dùng `navigation.reset({index: 0, routes: [{name: ...}]})`.
  - Logout (`Control.js`) gọi `clearSession()` (export từ `apiClient`) → xoá AsyncStorage + reset về `Login`.
- **Acceptance criteria:**
  - [x] Back ở Main không quay lại Language/Splash.
  - [x] Logout xoá session thật + về Login, không còn về lại Main khi back.

### UI-002 — Design tokens hiện đại
- **File:** `src/config/theme.js`
- **Implementation:** bảng màu mới (primary `#4F46E5`, primary2 `#7C3AED`, gradient brand), thêm `primaryLight`/`primaryGradient`, spacing 8pt, radius `radiusLg 22`, shadow mềm; giữ nguyên toàn bộ key cũ (không phá vỡ consumer).
- **Acceptance criteria:**
  - [x] Không key nào bị xoá khỏi LIGHT/DARK_COLORS; mọi screen/component cũ vẫn đọc đủ token.

### UI-003 — Home dashboard gọn gàng, hiện đại
- **File:** `src/components/tabs/HomeTab.js` + `locales/*` (`home.greeting_*`, `home.tap_checkin`, `home.subtitle`)
- **Implementation:** bỏ 3 StatCard dày đặc + banner riêng → hero card gradient (greeting + tên + trạng thái chấm công, tap → Checkin) + 2 StatCard (phép còn lại, thông báo) + quick actions.
- **Acceptance criteria:**
  - [x] Dashboard gọn hơn, vẫn giữ nguyên nguồn dữ liệu (checkin/search, dayoffs/getall, notification) & hành vi fetch/refresh.
  - [x] Trạng thái chấm công (nghỉ/phép/cuối tuần/đã chấm) hiển thị trong hero.

### UI-004 — Common components nâng cấp
- **File:** `src/components/common/Header.js`, `Card.js`, `Button.js`, `SectionHeader.js`
- **Implementation:** Header/SectionHeader dùng `colors.primaryGradient`; Card/Button đọc `useTheme()` (dark mode đúng) + shadow mềm.
- **Acceptance criteria:**
  - [x] Các màn hình dùng `common/Header` tự đồng bộ brand mới mà không cần sửa từng màn hình.

### UI-004B — Home hero: bỏ chuông + mũi tên thu gọn (thiết kế cuối)
- **File:** `src/components/tabs/HomeTab.js`
- **Status:** Hoàn thành theo yêu cầu user (sau khi đã HUỶ auto-collapse).
- **Implementation:**
  - **Bỏ cái chuông** (bell) ở top row + badge đếm thông báo; gỡ `notificationCount` state + fetch `NOTIFICATION/SEARCH_BY_ID` trong `refreshDashboard` (bỏ luôn import `SEARCH_BY_ID`).
  - **Thêm mũi tên chevron** (góc phải top row) dùng toggle thu/phóng phần greeting: `heroExpanded` state + Animated `maxHeight`/`opacity` (JS driver) cho body, `heroArrowRotate` (native driver) quay mũi tên 180°. Body thu gọn về 0 → chỉ còn top row **☰ · chevron**.
  - Giữ nguyên: greeting + tên + ngày + avatar (→ Profile) + status pill (→ Checkin), ☰ (→ Control).
- **Acceptance criteria:**
  - [x] Không còn chuông trên hero; tap mũi tên thu/phóng đúng.
  - [x] ESLint 0 error (chỉ warning pre-existing).

### UI-005 — Feature HRM mới (UI shell, mock data)
- **File (mới):** `src/screens/Schedule.js`, `IDCard.js`, `Directory.js`, `Docs.js`, `SalaryTrend.js`; register `src/screens/index.js` + `src/navigation/MainNavigator.js`; menu `src/components/tabs/FeatureTab.js`; keys i18n `schedule.*`, `idcard.*`, `directory.*`, `docs.*`, `salarytrend.*` (4 locale).
- **Implementation:**
  - **Schedule** — hero ca hôm nay + strip 7 ngày (ca ngày/đêm/nghỉ).
  - **IDCard** — thẻ ảo (avatar, mã NV, phòng ban, chức vụ, **QR chứa JSON thông tin NV từ `useUserProfile` (API `GET /users/:id`)**) + row chi tiết; nối dữ liệu thật qua `useUserProfile`/`authData`.
  - **Directory** — search + nhóm theo phòng ban + nút gọi (Alert).
  - **Docs** — danh sách tài liệu + badge "Chờ đăng tải".
  - **SalaryTrend** — 3 summary card + bar chart (View thuần) mock 6 tháng.
- **Acceptance criteria:**
  - [x] 5 màn hình parse sạch, eslint 0 error, register navigation + FeatureTab hoạt động.
  - [x] Key i18n đủ 4 locale, JSON hợp lệ.
  - [x] IDCard QR real: `qrcode-generator` (pure JS, Hermes-safe, không cần TextEncoder) + render `react-native-svg` (RNSVG đã link); encode JSON (employee_code, full_name, department, position, phone, email) từ API `GET /users/:id`; scan_hint thay pendingNote. (Loại bỏ `react-native-qrcode-svg` + polyfill TextEncoder ở index.js vì crash Hermes RN 0.73.)
  - [ ] Gắn API thật khi BE hoàn tất (xem `DESIGN.md` §2.1).

### UI-006 — DESIGN.md
- **File:** `DESIGN.md` (mới)
- **Acceptance criteria:**
  - [x] Tài liệu hệ thống thiết kế (tokens, component, pattern, navigation reset) + roadmap feature HRM & endpoint gợi ý.

---

## 🟦 P2 — Roll-out Design System lên màn hình còn lại

Đưa toàn bộ màn hình chính lên design system mới (brand Indigo→Violet, `useTheme`, `colors.primaryGradient`), hoàn thiện i18n + dark mode. KHÔNG cần BE mới.

### UI-007 — Notifications redesign
- **File:** `src/screens/Notifications.js`
- **Problem:** Dùng `useThemeContext` + `createStyles(isDarkMode)` cục bộ, gradient `#667eea/#764ba2/#f093fb`, icon màu hardcode → lệch brand mới.
- **Implementation:** chuyển sang `useTheme()` (`{colors, isDarkMode}`), header/empty-state dùng `colors.primaryGradient`, tab active/icon/unread dùng `colors.primary`, chuyển các màu cứng sang tokens. GIỮ NGUYÊN logic fetch/mark-read/tabs/expand. (Thêm token `primaryGradient` + brand `primary/primary2/primaryLight` vào `theme.js` theo DESIGN.md §1.1 — cần thiết để `colors.primaryGradient` tồn tại.)
- **Acceptance criteria:**
  - [x] Bỏ `useThemeContext`, không còn `createStyles` nội bộ; mọi màu từ `colors`.
  - [x] Babel parse sạch; eslint 0 error mới.

### UI-008 — Brand gradient: Setting, Splash, FeatureTab
- **File:** `src/screens/Setting.js`, `src/screens/Splash.js`, `src/components/tabs/FeatureTab.js`
- **Implementation:**
  - `Setting.js`: header `['#1a1a2e','#16213e']`/`['#667eea','#764ba2']` → `colors.primaryGradient`; `languageItem`/`selectedLanguageItem` bỏ hardcode `#ffffff`/`#f8f9ff` → `colors.surface`/`colors.primaryLight`. (thêm cả `settingItem` bỏ `#ffffff` → inline `colors.surface`)
  - `Splash.js`: `LIGHT_GRADIENT`/`DARK_GRADIENT` → brand (`['#4F46E5','#7C3AED']` / `['#6366F1','#8B5CF6']`).
  - `FeatureTab.js`: header `['#667eea','#764ba2']` → `colors.primaryGradient` (thêm `useTheme`).
- **Acceptance criteria:**
  - [x] Babel parse sạch; không đổi logic.

### UI-009 — i18n hoàn thiện (key thiếu)
- **File:** `locales/{vi,en,ja,pt}.json`
- **Problem:** `check-i18n` báo thiếu `no.products.available`, `delete_success`, `delete_failed`.
- **Implementation:** thêm 3 key vào 4 locale.
- **Acceptance criteria:**
  - [x] `npm run check-i18n` không còn báo key thiếu (chỉ còn false-positive dynamic keys).

### UI-010 — Dark-mode audit Profile/Salary/Leave
- **File:** `src/screens/Profile.js`, `Salary.js`, `Leave.js`
- **Implementation:** rà soát các card còn `backgroundColor: '#fff'`/`#FFFFFF` → `colors.surface`; giữ logic. CHỈ sửa chỗ rõ ràng phá dark mode.
- **Acceptance criteria:**
  - [x] Babel parse sạch; eslint 0 error mới.

---

## 🔴 P3 — Feature Complete (theo góc nhìn khách hàng, UI-first · mock data, BE sau)

Phỏng vấn "khách hàng" (nhân viên + quản lý): tính năng cần thiết nhất cho app HRM mà hiện tại CHƯA có hoặc CHƯA dùng được. Nguyên tắc: làm đủ UI màn hình trước, BE xử lý sau (mock data có sẵn như DESIGN.md).

### WIRE-001 — Kích hoạt 5 màn hình HRM shell (hiện không vào được)
- **File:** `src/screens/index.js`, `src/navigation/MainNavigator.js`, `src/components/tabs/FeatureTab.js`, `locales/*` (+ `feat.cat.hrm`)
- **Problem:** `Schedule`, `IDCard`, `Directory`, `Docs`, `SalaryTrend` đã có UI shell nhưng KHÔNG register navigation/export/menu; namespace keys (`schedule.*`, `idcard.*`, `directory.*`, `docs.*`, `salarytrend.*`) MISSING toàn bộ 4 locale.
- **Implementation:**
  - Export + `Stack.Screen` cho 5 màn hình.
  - Thêm nhóm `hrm` vào `CATEGORY_ORDER` + `FeatureTab`: lịch ca, thẻ NV, danh bạ, tài liệu, xu hướng lương.
  - Thêm key i18n (7+8+3+7+3 keys) đủ 4 locale.
- **Acceptance criteria:**
  - [x] Vào được 5 màn hình từ menu; name route khớp `navigation.navigate`.
  - [x] `npm run check-i18n` hết báo namespace keys thiếu.

### APPROVAL-001 — Trung tâm Phê duyệt (MANAGER/ADMIN)
- **File:** `src/screens/Approvals.js` (mới) + `locales/*` (`approval.*`)
- **Problem:** Nhân viên xin nghỉ/tăng ca nhưng manager/HR không có màn nào để duyệt → workflow HRM chưa khép kín.
- **Implementation:**
  - Header + segmented **Nghỉ phép / Tăng ca**; danh sách đơn chờ duyệt (mock data).
  - Mỗi đơn: tên NV, thời gian, lý do, nút **Duyệt** (confirm Alert) / **Từ chối** (modal nhập lý do tùy chọn).
  - Xử lý trong state local (Simplify: xóa khỏi pending, Alert thông báo). Giữ giao diện sẵn sàng gắn BE: mỗi item = 1 request object.
- **Acceptance criteria:**
  - [x] Duyệt/từ chối đúng đơn, không phá empty-state; role STAFF không thấy menu.
  - [x] i18n đủ 4 locale; Babel parse sạch.

### ACCOUNT-001 — Đổi mật khẩu
- **File:** `src/screens/ChangePassword.js` (mới), `src/screens/Setting.js`, `locales/*` (`changepassword.*`)
- **Problem:** Setting chỉ có theme + ngôn ngữ; không có nơi đổi mật khẩu.
- **Implementation:** 3 ô password (current/new/confirm) + mắt hiện mật khẩu, validate (bắt buộc, >=6, trùng khớp), mock submit (loading + Alert). Entry trong Setting section "Tài khoản".
- **Acceptance criteria:**
  - [x] Validate đúng; mock submit không crash; i18n đủ 4 locale.

### ACCOUNT-002 — Sửa hồ sơ cá nhân
- **File:** `src/screens/EditProfile.js` (mới), `src/screens/Profile.js`, `locales/*` (`editprofile.*`)
- **Problem:** Hồ sơ chỉ đọc; nhân viên cần cập nhật SĐT/email/địa chỉ.
- **Implementation:** form prefill từ `useUserProfile` (phone, email, address editable; họ tên read-only), mock save (Alert). Nút sửa ở header Profile.
- **Acceptance criteria:**
  - [x] Prefill đúng; mock save không crash; i18n đủ 4 locale.

### SUPPORT-001 — Hỗ trợ & FAQ
- **File:** `src/screens/Support.js` (mới), `src/screens/Setting.js`, `locales/*` (`support.*`)
- **Problem:** Không có nơi hỏi đáp / liên hệ hỗ trợ.
- **Implementation:** card liên hệ (call/email qua `Linking`), FAQ accordion 5-6 câu, entry trong Setting.
- **Acceptance criteria:**
  - [x] Accordion mở/đóng đúng; Linking hoạt động; i18n đủ 4 locale.

### UPDATE-001 — Cập nhật tài liệu
- **File:** `DESIGN.md`, `TODO.md`
- **Implementation:** thêm approvals/change-password/edit-profile/support vào roadmap + endpoint gợi ý.
- **Acceptance criteria:**
  - [x] Đồng bộ trạng thái thật (5 shell đã wire; keys i18n đủ).

---

## 🟠 P4 — Màn hình chức năng dự kiến (UI-first, mock data, chờ BE)

Phần còn lại của bộ HRM "dự kiến": hoàn thiện file `Learning.js` đang trống + 4 màn HRM cơ bản. Nguyên tắc giống P0–P3: UI đầy đủ theo design system, mock data trong file, register navigation + menu + i18n đủ 4 locale.

### P4-001 — Learning (đào tạo)
- **File:** `src/screens/Learning.js` (đang trống)
- **Implementation:** hero tiến độ tổng (X/Y bài), danh sách khóa học (icon gradient + số bài + progress bar + badge Hoàn thành/Chưa). Mock `learning.*` keys (c_skill, c_safety, c_quality, c_orientation).
- **Acceptance criteria:**
  - [x] Render 4 khóa mock, progress bar đúng; `learning.*` đủ 4 locale.

### P4-002 — Lịch sử phiếu lương
- **File:** `src/screens/PayslipHistory.js` (mới)
- **Implementation:** danh sách tháng (6 mock) với Gross/Net + badge Đã trả/Chờ trả; tap mở rộng chi tiết Thu nhập/Khấu trừ. Mock `paysliph.*`.
- **Acceptance criteria:**
  - [x] Expand/collapse đúng từng tháng; `paysliph.*` đủ 4 locale.

### P4-003 — Tổng hợp chấm công tháng
- **File:** `src/screens/AttendanceSummary.js` (mới)
- **Implementation:** hero month + prev/next tháng, 4 stat (ngày công, OT, trễ, nghỉ), breakdown theo tuần. Mock `attsum.*`.
- **Acceptance criteria:**
  - [x] Đổi tháng không crash; stat + breakdown khớp mock; `attsum.*` đủ 4 locale.

### P4-004 — Khảo sát nội bộ
- **File:** `src/screens/Survey.js` (mới)
- **Implementation:** danh sách khảo sát (badge Đang mở/Đã đóng, deadline); tap khảo sát đang mở → modal câu hỏi + chọn 1 trong 4 mức, gửi → Alert cảm ơn. Mock `survey.*`.
- **Acceptance criteria:**
  - [x] Chỉ khảo sát đang mở mới mở được modal; submit không crash; `survey.*` đủ 4 locale.

### P4-005 — Phúc lợi
- **File:** `src/screens/Benefits.js` (mới)
- **Implementation:** danh sách 6 phúc lợi (bảo hiểm, phép, sức khỏe, thưởng Tết, đào tạo, ăn ca) mở rộng mô tả khi tap. Mock `benefits.*`.
- **Acceptance criteria:**
  - [x] Accordion mở/đóng đúng; `benefits.*` đủ 4 locale.

### P4-006 — Wire + tài liệu
- **File:** `src/screens/index.js`, `src/navigation/MainNavigator.js`, `src/components/tabs/FeatureTab.js`, `DESIGN.md`
- **Acceptance criteria:**
  - [x] 5 màn hình vào menu `hrm`; check-i18n pass; DESIGN.md cập nhật roadmap.
- **Ghi chú:** endpoint gợi ý cho BE: `GET /trainings`, `GET /payroll/history?user_id&months`, `GET /attendance/summary?user_id&month`, `GET /surveys` + `POST /surveys/:id/answer`, `GET /benefits`.

### P4-007 — Lịch làm việc: gắn API ngày nghỉ (theo lịch giấy công ty)
- **File:** `src/screens/Schedule.js`
- **Problem:** Lịch làm việc toàn mock (`SHIFT_PATTERN`); muốn dùng API ngày nghỉ thật + hiển thị đúng thiết kế lịch giấy của công ty.
- **Implementation:**
  - Fetch `GET dayoffs/getall` (mẫu `Profile.js:136`), map `item.date` → `YYYY-MM-DD`.
  - Strip 7 ngày: **ngày nghỉ** → ô ngày nền đỏ nhạt + số ngày đỏ + chấm đỏ; **ngày làm** → 1 vòng tròn ca làm **ĐÊM tuần đó** (ca xoay vòng: tuần này B đêm, tuần sau A đêm...): A = vòng trắng không màu, B = đổ màu.
  - Hero hôm nay: nghỉ → badge đỏ "Nghỉ"; ngược lại → 2 vòng tròn kèm chữ **A/B** + "Ca ngày: X · Ca đêm: Y".
  - **Sự kiện trong ngày:** section phía dưới (icon calendar + "Chưa có sự kiện gì") — API cung cấp sau.
  - **Legend:** 3 mục — vòng tròn chữ **A** "Ca A", vòng tròn chữ **B** "Ca B", chấm đỏ "Nghỉ" để người dùng nhận biết ký hiệu.
- **Acceptance criteria:**
  - [x] Ngày nghỉ từ API + cuối tuần hiện đỏ ở ô ngày; ca đêm xoay vòng A/B đúng quy ước; legend có chữ A/B; lỗi API fallback về không có ngày nghỉ.
  - [x] ESLint 0 error, Babel parse sạch, key `schedule.*` đủ 4 locale (`schedule.events`, `schedule.empty_events` mới).

### P4-008 — Phân quyền menu theo role (ẩn trang leader+ với nhân viên)
- **File:** `src/components/tabs/FeatureTab.js`
- **Problem:** Khi nhân viên (STAFF) đăng nhập vẫn thấy hết các trang quản lý/phê duyệt/đăng bài (role rỗng → lọc `hideForRoles.includes(role)` không chặn được).
- **Implementation:**
  - Thay `hideForRoles` bằng **`minRole`** + thang `ROLE_LEVELS = {STAFF:0, LEADER:1, MANAGER:2, ADMIN:3}`; role rỗng/không rõ → mức 0 (ẩn trang leader+).
  - Gắn `minRole:'LEADER'` cho: **Approvals** (phê duyệt), **Management/RpV** (quản lý), **Important/is_impor** (đăng bài), **Upload/Up** (tải lên/đăng bài), giữ **Ai**.
  - STAFF chỉ thấy các trang nhân sự + công việc cá nhân (Schedule, IDCard, Leave, Order, Uniform, Upload, PlanProduction, Daily, Overtime...).
- **Acceptance criteria:**
  - [x] STAFF (hoặc role rỗng) KHÔNG thấy Approvals/Management/Important/Ai; LEADER/MANAGER/ADMIN vẫn thấy.
  - [x] ESLint 0 error, Babel parse sạch; không đổi key i18n.

### P4-009 — Redesign Profile: bỏ thông tin nhân viên, hiện đại hóa chấm công
- **File:** `src/screens/Profile.js`, `locales/*` (`profile.attendance_stat`)
- **Problem:** Profile trùng thông tin NV với IDCard (tên/code/phòng ban/phép/email/phone/địa chỉ) — không cần hiển thị nữa.
- **Implementation:**
  - Bỏ toàn bộ Employee Card (company name, avatar+camera, name, position, email, ID, expandable details, paid_days) + UploadAvatar modal + các state/handler (`isExpanded`, `userInfo`, `get_user_info`, avatar upload).
  - Gộp tháng + 3 stat (giờ công / OT / cuối tuần) thành **hero card gradient**: tiêu đề "Thống kê chấm công" + pill chọn tháng (mở SelectDate) + 3 cột số ngăn bằng vạch.
  - Giữ nguyên lịch sử chấm công (calendar/list) + RefreshControl + SelectDate.
  - **Upload avatar chuyển sang Thẻ nhân viên** (`src/screens/IDCard.js`): avatar tappable + overlay camera → mở `UploadAvatar`; `useUserProfile` thêm hàm `refresh()` (xoá cache + refetch) để cập nhật avatar/paid_days sau khi upload.
  - **Thẻ nhân viên thêm row "Ngày phép còn lại"** (`idcard.paid_days`): giá trị từ `user.paid_days`.
- **Acceptance criteria:**
  - [x] Không còn thông tin nhân viên trên Profile; hero hiển thị thống kê chấm công + đổi tháng hoạt động.
  - [x] IDCard: tap avatar mở upload + cập nhật ảnh ngay; hiển thị ngày phép còn lại.
  - [x] ESLint 0 error (không thêm warning mới), Babel OK, `profile.attendance_stat` + `idcard.paid_days` đủ 4 locale.

### P4-010 — Fix 401 Leave + Redesign giao diện & modal nghỉ phép
- **File:** `src/screens/Leave.js`, `locales/*`
- **Problem:** Trang nghỉ phép báo **401** — `Leave.js` gọi thẳng `axios` (không qua interceptor) nên KHÔNG gắn token `Authorization: Bearer …` (lúc này `apiClient.js` trong `services/apiClient.js` mới gắn token + tự đăng xuất khi 401). Riêng `ModalMessage` truyền sai prop `visible` → không hiện thông báo.
- **Implementation:**
  - Đổi cả 4 request (`SEARCH`, `GET_USER_WITH_DEPARTMENT_ID`, `CREATE`, `DELETE`) sang **`apiClient`** → token tự gắn, hết 401.
  - Thiết kế lại hiện đại:
    - **Hero card gradient**: số ngày phép còn lại (lớn) + 3 stat Đang chờ / Đã duyệt / Từ chối.
    - **Segmented tabs** (chấm màu + badge đếm), card đơn nghỉ: khối ngày DD/MMM + chip Loại phép (paid/unpaid) + reason + pill trạng thái màu + feedback + menu (⋯) Edit (disabled) / Delete.
    - **Bottom-sheet form modal**: slide-up có handle, header (title + subtitle + close), field Ngày nghỉ (mở DatePicker), **chip chọn loại lý do 2 cột** (thay dropdown), TextInput custom khi chọn "Other", toggle Paid / Nửa ngày, field **Người duyệt mở bottom-sheet danh sách** (thay DropDownPicker), nút submit gradient.
    - **DatePicker modal** + **confirm delete modal** (icon + cancel/delete) đều thiết kế lại.
    - Thay Alert bằng ModalMessage toast (đã đúng prop `isVisible`).
- **Acceptance criteria:**
  - [x] Leave gọi qua `apiClient` → không còn 401 khi login hợp lệ.
  - [x] 0 axios trực tiếp còn lại trong Leave.js.
  - [x] ESLint 0 error, Babel OK, check-i18n đủ 4 locale (thêm `leave.remaining_label`, `leave.day_unit`, `leave.select_date`, `leave.leader_label`, `select_leader_required`, `delete_confirm_title/body`, `load_leave_error`, `load_leader_error`, `no_leader`, `request_leave_hint`, `no_leaves_hint`, `done`).

### P4-011 — Redesign trang đặt suất ăn (Order)
- **File:** `src/screens/Order.js`, `src/components/OrderModal.js`, `locales/*`
- **Problem:** Trang đặt suất ăn dùng `axios` + `config` header thủ công (token từ redux — dễ 401), giao diện cũ.
- **Implementation:**
  - Chuyển sang **`apiClient`** (interceptor gắn token + tự đăng xuất khi 401) cho cả Order.js (`get_all_day_off`, `getUserOrders`, `handleCheckBoxPress`) và OrderModal (`handleCancelOrder`); bỏ `config` prop.
  - Thiết kế lại hiện đại:
    - **Hero card gradient**: tiêu đề + ngày hôm nay (thứ, ngày) + chip Đã đặt / Đã chọn.
    - **Card ngày**: header gradient (thứ in hoa + chip "Đã đặt" + ngày), body 2 nút **Ca ngày (sun) / Ca đêm (moon)** — đã đặt → xanh đổ + check "Đã đặt"; hết hạn (đã đặt ca khác) → mờ; khả dụng → outline primary; ngày nghỉ → gradient đỏ + icon "Không phục vụ".
    - **Bottom floating bar** (bo góc 22, gradient): tháng + Đã đặt / Đã nhận + chevron, tap mở danh sách đơn.
  - Giữ animation fade/slide/scale, giữ `selectedMap`/`orderedDates` logic.
- **Acceptance criteria:**
  - [x] Order/OrderModal gọi qua `apiClient` — không còn axios/config thủ công.
  - [x] ESLint 0 error trên Order.js (OrderModal giữ nguyên warning pre-existing), Babel OK, check-i18n đủ 4 locale (thêm `order.hero_title`, `order.day_shift`, `order.night_shift`, `order.view_orders`).

### P4-012 — Fix crash "Cannot read property 'data' of null" + gắn token khi login
- **File:** `src/screens/Login.js`, `src/components/tabs/HomeTab.js`
- **Problem:** App crash `TypeError: Cannot read property 'data' of null`.
  - Gốc rễ: `apiClient` đọc token từ AsyncStorage `'token'` (TOKEN_KEY), nhưng **Login không bao giờ lưu token** → mọi request qua apiClient KHÔNG có `Authorization` → endpoint bảo vệ (Leave/Order) trả **401**.
  - Interceptor apiClient gặp 401 → `clearSession()` → `setAuthData(null)` → redux auth = `{data: null}`.
  - HomeTab re-render → `authData?.data.data` (HomeTab.js:73) → `null.data` → **"Cannot read property 'data' of null"**.
- **Implementation:**
  - `Login.js`: sau login thành công, lưu `login?.data?.token` vào AsyncStorage `TOKEN_KEY` (`'token'`) → apiClient gắn `Authorization: Bearer …`.
  - `HomeTab.js:73`: `useState(authData?.data.data)` → `useState(authData?.data?.data)` — an toàn khi auth.data null (phòng khi 401/logout).
- **Acceptance criteria:**
  - [x] Token được lưu vào AsyncStorage sau login → request apiClient có Authorization, hết 401 (và không còn chuỗi logout→crash).
  - [x] HomeTab không còn crash khi auth.data null.
  - [x] ESLint 0 error, Babel OK.

---

## 🟢 P5 — BA Review + 🎙️ Nghe & dịch trực tiếp bằng âm thanh (yêu cầu khách hàng)

Kết quả đóng vai **BA** rà soát toàn bộ chức năng app + yêu cầu mới từ khách hàng: **app phải có chức năng nghe và dịch trực tiếp ngôn ngữ bằng âm thanh** (nói → dịch → đọc kết quả), phục vụ giao tiếp đa ngôn ngữ tại nơi làm việc. Nguyên tắc: UI-first theo design system (DESIGN.md), mock service, chờ BE/native lib.

### BA-AUDIO-001 — 🎙️ Màn hình Dịch thuật âm thanh (Translator)
- **File:** `src/screens/Translator.js` (mới), `src/services/translator.js` (mới), `src/screens/index.js`, `src/navigation/MainNavigator.js`, `src/components/tabs/FeatureTab.js`, `locales/*` (`translator.*`)
- **Problem:** Khách hàng yêu cầu tính năng nghe + dịch trực tiếp bằng âm thanh; app hiện KHÔNG có màn hình/mock nào.
- **Implementation:**
  - UI shell theo design system: Header brand + segmented **Giọng nói / Văn bản**; dòng chọn ngôn ngữ **Nguồn ⇄ Đích** (vi/en/ja/pt/zh/ko + nút đổi chiều); nút mic lớn nhấn-giữ để nói (pulse + "Đang nghe…"), thả ra → mock nhận dạng → mock dịch; chế độ văn bản: TextInput + nút Dịch.
  - Kết quả: 2 card (nguồn / đích) với nút **Phát âm** (mock TTS) + **Sao chép** (`@react-native-clipboard`); lịch sử dịch local (mở rộng/clear).
  - Service `translator.js`: `SUPPORTED_LANGS`, `mockRecognize()` (sinh câu mẫu theo ngôn ngữ nguồn), `translateText(text, from, to)` (mock dict + fallback `[from→to]`), `pendingNote` hướng dẫn gắn lib thật: `react-native-voice` (STT), `react-native-tts` (TTS), API dịch BE/Google Translate.
  - Register navigation + FeatureTab (category `other`, icon mic) + key `translator.*` đủ 4 locale.
- **Acceptance criteria:**
  - [x] UI shell parse sạch, theme light/dark đúng; mic pulse + đổi chiều ngôn ngữ hoạt động.
  - [x] Mock nhận dạng + dịch ra kết quả; copy/phát âm (mock) không crash.
  - [x] Vào được từ FeatureTab; `npm run check-i18n` pass; ESLint 0 error.
  - [ ] Gắn `react-native-voice` + `react-native-tts` + API dịch khi BE sẵn sàng (xem pendingNote).

### BA-FIX-001 — Main.js: notification count dùng axios thủ công (risk 401)
- **File:** `src/screens/Main.js:50`
- **Problem:** `getNotificationCount` gọi `axios.post` trực tiếp (KHÔNG qua `apiClient`) → không gắn token, khi hết hạn sẽ 401 mà không tự đăng xuất — cùng class bug P4-010/011/012.
- **Implementation:** đổi sang `apiClient`; bỏ import `axios` nếu không còn dùng.
- **Acceptance criteria:**
  - [x] Không còn `axios` trực tiếp trong Main.js; 401 do interceptor xử lý.
  - [x] ESLint 0 error, Babel OK.

### BA-FIX-002 — Main.js còn hardcode gradient cũ (lệch brand)
- **File:** `src/screens/Main.js:122,254`
- **Problem:** `selectedTabGradient`/`centerTabGradient` dùng `['#0A84FF','#5E5CE6']`/`['#667eea','#764ba2']` thay vì `colors.primaryGradient` (DESIGN.md §1.1).
- **Acceptance criteria:**
  - [x] Tab active + trung tâm dùng `colors.primaryGradient`; không đổi logic.

### BA-FIX-003 — Ai.js chưa theo design system + re-subscribe socket mỗi tin
- **File:** `src/screens/Ai.js`
- **Problem:** chat AI không Header brand, màu hardcode, không dark mode; `useEffect` deps `[messages]` → mỗi tin mới lại `socket.on`/`off` (leak + re-render churn).
- **Implementation:** thêm Header + `useTheme`; subscribe socket 1 lần (deps `[]`, functional setState).
- **Acceptance criteria:**
  - [x] Chat theo brand, dark mode đúng; socket on/off chỉ 1 lần; ESLint 0 error.

### BA-FIX-004 — FeatureTab subtitle hardcode tiếng Việt
- **File:** `src/components/tabs/FeatureTab.js:317`
- **Implementation:** chuyển sang key i18n `feat.subtitle` (4 locale).
- **Acceptance criteria:**
  - [x] `npm run check-i18n` pass với key mới.

### BA-FIX-005 — common/Header.js gradient sai brand (trái DESIGN.md)
- **File:** `src/components/common/Header.js:26`
- **Problem:** Header vẫn hardcode `['#667eea','#764ba2']` / `['#1a1a2e','#16213e']` trong khi DESIGN.md §1.3 yêu cầu `colors.primaryGradient`.
- **Acceptance criteria:**
  - [x] Header dùng `colors.primaryGradient`; light/dark đúng; không đổi API component.

### BA-FIX-006 — HomeTab gọi axios không qua apiClient (risk 401)
- **File:** `src/components/tabs/HomeTab.js` (`handle_notification_click` :244, `get_all_information` :217, `get_event_detail` :173)
- **Problem:** một số request dùng `axios` + `config` thủ công (token từ redux có thể rỗng); `handle_notification_click` không truyền config → risk 401.
- **Acceptance criteria:**
  - [x] Các request kể trên qua `apiClient` (bỏ `config` thủ công); 401 tự đăng xuất.

### BA-FEAT-001 → 005 — Màn hình HRM chuyên nghiệp mới (UI-first, mock, chờ BE)
- **BA-FEAT-001 — Sơ đồ tổ chức (OrgChart):** `src/screens/OrgChart.js` — cây phòng ban (avatar, tên, chức vụ), tap expand/collapse; endpoint gợi ý `GET /department` + `GET /users/by-department`.
- **BA-FEAT-002 — Đánh giá hiệu suất (Performance):** `src/screens/Performance.js` — KPI kỳ hiện tại + tự đánh giá thang điểm + nhận xét manager (mock); endpoint `GET /performance?user_id&period` + `POST /performance/self-review`.
- **BA-FEAT-003 — Tuyển dụng nội bộ (Referral):** `src/screens/Referral.js` — danh sách vị trí đang tuyển + thưởng giới thiệu + form giới thiệu (mock); endpoint `GET /jobs` + `POST /referrals`.
- **BA-FEAT-004 — Đổi ca làm việc (ShiftSwap):** `src/screens/ShiftSwap.js` — ca tuần này + chọn ca muốn đổi + chọn đồng nghiệp + gửi yêu cầu (mock); endpoint `GET /shift-swap/pending` + `POST /shift-swap`.
- **BA-FEAT-005 — Tài sản cấp phát (Asset):** `src/screens/Asset.js` — danh sách tài sản (mã, tên, tình trạng, ngày cấp) + đề nghị trả lại (mock); endpoint `GET /assets?user_id` + `POST /assets/:id/return`.
- **BA-FEAT-006 — Wire + tài liệu:** đăng ký 5 màn hình vào `screens/index.js`, `MainNavigator.js`, `FeatureTab` (nhóm `hrm`), key i18n `orgchart.*`/`performance.*`/`referral.*`/`shiftswap.*`/`asset.*` đủ 4 locale, cập nhật `DESIGN.md`.
- **Acceptance criteria (BA-FEAT):**
  - [x] 5 màn hình (OrgChart, Performance, Referral, ShiftSwap, Asset) parse sạch, eslint 0 error, register navigation + FeatureTab (nhóm `hrm`) hoạt động.
  - [x] Key i18n `orgchart.*`/`performance.*`/`referral.*`/`shiftswap.*`/`asset.*` đủ 4 locale, JSON hợp lệ, `npm run check-i18n` pass (không còn báo namespace thiếu).
  - [x] `DESIGN.md` §2 roadmap + §2.1 chi tiết + §2.2 namespace đã cập nhật.
  - [ ] Gắn API thật khi BE hoàn tất (xem `DESIGN.md` §2.1).

---

## 🟢 P5 Addendum — Fix 401 Inventory + Translator audio-in → audio-out + BE guide

### P5FIX-001 — Fix 401 Inventory (Báo cáo/Inventory)
- **File:** `src/screens/Report.js`
- **Problem:** trang Inventory báo **401** — `get_all_inventory_with_dapertment` và `get_all_daily_report_with_field` gọi `axios.post` trực tiếp (không qua `apiClient`) → không gắn token `Authorization` → 401. Cùng class bug với P4-010/011/012.
- **Implementation:** đổi `import axios` → `import apiClient from '../services/apiClient'`; cả 2 request dùng `apiClient.post` (interceptor tự gắn token + tự logout khi 401). Bỏ import `axios` (giờ unused).
- **Acceptance criteria:**
  - [x] Không còn `axios` trực tiếp trong Report.js (chỉ `apiClient`); 401 do interceptor xử lý.
  - [x] Babel parse sạch, ESLint 0 error mới (warning pre-existing giữ nguyên).

### P5AUDIO-002 — Translator: audio-in → audio-out (trả âm thanh, không chỉ văn bản)
- **File:** `src/screens/Translator.js`, `src/services/translator.js`, `locales/*` (`translator.*`)
- **Yêu cầu khách hàng:** nói vào → app trả lại **âm thanh** theo đúng **ngôn ngữ đích người dùng chọn** (không phải văn bản thuần). Chọn ngôn ngữ nào → nhận lại giọng nói ngôn ngữ đó.
- **Implementation:**
  - Service: thêm `synthDurationMs(text)` (mô phỏng thời lượng đọc theo độ dài + loại ngôn ngữ Latin/không-Latin), `mockSynthesize(text, lang)` (trả `{text, lang, duration, uri: mock://speech/...}`).
  - UI: sau khi dịch xong (voice **và** text đều) **tự phát âm kết quả** bằng ngôn ngữ đích: card kết quả hiện badge **"Đang phát âm..."** + **waveform animation** (7 thanh nhảy theo `synthDurationMs`); audio row trên card đích: `volume-high` + "Phản hồi bằng giọng nói: {{lang}}" + nút **Play/Stop**. Văn bản vẫn hiển thị kèm Copy để đối chiếu.
  - Giữ nguyên: segmented voice/text, chọn ngôn ngữ nguồn ⇄ đích, lịch sử, copy, picker modal.
- **Acceptance criteria:**
  - [x] Voice: nói xong → tự phát âm kết quả bằng ngôn ngữ đích (waveform chạy theo thời lượng); text: nút Dịch cũng phát âm.
  - [x] Người dùng đổi ngôn ngữ đích → giọng phát phản hồi đúng ngôn ngữ đó (mock, qua 4 locale).
  - [x] Play/Stop hoạt động, không leak timer (cleanup trong `useEffect` unmount).
  - [x] ESLint 0 error mới, Babel OK, check-i18n pass (thêm `translator.speaking`, `audio_reply`, `audio_reply_now`, `stop`, `play`, lang.* đã có).

### P5BE-003 — BE Integration Guide (BE_INTEGRATION.md)
- **File (mới):** `BE_INTEGRATION.md`
- **Implementation:** hợp đồng API FE↔BE: quy ước chung (JWT, envelope `{success,data,message}`), bảng endpoint từng màn hình, spec 5 màn HRM mới + **spec `POST /translate/audio`** (multipart: `audio, from_lang, to_lang, voice` → trả `{source_text, translated_text, to_lang, audio_url, duration_ms}`), gợi ý lib BE (STT/Translate/TTS), checklist gắn BE.
- **Acceptance criteria:**
  - [x] Ghi đủ endpoint + shape cho từng màn hình; spec dịch âm thanh đúng yêu cầu "trả âm thanh theo ngôn ngữ user chọn".

### P5DOC-004 — Cập nhật tài liệu
- **File:** `DESIGN.md`, `TODO.md`
- **Implementation:** thêm Translator vào roadmap §2 + §2.1 audio-in→audio-out; namespace `translator.*` vào §2.2; TODO ghi addendum này.
- **Acceptance criteria:**
  - [x] DESIGN.md phản ánh đúng thiết kế audio-in → audio-out; TODO đánh dấu trạng thái thật.

### P5AUDIO-005 — Conversation Engine: phiên dịch hội thoại 2 chiều liên tục (giống Interpreter Mode)
- **File:** `src/services/conversation/conversationManager.js`, `speechRecognition.js`, `tts.js`, `src/services/translator.js`, `src/components/ConversationPanel.js`, `src/screens/Translator.js`, `locales/*` (`translator.pause/resume/paused/processing/queue/no_voice`)
- **Yêu cầu khách hàng:** không còn mô hình turn-based bắt buộc (A nói xong mới B). App phải như phiên dịch viên: 2 người nói tự nhiên, liên tục, chen ngang; mic không bị chặn bởi translation/TTS; không mất câu.
- **Implementation:**
  - **Pipeline không chặn mic:** finalize → enqueue → STT restart NGAY (translation/TTS chạy queue song song). Bỏ `await translate+speak` trong luồng nghe.
  - **VAD/batching:** native STT tự giữ lượt qua im ngắn (Android cấu hình `EXTRA_SPEECH_INPUT_*_SILENCE_LENGTH_MILLIS`); grace window iOS (end→results); timer reset theo partial (Test C/D). Platform-aware: iOS `onSpeechResults` là partial → chỉ cập nhật text, finalize ở `onSpeechEnd`; Android `onResults` là final → finalize ngay.
  - **Echo suppression + interrupt:** khi TTS phát, STT bắt echo → bỏ qua (similarity ≥ 0.5 HOẶC cùng ngôn ngữ với giọng đang phát); speech mới ≠ echo → `tts.stop()` ngay (Test E). iOS không duplex (audio session) → delay restart trong lúc TTS; Android duplex thật.
  - **Adaptive locale:** `currentListenLang` đảo theo ngôn ngữ phát hiện; no-match liên tiếp (≥2) tự đảo ngược để bắt người nói liên tục 1 ngôn ngữ.
  - **Translation queue + context:** `TranslationService` abstraction (translator.js), truyền câu trước làm `context` MyMemory, worker xử lý tuần tự không chặn nghe, session-guard chống race stop/start.
  - **Pause/Resume:** thêm `pause()/resume()` (giữ lịch sử), UI nút Pause/Resume + chip ngôn ngữ micro + badge speaker A/B + chỉ báo queue.
  - **Fix audio tiếng Nhật:** `tts.js` `resolveVoiceForLanguage` — nếu `setDefaultLanguage` fail (thiết bị thiếu giọng ja) → tìm giọng đã cài qua `Tts.voices()`/`setDefaultVoice`; không có → báo `translator.no_voice` thay vì im lặng. Text mode dùng chung `speakText`.
- **Acceptance criteria:**
  - [x] Babel parse sạch toàn bộ file thay đổi; ESLint 0 error mới.
  - [x] `npm run check-i18n` pass với 6 key mới (4 locale).
  - [ ] QA thiết bị: Test A–H trong mô tả task (continuous same-speaker, alternating, interrupt, network) — cần smoke trên thiết bị thật.
- **Ghi chú giới hạn thiết bị/API:** STT per-locale (iOS SFSpeechRecognizer / Android SpeechRecognizer) → không thể nghe 2 ngôn ngữ song song trong 1 session; người nói đổi ngôn ngữ đột ngột có thể bị trễ 1 câu cho tới khi micro tự đảo locale. iOS không chạy mic+TTS song song (audio session) → duplex hạn chế (chống echo ở app layer). Speaker diarization thật chưa có → speaker xác định bằng ngôn ngữ + lượt.

### P5AUDIO-006 — Bugfix Conversation Translator (test Android thật): mic khoá 1 ngôn ngữ + TTS tiếng Nhật không phát âm
- **File:** `src/services/conversation/languageConfig.js` (mới — LANGUAGE_CONFIG trung tâm: sttLocale/ttsLocale/flag/name), `speechRecognition.js`, `tts.js`, `conversationManager.js`, `languageDetection.js` (+confidence), `translator.js` (delegate locale → languageConfig), `ConversationPanel.js`, `Translator.js`, `locales/*` (`translator.lang_detected`, `translator.no_voice_hint`)
- **LỖI 2 — "có text nhưng không có âm thanh tiếng Nhật" (root cause, đã verify native `@react-native-voice/voice` Android `VoiceModule.java`):**
  - `onSpeechStart` ở Android bắn ở **CẢ `onReadyForSpeech` VÀ `onBeginningOfSpeech`**, và micro (duplex) thu lại chính giọng TTS đang phát → recognizer báo `onBeginningOfSpeech` → manager cũ `tts.stop()` NGAY → **TTS bị giết chỉ sau vài chục ms** → người dùng thấy text đầy đủ nhưng gần như không nghe thấy âm thanh.
  - **Fix:** bỏ `tts.stop()` khỏi `_onNativeStart`; interrupt THẬT chỉ xảy ra ở `_finalize` khi utterance KHÔNG phải echo. `_onNativeStart` cũng không set `batchActive` nữa (Android ready ≠ có tiếng nói).
  - Voice selection: Android `setDefaultLanguage` trả `LANG_AVAILABLE = -1` nhưng `react-native-tts` map vào `default` → reject `"Unknown error code: -1"` DÙ language HỢP LỆ (module đã `setLanguage` rồi) → `resolveVoiceForLanguage` mới xử lý reject dạng này = THÀNH CÔNG; `lang_missing_data`/`lang_not_supported`/`not_found` → tìm giọng đã cài qua `Tts.voices()`+`setDefaultVoice`; không có → throw `no_voice_for_<lang>` + log + UI hướng dẫn cài language pack (`translator.no_voice_hint`). Không bao giờ lấy giọng en đọc tiếng Nhật. `logAvailableVoices()` chạy lúc init (yêu cầu #10).
- **LỖI 1 — "Listening Vietnamese" không nghe được tiếng Nhật:** xác nhận thư viện KHÔNG hỗ trợ simultaneous multilingual ASR (chỉ `EXTRA_LANGUAGE` đơn; iOS per-locale) → **không giả vờ**. Implement "Phương án C" đúng nghĩa: transcript → language detection (có confidence) → direction = detected → cặp kia; mic đảo locale **NGAY** khi no-match (7)/speech-timeout có partial (6) (bỏ threshold 2), sau mỗi utterance đảo sang ngôn ngữ còn lại. UI KHÔNG hiện "Listening vi" — chỉ "Listening…" + cặp `vi ↔ ja`; khi có speech → `🗣 {{flag}} Japanese detected`. Low-confidence → giữ listenLang, không dịch sai (threshold 0.55).
- **Anti-race:** `_listenSeq` guard cho grace finalize + utterance timer (sự kiện muộn của session cũ không finalize nhầm batch mới); `_session` guard cho queue worker (đã có). Lỗi STT 6/7/9/1110 = silent (không hiện error spinner), 5 = transient restart.
- **Logging (`__DEV__`):** `[Conversation]` Partial/Final transcript, Detected language + Confidence, Direction, Translation, TTS start/finish/error + locale/voice; `[Conversation][TTS]` available voices lúc init.
- **Acceptance criteria:**
  - [x] Babel parse 8 file sạch; ESLint 0 error mới; JSON 4 locale hợp lệ; `npm run check-i18n` không thêm key thiếu (EN 911/JA 911/PT 911/VI 912 — VI hơn 1 = false-positive `window` cũ).
  - [ ] QA thiết bị (Android): Test 18–21 (alternating, 1 người liên tục, chuyển ngôn ngữ) + xác nhận tiếng Nhật thực sự phát âm. **Giới hạn còn lại (trung thực):** người nói 1 ngôn ngữ LIÊN TỤC có thể bị rơi 1 câu ngay sau khi micro đảo ngôn ngữ (bản chất single-locale ASR). Đề xuất hướng nâng cấp thật sự: engine đa ngôn ngữ (Whisper/Vosk) hoặc Android `EXTRA_LANGUAGE_PREFERENCE` (cần patch native) — chưa làm trong task này.

---

## 🧪 Testing (Redesign P0)

- **REDESIGN-TEST-001:** `npx eslint` chỉ các file đã sửa — không thêm lỗi mới (repo có sẵn lỗi prettier/unused cũ, KHÔNG sửa tràn lan).
- **REDESIGN-TEST-002:** Babel parse toàn bộ file thay đổi qua `npx @babel/core ...` hoặc `react-native` build.
- **REDESIGN-TEST-003:** `npm run check-i18n` — key mới (category, placeholder, label) có đủ 4 locale.
- **REDESIGN-TEST-004:** Smoke (QA): Home dashboard hiển thị đủ thẻ, lịch chấm công render đúng, tìm kiếm feature lọc đúng, Leave/Profile hiện phép (sau BE TASK-024).

---

## 📈 Progress

- Redesign P0: 6 tasks (REDESIGN-001 → 006)
- Completed: **5/6** code-verified (001, 002, 004, 005, 006); **REDESIGN-003 HUỶ** theo quyết định user; smoke REDESIGN-TEST-004 QA pending
- Modern UI + Navigation + Feature HRM (P1): 6 tasks (UI-001 → 006)
- Completed: **6/6** (code-verified; UI-005 BE integration + smoke QA pending)
- Design System roll-out (P2): 4 tasks (UI-007 → 010)
- Completed: **4/4** (code-verified; smoke QA pending)
- Feature Complete (P3): 6 tasks (WIRE-001, APPROVAL-001, ACCOUNT-001/002, SUPPORT-001, UPDATE-001)
- Completed: **6/6** (UI-first, mock data; BE gắn sau theo DESIGN.md §2 — smoke QA pending)
- Planned screens (P4): 12 tasks (P4-001 → P4-012)
- Completed: **12/12** (Learning + PayslipHistory + AttendanceSummary + Survey + Benefits + Schedule API ngày nghỉ + phân quyền menu theo role + redesign Profile + fix 401/redesign Leave + redesign Order + fix crash token — UI-first, mock data, chờ BE — smoke QA pending)
- Ad-hoc bugfix (ja): `locales/ja.json` + `pt.json` thiếu 8 key `dependentSupportAmount.*` → khi đổi sang ja, i18next phát console.warn → LogBox vàng (dải vàng nhỏ trên đầu màn hình Home ở Android dev). Đã bổ sung đủ key, `npm run check-i18n` → JA/PT ✅ Đầy đủ.
- Ad-hoc bugfix (toast vàng trên Home): dải vàng nhỏ nằm ngay dòng status bar khi đổi ngôn ngữ — do `NewYearToast` (màu `#FFD700`, `absolute top:0`) bị kẹt ở vị trí nửa chừng vì animation (`useNativeDriver`) bị ngắt khi re-render đổi ngôn ngữ. Đã sửa: 2 toast chỉ render khi `visible=true` + `translateY.setValue(-100)` trước mỗi lần hiện; đồng thời guard `userInfo?.dob` trong `checkSpecialDays` (HomeTab) để toast sinh nhật không bắn khi thiếu dob. Babel OK, không thêm lỗi eslint mới.
- Ad-hoc redesign Home (P0.1): `src/components/tabs/HomeTab.js` — thay header cũ bằng **hero gradient** (greeting theo giờ + tên + ngày `dddd, DD/MM/YYYY` + pill trạng thái chấm công hôm nay → Checkin + avatar → Profile + chuông thông báo có badge) + **quick actions** (Chấm công · Order · Nghỉ phép · Lương) + **2 stat cards** (ngày phép còn lại từ `useUserProfile().paid_days`, thông báo đếm từ `NOTIFICATION/SEARCH_BY_ID`). Fetch dashboard gộp `Promise.allSettled` (checkin/search, notification, dayoffs/getall), refresh cùng pull-to-refresh. Thêm i18n `home.*` (12 keys × 4 locale). Giữ nguyên feed tin + modals/toasts. Prettier clean, ESLint 0 error, Babel OK, check-i18n pass.
- Ad-hoc UI-004B (greeting auto-collapse): `src/components/tabs/HomeTab.js` — greeting hiện 1 lần/phiên rồi tự thu gọn (~1.3s) về top row **☰ · "Thông tin" · 🔔**; bỏ quick actions + 2 stat cards để hero gọn, feed lên cao. `greetingPlayedOnce` module-level + Animated `maxHeight`/`opacity`. ESLint 0 error (warning pre-existing), Babel OK, `t('info')` có đủ 4 locale.
- Ad-hoc UI-004B revert: user quyết định **HUỶ auto-collapse** — muốn lời chào + avatar hiển thị như trước. Đã gỡ `greetingPlayedOnce`/`greetingActive`/Animated collapse + `heroTitle`, phục hồi hero đầy đủ (greeting, tên, ngày, avatar → Profile, status pill → Checkin, ☰ → Control, 🔔 → Notifications). Giữ nguyên: quick actions + 2 stat cards vẫn bỏ, `config` đã di chuyển lên trên `refreshDashboard` (fix TDZ crash), cả 2 timing dùng JS driver (fix lỗi maxHeight native). ESLint 0 error.
- Ad-hoc UI-004B hoàn thiện: **bỏ chuông** top row (+ bỏ `notificationCount`/fetch notify/import `SEARCH_BY_ID`), **thêm mũi tên chevron** toggle thu/phóng phần greeting (`heroExpanded` + Animated `maxHeight`/`opacity` JS driver, `heroArrowRotate` native driver quay 180°). Body thu gọn về top row ☰ · chevron. ESLint 0 error (14 warning pre-existing).
- Ad-hoc UI-004B collapse giống header màn hình khác: khi thu nhỏ hiện **bar thanh ngang như các màn hình khác** + chữ **"Bảng thông tin"** (`home.info_board` — thêm key × 4 locale) ở giữa ☰ · chevron, **bỏ bo tròn góc dưới** (`heroCollapsed`: borderRadius 0 khi collapse). Giữ bo tròn khi expanded. ESLint 0 error, check-i18n pass. → **Sau đó user đổi**: collapsed hiện **tên người dùng** (`getUserFullName()`) thay cho "Bảng thông tin"; gỡ key `home.info_board` khỏi 4 locale.
- Ad-hoc spacing Home: bỏ khoảng trống giữa hero/bar và các card feed — `hero.paddingBottom 26→0`, `scrollContent.paddingTop 16→0`, khi collapse `heroTopRowCollapsed.marginBottom 0` để card nằm sát thanh. ESLint 0 error.
- Ad-hoc Home: **bỏ status pill Checkin** trong hero — gỡ `getTodayStatus`, state `todayCheckin`/`isTodayHoliday`, `refreshDashboard` (fetch checkin/search + dayoffs/getall) + `useEffect` + gọi trong `onRefresh`, bỏ style `statusPill`/`statusPillText` + import `CHECKIN/SEARCH/DAY_OFFS/GET_ALL`. Hero còn: ☰ · "Bảng thông tin"/chevron + greeting + tên (từ `getUserFullName` fallback `full_name`/`name`/`user_name`) + ngày + avatar. ESLint 0 error.
- Ad-hoc bugfix (Home crash "Cannot access 'config' before initialization"): `refreshDashboard` (useCallback) dùng `config` trong deps nhưng `config` khai báo `const` phía SAU (dòng ~246) → **ReferenceError TDZ mỗi render** → màn hình Home chết/không click được. Đã di chuyển `config` (useMemo) lên trên `refreshDashboard`; các dùng còn lại trong thân hàm đều an toàn. ESLint 0 error, Babel OK.
- Ad-hoc bugfix (animation Home): `Animated.parallel` trộn driver — `greetOpacity` dùng `useNativeDriver: true` còn `greetMaxHeight` không support native module (tối đa chỉ chạy JS driver) → **"Style property 'maxHeight' is not supported by native animated module"**. Đã set `useNativeDriver: false` cho cả 2 timing. ESLint 0 error, Babel OK.
- BA Review (P5): rà soát toàn bộ chức năng — đã ghi `P5` vào TODO (BA-AUDIO-001, BA-FIX-001→006, BA-FEAT-001→006). **BA-AUDIO-001 đã code**: `src/screens/Translator.js` + `src/services/translator.js` (mock STT/dịch/TTS, 6 ngôn ngữ, chế độ giọng nói/văn bản, lịch sử, copy) + register `index.js`/`MainNavigator`/`FeatureTab` (category `other`, icon mic) + key `translator.*` đủ 4 locale. ESLint 0 error, Babel OK, check-i18n pass. Chờ gắn `react-native-voice`/`react-native-tts`/API dịch khi BE sẵn sàng.
- BA Review (P5) — i18n hoàn thiện: rà `src/` qua check-i18n, phát hiện **~168 key P3/P4 thiếu toàn bộ 4 locale** (feat/approval/schedule/idcard/survey/support/attsum/benefits/changepassword/directory/docs/editprofile/learning/paysliph/salarytrend/order/home…) — keys chưa từng tồn tại trong git. Đã thêm đủ; còn sót `manager.*` (nested — false positive flat-check) + dynamic/date-format keys. `npm run check-i18n`: EN 792 / JA 792 / PT 792 / VI 793, JA/PT/VI ✅ Đầy đủ. Thêm 4 key Login (`Please input username/password`, `Login failed`, `Login Error`).
- BA Review (P5) — hoàn thiện 5 màn HRM: **OrgChart, Performance, Referral, ShiftSwap, Asset** (`orgchart.*`, `performance.*`, `referral.*`, `shiftswap.*`, `asset.*` — 81 key mới × 4 locale). Register `screens/index.js`/`MainNavigator`/`FeatureTab` (nhóm `hrm`, icon git-network/ribbon/person-add/swap-horizontal/cube). DESIGN.md §2 roadmap + §2.1 + §2.2 namespace đã cập nhật. ESLint 0 error, Babel OK, check-i18n pass. Chờ gắn BE theo endpoint gợi ý.
- Ad-hoc bugfix (Profile 401): vào Profile báo **401** — `Profile.js` gọi thẳng `axios` (`get_checkin_of_user` + `get_day_offs`) KHÔNG qua `apiClient` interceptor nên không gắn `Authorization: Bearer …`. Đã đổi sang `apiClient` (bỏ import `axios`, gỡ biến `token` thừa). ESLint 0 error, Babel OK.
- Ad-hoc bugfix (Schedule 401 + missingKey home.greeting_*): **`src/screens/Schedule.js`** — `fetchDayOffs` gọi thẳng `axios.get` (`DAY_OFFS/GET_ALL`) KHÔNG qua `apiClient` → không gắn `Authorization` → **401 "Schedule getDayOffs error"** (cùng class bug P4-010/P5FIX-001). Đã đổi sang `apiClient.get` (bỏ import `axios`). **i18n**: HomeTab dùng `t('home.greeting_morning'/'afternoon'/'evening', fallback)` + `t('home.user', fallback)` nhưng 4 key chưa tồn tại ở locale nào → runtime `missingKey` (dù fallback vẫn hiện). Đã thêm 4 key `home.greeting_*` + `home.user` vào đủ 4 locale (en/ja/pt/vi). ESLint Schedule 0 error, Babel OK, JSON 4 locale hợp lệ, check-i18n không thêm key thiếu mới.
- Ad-hoc bugfix (missingKey "Request failed with status code 401"): nhiều màn hình gọi `t(message)`/`t(error)` với **message là chuỗi lỗi thô của axios** (VD `error.message` = "Request failed with status code 401") → i18next phát `missingKey` warning mỗi lần 401/network. Đã thêm helper **`translateMessage`** trong `services/i18next.js` (chỉ dịch khi `i18n.exists(message)` đúng, ngược lại trả nguyên văn) và thay thế các call site rủi ro: `ModalMessage.js` (render), `Daily.js`, `Report.js`, `PlanProduction.js`, `Profile.js` (đã import i18next sẵn), `Upload.js`, `Message.js`, `ComfirmDayOrNight.js`, `EditPlanProduction.js`. ModalMessage bỏ prop `t` (caller vẫn truyền — vô hại). ESLint: 0 error mới trên mọi file đổi (Upload.js baseline 74 = now 74), Babel OK 10 file.
- Ad-hoc Conversation Translator (BA-AUDIO nâng cấp → **Real-time Two-way Conversation Translation**): biến màn Audio Translation thành **phiên dịch hội thoại 2 chiều thời gian thực** (không còn hold-to-talk / bấm mic từng câu — chỉ **Start/Stop Conversation**, app tự nghe → tự dịch → tự đọc → tiếp tục nghe).
  - **Kiến trúc tách module** `src/services/conversation/`: `conversationManager.js` (ConversationManager — state machine + phối hợp), `speechRecognition.js` (SpeechRecognitionService — bọc `@react-native-voice/voice`, permission/availability, finalize 1 lần/utterance, timeout 25s "nói quá lâu"), `languageDetection.js` (LanguageDetectionService — detect offline bằng script/ko/ja/zh + diacritics/word-score cho vi/pt/en), `tts.js` (TextToSpeechService — `react-native-tts` promise + safety timeout 20s), `index.js`.
  - **Detect speech end**: dựa vào end-of-speech của native recognizer; finalize đúng 1 lần khi có `onSpeechResults` (Android) hoặc `onSpeechEnd`→đợi 350ms cho results (iOS); chống tách câu ngắn bằng pending text + partial. `onSpeechPartialResults` hiển thị text live.
  - **Xác định chiều dịch**: `detectLanguage(text)` → nếu trùng source/target dùng ngay; không detect được → tin ngôn ngữ micro đang nghe; tắt Auto Detect → dùng source/target luân phiên theo người nói trước. Mỗi lượt xong chuyển `currentListenLang` sang ngôn ngữ ngược lại (dự đoán người nói kế).
  - **Chống feedback loop (TTS bị micro thu lại)**: micro CHỈ chạy khi TTS không phát — TTS đọc xong (tts-finish/cancel/error) mới `_scheduleRestart` → nghe lại. Không có vòng lặp.
  - **UI** `src/components/ConversationPanel.js` + `src/screens/Translator.js` (rewrite): 2 tab **Conversation/Text** (giữ text translate + speak/copy/history cũ), bubble trái/phải theo speaker với flag + ngôn ngữ + giờ, status strip (Listening {{lang}}… / Translating… / Speaking {{lang}}… / lỗi thân thiện), nút Start/Stop gradient, toggle **Voice ON/OFF** + **Auto Detect**. Xử lý lỗi: permission, stt unavailable, network (translation fail), tts fail, no-match throttled 3s, background → auto-stop (AppState).
  - i18n: thêm 13 key `translator.*` (mode_conversation/mode_text/start_conversation/stop_conversation/listening_to/speaking_to/voice_on/voice_off/auto_detect/conv_empty/network_error/tts_error/no_match) × 4 locale + đổi title/subtitle thành "Conversation Translator". ESLint 0 error, Babel OK, JSON 4 locale hợp lệ, check-i18n không thêm key thiếu.
  - **Test thật**: cần **rebuild app** (libs đã cài sẵn từ trước — chỉ cần run) — chưa smoke test trên thiết bị.
- Ad-hoc Translator thật (BA-AUDIO-001 hoàn tất phần native): cài **`@react-native-voice/voice` 3.2.4** + **`react-native-tts` 4.1.1** (npm + pod install). iOS: thêm `NSMicrophoneUsageDescription` + `NSSpeechRecognitionUsageDescription` vào Info.plist. Android: `RECORD_AUDIO` + `<queries>` cho `android.speech.RecognitionService` + `android.intent.action.TTS_SERVICE`. `translator.js`: **bỏ Google Translate (key đã bị suspended — curl 403)**, dịch chính qua **MyMemory** (`fetch` + AbortController 15s), fallback dict offline (trả nguyên văn thay vì `[to] text`); thêm `LOCALE_FOR_CODE`/`getLocaleForCode` (vi-VN/en-US/ja-JP/pt-PT/zh-CN/ko-KR). `Translator.js`: giữ **nhấn-giữ mic** → `Voice.start(locale)` thật (Android xin RECORD_AUDIO, `Voice.isAvailable()`), `onSpeechResults` → dịch; tự **TTS đọc kết quả ngôn ngữ đích** (`tts-start/finish/cancel/error` điều khiển waveform 7 thanh + pill "Đang phát âm"; Play/Stop toggle đúng card source/target); waveform loop có thể stop được (fix leak animation cũ). ESLint 0 error, Babel OK, check-i18n pass (thêm `translator.permission_denied`, `translator.stt_unavailable`, cập nhật `translator.pending_note` × 4 locale). **Còn chờ:** BE `POST /translate/audio` (BE_INTEGRATION.md) thay MyMemory khi sẵn sàng; bắt buộc **rebuild lại app** (pod/gradle) để dùng mic + đọc âm thanh.
- BA Addendum (P5): **fix 401 Inventory** — `Report.js` 2 request `axios.post` trực tiếp → chuyển sang `apiClient` (bỏ import axios), hết 401. **Translator audio-in → audio-out** — sau khi dịch tự phát âm kết quả bằng ngôn ngữ đích (badge "Đang phát âm..." + waveform animation 7 thanh theo `synthDurationMs`; Play/Stop; audio row "Phản hồi bằng giọng nói: {{lang}}"); service thêm `synthDurationMs`/`mockSynthesize`; thêm 5 key `translator.*` (speaking, audio_reply, audio_reply_now, stop, play) × 4 locale. **`BE_INTEGRATION.md`** — hợp đồng API FE↔BE + spec `POST /translate/audio` (STT→dịch→TTS, trả `audio_url` theo `to_lang` user chọn). DESIGN.md §2/§2.1/§2.2 + TODO đã đồng bộ. ESLint 0 error mới, Babel OK, check-i18n pass. Chờ gắn `react-native-voice`/`react-native-tts`/API dịch khi BE sẵn sàng.
- Ad-hoc redesign Uniform (tab đơn hàng): tiếp nối `Uniform.js` + `SelectProductTab` đã chuyển `apiClient` — **`ProcessingOrdersTab.js`** & **`CompletedOrdersTab.js`** bỏ `axios` + `config` header thủ công → **`apiClient.post`** (interceptor gắn token, hết 401). Giao diện hiện đại theo design system: Processing = card bo tròn 20 + icon status clock + status label chớp (Animated blink) + progress bar + nút xóa đơn (confirm Alert); Completed = timeline dọc + badge "Đã xác nhận" + success bar delivery-date. Cả 2 có empty-state icon + RefreshControl pull-to-refresh, mọi màu từ `colors.*` (dark mode đúng). ESLint 0 error, Babel OK, check-i18n pass (dùng key đã có `completed_date`/`delivery_date`/`order_date`/`completed`; `uniform_type`/`uniform_size`/`order_status` là dynamic — false-positive check-i18n như cũ).
- Ad-hoc fix 400 khi order uniform: **`SelectProductTab.js`** gửi `uniform_type` theo FE enum (`work_jacket`…) nhưng BE (`hrmMetal/src/enum/uniformType.enum.ts`) yêu cầu enum `WORK JAKET`/`WORK PANTS`/`COVERALLS`/`WORK GLOVES`/`SAFETY SHOES`… → `create_uniform_order_use` (uniformOrder.usecase.ts:26-33) throw "Invalid uniform size or type" → router trả **400**. Đã thêm map `UNIFORM_TYPE_BACKEND` (FE enum value → BE enum value, kèm cả các type còn lại của enum) và dùng trong `handleCart` khi POST; giữ nguyên i18n/display (t(`work_jacket`)… không đổi). Các field còn lại (user_id guid, position ∈ Position enum, date ISO, quantity number>0, notes) đã khớp BE. ESLint 0 error mới, Babel OK.
- Ad-hoc UI Uniform: **bỏ hero card hướng dẫn** trên màn Uniform (cả nút help-circle cũ ở hero); chuyển **dấu hỏi (help-circle) lên tabbar** góc phải (mở GuideModal như cũ). Tabbar thêm `tabHelpButton` (44px, `colors.primaryLight`/`primary`), `TAB_WIDTH` tính lại `(width - 32 - 44)/3` để indicator vẫn khớp 3 tab; xoá hero gradient + styles dư + import `LinearGradient`. ESLint 0 error mới (chỉ warning pre-existing `Platform` unused), Babel OK.
- Ad-hoc UI Uniform: **bỏ indighter (vạch dưới) tabbar** khi chọn tab bị lệch — gỡ component `TabIndicator` + `scrollX` + `TAB_WIDTH` + style `indicator`; giữ hiệu ứng scale + highlight nền `primaryLight`. ESLint 0 error mới, Babel OK.
- Ad-hoc bugfix Translator crash: `TypeError: WAVE_BARS.map is not a function` — `WAVE_BARS = 7` (number) mà code gọi `.map()`. Đổi `useRef(WAVE_BARS.map(...))` → `useRef(Array.from({length: WAVE_BARS}, () => new Animated.Value(0)))` ở `src/screens/Translator.js:52`. ESLint 0 error, Babel OK.
- Ad-hoc Translator gắn Google Translate API thật: **`src/services/translator.js`** — `translateText` (trước là mock) nay gọi `https://translation.googleapis.com/language/translate/v2?key=${API_KEY_GOOGLE}` (giống ChatScreen.js:129,585) `POST {q, source, target, format:'text'}`, nhận `translations[0].translatedText`; khi API lỗi/rate-limit/null → **fallback mock** (DICT hoặc `[to] text`) giữ nguyên; shortcut `from===to` trả thẳng text. STT (`mockRecognize`) + TTS (`mockSynthesize`) giữ mock. ESLint 0 error, Babel OK.
- Ad-hoc Translator: **key Google Translate bị suspended** (test 403) → `translateText` giờ gọi Google trước, **fallback MyMemory free** (`api.mymemory.translated.net/get?q=&langpair=from|to`, ✅ test trả nghĩa thật "Hi, I'm a new employee."), cuối cùng mới mock. Không cần key; giới hạn ~5000 từ/ngày ẩn danh. ESLint 0 error, Babel OK. (ChatScreen vẫn dùng Google key hỏng — nếu muốn fix sau chuyển sang `translateText`/MyMemory.)
- Ad-hoc fix 401 + redesign Chat (AI) — **`src/screens/ChatScreen.js`**: (1) **Fix 401** — 4 request gọi thẳng `axios` (KHÔNG qua `apiClient` → không gắn `Authorization`) nay chuyển sang **`apiClient`**: `getAllMessage`, `handleDeleteMessage`, `handleUnsendMessage`, upload (`upload.post`) — hết 401, interceptor tự logout khi token hết hạn. `axios` giữ lại DUY NHẤT cho `translateText` Google (như services/translator). (2) **Redesign modern theo design system**: bubble user dùng `LinearGradient` `colors.primaryGradient` (không hardcode `#667eea/#764ba2`), header chat + nút gửi cũng `primaryGradient` (chuyển từ `colors.primary`), thêm giờ gửi `messageTime` (user: `rgba(255,255,255,0.75)`, other: `colors.textSecondary`), placeholder input dùng `colors.textSecondary`, shadow/border/background toàn bộ từ `colors.*` (dark mode đúng), bỏ `isDarkMode` param dư trong style `userMessageContainer`. So với HEAD: **bớt 7 lỗi eslint khi prettier-normalized** (394 vs 401); raw tăng nhẹ 4 do dòng mới theo indent 4-space sẵn có của repo (không prettier cả file theo convention). Babel OK.
- Ad-hoc fix 401 Message (chat flow còn 401): **`src/screens/Message.js`** — 4 request `axios.post` trực tiếp (friend list `FIND_USER_BY_FIELD`, conversations `GET_GROUP_MEMBER_OF_USER`, `DELETE` conversation, `CREATE` conversation) → **`apiClient`** (`import axios` → `import apiClient`). Đây là nguyên nhân "vẫn 401" sau khi đã sửa ChatScreen (màn danh sách hội thoại mở vào Chat). ESLint: 0 error mới (16 errors toàn file = pre-existing, giảm 2 so với HEAD), Babel OK.
- Ad-hoc redesign Notifications (đẹp + hiện đại) — **`src/screens/Notifications.js`** + `locales/*` (`notification_unread`): (1) **Fix 401 cùng class** — 3 request `axios` trực tiếp (`SEARCH_BY_ID` POST, `UPDATE` PUT ×2) → **`apiClient`**. (2) **Redesign theo design system** (mẫu Leave.js P4-010): danh sách **floating card** (radius 20, border, shadow mềm, margin 16/14 — bỏ kiểu row-full chia vạch cũ); unread = nền `primaryLight` + **accent gradient 4px** trái + icon tint `color+'1A'` + dot đỏ + title đậm, read = icon xám; **segmented tabs** Tất cả / Hệ thống kèm **badge đếm** (giống Leave); header subtitle hiện **"X chưa đọc"** (`notification_unread` × 4 locale), nút mark-all **disabled** khi 0 unread; nút "Xem thêm/Thu gọn" giờ áp dụng **mọi loại** thông báo (trước chỉ SYSTEM). Giữ nguyên logic fetch/mark-read/tabs/expand/refresh/empty-state. ESLint 0 error (3 warning inline-style = pattern Leave), Babel OK, check-i18n pass.
- Ad-hoc redesign DailyReport + fix sản phẩm FE↔BE — **`src/screens/Daily.js`**, **`src/components/DailyModal.js`** + `locales/*` (`daily_report_hero_desc`): (1) **Fix sai lệch sản phẩm FE↔BE**: BE `hrmMetal/src/enum/product.enum.ts` (`Products`) CHỈ có **`D14KRR`**, FE hardcode `D14KRR_1`/`D14KRR_2` và gửi **label** làm `product` → BE throw `"D14KRR_1 not valid"` (400) vì enum validation `isValidEnumValue(field.product, Products)` (dailyReport.useCase.ts:73) + DB ENUM. Đã thêm field **`code`** (`D14KRR_1/D14KRR_2 → code:'D14KRR'`) + state `productCode`; `handleClickChoiceProduct` set `productCode = product.code || product.label`; `field.product = productCode`. 28/30 sản phẩm còn lại khớp enum (đã verify từng cái, bổ sung sau khi test thật báo **`D86E_CTC not valid`**: FE hardcode `D86E_CTC` sai chính tả vs BE `D86_CTC` — đã đổi label → `D86_CTC`; giờ automated compare **30/30 FE code hợp lệ & BE enum phủ đủ, NONE thừa/thiếu**); mã lỗi ERROR_OPTIONS đều nằm trong `CodeError` enum (01–99); shift A/B = `shift` enum; payload khớp `create_daily_report` interface. (2) **Fix 401**: `axios.post` → **`apiClient`**. (3) **Redesign**: hero gradient card (icon + ngày `dddd, DD/MM/YYYY` + desc `daily_report_hero_desc`); card thông tin sản phẩm (selector có icon cube + badge thời gian chu kỳ + hint); card chi tiết sản xuất 2 cột input gọn (border 1.2, icon nhỏ tint); card kết quả (row kèm icon + màu theo giá trị: hiệu suất/speed/error); nút Tính toán/Send dùng `colors.primaryGradient`; modal gửi modern (section card nền `backgroundTertiary`, shift pill A/B active fill primary, summary có divider, error row có chip mã + input có icon, nút submit gradient). **`DailyModal`** bỏ hardcode `#fff/#f0f0f0/#f9f9f9` → `useTheme` (dark mode đúng): header gradient `primaryGradient`, item có icon package + **chip cycle time** + check khi chọn, empty-state có icon. Giữ nguyên toàn bộ logic (tính toán, errors, shift, validation, animation). ESLint 0 error mới (giữ 1 lỗi pre-existing `exhaustive-deps` animation, các warning no-shadow/inline-style = pattern cũ), file mới prettier-clean, Babel OK, check-i18n pass.
- Ad-hoc BE fix (DailyReport tiếp): sau khi sửa product, test thật báo **`WHERE parameter "id" has invalid "undefined" value repository`** (HTTP 200 + `success:false`). Nguyên nhân **BUG BE**: `inventory.repo.ts` `UPDATE_INVENTORY` chạy `Inventory.update({...field}, {where:{id: field?.id}})` nhưng **dailyReport.useCase.ts gọi `UPDATE_INVENTORY({quantity, product, department_id})` KHÔNG có `id`** → `where id undefined` → Sequelize throw. (Route `/inventory/update` có validate `id` required nên không dính; chỉ flow dailyReport dính.) Đã sửa: `where = field?.id ? {id: field?.id} : {product: field?.product, department_id: field?.department_id}` — update theo product+department khi không có id, giữ nguyên cho caller có id. `npx tsc --noEmit` ✅. Cần **restart BE** (`npm run dev`) để áp dụng.
- **ADMIN-PAGE-REDESIGN Phase A (đúng quyền & đúng kênh HTTP, đối chiếu BE hrmMetal)** — thiết kế đầy đủ ở `docs/ADMIN_PAGE_REDESIGN.md` (verified từng router: `paidleave/search {leader_id}` + `PUT paidleave {id}` + `POST paidleave/update {id,feedback}`; `overtimerequest` getbyuserid/updateisconfirm/getAll(ADMIN-only); `inventory/search {department_id}` + `POST dashboards/leader/inventorys/update-inventory {id,quantity}` — `department_id` lấy từ token leader; `dashboards/leader/overtime` weight/price; `users` GET restricted; `getAllUserCheckedSafetyCheckEvent {id}`). Phân quyền thật: **ADMIN** quản trị dayoffs/taxdependent/`getAll` overtime; **MANAGER/LEADER** duyệt leave team qua `leader_id`, confirm tăng ca; **STAFF** không vào Manager/Inventory (maintain P4-008 `minRole`). Phát hiện: HRM app hiện dính **2 file còn gọi `axios` raw (không token → 401, cùng class bug P5FIX-001)**: `src/screens/Manager.js` (5 call: leave search/update/approve + create overtime + get all users) & `src/screens/OvertimeConfirm.js` (2 call: getbyuserid + updateisconfirm) — **đã chuyển hết sang `apiClient`** (bỏ `import axios`, interceptor gắn `Authorization` + auto-logout 401). **Inventory là của LEADER**: item menu `inventory` (→ `Report`) trong `FeatureTab.js` hiện KHÔNG `minRole` (STAFF thấy) → **đã thêm `minRole:'LEADER'`**. Lưu ý cấu trúc: màn admin thực = `Manager.js` đăng ký route **`ReportView`**, vào từ menu `RpV` (đã minRole LEADER); `Report.js` = inventory đã `apiClient` từ P5FIX-001. ESLint/Babel: **chạy lại sau edit** (mục tiếp theo). Phase B/C/D còn lại: split Inventory update theo `dashboards/leader/inventorys/update-inventory`, Approval hub đầy đủ (ADMIN `getAll` overtime vs LEADER confirm), Employee directory theo role, thay gradient cứng `#667eea`/`#764ba2` bằng `colors.primaryGradient`.

- Ad-hoc nâng cấp Conversation Translator → **phiên dịch hội thoại 2 chiều liên tục (P5AUDIO-005)**: bỏ turn-based — mic luôn mở, dịch/TTS chạy **queue không chặn nghe** (`_drainQueue` session-guard chống race stop/start), finalize → restart STT ngay; **VAD/batching** native (Android silence timeout, iOS grace window + platform-aware finalize: iOS `onSpeechResults` chỉ cập nhật text, Android mới finalize); **echo suppression + interrupt** (STT bắt đúng giọng TTS → bỏ qua bằng similarity ≥0.5 HOẶC cùng ngôn ngữ giọng đang phát; speech khác → `tts.stop()`); **adaptive locale** (đảo ngôn ngữ micro theo lượt, no-match ≥2 tự đảo ngược); **`TranslationService`** abstraction + context câu trước truyền MyMemory; **Pause/Resume** + chip ngôn ngữ micro + badge speaker A/B + chỉ báo queue; **fix tiếng Nhật không có âm thanh**: `resolveVoiceForLanguage` (setDefaultLanguage fail → `Tts.voices()`/`setDefaultVoice` → báo `translator.no_voice` thay vì im lặng), text mode dùng chung `speakText`. 6 key i18n mới × 4 locale. ESLint 0 error mới, Babel OK, check-i18n pass. Chưa smoke test thiết bị (Test A–H).
- Ad-hoc **P5AUDIO-006** (bugfix test Android thật): **TTS tiếng Nhật không phát âm** — root cause: Android `onSpeechStart` bắn ở cả `onReadyForSpeech`+`onBeginningOfSpeech`, micro duplex thu lại chính giọng TTS → manager cũ `tts.stop()` ngay tại `onSpeechStart` → TTS bị giết sau vài chục ms. Đã bỏ `tts.stop()` khỏi `_onNativeStart`, interrupt chỉ ở `_finalize` khi không phải echo. **Mic khoá 1 ngôn ngữ** — xác nhận thư viện chỉ nhận 1 locale/lần (`EXTRA_LANGUAGE` đơn) → không giả vờ hỗ trợ song song; implement Phương án C (transcript → detect language có confidence → direction = detected → cặp kia) + đảo locale NGAY khi no-match/timeout+có partial + sau mỗi utterance. **`LANGUAGE_CONFIG` trung tâm** (`languageConfig.js`): stt/tts locale riêng, flag, name; `resolveVoiceForLanguage` xử lý Android `LANG_AVAILABLE(-1)` bị react-native-tts map sai thành reject → coi là thành công; `lang_missing_data`/`not_found` → tìm giọng cài sẵn → hết giọng báo `translator.no_voice` + hướng dẫn cài language pack. UI: bỏ "Listening vi" → **"Listening…" + cặp `vi ↔ ja`**, khi nói → **"🗣 Japanese detected"**; low-confidence giữ listenLang; `_listenSeq` guard chống race finalize; log `[Conversation]` đầy đủ (partial/final/detected+conf/direction/translation/tts). ESLint 0 error, Babel OK 8 file, check-i18n pass (EN 911/JA 911/PT 911/VI 912). Còn cần QA Android thật (Test 18–21); giới hạn trung thực: 1 người nói liên tục có thể rơi 1 câu khi micro đảo ngôn ngữ.

## Verify commit này
- [x] `FeatureTab.js`: `inventory` thêm `minRole:'LEADER'` (STAFF không thấy).
- [x] `Manager.js` + `OvertimeConfirm.js`: 0 còn `axios.`/`import axios` (rg exit=1 → trống).
- [x] `eslint --fix` trên 3 file đổi: 0 error mới (14 warning ko-inline/no-shadow = pattern sẵn có).
- [x] Babel parse từng file OK.
- [x] `OvertimeConfirm.js`: fix JSX vỡ pre-session (thẻ mở `<Text>` header title bị mất) → parse OK.
- [x] `Manager.js`: fix no-dupe-keys `reasonText` (rename key thứ 2 → `reasonTextAlt`, không đổi behavior).
- [x] TODO.md + `docs/ADMIN_PAGE_REDESIGN.md` đã cập nhật.

## 🟢 P6 — Conversation Translator → Backend Interpreter (hrmMetal, cloud STT/TTS)

Thay pipeline on-device (STT đơn-locale + TTS thiết bị — giới hạn "mic khoá 1 ngôn ngữ, rơi câu khi đảo locale, tiếng Nhật không phát âm") bằng **pipeline backend thời gian thực**: mic raw PCM16 → Socket.IO → hrmMetal `initInterpreter` (Deepgram STT multi/dual-stream → Translation DeepL/Gemini/MyMemory → ElevenLabs TTS) → phát âm lại. Backend đã hoàn tất (xem TODO hrmMetal, `src/socket/interpreter/`, tsc clean).

### P6-001 — Mobile: interpreter socket client + MicStream + TTS audio player
- **File (mới):** `src/services/conversation/interpreter/config.js` (URL + sampleRate 16000 + micProvider + readyTimeout), `interpreterSocket.js` (kết nối socket.io RIÊNG tới hrmMetal; emit `interpreter:start {sessionId,langA,langB}` + `interpreter:audio` binary + `interpreter:interrupt/stop`; nhận `ready/speech_partial/speech_final/language_detected/translation_started/translation_completed/tts_started/tts_audio/tts_completed/interrupted/error`), `micStream.js` (MicStream pluggable — `react-native-live-audio-stream` qua **require động** để app vẫn bundle khi chưa cài lib; báo `mic_engine_missing`), `audioPlayer.js` (TtsAudioPlayer — gom chunk base64 → ghi file tạm `react-native-fs` → trả `file://` URI cho react-native-video phát).
- **Acceptance criteria:**
  - [x] Socket client đúng protocol backend; mic stream base64→ArrayBuffer gửi binary.
  - [x] MicStream không crash khi lib chưa cài (lỗi rõ ràng); ESLint 0 error mới, Babel OK.

### P6-002 — ConversationManager v3 (thay engine on-device)
- **File:** `src/services/conversation/conversationManager.js` (rewrite, GIỮ public API + CONV_STATE để UI không đổi)
- **Implementation:** start → CONNECTING → emit start → `ready` → mic.start → LISTENING; `speech_partial` → DETECTED (partial text live); `translation_completed` → bubble A/B (speaker theo sourceLang); `tts_audio` → gom chunk; `tts_completed` → viết file + phát (voice ON) hoặc bỏ (voice OFF); `speech_started`/`interrupted` → dừng phát; queue count theo `translation_started/completed`; `updateLangs` khi đang chạy → restart session; pause/resume = stop/start mic (giữ socket); stop/destroy → stop mic + `interpreter:stop` + disconnect. Thêm CONV_STATE.**CONNECTING**/.**INTERRUPTED**.
- **Acceptance criteria:**
  - [x] Public API (`start/stop/pause/resume/toggleVoice/toggleAutoDetect/updateLangs/clearHistory/destroy/subscribe`) giữ nguyên; emit payload giữ key cũ + thêm `ttsUri/ttsPlaying`.
  - [x] ESLint 0 error mới, Babel OK.

### P6-003 — UI: ConversationPanel + Translator
- **File:** `src/components/ConversationPanel.js`, `src/screens/Translator.js`, `locales/*`
- **Implementation:** panel thêm case CONNECTING (`translator.connecting`) + INTERRUPTED; render hidden `<Video>` (react-native-video, `audioOnly`, key=ttsUri) phát TTS, `onEnd/onError` → `onTtsEnd`; Translator truyền `ttsUri/ttsPlaying/onTtsEnd`. Thêm 4 key × 4 locale: `translator.connecting`, `translator.interrupted`, `translator.mic_engine_missing`, `translator.server_error`.
- **Acceptance criteria:**
  - [x] Babel parse sạch; ESLint 0 error mới trên 2 file; check-i18n pass (EN/JA/PT 915, VI 916 = false-positive `window` cũ).
  - [ ] QA thiết bị: nói vi↔ja có bubble + phát âm đúng ngôn ngữ đích; chen ngang dừng TTS.

### P6-004 — Gỡ API_KEY_GOOGLE (security #23)
- **File:** `src/utils/constans.js`, `src/screens/ChatScreen.js`
- **Implementation:** bỏ `API_KEY_GOOGLE` hardcode khỏi constans.js; ChatScreen `handleTranslateMessage` chuyển từ Google Translate (key suspended, 403) sang `translateText` (MyMemory) + `detectLanguage` (nguồn = detect hoặc `vi`, đích = ngôn ngữ UI); bỏ import axios (giờ unused, đã có `apiClient`).
- **Acceptance criteria:**
  - [x] Không còn `API_KEY_GOOGLE` trong codebase (rg = 0).
  - [x] ChatScreen không thêm lỗi eslint mới (prettier pre-existing giữ nguyên); Babel OK.
  - [ ] Dịch tin nhắn trong chat vẫn hoạt động (QA thiết bị).

### Ghi chú (trung thực)
- **Mic cần lib native chưa cài:** `react-native-live-audio-stream` (đổi `INTERPRETER.micProvider` nếu dùng lib khác). Phải `npm i` + `pod install` + **rebuild app** — sau đó mic stream mới hoạt động; chưa cài thì UI báo `mic_engine_missing`.
- **Server interpreter:** điểm nối = `INTERPRETER_BASE_URL/INTERPRETER_PORT` trong `constans.js` (mặc định `http://126.111.50.171:4000` — đổi theo nơi hrmMetal chạy).
- **Chưa thể test thật** tới khi có API keys (Deepgram/ElevenLabs/DeepL/Gemini) trong `hrmMetal/.env` (đang rỗng) + rebuild app + thiết bị.

## 🟣 P7 — Redesign trang Translation thành "Live Meeting Translator" (UX-first)

Thay đổi theo yêu cầu: không sửa AI/backend, chỉ **thiết kế lại trang dịch thuật + UX** — tối giản, tập trung "nghe → dịch → hiểu", dùng trong cuộc họp. Mặc định **Japanese → Vietnamese**, 3 chế độ âm thanh (**Tap to Speak** mặc định).

### P7-001 — ConversationPanel (màn hình hội thoại) thiết kế lại
- **File:** `src/components/ConversationPanel.js`
- **Implementation:** mic trạng thái lớn (🎙 Tap to Start / ● Listening / ● Translating / ⚠ lỗi + Retry); FlatList message (Original neutral + Translation nổi bật + 🔊 Speak + Copy); **smart scroll** (tự xuống khi ở dưới cùng, nút `↓ New messages` khi user xem phần cũ); empty state; nút Start/Stop duy nhất; không còn speaker A/B, pause/resume, voice/auto-detect toggle trên màn hình chính; dùng `useTheme().colors` cho dark/light mode.
- **Acceptance criteria:**
  - [x] ESLint 0 error, Babel OK, check-i18n pass.

### P7-002 — Translator screen (Live Meeting Translator)
- **File:** `src/screens/Translator.js`, `locales/*`
- **Implementation:** header + nút History/Settings (nhỏ); language row `🇯🇵 ⇄ 🇻🇳` (chạm mở picker, nút swap); **3 chế độ âm thanh** trong Settings bottom sheet (Auto Speak / Tap to Speak mặc định / Text Only); mọi audio phát bằng **react-native-tts local** theo NGÔN NGỮ ĐÍCH (không phụ thuộc ElevenLabs backend): auto = tự đọc message mới, tap = bấm 🔊, text = ẩn 🔊; History bottom sheet (lưu AsyncStorage: timestamp/source/translation/lang); copy + toast "Copied ✓"; mặc định `ja→vi`; lưu cài đặt AsyncStorage; xử lý background → auto-stop mic; lỗi giữ nội dung đã dịch (không mất).
- **Acceptance criteria:**
  - [x] ESLint 0 error, Babel OK, check-i18n pass (thêm 22 key × 4 locale).
  - [ ] QA thiết bị: Start→nghe JA→dịch VI→hiển thị→tiếp tục nghe; 3 mode âm thanh đúng; smart scroll; copy; lịch sử; dark/light.

### P7-003 — Engine on-device (bỏ backend interpreter) + fix bundle Metro
- **File:** `src/services/conversation/conversationManager.js` (rewrite), `micStream.js` (fix require động), xóa `src/services/conversation/interpreter/`, `src/utils/constans.js` (gỡ `INTERPRETER_BASE_URL/PORT`)
- **Implementation:** theo yêu cầu "on-device hoàn toàn (mic + MyMemory + tts)". `ConversationManager` rewrite: dùng `SpeechRecognitionService` (`@react-native-voice/voice`) nghe liên tục theo NGÔN NGỮ NGUỒN → `detectLanguageWithConfidence` → `translateText` (MyMemory, free) → emit message `{id,timestamp,sourceLanguage,originalText,translatedText,toLang}`; nghe lại liên tục sau mỗi utterance (không cần backend/API key/lib mic streaming). **Fix bundle:** `micStream.js` dùng `require(providerName)` động → Metro chặn cả app không bundle được; đổi sang truy cập `NativeModules` trực tiếp. Xóa folder `interpreter/` (socket + MicStream + audioPlayer + config) vì không còn dùng; gỡ `INTERPRETER_BASE_URL/PORT` khỏi constans.
- **Acceptance criteria:**
  - [x] App bundle thành công (Metro không còn chặn dynamic require).
  - [x] ESLint 0 error, Babel OK, check-i18n pass.
  - [x] Chạy trên thiết bị Android: app khởi động, hết lỗi `Interpreter socket connect_error` (đã bỏ backend).
  - [ ] QA thiết bị: nói JA → dịch VI → hiển thị → tiếp tục nghe (cần người nói thật + vào màn Translator).

### Ghi chú P7 (trung thực)
- Engine on-device: mic `@react-native-voice/voice` (đã cài + link), dịch `MyMemory` (free, cần internet), TTS `react-native-tts` (đã cài). **Không cần server, không API key.**
- Đã kiểm tra trên thiết bị Android: app chạy, bundle OK, hết lỗi backend interpreter. Luồng nghe→dịch→đọc cần người nói thật để QA đầy đủ.
