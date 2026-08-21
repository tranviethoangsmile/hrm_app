# Translator UI Redesign

## Current UI

- `Translator.js` owns language direction, audio mode, AsyncStorage settings,
  session subscription, replay and TTS playback.
- `ConversationPanel` renders the timeline with FlatList, live partial speech,
  status, replay/copy actions and pause/stop controls.
- Audio mode is already a bottom sheet with Auto Speak, Tap to Speak and Text
  Only. Auto Speak is the default.
- TTS is serialized by `TextToSpeechService`; replay uses the stored
  `translatedText` and does not call MyMemory.
- Settings are stored in `live_meeting_translator_settings` through AsyncStorage.

## Problems

- The audio sheet does not expose reading speed.
- TTS initializes with a fixed native rate (`0.45`) and has no public speed
  setting.
- The bottom control shows the audio mode but not the current speed.
- A playing message only changes its icon; it does not clearly say that it is
  speaking.
- Some small action targets are below the 44pt accessibility target.
- No translation or STT engine changes are required for this UI task.

## New UX

The product remains a dark-first Meeting Interpreter. The conversation timeline
is the primary content; audio controls are compact and open one bottom sheet.

- Header: Meeting Interpreter, direction, live/ready status.
- Timeline: source text, translated text, timestamp, replay and copy.
- Live card: partial speech only, visually distinct from history.
- Bottom bar: `Audio · 1.0x`, Pause/Resume, Stop/Start.
- Audio sheet: three audio modes and six reading-speed presets.

## New Layout

```text
Meeting Interpreter                         LIVE
Japanese             [swap]                 Vietnamese

Conversation timeline
  source segment
  translated segment                     [play] [copy]
  source segment
  translated segment                     [play] [copy]
  live partial speech

[Audio · 1.0x]              [Pause] [Stop]
```

The existing session/timeline implementation is retained and restyled rather
than duplicated. No dashboard, chat bubbles or technical API information is
added.

## TTS Speed

`react-native-tts` documents `setDefaultRate(rate)` as a float from `0.01` to
`0.99`. The app keeps a product-level multiplier and maps it from the existing
normal native rate of `0.45`:

```text
nativeRate = clamp(0.45 * multiplier, 0.01, 0.99)
```

Presets: `0.75x`, `0.85x`, `1.0x`, `1.15x`, `1.25x`, `1.5x`. Default: `1.0x`.
The service applies the current mapped rate immediately before every queued
utterance, so new speech and replay use the current speed without translation.

## Audio Settings

The existing bottom sheet becomes the single Audio Settings surface:

- Auto Speak, Tap to Speak, Text Only.
- Reading Speed preset row.
- Current selected state and immediate feedback.

No new native TTS package or voice-selection system is introduced.

## Conversation Timeline

The existing FlatList remains virtualized. Partial transcript updates only the
live card. Final messages keep their source/target direction and independent
timestamp. New messages auto-scroll only while the user is already at the end.

## Replay

Replay calls the existing TTS queue with `translatedText` and the current speed.
It never creates a new message and never calls MyMemory. One active TTS queue is
preserved, so replay cannot overlap automatic speech.

## Responsive Design

- Keep timeline flexible and controls inside safe horizontal padding.
- Keep action targets at least 44pt.
- Use FlatList rather than a nested ScrollView.
- Keep light/dark colors from the existing theme tokens.
- Keep labels localized in all four project locales.

## Implementation Plan

1. Add rate mapping and a public `setSpeed()` to `TextToSpeechService`.
2. Persist/load `ttsSpeed` beside the existing audio mode.
3. Add speed presets and selected state to the current audio sheet.
4. Show current speed in the compact bottom control and speaking status on the
   active message.
5. Run targeted lint, Babel, i18n, Android build and device smoke checks.

## Non-Goals

- No change to MyMemory or translation request flow.
- No change to STT or speech segmentation.
- No replacement of the TTS engine.
- No new background service, analytics, waveform or voice architecture.
