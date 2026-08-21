# Check-in Redesign Notes

These are audit findings only. They are not changed by the UI redesign.

## Business/Integration Findings

1. `Checkin.js` defines `isValidQRCode`, but the function is not used before
   routing non-special QR values to the content modal. Confirm whether this is
   intentional before changing QR validation.
2. `handleScannerQRCodePicked` checks `checked?.success` on the Axios response,
   while the normal check-in path checks `result?.data?.success`. This may make
   the picked/order success branch report failure even when the backend returns
   success. Do not change without API confirmation.
3. The picked flow changes `checkin.date` to a Moment object before its PUT,
   while the normal payload starts with a formatted date string. Confirm the
   backend serialization contract.
4. `timeCheckin` is passed to `ConfirmDayOrNight` but is never populated in
   `Checkin.js`; the child currently generates its own `check_time`. Confirm
   whether the prop can be removed in a separate cleanup task.
5. Check-in and picked requests use direct Axios plus token headers instead of
   `apiClient`. This is an auth/integration concern, not a UI change.
6. The officer branch reads `authData.data.data.is_officer`, while the current
   project TODO documents that this field was removed from the login payload.
   Verify the current backend/profile source before changing the branch.

## Lifecycle Findings

1. `Checkin` does not explicitly subscribe to AppState or navigation focus and
   does not expose a camera permission/error state. CameraKit currently owns the
   preview lifecycle; this must be verified on physical Android and iOS devices.
2. The scan guard resets after 3 seconds for arbitrary QR values and 10 seconds
   for `checkin`/`picked`, independent of API completion. This is existing scan
   policy and should not be changed in a UI-only task.
3. The current back action navigates to `Main` rather than calling `goBack`.
   Preserve the intended destination while ensuring the camera unmounts; do
   not change stack semantics without navigation testing.

## Testing Blockers

- Camera permission, AppState pause/resume, CameraKit release behavior and
  duplicate scan behavior require physical Android/iOS smoke tests.
- Day/night business outcomes require valid backend QR codes and a connected
  API environment.
