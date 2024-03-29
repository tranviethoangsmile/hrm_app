/* eslint-disable no-undef */
/* eslint-disable no-lone-blocks */
/* eslint-disable no-alert */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import i18next from '../../services/i18next';
import {useDispatch} from 'react-redux';
import {setAuthData} from '../redux/AuthSlice';
import {API, BASE_URL, LOGIN_URL, PORT, V1, VERSION} from '../utils/Strings';
import CheckBox from '@react-native-community/checkbox';

import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import Loader from '../components/Loader';

const Login = () => {
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const {t} = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [badUserName, setBadUserName] = useState('');
  const [badPassword, setBadPassword] = useState('');
  const [secury, setSecury] = useState(false);
  const [visible, setVisible] = useState(false);
  const [savePass, setSavePass] = useState(true);
  const getUserIF = async () => {
    const userIF = await AsyncStorage.getItem('USERINFO');
    return JSON.parse(userIF);
  };

  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    const fetchData = async () => {
      const userIF = await getUserIF();
      if (userIF != null) {
        setUserName(userIF.username);
        setPassword(userIF.password);
        setSavePass(true);
      }
    };
    checkLanguage();
    fetchData();
  }, []);

  const validate = () => {
    let isValid = true;

    if (userName === '') {
      setBadUserName('Please input username');
      isValid = false;
    } else if (userName.length < 5) {
      setBadUserName('Please enter a username with at least 5 characters');
      isValid = false;
    } else {
      setBadUserName('');
    }

    if (password === '') {
      setBadPassword('Please input password');
      isValid = false;
    } else if (password.length < 6) {
      setBadPassword('Please enter a password with at least 6 characters');
      isValid = false;
    } else {
      setBadPassword('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (savePass) {
      handleSaveLoginInfo();
    } else {
      await AsyncStorage.removeItem('USERINFO');
    }
    if (validate()) {
      setVisible(true);
      try {
        let user = {
          user_name: userName,
          password: password,
        };
        const IosLogin = async () => {
          try {
            return await axios.post(
              `${BASE_URL}${PORT}${API}${VERSION}${V1}${LOGIN_URL}`,
              user,
            );
          } catch (error) {
            Alert.alert('Error during iOS login:', error);
          }
        };
        const AndroidLogin = async () => {
          try {
            return await axios.post(
              `${BASE_URL}${PORT}${API}${VERSION}${V1}${LOGIN_URL}`,
              user,
            );
          } catch (error) {
            Alert.alert('Error during Android login:', error);
          }
        };
        const login = await Platform.select({
          ios: IosLogin,
          android: AndroidLogin,
        })();
        if (!login?.data?.success) {
          if (login?.data?.message === 'Password wrong...!!!') {
            setBadPassword(login?.data?.message);
          } else {
            setBadUserName(login?.data?.message);
          }
        } else {
          await AsyncStorage.setItem(
            'userInfor',
            JSON.stringify(login.data.data),
          );

          dispatch(setAuthData(login?.data));
          setUserName('');
          setPassword('');
          navigation.replace('Main');
        }
      } catch (error) {
        console.error('Error during login:', error);
      }
      setVisible(false);
    }
  };

  const handleSaveLoginInfo = async () => {
    try {
      const userIF = {
        username: userName,
        password: password,
      };

      await AsyncStorage.setItem('USERINFO', JSON.stringify(userIF));
    } catch (error) {
      console.error('Error while saving login info:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../images/daihatsu-metal-logo.jpg')}
        style={styles.logo}
      />
      <Text style={styles.welcomeText}>{t('Login w')}</Text>

      <CustomTextInput
        Icon={require('../images/user_name.png')}
        placeholder={t('User Name')}
        value={userName}
        onChangeText={text => setUserName(text)}
        isValid={badUserName === ''}
      />
      {badUserName !== '' && (
        <Text style={styles.errorText}>{badUserName}</Text>
      )}

      <CustomTextInput
        Icon={require('../images/password_icon.png')}
        placeholder={t('Password') + '..'}
        value={password}
        onChangeText={text => setPassword(text)}
        isValid={badPassword === ''}
        secureTextEntry={secury}
      />
      {badPassword !== '' && (
        <Text style={styles.errorText}>{badPassword}</Text>
      )}
      <View style={styles.saveContainer}>
        <View style={styles.checkBoxType}>
          <CheckBox
            tintColors={{true: 'red', false: 'black'}}
            value={secury}
            style={styles.checkBox}
            onChange={() => setSecury(!secury)}
          />
        </View>
        <Text style={styles.saveText}>{t('Spw')}</Text>
      </View>

      <View style={styles.saveContainer}>
        <CheckBox
          tintColors={{true: 'red', false: 'black'}}
          value={savePass}
          style={styles.checkBox}
          onChange={() => setSavePass(!savePass)}
          tintColor={{true: 'GREEN', false: 'BLACK'}}
        />
        <Text style={styles.saveText}>{t('Save')}</Text>
      </View>

      <LinearGradient colors={[THEME_COLOR, THEME_COLOR_2]} style={styles.btn}>
        <TouchableOpacity onPress={handleLogin} style={styles.btn}>
          <Text style={styles.btnText}>{t('Login')}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <Text
        style={styles.forgetText}
        onPress={() => {
          navigation.navigate('Forget');
        }}>
        {t('Fgp')}
      </Text>

      <Loader visible={visible} />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    color: TEXT_COLOR,
    paddingHorizontal: 20,
  },
  logo: {
    width: 170,
    height: 160,
    alignSelf: 'center',
    marginTop: Dimensions.get('window').height / 8,
  },
  welcomeText: {
    color: TEXT_COLOR,
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: '500',
    marginVertical: 20,
  },
  btn: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  checkbox: {
    margin: 10,
  },
  forgetText: {
    color: TEXT_COLOR,
    fontSize: 15,
    marginTop: 20,
    fontWeight: '500',
  },
  checkBox: {
    borderWidth: 1,
    borderColor: 'black',
    color: TEXT_COLOR,
    marginTop: 5,
  },
  saveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  saveLoginOutter: {
    width: 15,
    height: 15,
    borderWidth: 1,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveLoginInner: {
    width: 10,
    height: 10,
    borderWidth: 1,
    backgroundColor: 'blue',
  },
  saveText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5,
    color: TEXT_COLOR,
  },
});
