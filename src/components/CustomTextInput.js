/* eslint-disable react-native/no-inline-styles */
import {View, TextInput, Image} from 'react-native';
import React from 'react';
import {TEXT_COLOR} from '../utils/Colors';

const CustomTextInput = ({
  mt,
  placeholder,
  onChangeText,
  isValid,
  keyboardType,
  value,
  Icon,
  secureTextEntry,
  icon_eye,
}) => {
  return (
    <View
      style={{
        width: '90%',
        height: 50,
        borderWidth: isValid ? 0.4 : 1,
        alignSelf: 'center',
        borderColor: isValid ? '#9e9e9e' : 'red',
        borderRadius: 10,
        marginTop: mt ? mt : 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
      }}>
      {Icon && <Image source={Icon} style={{width: 24, height: 24}} />}
      <TextInput
        style={{marginLeft: 20, color: TEXT_COLOR}}
        placeholder={placeholder}
        value={value}
        onChangeText={text => {
          onChangeText(text);
        }}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={TEXT_COLOR}
      />
      {icon_eye && <Image source={icon_eye} style={{width: 24, height: 24}} />}
    </View>
  );
};

export default CustomTextInput;
