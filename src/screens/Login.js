/* eslint-disable no-lone-blocks */
/* eslint-disable no-alert */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */

import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Button,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {BASE_URL, LOGIN_URL, PORT} from '../utils/Strings';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import Loader from '../components/Loader';
import {setAuthData} from '../redux/AuthSlice';
const Login = () => {
  const navigation = useNavigation();
  const disPatch = useDispatch();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [badUserName, setBadUserName] = useState('');
  const [badPassword, setBadPassword] = useState('');
  const [secury, setSecury] = useState(true);
  const [visible, setVisible] = useState(false);
  const validate = () => {
    let isValid = false;
    if (userName === '') {
      setBadUserName('Please input password');
      isValid = false;
    } else if (userName !== '' && userName.length < 5) {
      setBadUserName('please enter user name > 5 characters');
      isValid = false;
    } else {
      isValid = true;
      setBadUserName('');
    }
    if (password === '') {
      setBadPassword('Please input password');
      isValid = false;
    } else if (password !== '' && password.length < 6) {
      setBadPassword('please enter password > 5 characters');
      isValid = false;
    } else {
      isValid = true;
      setBadPassword('');
    }
    return isValid;
  };
  const handleLogin = async () => {
    if (validate()) {
      setVisible(true);
    }
    try {
      let user = {
        user_name: userName,
        password: password,
      };
      const login = await axios.post(BASE_URL + PORT + LOGIN_URL, user);
      if (!login?.data?.success) {
        if (login?.data?.message == 'Password wrong...!!!') {
          setBadPassword(login?.data?.message);
          setVisible(false);
        } else {
          setBadUserName(login?.data?.message);
          setVisible(false);
        }
      } else {
        disPatch(setAuthData(login?.data));
        setVisible(false);
        setUserName('');
        setPassword('');
        navigation.navigate('Main');
      }
    } catch (error) {
      console.log(error);
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
        isValid={badUserName === '' ? true : false}
      />
      {badUserName !== '' && (
        <Text style={styles.errorText}>{badUserName}</Text>
      )}

      <CustomTextInput
        Icon={require('../images/password_icon.png')}
        placeholder={'Password..'}
        value={password}
        onChangeText={text => setPassword(text)}
        isValid={badPassword === '' ? true : false}
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

      <LinearGradient colors={[THEME_COLOR, THEME_COLOR_2]} style={styles.btn}>
        <TouchableOpacity
          onPress={handleLogin}
          style={[
            styles.btn,
            {justifyContent: 'center', alignItems: 'center', marginTop: 0},
          ]}>
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
  },
  btn: {
    width: '90%',
    height: 50,
    marginTop: 40,
    alignSelf: 'center',
    borderRadius: 10,
  },
  btnText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginLeft: 20,
    marginTop: 5,
  },
  forgetText: {
    color: TEXT_COLOR,
    fontSize: 15,
    marginLeft: 20,
    marginTop: 20,
    fontWeight: '500',
  },
  checkBox: {
    marginLeft: 20,
    marginTop: 5,
    color: TEXT_COLOR,
  },
});
