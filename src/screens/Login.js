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
import {useDispatch} from 'react-redux';
import {setAuthData} from '../redux/AuthSlice';
import {
  API,
  BASE_URL,
  BASE_URL_DEV,
  BASE_URL_IOS,
  LOGIN_URL,
  PORT,
  PORT_DEV,
  PORT_IOS,
  V1,
  VERSION,
} from '../utils/Strings';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import Loader from '../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch(); // Đã sửa thành "dispatch" thay vì "disPatch"
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [badUserName, setBadUserName] = useState('');
  const [badPassword, setBadPassword] = useState('');
  const [secury, setSecury] = useState(true);
  const [visible, setVisible] = useState(false);
  const [savePass, setSavePass] = useState(false);

  const getUserIF = async () => {
    const userIF = await AsyncStorage.getItem('USERINFO');
    return JSON.parse(userIF);
  };

  useEffect(() => {
    const fetchData = async () => {
      const userIF = await getUserIF();
      if (userIF != null) {
        setUserName(userIF.username);
        setPassword(userIF.password);
        setSavePass(true);
      }
    };

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
              `${BASE_URL_DEV}${PORT_DEV}${API}${VERSION}${V1}${LOGIN_URL}`,
              user,
            );
          } catch (error) {
            Alert.alert('Error during iOS login:', error);
          }
        };
        const AndroidLogin = async () => {
          try {
            return await axios.post(
              `${BASE_URL_DEV}${PORT_DEV}${API}${VERSION}${V1}${LOGIN_URL}`,
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
          dispatch(setAuthData(login?.data)); // Đã sửa thành "dispatch" thay vì "disPatch"
          setUserName('');
          setPassword('');
          navigation.navigate('Main');
        }
      } catch (error) {
        console.error('Error during login:', error);
      }
      setVisible(false);
    }
  };

  const handleSaveLoginInfo = async () => {
    setSavePass(true);

    try {
      const userIF = {
        username: userName,
        password: password,
      };

      await AsyncStorage.setItem('USERINFO', JSON.stringify(userIF));
    } catch (error) {
      console.error('Error while saving login info:', error);
      alert('Error while saving login info');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../images/daihatsu_logo.jpg')}
        style={styles.logo}
      />
      <Text style={styles.welcomeText}>Login with your account</Text>

      <CustomTextInput
        Icon={require('../images/user_name.png')}
        placeholder={'User Name'}
        value={userName}
        onChangeText={text => setUserName(text)}
        isValid={badUserName === ''}
      />
      {badUserName !== '' && (
        <Text style={styles.errorText}>{badUserName}</Text>
      )}

      <CustomTextInput
        Icon={require('../images/password_icon.png')}
        placeholder={'Password..'}
        value={password}
        onChangeText={text => setPassword(text)}
        isValid={badPassword === ''}
        secureTextEntry={secury}
      />
      {badPassword !== '' && (
        <Text style={styles.errorText}>{badPassword}</Text>
      )}

      <Text
        style={styles.checkBox}
        onPress={() => {
          setSecury(!secury);
        }}>
        Show password
      </Text>

      <View style={styles.saveContainer}>
        <TouchableOpacity onPress={handleSaveLoginInfo}>
          <View style={styles.saveLoginOutter}>
            {savePass && <View style={styles.saveLoginInner} />}
          </View>
        </TouchableOpacity>
        <Text style={styles.saveText}>Save</Text>
      </View>

      <LinearGradient colors={[THEME_COLOR, THEME_COLOR_2]} style={styles.btn}>
        <TouchableOpacity onPress={handleLogin} style={styles.btn}>
          <Text style={styles.btnText}>LOGIN</Text>
        </TouchableOpacity>
      </LinearGradient>

      <Text
        style={styles.forgetText}
        onPress={() => {
          navigation.navigate('Forget');
        }}>
        Forget password?
      </Text>

      <Loader visible={visible} />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    color: TEXT_COLOR,
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 150,
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
  forgetText: {
    color: TEXT_COLOR,
    fontSize: 15,
    marginTop: 20,
    fontWeight: '500',
  },
  checkBox: {
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
