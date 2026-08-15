/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const MOCK_OPTIONS = [
  'survey.opt_very',
  'survey.opt_ok',
  'survey.opt_fair',
  'survey.opt_bad',
];

const MOCK_SURVEYS = [
  {
    id: 1,
    titleKey: 'survey.q1',
    active: true,
    deadline: '20/08/2026',
    submitted: false,
  },
  {
    id: 2,
    titleKey: 'survey.q2',
    active: true,
    deadline: '25/08/2026',
    submitted: false,
  },
  {
    id: 3,
    titleKey: 'survey.q1',
    active: false,
    deadline: '05/08/2026',
    submitted: true,
  },
];

const Survey = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [surveys, setSurveys] = useState(MOCK_SURVEYS);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const openSurvey = survey => {
    setActiveSurvey(survey);
    setSelectedOption(null);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !activeSurvey) {
      return;
    }
    setSurveys(prev =>
      prev.map(s => (s.id === activeSurvey.id ? {...s, submitted: true} : s)),
    );
    setActiveSurvey(null);
    setSelectedOption(null);
    Alert.alert(t('survey.thanks'), t('survey.submitted'));
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('survey.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {surveys.map(survey => {
          const active = survey.active && !survey.submitted;
          return (
            <View
              key={survey.id}
              style={[
                styles.card,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <TouchableOpacity
                style={styles.cardBody}
                onPress={() => active && openSurvey(survey)}
                disabled={!active}
                activeOpacity={0.8}>
                <View
                  style={[
                    styles.cardIcon,
                    {backgroundColor: colors.primaryLight},
                  ]}>
                  <Icon
                    name="chatbox-ellipses-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text
                    style={[styles.cardTitle, {color: colors.text}]}
                    numberOfLines={2}>
                    {t(survey.titleKey)}
                  </Text>
                  <Text
                    style={[
                      styles.cardDeadline,
                      {color: colors.textSecondary},
                    ]}>
                    {t('survey.deadline')}: {survey.deadline}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: active
                        ? colors.primary
                        : colors.backgroundSecondary,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      {color: active ? '#fff' : colors.textSecondary},
                    ]}>
                    {active
                      ? t('survey.active')
                      : survey.submitted
                      ? t('survey.submitted')
                      : t('survey.closed')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('survey.pending')}
          </Text>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={activeSurvey !== null}
        animationType="fade"
        onRequestClose={() => setActiveSurvey(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, {backgroundColor: colors.surface}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                {t('survey.title')}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveSurvey(null)}
                hitSlop={10}>
                <Icon name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalQuestion, {color: colors.text}]}>
              {t(activeSurvey?.titleKey || 'survey.q1')}
            </Text>
            {MOCK_OPTIONS.map((option, index) => {
              const selected = selectedOption === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: selected
                        ? colors.primaryLight
                        : colors.backgroundSecondary,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedOption(index)}
                  activeOpacity={0.8}>
                  <View
                    style={[
                      styles.radioOuter,
                      {
                        borderColor: selected
                          ? colors.primary
                          : colors.textTertiary,
                      },
                    ]}>
                    {selected ? (
                      <View
                        style={[
                          styles.radioInner,
                          {backgroundColor: colors.primary},
                        ]}
                      />
                    ) : null}
                  </View>
                  <Text style={[styles.optionText, {color: colors.text}]}>
                    {t(option)}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor:
                    selectedOption === null
                      ? colors.textTertiary
                      : colors.primary,
                },
              ]}
              onPress={handleSubmit}
              disabled={selectedOption === null}
              activeOpacity={0.85}>
              <Text style={styles.submitText}>{t('survey.submit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 10,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardDeadline: {
    fontSize: 12,
    marginTop: 3,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pendingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    gap: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    borderRadius: 18,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalQuestion: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
    lineHeight: 21,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  submitBtn: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 6,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default Survey;
