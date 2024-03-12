import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import CheckBox from '@react-native-community/checkbox';
import {THEME_COLOR, TEXT_COLOR} from '../utils/Colors';
const Upload = () => {
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isPublic, setIsPublic] = useState(false);

  const chooseImage = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });
      setImageUri(res.uri);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the file selection.');
      } else {
        console.log('Error: ', err);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInforUpload}>
        <View style={styles.userInforAvatar}>
          <Image
            source={require('../images/avatar.jpg')}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
        <View style={styles.userInforName}>
          <Text>Viet Hoang</Text>
        </View>
      </View>
      <View style={styles.captionInput}>
        <TextInput
          multiline={true}
          numberOfLines={5}
          placeholder="Write a caption..."
          style={styles.input}
          onChangeText={text => setCaption(text)}
        />
      </View>
      <View style={styles.checkboxRow}>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={isPublic}
            onValueChange={newValue => setIsPublic(newValue)}
            style={styles.checkbox}
          />
          <Text style={styles.label}>Public</Text>
        </View>
        <TouchableOpacity
          onPress={chooseImage}
          style={styles.chooseImageButton}>
          <Text>Choose Image</Text>
        </TouchableOpacity>
      </View>
      {imageUri && (
        <Image source={{uri: imageUri}} style={styles.selectedImage} />
      )}
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  userInforUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInforAvatar: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInforName: {},
  captionInput: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  chooseImageButton: {
    backgroundColor: THEME_COLOR,
    padding: 10,
    borderRadius: 5,
  },
  selectedImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  btn: {
    backgroundColor: THEME_COLOR,
    padding: 10,
    borderRadius: 5,
    width: '50%',
  },
  btnText: {
    color: TEXT_COLOR,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default Upload;
