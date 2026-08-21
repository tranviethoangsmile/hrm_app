# Check-in Camera Redesign Plan

## Audit Scope

Files and systems reviewed:

- `src/screens/Checkin.js`
- `src/components/ComfirmDayOrNight.js`
- `src/components/common/QRCode.js`
- `react-native-camera-kit` `CameraScreen`
- `src/utils/constans.js` check-in/order endpoints
- `MainNavigator` route `Checkin`
- Redux auth state and token storage
- `apiClient` authentication behavior
- Existing Check-in i18n keys in all four locales
- Android camera permission and iOS camera usage declaration
- `moment` date/shift handling and related attendance calendar rendering

## Current Flow

1. `Checkin` mounts a full-screen `CameraScreen` with barcode scanning enabled.
2. `onReadCode` is guarded by `isScanned`, then dispatches based on the QR value:
   - `checkin`: officer users post directly; other users open shift selection.
   - `picked`: executes the existing order/user PUT flow.
   - anything else: opens the existing QR content modal.
3. The normal check-in shift modal chooses `DAY` or `NIGHT`.
4. Night shift then chooses `IN` or `OUT`.
5. `ConfirmDayOrNight` posts the existing check-in payload with
   `user_id`, `date`, `check_time`, and `work_shift`.
6. NIGHT OUT uses `checkin.date - 1 day`; this rule must remain unchanged.
7. Successful check-in shows `ModalMessage` and navigates to `Profile` after the
   current delay.

## Business Rules To Preserve

- QR values and their existing routing behavior.
- Officer/non-officer branching.
- DAY shift selection.
- NIGHT shift selection with separate IN and OUT actions.
- NIGHT OUT date calculation using the previous calendar day.
- Existing check-in and picked/order API requests and payloads.
- Existing auth/token requirements.
- Existing scan guard timing and retry behavior until product/business owners
  approve a different scanner policy.
- Existing success destination (`Profile`) and message behavior.

## New UI Structure

### Header

- Theme-aware top bar over the camera with Back and localized “Check-in”.
- Back calls the existing navigation destination and unmounts the camera.
- No extra actions unless they already have a real supported behavior.

### Camera stage

- Keep `CameraScreen` as the scanner implementation.
- Put a restrained dark overlay over the preview for legibility.
- Add a centered bracket-style scan frame using four corners, not a heavy box.
- Add a lightweight scan line only while the scanner is ready.
- Keep the preview as the dominant visual area and avoid unnecessary controls.

### Status panel

- Show one concise state at a time: waiting, detected/processing, success or
  error.
- Show the current date/time only if it can be derived from existing local time
  without changing the API payload.
- Show a compact current-shift hint only when existing state can provide it;
  do not invent a shift.

### Existing shift flow

- Preserve `ConfirmDayOrNight` as the business-flow owner initially.
- Restyle its DAY/NIGHT and NIGHT IN/OUT choices with theme tokens, clear
  labels, large touch targets and a bottom-sheet/modal hierarchy.
- Do not move date calculation or API calls into the screen UI.

### Feedback

- Keep `ModalMessage` for existing API result behavior, but pair it with a
  clear inline processing/error overlay where appropriate.
- Keep the QR content modal behavior for non-check-in codes unless product
  explicitly removes that existing behavior.
- Replace technical error text only at the presentation boundary; do not alter
  API error handling or status decisions in this task.

## Permission and Lifecycle Plan

- First verify the actual CameraKit permission behavior on Android and iOS.
- If CameraKit exposes no usable JS permission state, add a UI fallback only
  around the existing camera error/unavailable callback; do not fake a granted
  state.
- Use screen focus/AppState only to pause or unmount the camera preview when
  leaving/backgrounding, while preserving all check-in state required by the
  current flow.
- Ensure no new camera instance, interval, or scanner listener is created for
  each render.
- Clean up temporary animations and timers on unmount.

## Implementation Order

1. Add missing Check-in i18n labels in all four locales.
2. Add theme-aware Check-in layout and scan-frame components/styles.
3. Connect existing `handleQRCodeScanner`, modal state, and retry state without
   changing business branches.
4. Restyle the existing shift confirmation component without moving its API or
   date rules.
5. Add processing/success/error/permission presentation only where current
   state exposes enough information.
6. Add lifecycle cleanup and verify CameraKit behavior on Android/iOS.
7. Run targeted lint/Babel/i18n checks, then device smoke tests.

## Explicit Non-Goals

- No change to check-in/check-out API contracts.
- No change to day/night date semantics.
- No new QR format or validation rule.
- No new photo, gallery, GPS, map, analytics or scan-history feature.
- No migration from CameraKit to another scanner in this UI task.
