# App Redesign TODO

Source of truth for the Splash, Login, first-launch Language, Home and Settings
redesign. Complete and verify each phase before moving to the next.

# PHASE 1 — AUDIT

- [x] Audit current UI
- [x] Audit theme
- [x] Audit navigation
- [x] Audit i18n
- [x] Audit auth
- [x] Audit storage

# PHASE 2 — DESIGN SYSTEM

- [~] Define colors
- [~] Define typography
- [~] Define spacing
- [~] Define radius
- [~] Define button styles
- [~] Define input styles
- [~] Define card styles

# PHASE 3 — SPLASH

- [ ] Redesign Splash
- [ ] Optimize initialization
- [ ] Test navigation

# PHASE 4 — LOGIN

- [ ] Redesign Login
- [ ] Improve form UX
- [ ] Improve keyboard UX
- [ ] Improve loading
- [ ] Improve errors
- [ ] Test authentication

# PHASE 5 — LANGUAGE

- [ ] Redesign Language Selection
- [ ] Save language
- [ ] First launch flow
- [ ] Returning user flow

# PHASE 6 — HOME

- [ ] Redesign Home
- [ ] Main feature card
- [ ] Quick actions
- [ ] Navigation
- [ ] Empty states

# PHASE 7 — SETTINGS

- [ ] Redesign Settings
- [ ] Account section
- [ ] Translation section
- [ ] Appearance
- [ ] Language
- [ ] Logout

# PHASE 8 — CONSISTENCY

- [ ] Check all screens
- [ ] Check colors
- [ ] Check typography
- [ ] Check spacing
- [ ] Check dark mode
- [ ] Check light mode

# PHASE 9 — PERFORMANCE

- [ ] Check unnecessary renders
- [ ] Check image loading
- [ ] Check navigation performance
- [ ] Check startup performance
- [ ] Check memory

# PHASE 10 — TEST

- [ ] Android
- [ ] iOS
- [ ] Small screen
- [ ] Large screen
- [ ] Dark mode
- [ ] Light mode
- [ ] First launch
- [ ] Returning user
- [ ] Login
- [ ] Logout
- [ ] Language change
- [ ] Settings persistence

## Acceptance Notes

- Do not mark a task complete without targeted verification.
- Preserve existing route names and backend/auth behavior.
- Do not introduce fake Home data or unsupported authentication actions.
- Update `UI_REDESIGN_PLAN.md` when implementation decisions differ from the
  approved design direction.

# CHECK-IN CAMERA REDESIGN

Audit and plan: see `CHECKIN_REDESIGN_PLAN.md` and
`CHECKIN_REDESIGN_NOTES.md`. Business findings are intentionally not changed in
the UI task.

- [x] Audit current Check-in screen
- [x] Audit camera implementation
- [x] Audit QR scanning
- [x] Audit check-in business logic
- [x] Audit check-out business logic
- [x] Audit day shift
- [x] Audit night shift
- [x] Audit camera permission
- [ ] Redesign header
- [ ] Redesign camera preview
- [ ] Redesign scan frame
- [ ] Redesign scan status
- [ ] Redesign shift status
- [ ] Redesign check-in/out controls
- [ ] Redesign success state
- [ ] Redesign error state
- [ ] Redesign permission state
- [ ] Add loading state
- [ ] Optimize camera lifecycle
- [ ] Prevent duplicate scanning
- [ ] Release camera on navigation
- [ ] Handle AppState
- [ ] Test Android
- [ ] Test iOS
- [ ] Test day shift
- [ ] Test night shift
- [ ] Test check-in
- [ ] Test check-out
- [ ] Test invalid QR
- [ ] Test permission denied
- [ ] Test network error
- [ ] Test background/foreground
- [ ] Test navigation back
- [ ] Test long session
