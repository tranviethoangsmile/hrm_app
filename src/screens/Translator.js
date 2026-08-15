import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Clipboard from '@react-native-clipboard/clipboard';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';
import {
  SUPPORTED_LANGS,
  getLangLabelKey,
  mockRecognize,
  translateText,
  synthDurationMs,
} from '../services/translator';

const RING_SIZE = 96;
const WAVE_BARS = 7;

const WAVEBAR_HEIGHTS = [10, 18, 26, 14, 22, 30, 12];

const Translator = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();

  const [mode, setMode] = useState('voice');
  const [sourceLang, setSourceLang] = useState('vi');
  const [targetLang, setTargetLang] = useState('en');
  const [pickerFor, setPickerFor] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [resultText, setResultText] = useState('');
  const [history, setHistory] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);
  const [spokenKey, setSpokenKey] = useState(null);

  const pulse = useRef(new Animated.Value(1)).current;
  const speakBars = useRef(WAVE_BARS.map(() => new Animated.Value(0))).current;
  const speakAnim = useRef(null);
  const speakTimer = useRef(null);

  const langName = code => t(getLangLabelKey(code));

  const swapLang = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const selectLang = code => {
    if (pickerFor === 'source') {
      setSourceLang(code);
    } else if (pickerFor === 'target') {
      setTargetLang(code);
    }
    setPickerFor(null);
  };

  const startListening = () => {
    setIsListening(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.18,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopWave = () => {
    if (speakAnim.current) {
      speakAnim.current.stop();
      speakAnim.current = null;
    }
    if (speakTimer.current) {
      clearTimeout(speakTimer.current);
      speakTimer.current = null;
    }
    speakBars.forEach(bar => bar.setValue(0));
    setIsSpeaking(false);
  };

  const startWave = () => {
    speakBars.forEach((bar, index) => {
      const target = WAVEBAR_HEIGHTS[index] / 30;
      bar.setValue(0.2);
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: target,
            duration: 260 + index * 18,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: 0.2,
            duration: 260 + index * 18,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    });
  };

  const speakText = (text, lang, auto = false) => {
    stopWave();
    setIsSpeaking(true);
    setSpokenKey(null);
    speakAnim.current = startWave();
    const duration = synthDurationMs(text);
    speakTimer.current = setTimeout(() => {
      setIsSpeaking(false);
      speakBars.forEach(bar => bar.setValue(0));
      if (auto) {
        setSpokenKey(null);
      }
    }, duration);
    setSpokenKey(auto ? null : 'playing');
  };

  useEffect(() => {
    return () => {
      stopWave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishTranslate = async text => {
    setSourceText(text);
    setResultText('');
    setIsTranslating(true);
    try {
      const translated = await translateText(text, sourceLang, targetLang);
      setResultText(translated);
      setHistory(prev =>
        [
          {source: text, result: translated, from: sourceLang, to: targetLang},
          ...prev,
        ].slice(0, 10),
      );
      // Audio-out: sau khi dịch, tự phát lại âm thanh bằng ngôn ngữ đích
      speakText(translated, targetLang, true);
    } catch (e) {
      setIsTranslating(false);
    } finally {
      setIsTranslating(false);
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    pulse.stopAnimation();
    pulse.setValue(1);
    try {
      const recognized = await mockRecognize(sourceLang);
      await finishTranslate(recognized);
    } catch (e) {
      setIsTranslating(false);
    }
  };

  const handleTextTranslate = async () => {
    const text = inputText.trim();
    if (!text) {
      return;
    }
    setInputText('');
    await finishTranslate(text);
  };

  const copyToClipboard = (value, kind) => {
    Clipboard.setString(value);
    setCopiedKey(kind);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const speakMock = kind => {
    if (isSpeaking) {
      return;
    }
    const text = kind === 'target' ? resultText : sourceText;
    if (!text) {
      return;
    }
    speakText(text, kind === 'target' ? targetLang : sourceLang);
  };

  const renderLangChip = (label, onPress) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.langChip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      activeOpacity={0.8}>
      <Text
        style={[styles.langChipText, {color: colors.text}]}
        numberOfLines={1}>
        {label}
      </Text>
      <Icon name="chevron-down" size={14} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderWave = accent => (
    <View style={styles.waveWrap}>
      {speakBars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              backgroundColor: accent,
              transform: [
                {
                  scaleY: bar,
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  const renderResultCard = (title, text, kind, accent) => {
    const isActive =
      (copiedKey === kind && t('translator.copied')) ||
      (spokenKey === 'playing' && kind === 'target' && isSpeaking) ||
      (spokenKey === 'playing' && kind === 'source' && isSpeaking);
    return (
      <View
        style={[
          styles.resultCard,
          {backgroundColor: colors.surface, borderColor: colors.border},
        ]}>
        <View style={styles.resultCardHeader}>
          <View style={[styles.resultDot, {backgroundColor: accent + '22'}]}>
            <Icon name="language-outline" size={14} color={accent} />
          </View>
          <Text style={[styles.resultTitle, {color: colors.textSecondary}]}>
            {title}
          </Text>
          {kind === 'target' && isSpeaking ? (
            <View style={styles.speakingPill}>
              <Text style={[styles.speakingText, {color: accent}]}>
                {t('translator.speaking')}
              </Text>
              {renderWave(accent)}
            </View>
          ) : null}
        </View>
        <View style={styles.resultBodyWrap}>
          <Text
            style={[
              styles.resultBody,
              {color: colors.text, borderBottomColor: colors.border},
            ]}>
            {text}
          </Text>
          {kind === 'target' && isSpeaking ? (
            <View style={styles.bodyWave}>{renderWave(accent)}</View>
          ) : null}
        </View>
        {kind === 'target' ? (
          <View
            style={[
              styles.audioRow,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.border,
              },
            ]}>
            <Icon name="volume-high" size={16} color={accent} />
            <Text style={[styles.audioRowText, {color: colors.textSecondary}]}>
              {isSpeaking
                ? t('translator.audio_reply_now', {
                    lang: langName(targetLang),
                  })
                : t('translator.audio_reply', {
                    lang: langName(targetLang),
                  })}
            </Text>
            <TouchableOpacity
              style={[styles.playPill, {backgroundColor: accent + '22'}]}
              onPress={() => speakMock('target')}
              disabled={isSpeaking}
              activeOpacity={0.7}>
              <Icon
                name={isSpeaking ? 'stop' : 'play'}
                size={15}
                color={accent}
              />
              <Text style={[styles.playPillText, {color: accent}]}>
                {isSpeaking ? t('translator.stop') : t('translator.play')}
              </Text>
            </TouchableOpacity>
            {spokenKey === 'playing' && isSpeaking ? (
              <View style={styles.playWave}>{renderWave(accent)}</View>
            ) : null}
          </View>
        ) : null}
        <View style={styles.resultActions}>
          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => speakMock(kind)}
            activeOpacity={0.7}>
            <Icon
              name={
                spokenKey === 'playing' && isSpeaking
                  ? 'volume-high'
                  : 'volume-medium-outline'
              }
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.actionText, {color: colors.primary}]}>
              {t('translator.speak')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => copyToClipboard(text, kind)}
            activeOpacity={0.7}>
            <Icon
              name={copiedKey === kind ? 'checkmark' : 'copy-outline'}
              size={16}
              color={copiedKey === kind ? colors.success : colors.primary}
            />
            <Text
              style={[
                styles.actionText,
                {color: copiedKey === kind ? colors.success : colors.primary},
              ]}>
              {copiedKey === kind
                ? t('translator.copied')
                : t('translator.copy')}
            </Text>
          </TouchableOpacity>
        </View>
        {isActive ? (
          <Text style={[styles.actionFeedback, {color: colors.primary}]}>
            {isActive}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header
        title={t('translator.title')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          {t('translator.subtitle')}
        </Text>

        {/* Mode segmented */}
        <View
          style={[
            styles.segmentWrap,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
            },
          ]}>
          {['voice', 'text'].map(item => {
            const active = mode === item;
            return (
              <TouchableOpacity
                key={item}
                style={styles.segmentItem}
                onPress={() => setMode(item)}
                activeOpacity={0.8}>
                {active ? (
                  <LinearGradient
                    colors={colors.primaryGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.segmentActive}>
                    <Icon
                      name={item === 'voice' ? 'mic-outline' : 'text-outline'}
                      size={15}
                      color="#fff"
                    />
                    <Text style={styles.segmentActiveText}>
                      {t(
                        item === 'voice'
                          ? 'translator.tab_voice'
                          : 'translator.tab_text',
                      )}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.segmentInactive}>
                    <Icon
                      name={item === 'voice' ? 'mic-outline' : 'text-outline'}
                      size={15}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.segmentInactiveText,
                        {color: colors.textSecondary},
                      ]}>
                      {t(
                        item === 'voice'
                          ? 'translator.tab_voice'
                          : 'translator.tab_text',
                      )}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Language row */}
        <View style={styles.langRow}>
          <View style={styles.langCol}>
            <Text style={[styles.langLabel, {color: colors.textSecondary}]}>
              {t('translator.source_label')}
            </Text>
            {renderLangChip(langName(sourceLang), () => setPickerFor('source'))}
          </View>
          <TouchableOpacity
            onPress={swapLang}
            style={[styles.swapBtn, {backgroundColor: colors.primaryLight}]}
            activeOpacity={0.8}>
            <Icon name="swap-horizontal" size={22} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.langCol}>
            <Text style={[styles.langLabel, {color: colors.textSecondary}]}>
              {t('translator.target_label')}
            </Text>
            {renderLangChip(langName(targetLang), () => setPickerFor('target'))}
          </View>
        </View>

        {/* Input area */}
        {mode === 'voice' ? (
          <View
            style={styles.voiceArea}
            onStartShouldSetResponder={() => true}
            onResponderGrant={startListening}
            onResponderRelease={stopListening}
            onResponderTerminate={stopListening}>
            <Animated.View style={{transform: [{scale: pulse}]}}>
              <LinearGradient
                colors={
                  isListening ? ['#FF6B6B', '#FF8E53'] : colors.primaryGradient
                }
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.micButton}>
                <Icon
                  name={isListening ? 'stop' : 'mic'}
                  size={40}
                  color="#fff"
                />
              </LinearGradient>
            </Animated.View>
            <Text style={[styles.listenHint, {color: colors.textSecondary}]}>
              {isListening
                ? t('translator.listening')
                : t('translator.hold_to_talk')}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.textBox,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <TextInput
              style={[styles.textInput, {color: colors.text}]}
              placeholder={t('translator.enter_text')}
              placeholderTextColor={colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              onPress={handleTextTranslate}
              disabled={isTranslating}
              activeOpacity={0.85}>
              <LinearGradient
                colors={colors.primaryGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.translateBtn}>
                <Icon name="language-outline" size={18} color="#fff" />
                <Text style={styles.translateBtnText}>
                  {t('translator.translate_btn')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Result */}
        {isTranslating ? (
          <View
            style={[
              styles.loadingBox,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <Icon name="sync" size={18} color={colors.primary} />
            <Text style={[styles.loadingText, {color: colors.textSecondary}]}>
              {t('translator.translating')}
            </Text>
          </View>
        ) : sourceText !== '' && resultText !== '' ? (
          <>
            {renderResultCard(
              `${t('translator.result_source')} · ${langName(sourceLang)}`,
              sourceText,
              'source',
              colors.primary,
            )}
            {renderResultCard(
              `${t('translator.result_target')} · ${langName(targetLang)}`,
              resultText,
              'target',
              colors.success,
            )}
          </>
        ) : null}

        {/* History */}
        {history.length > 0 ? (
          <View
            style={[
              styles.historyWrap,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, {color: colors.text}]}>
                {t('translator.history')}
              </Text>
              <TouchableOpacity onPress={() => setHistory([])}>
                <Text style={[styles.clearText, {color: colors.danger}]}>
                  {t('translator.clear_history')}
                </Text>
              </TouchableOpacity>
            </View>
            {history.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.historyItem,
                  {borderBottomColor: colors.border},
                ]}>
                <Text
                  style={[styles.historySource, {color: colors.text}]}
                  numberOfLines={2}>
                  {item.source}
                </Text>
                <Text
                  style={[styles.historyResult, {color: colors.primary}]}
                  numberOfLines={2}>
                  {item.result}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.pendingNote,
              {backgroundColor: colors.primaryLight},
            ]}>
            <Icon
              name="cloud-upload-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.pendingText, {color: colors.primary}]}>
              {t('translator.pending_note')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Language picker modal */}
      <Modal
        visible={pickerFor !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerFor(null)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerFor(null)}>
          <View style={[styles.modalSheet, {backgroundColor: colors.surface}]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                {pickerFor === 'source'
                  ? t('translator.source_label')
                  : t('translator.target_label')}
              </Text>
              <TouchableOpacity onPress={() => setPickerFor(null)}>
                <Icon name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {SUPPORTED_LANGS.map(lang => {
              const isActive =
                lang.code ===
                (pickerFor === 'source' ? sourceLang : targetLang);
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langOption,
                    {borderBottomColor: colors.border},
                  ]}
                  onPress={() => selectLang(lang.code)}
                  activeOpacity={0.7}>
                  <Text style={[styles.langOptionText, {color: colors.text}]}>
                    {t(lang.labelKey)}
                  </Text>
                  {isActive ? (
                    <Icon
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  segmentWrap: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 4,
    marginBottom: 16,
  },
  segmentItem: {
    flex: 1,
  },
  segmentActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  segmentActiveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  segmentInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  segmentInactiveText: {
    fontSize: 14,
    fontWeight: '600',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  langCol: {
    flex: 1,
  },
  langLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  langChipText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  swapBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  voiceArea: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  micButton: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  listenHint: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
  },
  textBox: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 16,
  },
  textInput: {
    minHeight: 96,
    fontSize: 15,
    textAlignVertical: 'top',
    padding: 0,
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  translateBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 12,
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resultDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  speakingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultBodyWrap: {
    position: 'relative',
  },
  resultBody: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 10,
  },
  bodyWave: {
    position: 'absolute',
    right: 8,
    bottom: 14,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionFeedback: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 10,
    gap: 8,
    marginBottom: 10,
  },
  audioRowText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  playPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  playPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  waveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    width: 3,
    height: 30,
    borderRadius: 2,
  },
  playWave: {
    position: 'absolute',
    right: 100,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  historyWrap: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyItem: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  historySource: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyResult: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  pendingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 10,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C7C7CC',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  langOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Translator;
