import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AppState,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Header from '../components/common/Header';
import ConversationPanel from '../components/ConversationPanel';
import {useTheme} from '../hooks/useTheme';
import {CONV_STATE, MeetingInterpreterSession} from '../services/conversation';
import {
  DEFAULT_TTS_SPEED,
  TTS_SPEED_PRESETS,
  TextToSpeechService,
} from '../services/conversation/tts';
import {
  getFlagForCode,
  getLangLabelKey,
  SUPPORTED_LANGS,
} from '../services/translator';

const AUDIO_MODES = ['auto', 'tap', 'text'];
const SETTINGS_KEY = 'live_meeting_translator_settings';

const Translator = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [sourceLang, setSourceLang] = useState('ja');
  const [targetLang, setTargetLang] = useState('vi');
  const [audioMode, setAudioMode] = useState('auto');
  const [ttsSpeed, setTtsSpeed] = useState(DEFAULT_TTS_SPEED);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [conv, setConv] = useState({
    state: CONV_STATE.IDLE,
    messages: [],
    partialText: '',
    errorDetail: '',
  });
  const [pickerFor, setPickerFor] = useState(null);
  const [audioPickerVisible, setAudioPickerVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [ttsError, setTtsError] = useState(false);
  const langRef = useRef({source: sourceLang, target: targetLang});
  const managerRef = useRef(null);
  const ttsRef = useRef(null);
  const copyTimer = useRef(null);
  const lastAutoSpokenId = useRef(null);

  useEffect(() => {
    const manager = new MeetingInterpreterSession({
      langRef,
      autoDetectRef: {current: true},
    });
    const tts = new TextToSpeechService();
    managerRef.current = manager;
    ttsRef.current = tts;
    const unsubscribe = manager.subscribe(payload => setConv(payload));
    AsyncStorage.getItem(SETTINGS_KEY)
      .then(async value => {
        if (!value) {
          return;
        }
        const settings = JSON.parse(value);
        if (settings.sourceLang) {
          setSourceLang(settings.sourceLang);
        }
        if (settings.targetLang) {
          setTargetLang(settings.targetLang);
        }
        if (AUDIO_MODES.includes(settings.audioMode)) {
          setAudioMode(settings.audioMode);
        }
        if (TTS_SPEED_PRESETS.includes(Number(settings.ttsSpeed))) {
          setTtsSpeed(Number(settings.ttsSpeed));
          await tts.setSpeed(Number(settings.ttsSpeed));
        }
      })
      .catch(() => {})
      .finally(() => setSettingsLoaded(true));
    return () => {
      unsubscribe();
      manager.destroy();
      tts.destroy();
      if (copyTimer.current) {
        clearTimeout(copyTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    langRef.current = {source: sourceLang, target: targetLang};
    managerRef.current?.updateLangs(sourceLang, targetLang);
    if (settingsLoaded) {
      AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({sourceLang, targetLang, audioMode, ttsSpeed}),
      ).catch(() => {});
    }
  }, [audioMode, settingsLoaded, sourceLang, targetLang, ttsSpeed]);

  useEffect(() => {
    if (settingsLoaded) {
      ttsRef.current?.setSpeed(ttsSpeed).catch(() => {});
    }
  }, [settingsLoaded, ttsSpeed]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        managerRef.current?.stop();
        ttsRef.current?.stop();
      }
    });
    return () => subscription.remove();
  }, []);

  const active =
    conv.state !== CONV_STATE.IDLE && conv.state !== CONV_STATE.ERROR;

  const handleSpeak = useCallback(
    async item => {
      if (!item?.translatedText || !ttsRef.current) {
        return;
      }
      const resumeAfter = active && conv.state !== CONV_STATE.PAUSED;
      try {
        if (resumeAfter) {
          await managerRef.current?.pause();
        }
        setSpeakingId(item.id);
        setTtsError(false);
        const ttsStartTime = Date.now();
        console.log('[MEETING] TTS start', item.id);
        await ttsRef.current.speak(
          item.translatedText,
          item.targetLanguage || item.toLang || targetLang,
        );
        const ttsEndTime = Date.now();
        console.log('[MEETING] TTS latency', ttsEndTime - ttsStartTime, 'ms');
        await ttsRef.current.waitForIdle();
      } catch (error) {
        console.log('[MEETING] TTS error', String(error));
        setTtsError(true);
      } finally {
        setSpeakingId(null);
        if (resumeAfter) {
          managerRef.current?.resume();
        }
      }
    },
    [active, conv.state, targetLang],
  );

  useEffect(() => {
    if (audioMode !== 'auto') {
      return;
    }
    const last = conv.messages[conv.messages.length - 1];
    if (last?.translatedText && last.id !== lastAutoSpokenId.current) {
      lastAutoSpokenId.current = last.id;
      handleSpeak(last);
    }
  }, [audioMode, conv.messages, handleSpeak]);

  const stopSpeak = () => {
    ttsRef.current?.stop();
    setSpeakingId(null);
  };

  const copy = item => {
    Clipboard.setString(
      item.translatedText || item.sourceText || item.originalText || '',
    );
    setCopied(true);
    if (copyTimer.current) {
      clearTimeout(copyTimer.current);
    }
    copyTimer.current = setTimeout(() => setCopied(false), 1400);
  };

  const swap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const selectLanguage = code => {
    if (pickerFor === 'source' && code !== targetLang) {
      setSourceLang(code);
    }
    if (pickerFor === 'target' && code !== sourceLang) {
      setTargetLang(code);
    }
    setPickerFor(null);
  };

  const selectSpeed = speed => {
    setTtsSpeed(speed);
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header
        title={t('translator.meeting_title', 'Meeting Interpreter')}
        onBack={() => navigation.goBack()}
      />
      <View
        style={[
          styles.directionBar,
          {backgroundColor: colors.surface, borderBottomColor: colors.border},
        ]}>
        <TouchableOpacity
          style={styles.languageChoice}
          onPress={() => setPickerFor('source')}>
          <Text style={styles.flag}>{getFlagForCode(sourceLang)}</Text>
          <Text
            style={[styles.languageName, {color: colors.text}]}
            numberOfLines={1}>
            {t(getLangLabelKey(sourceLang))}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swap, {backgroundColor: colors.primaryLight}]}
          onPress={swap}
          accessibilityRole="button">
          <Icon name="swap-horizontal" size={21} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.languageChoice}
          onPress={() => setPickerFor('target')}>
          <Text style={styles.flag}>{getFlagForCode(targetLang)}</Text>
          <Text
            style={[styles.languageName, {color: colors.text}]}
            numberOfLines={1}>
            {t(getLangLabelKey(targetLang))}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statusLine}>
        <View
          style={[
            styles.liveDot,
            {backgroundColor: active ? colors.danger : colors.textTertiary},
          ]}
        />
        <Text style={[styles.statusText, {color: colors.textSecondary}]}>
          {active
            ? t('translator.live', 'LIVE')
            : t('translator.ready', 'Ready')}
        </Text>
      </View>
      <View style={styles.timeline}>
        <ConversationPanel
          t={t}
          state={conv.state}
          errorDetail={conv.errorDetail}
          partialText={conv.partialText}
          sourceLang={sourceLang}
          targetLang={targetLang}
          messages={conv.messages}
          audioMode={audioMode}
          ttsSpeed={ttsSpeed}
          running={active}
          speakingId={speakingId}
          onStart={() => managerRef.current?.start()}
          onPause={() =>
            conv.state === CONV_STATE.PAUSED
              ? managerRef.current?.resume()
              : managerRef.current?.pause()
          }
          onStop={() => {
            managerRef.current?.stop();
            stopSpeak();
          }}
          onSpeak={handleSpeak}
          onStopSpeak={stopSpeak}
          onCopy={copy}
          onAudioMode={() => setAudioPickerVisible(true)}
          onRetry={id => managerRef.current?.retryMessage(id)}
          ttsError={ttsError}
        />
      </View>
      {copied ? (
        <View style={[styles.toast, {backgroundColor: colors.primary}]}>
          <Icon name="checkmark" size={16} color="#fff" />
          <Text style={styles.toastText}>{t('translator.copied')}</Text>
        </View>
      ) : null}
      <AudioModeModal
        visible={audioPickerVisible}
        value={audioMode}
        speed={ttsSpeed}
        onSelect={mode => {
          setAudioMode(mode);
          setAudioPickerVisible(false);
        }}
        onSpeedSelect={selectSpeed}
        onClose={() => setAudioPickerVisible(false)}
        colors={colors}
        t={t}
      />
      <LanguageModal
        visible={pickerFor !== null}
        pickerFor={pickerFor}
        selected={pickerFor === 'source' ? sourceLang : targetLang}
        onSelect={selectLanguage}
        onClose={() => setPickerFor(null)}
        colors={colors}
        t={t}
      />
    </View>
  );
};

const AudioModeModal = ({
  visible,
  value,
  speed,
  onSelect,
  onSpeedSelect,
  onClose,
  colors,
  t,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}>
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}>
      <View
        style={[styles.sheet, {backgroundColor: colors.background}]}
        onStartShouldSetResponder={() => true}>
        <View style={styles.handle} />
        <Text style={[styles.sheetTitle, {color: colors.text}]}>
          {t('translator.audio_mode_title', 'Translation Audio')}
        </Text>
        <Text style={[styles.settingLabel, {color: colors.textSecondary}]}>
          {t('translator.reading_speed', 'Reading speed')}
        </Text>
        <View style={styles.speedRow}>
          {TTS_SPEED_PRESETS.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.speedOption,
                {
                  backgroundColor:
                    speed === option ? colors.primary : colors.surface,
                  borderColor:
                    speed === option ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSpeedSelect(option)}
              accessibilityRole="button"
              accessibilityLabel={`${option}x`}>
              <Text
                style={[
                  styles.speedText,
                  {color: speed === option ? '#fff' : colors.text},
                ]}>
                {option}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.settingLabel, {color: colors.textSecondary}]}>
          {t('translator.audio_mode', 'Translation Audio')}
        </Text>
        {['auto', 'tap', 'text'].map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.modeOption, {borderBottomColor: colors.border}]}
            onPress={() => onSelect(mode)}>
            <Text style={[styles.modeText, {color: colors.text}]}>
              {t(`translator.audio_mode_${mode}`)}
            </Text>
            <Icon
              name={value === mode ? 'radio-button-on' : 'radio-button-off'}
              size={21}
              color={value === mode ? colors.primary : colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

const LanguageModal = ({
  visible,
  pickerFor,
  selected,
  onSelect,
  onClose,
  colors,
  t,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}>
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}>
      <View
        style={[styles.sheet, {backgroundColor: colors.background}]}
        onStartShouldSetResponder={() => true}>
        <View style={styles.handle} />
        <Text style={[styles.sheetTitle, {color: colors.text}]}>
          {t(
            pickerFor === 'source'
              ? 'translator.source_label'
              : 'translator.target_label',
          )}
        </Text>
        {SUPPORTED_LANGS.map(lang => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.modeOption, {borderBottomColor: colors.border}]}
            onPress={() => onSelect(lang.code)}>
            <Text style={[styles.modeText, {color: colors.text}]}>
              {getFlagForCode(lang.code)} {t(lang.labelKey)}
            </Text>
            {selected === lang.code ? (
              <Icon name="checkmark-circle" size={21} color={colors.primary} />
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  container: {flex: 1},
  directionBar: {
    minHeight: 66,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  languageChoice: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flag: {fontSize: 22},
  languageName: {fontSize: 15, fontWeight: '800', flex: 1},
  swap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLine: {
    height: 34,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  liveDot: {width: 8, height: 8, borderRadius: 4},
  statusText: {fontSize: 12, fontWeight: '800', letterSpacing: 0.6},
  timeline: {flex: 1},
  toast: {
    position: 'absolute',
    bottom: 86,
    alignSelf: 'center',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 9,
    flexDirection: 'row',
    gap: 5,
  },
  toastText: {color: '#fff', fontSize: 13, fontWeight: '800'},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#888',
    alignSelf: 'center',
    marginVertical: 12,
  },
  sheetTitle: {fontSize: 19, fontWeight: '800', marginBottom: 8},
  settingLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 8,
  },
  speedRow: {flexDirection: 'row', gap: 7, flexWrap: 'wrap', marginBottom: 8},
  speedOption: {
    minWidth: 52,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {fontSize: 13, fontWeight: '800'},
  modeOption: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  modeText: {fontSize: 16, fontWeight: '700'},
});

export default Translator;
