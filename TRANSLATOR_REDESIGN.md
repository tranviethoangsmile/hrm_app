# Meeting Interpreter Redesign

## Current System

- `src/screens/Translator.js` owns language selection, text mode, audio mode,
  TTS replay, persistence, AppState handling and conversation subscription.
- `ConversationManager` owns the native speech lifecycle, partial fallback,
  sentence splitting, MyMemory queue and the in-memory message list.
- `SpeechRecognitionService` wraps `@react-native-voice/voice` and receives
  partial, final, end and error callbacks.
- `TextToSpeechService` wraps `react-native-tts` and serializes speech requests.
- `MyMemoryTranslationService` is the only translation engine and enforces the
  500-byte request limit.
- `ConversationPanel` renders a FlatList, current partial speech, message cards,
  replay/copy actions and pause/stop controls.

## Current Problems

- The screen still presents a Google Translate-like language/text workflow before
  the conversation timeline.
- Session coordination is split between the screen and manager. Auto Speak can
  pause STT from a React effect instead of being a session-level operation.
- Partial speech is now kept separate, but segmentation and finalization are
  still coupled to native result timing rather than a dedicated segmenter.
- Message fields have legacy aliases (`originalText`/`toLang`) instead of one
  stable conversation data model.
- Session duration, state and queue status are not presented as one coherent
  interpreter session.
- Latency logs exist, but are not represented in one per-segment metric record.

## New Product Concept

The screen is a **Meeting Interpreter**, not a text translator or chat screen.
The primary loop is:

```text
start meeting
  -> listen
  -> show current partial speech
  -> natural pause
  -> finalize one segment
  -> translate with MyMemory
  -> append one timeline message
  -> speak the translation when Auto Speak is enabled
  -> listen again in the same session
```

## New UX

- Compact header: back, `Meeting Interpreter`, live indicator and language
  direction with one swap action.
- Timeline occupies most of the screen. Every finalized segment remains visible
  as an independent source/translation record.
- A distinct live-speech card is rendered after the timeline and never enters
  history until finalization.
- Bottom controls are limited to audio mode, pause/resume and stop/start.
- When the reader scrolls away from the end, new messages are counted instead
  of forcing an auto-scroll.
- Replay uses the stored `translatedText`; it never calls MyMemory again.

## New UI

```text
< Meeting Interpreter                         LIVE >
        Japanese -> Vietnamese          [swap]

  conversation timeline
  [source language]
  original speech
  [target language]
  translated speech                 [play] [copy]
  timestamp

  [microphone] Listening
  current partial transcript

  [Auto Speak]        [Pause] [Stop]
```

The visual language is dark, high-contrast and restrained. Indigo is reserved
for the active state and actions; there are no dashboard cards, chat bubbles,
large waveform animations or technical API information.

## New State Machine

The session has one owner and one active native microphone:

```text
IDLE -> CONNECTING -> LISTENING
LISTENING -> DETECTED -> FINALIZING -> TRANSLATING
TRANSLATING -> SPEAKING -> LISTENING
TRANSLATING -> LISTENING       (Text Only / Tap to Speak)
LISTENING -> PAUSED -> LISTENING
any active state -> ERROR or IDLE
```

`currentTranscript` is live state. `messages` is history state. A pause keeps
both; stop cleans native resources but leaves the current session messages
visible until a new meeting is explicitly started.

## New Data Model

```js
{
  id,
  sourceText,
  translatedText,
  sourceLanguage,
  targetLanguage,
  timestamp,
  status: 'processing' | 'translated' | 'speaking' | 'completed' | 'error',
  metrics: {
    speechStartTime,
    speechEndTime,
    sttFinalizeTime,
    translationStartTime,
    translationEndTime,
    ttsStartTime,
    ttsEndTime,
  },
}
```

## Speech Segmentation

`SpeechSegmenter` receives partial and native final/end events. Partial results
update only `currentTranscript`. A final result is preferred; when Android
returns an empty final result, the latest non-empty partial is used once. The
segmenter applies a short native silence window and emits exactly one finalized
segment per utterance. It does not call MyMemory for partial results.

## Translation Pipeline

`MyMemoryTranslationService` remains the only engine. `TranslationQueue` accepts
final segments, assigns sequence numbers and processes requests serially. Each
message is inserted before translation with `status: 'processing'`, then updated
by ID. A failed request keeps `sourceText` and gets an error status with retry
available at the message level.

## TTS Pipeline

`TTSQueue` serializes target-language speech. Auto Speak starts immediately when
the message translation is available. The session temporarily pauses native STT
while device TTS is audible, then resumes the same session, preventing feedback
without destroying history. Tap to Speak enqueues the stored translation; Text
Only hides audio actions.

## Performance Strategy

- Record one metric object per segment, not one React state update per partial.
- Keep partial text outside `messages` so old FlatList rows do not change.
- Use a serial translation queue to preserve order and avoid duplicate requests.
- Start translation immediately after finalization and start TTS immediately after
  a successful response.
- Use FlatList virtualization and only keep a bounded in-memory timeline.
- Log `STT`, `MyMemory`, `TTS` and total latency in development builds.

## Background Strategy

The first implementation keeps the current safe behavior: backgrounding stops
the active microphone session. Android foreground-service microphone support is a
separate phase and must be implemented natively, not simulated with timers. iOS
background microphone support remains subject to platform audio-session limits.

## Migration Plan

1. Introduce the stable message/metrics model without changing MyMemory.
2. Extract speech segmentation and queue ownership from the screen.
3. Make TTS queue/session coordination explicit.
4. Replace the current Translator layout with the Meeting Interpreter timeline.
5. Add replay, new-message navigation and explicit session controls.
6. Verify device flow, latency and long-session behavior before background work.
