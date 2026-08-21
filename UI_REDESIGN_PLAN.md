# UI Redesign Plan

## Current UI

### Navigation and app flow

- `MainNavigator` uses one stack with `Splash` as the entry route and no native
  header. `Splash` routes to `Language`, `Login`, `FirstLoginPassword`, or
  `Main`.
- `Main` is a two-page content shell (`HomeTab` and `FeatureTab`) with a
  five-slot bottom bar: Home, Message, Check-in, Notifications, and Features.
- `Setting` is reached from the Home side menu (`Control`), not from the
  bottom bar. `Translator` is currently reached from the Features list.
- Auth state is Redux `state.auth.data`; the token and cached user values are
  stored in AsyncStorage. `apiClient` clears the session and resets to Login
  after a 401.

### Splash

- Shows a large image logo, gradient background, progress bar and animated
  loading label.
- Reads `Language`, then waits a fixed three seconds before checking
  `FIRST_LOGIN_REQUIRED`, `userInfor`, and Redux auth state.
- Uses `navigate('Language')` for first launch and `replace` for later routes.
- Problems: initialization is visually tied to a fake timer, the destination
  decision is split between storage and Redux, and the version string is
  hard-coded.

### Login

- Uses a gradient hero, logo image, username/password inputs, password reveal,
  save-login checkbox, dark-mode toggle and a gradient submit button.
- Uses `axios` directly for the login endpoint, then stores the auth payload,
  token, user information and optional saved plaintext credentials.
- Blocks duplicate submits with `visible`, but errors can expose raw backend or
  Axios messages through `Alert`.
- Problems: the page is visually heavier than necessary, input behavior is
  duplicated locally, error copy is not safely normalized, and some labels use
  legacy string keys/defaults instead of a coherent auth namespace.

### First-launch Language Selection

- Supports `en`, `vi`, `ja`, and `pt` but labels are hard-coded and lack flags.
- Saves `Language` immediately when a row is pressed; `Next` navigates to Login
  even if no language is selected.
- Uses legacy colors and a plain `FlatList` inside an otherwise static screen.
- Does not call `i18next.changeLanguage` after selection.

### Home and main shell

- `HomeTab` is primarily an information/news feed. It fetches posts and event
  data, handles notifications and special-day modals, and shows a gradient
  greeting hero with avatar.
- The current hero has a menu button and collapse control. The feed supports
  media, link previews, events, refresh, and an empty state.
- `FeatureTab` contains a search field and a long grouped feature catalog. Each
  feature currently uses an independent bright gradient, which makes the page
  feel like a dashboard rather than a focused productivity home.
- `Main` hides the bottom navigation while scrolling and includes a prominent
  check-in action plus message/notification destinations.
- Problems: the product's most important feature, Translation, is not visible
  on Home; there are many unrelated HRM actions competing for attention; some
  feed metadata is fake (`Math.random()` view counts and local like state); the
  shell has hard-coded colors and labels; and the current bottom bar has no
  direct Settings or Translation destination.

### Settings

- Uses a gradient header, theme toggle, Change Password row, Support row, a
  language list and an Apply button.
- Language is persisted under `Language` and theme under
  `theme_preference`. Theme currently supports a boolean light/dark value with
  system preference only used as the initial fallback.
- Translation source/target, Auto Detect and TTS mode are not exposed here;
  Translation stores only its own language/audio settings.
- Logout is handled elsewhere by `Control` and is not a dedicated Settings
  action with confirmation.
- Problems: settings are not grouped by user intent, rows lack subtitles/value
  hierarchy, theme is not a System/Light/Dark choice, and there is no unified
  account/profile/logout section.

## Problems

1. The app has a modern purple token set, but common `Button`, `Input`, and
   `Card` still consume legacy static `COLORS`, so dark mode and surface
   behavior are inconsistent.
2. Spacing, radius, typography and shadows are distributed as screen-local
   constants. `SIZES` contains legacy names and oversized body values rather
   than a clear mobile scale.
3. Gradient usage is excessive in Home, Features, Login and Settings. The new
   visual direction should reserve gradients for brand moments and primary
   emphasis.
4. The first-launch flow needs one explicit decision function: read language,
   validate auth/session, handle first-password state, then reset to exactly one
   destination.
5. Existing backend/API, translation, notification, feed and HRM feature
   behavior must remain unchanged while the presentation layer changes.

## New Design Direction

Use a restrained “AI productivity assistant” system:

- Warm neutral surfaces in light mode and layered charcoal surfaces in dark
  mode, with violet as the single brand accent.
- One primary Translation entry point on Home, with a smaller secondary text
  action and Settings access. Keep the existing HRM catalog available through
  Features instead of duplicating it on Home.
- Use cards only for meaningful actions or content. Use dividers and grouped
  rows for Settings.
- Use one icon family per context, 44pt minimum touch targets, short labels and
  clear pressed/disabled/loading states.
- Keep motion to short fade/translate/scale transitions; no continuous hero or
  dashboard animation.

## Design System

### Colors

Extend `src/config/theme.js` without removing legacy keys:

- `primary`, `primaryLight`, `primaryDark`, `primaryGradient`
- `background`, `surface`, `surfaceSecondary`
- `text`, `textSecondary`, `textTertiary`
- `border`, `success`, `warning`, `danger`, `error`
- `overlay`, `focusRing`, and semantic shadow values

Use the same semantic keys in both themes. Avoid screen-level color literals
except for white text over a verified brand background and platform status bar
requirements.

### Typography

Add semantic styles to `FONTS`: `display`, `title`, `heading`, `body`,
`bodyMedium`, `label`, and `caption`. Keep system fonts for performance and
localization. Do not use oversized legacy `body1/body2` values for new UI.

### Spacing and radius

- Spacing: `xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `xxl: 24`,
  `xxxl: 32`, `section: 40`.
- Radius: `sm: 10`, `md: 14`, `lg: 20`, `pill: 999`.
- New screen styles should consume these tokens rather than random margins.

### Shared components

Evolve or add a small shared set under `src/components/common`:

- `AppButton`: primary, secondary, outline, ghost and danger variants with
  loading/disabled/pressed states.
- `AppInput`: label, focus, error, secure toggle and accessibility defaults.
- `AppCard`: theme-aware surface, border and optional subtle elevation.
- `SettingsRow`: icon, title, subtitle, value and chevron/accessory.
- `ScreenHeader`: consistent title/back/action treatment for secondary screens.
- `LanguageOption`: flag, localized label, selected check and accessibility
  state.

Preserve existing component APIs where they have broad consumers; migrate
these five screens incrementally.

## Splash

- Keep the existing logo asset and brand identity, but use a quiet surface or
  restrained violet backdrop with logo, app name and a one-line translation
  assistant promise.
- Run initialization immediately in one effect. Do not wait a fixed three
  seconds. Show a small loading indicator only while storage/auth checks are
  actually pending.
- Use a navigation reset/replace decision table:
  - no `Language` -> `Language`
  - first password required and cached user -> `FirstLoginPassword`
  - valid auth -> `Main`
  - otherwise -> `Login`
- Guard the effect against unmount and prevent duplicate navigation.

## Login

- Use a simple centered brand header and one form surface. Keep the theme
  switch as an icon action if it is still needed, not as a competing hero
  element.
- Use shared inputs with username/email and secure password behavior, inline
  validation, keyboard-aware scrolling and a single full-width primary button.
- Keep existing login endpoint, token persistence, first-password route,
  notification registration and auth dispatch.
- Normalize errors to localized user-safe messages. Never render raw Axios
  error text. Keep save-login behavior only if product requirements confirm it;
  do not add social login or forgot-password behavior without backend support.

## Language Selection

- Use an i18n-safe title/subtitle with four real supported locales: English,
  Vietnamese, Japanese and Brazilian Portuguese.
- Render selectable rows with flags, localized/native language names, selected
  border/check and a disabled button until a locale is chosen.
- Save `Language`, call `i18next.changeLanguage`, then reset to Login so the
  first-launch stack cannot return to Splash.
- Returning users bypass this route; Settings reuses the same option component.

## Home

- Keep the real greeting/user profile and the real information feed available,
  but make Translation the first and strongest action.
- New hierarchy: greeting/profile action, one Conversation Translator hero,
  one compact Text Translation action, then a restrained “Information” feed
  with the existing real posts/events. Keep empty/loading/error states honest.
- Do not add fake statistics, view counts, recent translations or AI scores.
- Keep the existing side control, post media/events, refresh and navigation
  behavior. Use subtle press feedback instead of multiple gradient cards.
- Redesign the main bar around existing destinations without silently removing
  Message, Check-in, Notifications or Features. Settings can remain in the
  side menu unless product approval explicitly changes information architecture.

## Settings

- Use a compact header and grouped sections:
  - Account: real profile summary, Change Password, Support
  - Translation: source/target, Auto Detect, Translation Audio
  - Appearance: System/Light/Dark
  - App: Language, About/version if real data exists
  - Danger: Logout with confirmation
- Persist translation preferences under the existing translator settings key or
  extract a shared settings helper; do not create competing state managers.
- Add selection sheets for language, theme and audio modes rather than long
  always-open lists.
- Keep the existing navigation destinations and use `clearSession()` for
  logout so token/user storage and stack reset remain centralized.

## Navigation

- Keep the current stack route names during the redesign.
- Replace only post-auth/first-launch transitions that need stack clearing with
  `navigation.reset` or `replace`; never navigate from Splash into a growing
  auth stack.
- Do not create a second navigation container or duplicate session state.

## Responsive

- Use flex layout, max content widths and safe-area aware padding. Avoid fixed
  screen width/height calculations for primary layout.
- Keep forms inside one keyboard-aware scroll container.
- Validate at narrow Android width, large Android width, small iPhone and large
  iPhone widths. Check long localized labels, especially German-like fallback
  expansion and Japanese/Portuguese rows.

## Accessibility

- Minimum 44pt touch targets, meaningful `accessibilityLabel` and
  `accessibilityRole` for buttons/rows.
- Icon-only controls require labels; selected language/theme rows expose
  `accessibilityState={{selected: true}}`.
- Maintain contrast for muted text, error text, disabled controls and both
  themes. Never use color alone for selected/error state.

## Implementation Plan

1. Add semantic design tokens and shared primitives without breaking legacy
   theme keys.
2. Add/normalize i18n namespaces for auth, first-launch, home and settings in
   all four locales.
3. Fix Splash initialization decision flow with no artificial delay.
4. Migrate Login to shared input/button primitives while preserving auth logic.
5. Migrate Language Selection and reuse its option pattern in Settings.
6. Redesign Home hero/action hierarchy while preserving feed and event logic.
7. Redesign Settings and connect existing theme/language/password/support/logout
   behaviors plus translator preferences.
8. Audit Main bottom navigation and cross-screen visual consistency.
9. Run Babel, targeted ESLint, i18n checks and Jest/build checks; then perform
   device smoke tests for first launch, returning user, auth, logout, theme,
   language and keyboard behavior.

## Explicit Non-Goals

- No backend/API contract changes.
- No new fake statistics, analytics, social auth, forgot-password flow or
  translation engine.
- No removal of existing HRM routes or feed capabilities.
- No implementation of this plan in the audit phase.
