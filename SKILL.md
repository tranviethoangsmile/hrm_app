---
name: hrm-app
description: Hướng dẫn thiết kế và viết code cho ứng dụng mobile hrm_app (React Native CLI + TypeScript + Redux Toolkit + Socket.IO). Dùng skill này khi cần tạo màn hình mới, component mới, hoặc thêm tính năng cho app di động HRM. Bắt buộc đọc khi người dùng yêu cầu viết bất kỳ screen/component nào cho React Native, tích hợp API backend, xử lý dark mode, đa ngôn ngữ, hoặc cần biết pattern chuẩn của hrm_app.
---

# HRM App — Mobile Skill

## Tech Stack
- **Framework**: React Native CLI 0.73 (Android + iOS)
- **Language**: JavaScript (JSX) — không dùng TypeScript trong screen files
- **State**: Redux Toolkit (`@reduxjs/toolkit`) — auth state
- **Navigation**: React Navigation Stack (`@react-navigation/stack`)
- **HTTP**: Axios
- **Storage**: AsyncStorage (auth token, theme, language)
- **Realtime**: Socket.IO client
- **Push**: Firebase FCM (`@react-native-firebase/messaging`)
- **i18n**: i18next (VI/EN/JA/PT)
- **Charts**: `react-native-chart-kit` (LineChart, BarChart, PieChart)
- **Camera/QR**: `react-native-camera-kit`
- **Video**: `react-native-video`
- **Image**: `react-native-image-picker`
- **Gradient**: `react-native-linear-gradient`
- **Icons**: `react-native-vector-icons` (Ionicons, FontAwesome, MaterialCommunityIcons)
- **Animation**: Lottie (`lottie-react-native`)
- **Date**: `react-native-date-picker` + moment.js
- **Dropdown**: `react-native-dropdown-picker`

---

## Màu sắc & Theme

App hỗ trợ **Dark Mode** — PHẢI dùng `useTheme()` hook, không hardcode màu.

```javascript
import { useTheme } from '../hooks/useTheme';

const MyScreen = () => {
  const { colors, isDarkMode } = useTheme();
  // colors.background, colors.text, colors.primary, colors.surface...
};
```

### Bảng màu chính (Light / Dark)
```javascript
// Light
primary:           '#007AFF'   // blue buttons, links
background:        '#FFFFFF'
backgroundSecondary: '#F2F2F7'
surface:           '#FFFFFF'   // card background
text:              '#1A1A1A'
textSecondary:     '#8E8E93'
border:            '#E5E5EA'
success:           '#34C759'
danger:            '#FF3B30'
warning:           '#FF9500'

// Dark (auto-switch khi isDarkMode=true)
primary:           '#0A84FF'
background:        '#000000'
backgroundSecondary: '#1C1C1E'
surface:           '#1C1C1E'
text:              '#FFFFFF'
border:            '#38383A'
success:           '#30D158'
danger:            '#FF453A'
```

### Brand gradients (LinearGradient)
```javascript
// Header screens
['#1a7f37', '#43e97b']     // green — success, checkin, leave

// Feature buttons trong FeatureTab
['#667eea', '#764ba2']     // purple — inventory/report
['#f093fb', '#f5576c']     // pink — order/food
['#4facfe', '#00f2fe']     // cyan — AI
['#43e97b', '#38f9d7']     // teal — uniform
['#fa709a', '#fee140']     // pink-yellow — leave
['#ff6b6b', '#ffa726']     // red-orange — overtime
['#a18aff', '#ff8a80']     // violet-red — daily report
```

---

## Constants & API

```javascript
// src/utils/constans.js (tên file có typo — KHÔNG đổi)
import {
  BASE_URL, PORT, API, VERSION, V1,
  TEN_MODULE, CREATE, SEARCH, UPDATE, DELETE,
  GET_ALL_BY_USER_ID,
} from '../utils/constans';

// URL pattern: BASE_URL + PORT + API + VERSION + V1 + endpoint
const url = `${BASE_URL}${PORT}${API}${VERSION}${V1}${TEN_MODULE}${CREATE}`;
```

**Thêm constant mới**: mở `src/utils/constans.js`, thêm vào cuối:
```javascript
export const TEN_MODULE = '/ten-module';
```

---

## Template màn hình chuẩn

```javascript
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl,
  StatusBar, Platform, Dimensions, Modal, TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { ModalMessage } from '../components';
import Header from '../components/common/Header';
import {
  BASE_URL, PORT, API, VERSION, V1,
  TEN_MODULE, CREATE, SEARCH,
} from '../utils/constans';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TenModule = () => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const authData = useSelector(state => state.auth);
  const userInfo = authData?.data?.data;

  // ── State ──────────────────────────────────────
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // Toast message state
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1500);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);

  // ── Helpers ────────────────────────────────────
  const showMessage = (msg, type = 'success', dur = 1500) => {
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
    setMessageModalVisible(true);
  };

  // ── API ────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${TEN_MODULE}${SEARCH}`,
        { user_id: userInfo?.id },
      );
      if (res.data?.success) {
        setList(res.data.data);
      }
    } catch (error) {
      showMessage('networkError', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [userInfo?.id]);

  useEffect(() => {
    if (userInfo?.id) fetchList();
  }, [userInfo?.id, fetchList]);

  // ── Render items ───────────────────────────────
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('TenModuleDetail', { item })}
      activeOpacity={0.8}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{item.field1}</Text>
      <StatusChip active={item.is_active} colors={colors} t={t} />
    </TouchableOpacity>
  );

  // ── Main render ────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <LinearGradient colors={['#1a7f37', '#43e97b']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('ten_module')}</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
          <Icon name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchList(); }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Icon name="document-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('no_data')}
              </Text>
            </View>
          }
        />
      )}

      {/* Toast notification */}
      <ModalMessage
        isVisible={isMessageModalVisible}
        message={t(messageModal)}
        type={messageType}
        duration={duration}
        onHide={() => setMessageModalVisible(false)}
      />
    </View>
  );
};

// ── Sub-components ─────────────────────────────────
const StatusChip = ({ active, colors, t }) => (
  <View style={[
    styles.chip,
    { backgroundColor: active ? colors.success + '22' : colors.danger + '22' }
  ]}>
    <Text style={{ color: active ? colors.success : colors.danger, fontSize: 12, fontWeight: '600' }}>
      {active ? t('confirmed') : t('notConfirmed')}
    </Text>
  </View>
);

// ── Styles ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  addBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  listContent: { padding: 16, gap: 12 },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { marginTop: 12, fontSize: 15 },
});

export default TenModule;
```

---

## Quy tắc thiết kế

### Header màn hình
```javascript
// LUÔN dùng LinearGradient green cho header
<LinearGradient colors={['#1a7f37', '#43e97b']} style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Icon name="arrow-back" size={24} color="#fff" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>{t('screen_title')}</Text>
  {/* Nút action phải (optional) */}
</LinearGradient>
```

### Toast message — dùng ModalMessage
```javascript
// KHÔNG dùng Alert.alert cho thông báo thành công/thất bại
// PHẢI dùng ModalMessage component
import { ModalMessage } from '../components';

// State cần khai báo:
const [messageModal, setMessageModal] = useState('');
const [messageType, setMessageType] = useState('success');  // 'success' | 'error' | 'warning'
const [duration, setDuration] = useState(1500);
const [isMessageModalVisible, setMessageModalVisible] = useState(false);

const showMessage = (msg, type = 'success', dur = 1500) => {
  setMessageModal(msg);
  setMessageType(type);
  setDuration(dur);
  setMessageModalVisible(true);
};

// Trong JSX:
<ModalMessage
  isVisible={isMessageModalVisible}
  message={t(messageModal)}   // luôn wrap với t() để dịch
  type={messageType}
  duration={duration}
  onHide={() => setMessageModalVisible(false)}
/>
```

### Dark mode — quy tắc bắt buộc
```javascript
// PHẢI dùng colors từ useTheme() cho TẤT CẢ màu
style={{ backgroundColor: colors.background }}   // ✅
style={{ backgroundColor: '#FFFFFF' }}           // ❌ hardcode

// StatusBar phải theo theme
<StatusBar
  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
  backgroundColor={colors.background}
/>
```

### Card style chuẩn
```javascript
{
  borderRadius: 16,
  padding: 16,
  borderWidth: 0.5,
  borderColor: colors.border,
  backgroundColor: colors.surface,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,        // Android shadow
}
```

### Platform-aware padding (iOS safe area)
```javascript
paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
```

---

## Lấy user info từ Redux
```javascript
const authData = useSelector(state => state.auth);
const userInfo = authData?.data?.data;
// userInfo.id, userInfo.name, userInfo.role, userInfo.position,
// userInfo.department_id, userInfo.avatar...
```

## Role-based rendering
```javascript
const isLeaderOrAbove = ['LEADER', 'SUPERVISOR', 'MANAGER', 'ADMIN'].includes(userInfo?.role);
const isAdmin = userInfo?.role === 'ADMIN';

// Ẩn/hiện theo role
{isLeaderOrAbove && <TouchableOpacity onPress={handleApprove}>...</TouchableOpacity>}
```

---

## Đăng ký màn hình mới

### 1. Thêm vào `src/screens/index.js`
```javascript
import TenModule from './TenModule';
export { ..., TenModule };
```

### 2. Thêm vào `src/navigation/MainNavigator.js`
```javascript
import { ..., TenModule } from '../screens';

<Stack.Screen
  name="TenModule"
  component={TenModule}
  options={{ headerShown: false }}
/>
```

### 3. Thêm vào FeatureTab (nếu cần)
```javascript
// src/components/tabs/FeatureTab.js
{
  iconName: 'icon-name-outline',
  labelKey: 'ten_module',      // key i18n
  action: () => navigation.navigate('TenModule'),
  gradient: ['#colorStart', '#colorEnd'],
  iconColor: '#colorStart',
  hideForRoles: ['STAFF'],     // optional: ẩn với role cụ thể
},
```

---

## i18n — Thêm translation

```javascript
// locales/vi.json, locales/en.json, locales/ja.json, locales/pt.json
// Thêm key vào TẤT CẢ 4 file

// vi.json:
"ten_module": "Tên module",
"field1": "Trường 1",

// en.json:
"ten_module": "Module Name",
"field1": "Field 1",
```

---

## Checklist khi tạo màn hình mới

- [ ] Import `useTheme()` và dùng `colors` thay vì hardcode màu
- [ ] Header xanh lá `LinearGradient(['#1a7f37', '#43e97b'])` + nút back
- [ ] `StatusBar` theo theme (`isDarkMode ? 'light-content' : 'dark-content'`)
- [ ] Dùng `ModalMessage` thay vì `Alert.alert` cho thông báo
- [ ] `Platform.OS === 'ios'` cho safe area padding
- [ ] `FlatList` với `RefreshControl` cho danh sách
- [ ] Empty state với icon + text khi không có dữ liệu
- [ ] `useCallback` cho fetchList để tránh re-render không cần thiết
- [ ] Lấy user từ Redux: `useSelector(state => state.auth)?.data?.data`
- [ ] Thêm i18n keys vào cả 4 file locale
- [ ] Thêm constant API path vào `constans.js`
- [ ] Đăng ký trong `screens/index.js` và `MainNavigator.js`
- [ ] Role-based UI nếu cần phân quyền
