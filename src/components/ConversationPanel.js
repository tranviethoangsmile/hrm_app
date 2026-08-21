import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  Animated,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../hooks/useTheme';
import {CONV_STATE} from '../services/conversation';
import {getFlagForCode, getLangLabelKey} from '../services/translator';

const ConversationPanel = ({
  t,
  state,
  errorDetail,
  partialText,
  sourceLang,
  targetLang,
  messages,
  audioMode,
  ttsSpeed,
  running,
  speakingId,
  onStart,
  onPause,
  onStop,
  onSpeak,
  onStopSpeak,
  onCopy,
  onAudioMode,
  onRetry,
  ttsError,
}) => {
  const {colors} = useTheme();
  const listRef = useRef(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const previousLength = useRef(messages.length);
  const [atBottom, setAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    if (!running) {
      pulse.setValue(1);
      return undefined;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse, running]);

  useEffect(() => {
    if (messages.length > previousLength.current && !atBottom) {
      setNewCount(count => count + messages.length - previousLength.current);
    }
    if (messages.length > 0 && atBottom) {
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({animated: true}),
      );
    }
    previousLength.current = messages.length;
  }, [atBottom, messages.length]);

  const onScroll = useCallback(event => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const isBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 40;
    setAtBottom(isBottom);
    if (isBottom) {
      setNewCount(0);
    }
  }, []);

  const status =
    state === CONV_STATE.ERROR
      ? {
          icon: 'warning-outline',
          text: t(errorDetail || 'translator.unable_to_translate'),
          color: colors.danger,
        }
      : state === CONV_STATE.PAUSED
      ? {
          icon: 'pause-circle-outline',
          text: t('translator.paused'),
          color: colors.textSecondary,
        }
      : state === CONV_STATE.TRANSLATING
      ? {
          icon: 'language-outline',
          text: t('translator.translating'),
          color: colors.primary,
        }
      : state === CONV_STATE.CONNECTING
      ? {
          icon: 'sync-outline',
          text: t('translator.connecting'),
          color: colors.primary,
        }
      : running
      ? {icon: 'mic', text: t('translator.listening'), color: colors.success}
      : {
          icon: 'mic-outline',
          text: t('translator.ready', 'Ready'),
          color: colors.textSecondary,
        };

  const renderMessage = ({item}) => {
    const speaking = speakingId === item.id;
    const source = item.sourceLanguage || sourceLang;
    const target = item.targetLanguage || item.toLang || targetLang;
    return (
      <View
        style={[
          styles.message,
          {backgroundColor: colors.surface, borderColor: colors.border},
        ]}>
        <Text style={[styles.language, {color: colors.textSecondary}]}>
          {getFlagForCode(source)} {t(getLangLabelKey(source))}
        </Text>
        <Text style={[styles.sourceText, {color: colors.text}]}>
          {item.sourceText || item.originalText}
        </Text>
        <View
          style={[styles.rule, {backgroundColor: colors.borderSecondary}]}
        />
        <Text style={[styles.language, {color: colors.primary}]}>
          {getFlagForCode(target)} {t(getLangLabelKey(target))}
        </Text>
        <Text
          style={[
            styles.translationText,
            {color: item.status === 'error' ? colors.danger : colors.text},
          ]}>
          {item.translatedText ||
            (item.status === 'error'
              ? t('translator.unable_to_translate')
              : t('translator.translating'))}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.time, {color: colors.textTertiary}]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {item.status === 'error' ? (
            <TouchableOpacity
              style={styles.action}
              onPress={() => onRetry(item.id)}>
              <Icon name="refresh-outline" size={18} color={colors.danger} />
              <Text style={[styles.actionText, {color: colors.danger}]}>
                {t('translator.try_again')}
              </Text>
            </TouchableOpacity>
          ) : item.translatedText ? (
            <View style={styles.actions}>
              {audioMode !== 'text' ? (
                <TouchableOpacity
                  style={styles.action}
                  onPress={() => (speaking ? onStopSpeak() : onSpeak(item))}
                  accessibilityRole="button">
                  <Icon
                    name={speaking ? 'stop' : 'volume-high-outline'}
                    size={18}
                    color={speaking ? colors.danger : colors.primary}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      {color: speaking ? colors.danger : colors.primary},
                    ]}>
                    {speaking
                      ? t('translator.speaking')
                      : t('translator.speak')}
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={styles.action}
                onPress={() => onCopy(item)}
                accessibilityRole="button">
                <Icon
                  name="copy-outline"
                  size={17}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.actionText, {color: colors.textSecondary}]}>
                  {' '}
                  {t('translator.copy')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const liveSpeech =
    running && partialText ? (
      <View
        style={[
          styles.liveSpeech,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.primary,
          },
        ]}>
        <View style={styles.liveHeader}>
          <Animated.View style={{transform: [{scale: pulse}]}}>
            <Icon name="mic" size={17} color={colors.danger} />
          </Animated.View>
          <Text style={[styles.liveLabel, {color: colors.danger}]}>
            {' '}
            {t('translator.current_speech', 'Listening')}
          </Text>
        </View>
        <Text style={[styles.liveText, {color: colors.text}]}>
          {partialText}
        </Text>
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.statusIcon, {backgroundColor: status.color}]}>
          <Icon name={status.icon} size={16} color="#fff" />
        </View>
        <Text style={[styles.statusText, {color: status.color}]}>
          {status.text}
        </Text>
      </View>
      {ttsError ? (
        <Text style={[styles.errorNotice, {color: colors.danger}]}>
          ⚠ {t('translator.tts_error')}
        </Text>
      ) : null}
      <View style={styles.listWrap}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => String(item.id)}
          renderItem={renderMessage}
          ListFooterComponent={liveSpeech}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="mic-outline" size={42} color={colors.primary} />
              <Text style={[styles.emptyTitle, {color: colors.text}]}>
                Meeting Interpreter
              </Text>
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                {t('translator.conv_empty')}
              </Text>
            </View>
          }
          contentContainerStyle={[
            styles.listContent,
            messages.length === 0 && styles.emptyContent,
          ]}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
        />
        {newCount > 0 && !atBottom ? (
          <TouchableOpacity
            style={[styles.newMessages, {backgroundColor: colors.primary}]}
            onPress={() => {
              listRef.current?.scrollToEnd({animated: true});
              setAtBottom(true);
              setNewCount(0);
            }}>
            <Icon name="arrow-down" size={14} color="#fff" />
            <Text style={styles.newMessagesText}>
              {t('translator.new_messages')} ({newCount})
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={[styles.bottom, {borderTopColor: colors.border}]}>
        <TouchableOpacity
          style={[styles.audioMode, {backgroundColor: colors.surface}]}
          onPress={onAudioMode}
          accessibilityRole="button"
          accessibilityLabel={t('translator.audio_mode_title')}>
          <Icon
            name={
              audioMode === 'auto'
                ? 'volume-high-outline'
                : audioMode === 'tap'
                ? 'hand-left-outline'
                : 'text-outline'
            }
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.audioModeText, {color: colors.text}]}>
            {' '}
            {t(`translator.audio_mode_${audioMode}`)} · {ttsSpeed}x
          </Text>
        </TouchableOpacity>
        {running ? (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.pauseButton, {borderColor: colors.border}]}
              onPress={onPause}
              accessibilityRole="button"
              accessibilityLabel={t(
                state === CONV_STATE.PAUSED
                  ? 'translator.resume'
                  : 'translator.pause',
              )}>
              <Icon
                name={state === CONV_STATE.PAUSED ? 'play' : 'pause'}
                size={18}
                color={colors.text}
              />
              <Text style={[styles.controlText, {color: colors.text}]}>
                {' '}
                {state === CONV_STATE.PAUSED
                  ? t('translator.resume')
                  : t('translator.pause')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stopButton, {backgroundColor: colors.danger}]}
              onPress={onStop}
              accessibilityRole="button"
              accessibilityLabel={t('translator.stop_conversation')}>
              <Icon name="stop" size={17} color="#fff" />
              <Text style={styles.controlText}>
                {' '}
                {t('translator.stop_conversation')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, {backgroundColor: colors.primary}]}
            onPress={onStart}>
            <Icon name="mic" size={19} color="#fff" />
            <Text style={styles.controlText}>
              {' '}
              {t('translator.start_conversation')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  statusRow: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusIcon: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {fontSize: 13, fontWeight: '800'},
  errorNotice: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  listWrap: {flex: 1},
  listContent: {paddingHorizontal: 16, paddingTop: 5, paddingBottom: 10},
  emptyContent: {flexGrow: 1},
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 10,
  },
  emptyTitle: {fontSize: 21, fontWeight: '800'},
  emptyText: {fontSize: 14, lineHeight: 21, textAlign: 'center'},
  message: {borderWidth: 1, borderRadius: 16, padding: 15, marginBottom: 10},
  language: {fontSize: 12, fontWeight: '800', marginBottom: 8},
  sourceText: {fontSize: 16, lineHeight: 24},
  rule: {height: 1, marginVertical: 13},
  translationText: {fontSize: 17, lineHeight: 25, fontWeight: '700'},
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
  },
  time: {fontSize: 11},
  actions: {flexDirection: 'row', gap: 17},
  action: {minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4},
  actionText: {fontSize: 12, fontWeight: '800'},
  liveSpeech: {borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 6},
  liveHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  liveLabel: {fontSize: 12, fontWeight: '800'},
  liveText: {fontSize: 16, lineHeight: 24},
  newMessages: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    gap: 5,
  },
  newMessagesText: {color: '#fff', fontSize: 12, fontWeight: '800'},
  bottom: {
    borderTopWidth: 1,
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 19 : 12,
  },
  audioMode: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 9,
  },
  audioModeText: {fontSize: 13, fontWeight: '800'},
  controls: {flexDirection: 'row', gap: 9},
  pauseButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  stopButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  startButton: {
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  controlText: {fontSize: 14, fontWeight: '800', color: '#fff'},
});

export default ConversationPanel;
