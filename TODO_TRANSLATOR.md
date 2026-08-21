# TRANSLATOR

## 1. Audit
- [x] Audit current translator
- [x] Audit current speech recognition
- [x] Audit current MyMemory integration
- [x] Audit current TTS and lifecycle
- [x] Audit current state and performance risks

## 2. Architecture
- [x] Meeting Interpreter session owner
- [x] Stable message and session data model
- [x] Single active session lifecycle
- [x] Separate live speech and history state

## 3. Speech Segmenter
- [x] Natural pause segmentation
- [x] Partial transcript handling
- [x] Empty-final fallback
- [x] Prevent duplicate finalized segments
- [x] Continue listening in the same session

## 4. MyMemory
- [x] MyMemory service and language mapping
- [x] UTF-8 encoding and request limit
- [x] Timeout and finite retry
- [x] Per-segment error and retry feedback

## 5. Translation Queue
- [x] Ordered queue foundation
- [x] Stable sequence/message status
- [x] Preserve source text on failure
- [x] Queue metrics

## 6. TTS Queue
- [x] Serialized TTS queue foundation
- [x] Auto Speak as the meeting default
- [x] Tap to Speak replay
- [x] Text Only mode
- [x] Prevent TTS microphone feedback
- [x] TTS error feedback

## 7. Conversation UI
- [x] Meeting Interpreter header and live status
- [x] Conversation timeline message cards
- [x] Current live-speech card
- [x] Pause/resume/stop controls
- [x] Audio mode control
- [x] Error and empty states

## 8. Replay
- [x] Replay stored translations
- [x] Copy stored translations
- [x] New-message indicator
- [x] Preserve message direction after language swap

## 9. Performance
- [x] Development latency instrumentation
- [ ] Reduce pause-to-translation latency
- [ ] FlatList virtualization verification
- [ ] 10/30/50/100-message test
- [ ] 30-minute meeting test

## 10. Background
- [ ] Android foreground-service investigation
- [ ] Android screen-lock test
- [ ] Android session resume test
- [ ] iOS capability and limitation test

## 11. Testing
- [ ] Japanese -> Vietnamese continuous meeting
- [ ] Vietnamese -> Japanese continuous meeting
- [ ] Ordered multi-segment translation
- [ ] Auto Speak without feedback loop
- [ ] Pause/resume/stop cleanup
- [ ] Replay without MyMemory request
- [ ] Network and TTS errors
- [ ] Android device test
- [ ] iOS device test

## 12. Documentation
- [x] Create `TRANSLATOR_REDESIGN.md`
- [x] Create `TRANSLATOR_UI_REDESIGN.md`
- [ ] Record measured latency results
- [ ] Record known platform limitations

## UI REDESIGN
- [x] Audit current Translation UI
- [x] Redesign Header
- [x] Redesign Conversation Timeline
- [x] Redesign Message Card
- [x] Redesign Live Transcript
- [x] Redesign Bottom Controls
- [x] Redesign Audio Settings
- [x] Add TTS speed control
- [x] Persist TTS speed
- [x] Add replay UI
- [x] Improve listening state
- [x] Improve translating state
- [x] Improve speaking state
- [ ] Dark mode
- [ ] Light mode
- [ ] Responsive
- [x] Accessibility
- [ ] Final testing
