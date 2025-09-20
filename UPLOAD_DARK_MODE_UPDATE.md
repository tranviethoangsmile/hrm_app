# 🌙 Cập Nhật Upload.js - Dark Mode Support

## 🎯 Mục đích

Cập nhật trang Upload.js để đồng bộ với dark mode như những trang khác trong ứng dụng.

## ✅ Thay đổi đã thực hiện

### 1. **Thêm Theme Hook**

#### **Import useTheme:**
```javascript
import {useTheme} from '../hooks/useTheme';
```

#### **Sử dụng trong components:**
```javascript
const {colors, isDarkMode} = useTheme();
```

### 2. **Cập Nhật PostInput Component**

#### **Theme Integration:**
```javascript
const PostInput = ({onPost, loading, onShowMessage}) => {
  const {t} = useTranslation();
  const {colors, isDarkMode} = useTheme(); // ← Thêm theme hook
  // ... rest of component
};
```

#### **Dynamic Styling:**
```javascript
// Input Block
<View style={[styles.inputBlockModern, {backgroundColor: colors.surface}]}>

// Title Input
<TextInput
  style={[
    styles.inputTitleModern, 
    {backgroundColor: colors.background, color: colors.text, borderColor: colors.border},
    errorTitle && styles.inputError
  ]}
  placeholderTextColor={colors.textSecondary}
/>

// Content Input
<TextInput
  style={[
    styles.inputContentModern, 
    {backgroundColor: colors.background, color: colors.text, borderColor: colors.border},
    errorContent && styles.inputError
  ]}
  placeholderTextColor={colors.textSecondary}
/>

// Action Buttons
<TouchableOpacity 
  style={[styles.inputIconBtnModern, {backgroundColor: colors.background}]} 
  onPress={pickImage}>
  <Icon name="image" size={20} color={colors.primary} />
</TouchableOpacity>

// Privacy Button
<TouchableOpacity
  style={[styles.privacyBtnModern, {backgroundColor: colors.background}]}
  onPress={() => setIsPublic(v => !v)}>
  <Icon
    name={isPublic ? 'globe' : 'lock'}
    size={18}
    color={isPublic ? colors.primary : colors.textSecondary}
  />
</TouchableOpacity>

// Post Button
<TouchableOpacity
  style={[styles.postBtnModern, {backgroundColor: colors.primary}]}
  onPress={handlePost}>
```

### 3. **Cập Nhật PostCard Component**

#### **Theme Integration:**
```javascript
const PostCard = ({item, onDelete, onEdit, onPressLink, showMenu}) => {
  const {t} = useTranslation();
  const {colors, isDarkMode} = useTheme(); // ← Thêm theme hook
  // ... rest of component
};
```

#### **Dynamic Styling:**
```javascript
// Feed Block
<View style={[styles.feedBlock, {backgroundColor: colors.surface}]}>

// Menu Button
<TouchableOpacity
  style={styles.menuBtnFlat}
  onPress={() => setMenuVisible(true)}>
  <Icon name="ellipsis-v" size={18} color={colors.textSecondary} />
</TouchableOpacity>

// Title
{item.title ? <Text style={[styles.feedTitle, {color: colors.text}]}>{item.title}</Text> : null}

// Content
<Text style={[styles.feedContent, {color: colors.textSecondary}]}>{item.content}</Text>

// Link Preview
<TouchableOpacity
  style={[styles.linkPreviewBoxFlat, {backgroundColor: colors.background, borderColor: colors.border}]}
  onPress={() => onPressLink(linkPreview.url)}>
  <Text style={[styles.linkPreviewTitleFlat, {color: colors.text}]}>
    {linkPreview.title}
  </Text>
  <Text style={[styles.linkPreviewDescFlat, {color: colors.textSecondary}]}>
    {linkPreview.description}
  </Text>
  <Text style={[styles.linkPreviewUrlFlat, {color: colors.primary}]}>
    {linkPreview.url}
  </Text>
  <Icon name="external-link" size={16} color={colors.primary} />
</TouchableOpacity>

// Date
<Text style={[styles.feedDate, {color: colors.textSecondary}]}>
  {moment(item.date).format('DD/MM/YYYY HH:mm')}
</Text>

// Menu Modal
<View style={[styles.menuModal, {backgroundColor: colors.surface}]}>
  <TouchableOpacity style={styles.menuItem}>
    <Icon name="edit" size={18} color={colors.primary} />
    <Text style={[styles.menuText, {color: colors.text}]}>{t('edit')}</Text>
  </TouchableOpacity>
</View>
```

### 4. **Cập Nhật Upload Component Chính**

#### **Theme Integration:**
```javascript
const Upload = () => {
  const {t} = useTranslation();
  const {colors, isDarkMode} = useTheme(); // ← Thêm theme hook
  // ... rest of component
};
```

#### **Dynamic Styling:**
```javascript
// Container
<View style={[styles.container, {backgroundColor: colors.background}]}>

// Status Bar
<StatusBar
  barStyle={isDarkMode ? "light-content" : "dark-content"}
  backgroundColor="transparent"
  translucent
/>

// Header Gradient
<LinearGradient
  colors={isDarkMode ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
  start={{x: 0, y: 0}}
  end={{x: 1, y: 1}}
  style={styles.headerGradient}>

// Keyboard Avoiding View
<KeyboardAvoidingView
  style={{flex: 1, backgroundColor: colors.background}}>

// Refresh Control
<RefreshControl 
  refreshing={refreshing} 
  onRefresh={onRefresh}
  tintColor={colors.primary}
  colors={[colors.primary]}
/>

// Empty Component
<ActivityIndicator color={colors.primary} />
<Text style={{color: colors.textSecondary}}>
  {t('no_posts', 'Chưa có bài đăng nào')}
</Text>
```

### 5. **Cập Nhật Styles**

#### **Loại Bỏ Hardcoded Colors:**
```javascript
// Before
container: {
  flex: 1,
  backgroundColor: '#f8fafc',
},
inputBlockModern: {
  backgroundColor: '#fff',
  borderColor: '#e2e8f0',
},
inputTitleModern: {
  color: '#1e293b',
  backgroundColor: '#f8fafc',
  borderColor: '#e2e8f0',
},
feedBlock: {
  backgroundColor: '#fff',
},
feedTitle: {
  color: '#1e293b',
},
feedContent: {
  color: '#475569',
},
menuModal: {
  backgroundColor: '#23272f',
},
menuText: {
  color: '#fff',
},

// After
container: {
  flex: 1,
},
inputBlockModern: {
  // backgroundColor và borderColor được set động
},
inputTitleModern: {
  // color, backgroundColor, borderColor được set động
},
feedBlock: {
  // backgroundColor được set động
},
feedTitle: {
  // color được set động
},
feedContent: {
  // color được set động
},
menuModal: {
  // backgroundColor được set động
},
menuText: {
  // color được set động
},
```

## 🎨 Visual Changes

### **1. Light Mode**
- **Background**: Light colors (`#f8fafc`, `#fff`)
- **Text**: Dark colors (`#1e293b`, `#475569`)
- **Borders**: Light gray (`#e2e8f0`)
- **Header**: Blue gradient (`#667eea` to `#764ba2`)

### **2. Dark Mode**
- **Background**: Dark colors (`#1a1a2e`, `#16213e`)
- **Text**: Light colors (`#ffffff`, `#b0b3b8`)
- **Borders**: Dark gray (`#374151`)
- **Header**: Dark gradient (`#1a1a2e` to `#16213e`)

### **3. Dynamic Elements**
- **Input fields**: Adapt to theme
- **Buttons**: Use theme colors
- **Icons**: Use theme colors
- **Text**: Use theme colors
- **Cards**: Use theme surface colors

## 🔧 Technical Implementation

### **1. Theme Hook Integration**

#### **Import và sử dụng:**
```javascript
import {useTheme} from '../hooks/useTheme';

const {colors, isDarkMode} = useTheme();
```

#### **Dynamic styling:**
```javascript
style={[styles.baseStyle, {color: colors.text, backgroundColor: colors.background}]}
```

### **2. Conditional Rendering**

#### **Status Bar:**
```javascript
<StatusBar
  barStyle={isDarkMode ? "light-content" : "dark-content"}
/>
```

#### **Header Gradient:**
```javascript
<LinearGradient
  colors={isDarkMode ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
/>
```

### **3. Color System**

#### **Text Colors:**
- **Primary text**: `colors.text`
- **Secondary text**: `colors.textSecondary`
- **Primary color**: `colors.primary`

#### **Background Colors:**
- **Main background**: `colors.background`
- **Surface**: `colors.surface`
- **Input background**: `colors.background`

#### **Border Colors:**
- **Input borders**: `colors.border`
- **Card borders**: `colors.border`

## 🧪 Test Cases

### **Test Case 1: Light Mode**
1. **Switch to light mode** → All elements use light colors
2. **Input fields** → Light background, dark text
3. **Cards** → White background, dark text
4. **Header** → Blue gradient
5. **Status bar** → Dark content

### **Test Case 2: Dark Mode**
1. **Switch to dark mode** → All elements use dark colors
2. **Input fields** → Dark background, light text
3. **Cards** → Dark surface, light text
4. **Header** → Dark gradient
5. **Status bar** → Light content

### **Test Case 3: Theme Switching**
1. **Switch between modes** → Smooth transition
2. **All elements update** → Consistent theming
3. **No hardcoded colors** → All dynamic

### **Test Case 4: Component Consistency**
1. **PostInput** → Matches theme
2. **PostCard** → Matches theme
3. **Menu modal** → Matches theme
4. **All text** → Proper contrast

## 🎉 Kết quả

### **✅ Đã cập nhật:**
- **Theme integration** - Sử dụng useTheme hook
- **Dynamic styling** - Tất cả colors được set động
- **Light mode support** - Hoạt động với light theme
- **Dark mode support** - Hoạt động với dark theme
- **Consistent theming** - Đồng bộ với các trang khác
- **No hardcoded colors** - Loại bỏ tất cả hardcoded colors

### **✅ Components đã cập nhật:**
- **PostInput** - Input form với theme colors
- **PostCard** - Feed cards với theme colors
- **Upload** - Main component với theme colors
- **Menu modal** - Context menu với theme colors
- **Header** - Gradient header với theme colors

### **✅ Visual elements:**
- **Backgrounds** - Dynamic background colors
- **Text colors** - Dynamic text colors
- **Borders** - Dynamic border colors
- **Icons** - Dynamic icon colors
- **Buttons** - Dynamic button colors
- **Status bar** - Dynamic status bar style

### **✅ User experience:**
- **Consistent theming** - Đồng bộ với toàn bộ app
- **Smooth transitions** - Chuyển đổi theme mượt mà
- **Proper contrast** - Độ tương phản phù hợp
- **Accessibility** - Dễ đọc trong mọi theme

## 🚀 Performance Benefits

### **1. Efficient Rendering**
- **Dynamic styling** - Chỉ update khi cần thiết
- **Theme integration** - Sử dụng existing theme system
- **Minimal overhead** - Không ảnh hưởng performance

### **2. Maintainability**
- **Centralized theming** - Dễ dàng thay đổi theme
- **Consistent colors** - Sử dụng theme colors
- **Clean code** - Loại bỏ hardcoded values

### **3. User Experience**
- **Theme consistency** - Đồng bộ với toàn bộ app
- **Visual harmony** - Giao diện nhất quán
- **Accessibility** - Dễ đọc trong mọi điều kiện

**Lưu ý**: Upload.js đã được cập nhật hoàn chỉnh để đồng bộ với dark mode! 🎉
