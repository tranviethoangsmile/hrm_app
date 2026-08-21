// Keeps live partial speech separate from finalized meeting messages.
// Native Voice decides the pause boundary; this class only normalizes the
// partial/final event ordering and emits one segment per utterance.
export class SpeechSegmenter {
  constructor({onPartial} = {}) {
    this.onPartial = onPartial;
    this.currentText = '';
  }

  acceptPartial(event) {
    const value = event?.value || [];
    const raw = Array.isArray(value)
      ? value.find(item => typeof item === 'string' && item.trim()) || ''
      : value;
    const text = String(raw || '').trim();
    if (text) {
      this.currentText = text;
      this.onPartial?.(text);
    }
    return text;
  }

  finalize(event) {
    const value = event?.value || [];
    const finalText = (
      Array.isArray(value) ? value.join(' ') : String(value || '')
    ).trim();
    const text = finalText || this.currentText;
    this.currentText = '';
    return text;
  }

  reset() {
    this.currentText = '';
  }
}

export default SpeechSegmenter;
