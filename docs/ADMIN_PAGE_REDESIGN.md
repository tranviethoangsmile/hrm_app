# ADMIN PAGE REDESIGN — Bản thiết kế (đối chiếu BE thật)

Nguồn BE: `/Users/hoangdev/Desktop/hrmMetal` (đã xác minh từng router/controller).

## 1. Nguyên tắc phân quyền (ground truth)

| Đối tượng | Vai trò trên admin page | Ghi chú |
|---|---|---|
| **ADMIN** | Xem toàn bộ approvals, `GET /overtimerequest/getAll` (router `requireRoles(['ADMIN'])`), dayoffs create/update/delete (ADMIN-only), taxdependent update-status/dependent confirm | role gate tại router |
| **MANAGER** | Duyệt leave (là leader của team) + tăng ca; KHÔNG gọi được `/overtimerequest/getAll` | `PAID_LEAVE/search` theo `leader_id` |
| **LEADER** | **Chủ sở hữu Inventory** (`/inventory/search` + `/dashboards/leader/inventorys/update-inventory` với `department_id` từ token), duyệt leave team mình, confirm tăng ca | |
| **STAFF** | Không vào Manager page (đã chặn), KHÔNG xem Inventory | |

## 2. Phát hiện sai lệch hiện tại (FE vs BE)

| # | Vị trí | Hiện tại | Thực tế BE | Mức |
|---|---|---|---|---|
| F1 | `FeatureTab.js` item `inventory` (→ `Report`) | `category:'work'`, KHÔNG `minRole` → STAFF thấy | Inventory thuộc LEADER | **Fix** |
| F2 | `Manager.js`, `OvertimeConfirm.js` | gọi `axios` raw (không token) → 401 (cùng class bug P5FIX-001) | cần `apiClient` (gắn `Authorization`) | **Fix** |
| F3 | — | (xét nghiệm: KHÔNG tồn tại — hiện tượng "n trailing" chỉ là artifact flag `rg -r`) | — | — |
| F4 | `Manager.js` Overtime tab | title dùng `manager.overtime.*`, màn manager TẠO tăng ca | roadmap: chia rõ "Leader approve" vs "Staff request" | Phase C |

> Lưu ý cấu trúc: màn "admin" thực tế = `Manager.js`, đăng ký route **`ReportView`**, vào từ menu `RpV` (minRole LEADER). "Inventory" = `Report.js` (route `Report`).
| F5 | `Report.js` (inventory) | đã chuyển `apiClient` (P5FIX-001) nhưng chưa role-gate | leader-only | Phase B |

Endpoint inventory (đã xác minh):
- `POST /v1/inventory/search` — body `{department_id}` (Report.js đã dùng đúng)
- `POST /v1/dashboards/leader/inventorys/update-inventory` — body `{id, quantity, product?}`; `department_id` từ token leader (controller ghi đè)

## 3. Kế hoạch theo phase

### Phase A — Đúng quyền & đúng kênh HTTP (đã làm ✅)
- [x] **A1.** `FeatureTab.js`: item `inventory` thêm `minRole:'LEADER'`.
- [x] **A2.** `Manager.js`: `axios` raw → `apiClient` (5 call: leave search/reject/approve + create overtime + get all users).
- [x] **A3.** `OvertimeConfirm.js`: `axios` → `apiClient` (2 call: getByUserId, updateIsConfirm) + **fix JSX vỡ do bản sửa trước** (thẻ mở `<Text>` header title bị mất → parse error).
- [x] **A4.** Manager entry = route `ReportView`, menu `RpV` (đã minRole LEADER) — giữ guard STAFF ở đầu screen.
- [x] **A5.** TODO.md cập nhật; ESLint 0 error (14 warning pre-existing style), Babel parse OK.

### Phase B — Inventory module của LEADER
- [ ] Tách phần Inventory của `Report.js` thành flows leader rõ ràng: list (dept), sửa số lượng qua `/dashboards/leader/inventorys/update-inventory`, nút "Cập nhật" chỉ hiện role LEADER/MANAGER/ADMIN.
- [ ] Thêm mục Inventory vào nhóm menu leader (không cho STAFF).

### Phase C — Approval hub đúng BE
- [ ] Manager page: 3 ngăn Leave / Overtime / Employees → 4 ngăn + badge count.
- [ ] Overtime: ADMIN xem toàn bộ (`/getAll`), LEADER/MANAGER confirm theo team (`is_confirm`); ẩn nút create tăng ca khỏi view manager khi role là LEADER? (theo hợp đồng: create là của người xin) — kiểm tra lại `updateisconfirm` body `{id, user_id}`.
- [ ] Employee directory: `GET /users` chỉ ADMIN/MANAGER — LEADER phải dùng `/users/search` với tham số phù hợp (nếu có) hoặc chuyển qua `getuserwithdepartmentid`.

### Phase D — UI thống nhất
- [ ] Đổi gradient cứng `['#667eea','#764ba2']` → `colors.primaryGradient` (chuẩn DESIGN.md).
- [ ] Đồng bộ label i18n `manager.*`/`overtime.*` đủ 4 locale.
- [ ] Dọn mangled tên trong `Manager.js` (F3).

## 4. Acceptance
- STAFF: không thấy Inventory, không vào Manager (maintain P4-008).
- LEADER: vào Manager, duyệt leave team, xem/sửa inventory của department mình (không 401).
- MANAGER/ADMIN: giữ nguyên quyền admin; ADMIN thêm được getAll overtime.