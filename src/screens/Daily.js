/* eslint-disable no-alert */
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Button,
} from 'react-native';
import React, {useState} from 'react';
import DailyModal from '../components/DailyModal';
import {BG, BG_COLOR, TEXT_COLOR, THEME_COLOR} from '../utils/Colors';
import {useNavigation} from '@react-navigation/native';

const Daily = () => {
  const navigation = useNavigation();
  const listProduct = [
    {label: '66 OIL', value: '1.08'},
    {label: '05k RR', value: '0.81'},
    {label: '05k FR', value: '0.85'},
    {label: '042 OIL', value: '1.09'},
    {label: 'D93F', value: '0.82'},
    {label: '14k RR', value: '1'},
    {label: '14k FR', value: '0.8'},
    {label: '67E', value: '0.80'},
    {label: '84N', value: '1.13'},
  ];
  const [isModalProductChoiceVisible, setIsModalProductChoiceVisible] =
    useState(false);
  const [productName, setProductName] = useState('');
  const [productValue, setProductValue] = useState('');
  const [quatity, setQuatity] = useState(0);
  const [fisrtProduct, setFisrtProduct] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [error, setError] = useState(0);
  const [timeStop, setTimeStop] = useState(0);
  const [timeWork, setTimeWork] = useState(0);
  const [percent, setPercent] = useState(0);
  const [errPercemt, setErrPercent] = useState(0);
  const [fisrtPercent, setFisrtPercent] = useState(0);
  const [tempPercent, setTempPercent] = useState(0);

  const handleClickChoiceProduct = product => {
    setProductName(product.label);
    setProductValue(product.value);
  };
  const handleCal = () => {
    if (productValue === '') {
      alert('Please select a product');
    } else {
      let per =
        ((parseFloat(quatity) * parseFloat(productValue)) /
          (parseFloat(timeWork) - parseFloat(timeStop))) *
        100;
      let errPer = (parseFloat(error) / parseFloat(quatity)) * 100;
      let firstPer = (parseFloat(fisrtProduct) / parseFloat(quatity)) * 100;
      let tempPer = (parseFloat(temperature) / parseFloat(quatity)) * 100;
      setPercent(per.toFixed(1));
      setErrPercent(errPer.toFixed(1));
      setFisrtPercent(firstPer.toFixed(1));
      setTempPercent(tempPer.toFixed(1));
    }
  };
  const handleCancel = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <View style={styles.productChoice}>
        <Text style={styles.text}>Product: </Text>
        <Text style={styles.text}>{productName}</Text>
        <TouchableOpacity
          onPress={() => {
            setIsModalProductChoiceVisible(!isModalProductChoiceVisible);
          }}>
          <Image
            style={styles.arrowChoiceProduct}
            source={require('../images/arrow_icon.png')}
          />
        </TouchableOpacity>
        <DailyModal
          products={listProduct}
          visible={isModalProductChoiceVisible}
          onClose={() => {
            setIsModalProductChoiceVisible(!isModalProductChoiceVisible);
          }}
          onProductSelected={handleClickChoiceProduct}
        />
      </View>
      <View style={styles.quatityProduct}>
        <Text style={styles.text}>Quatity:</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          onChangeText={txt => {
            setQuatity(txt);
          }}
        />
      </View>
      <View style={styles.quatityProduct}>
        <Text style={styles.text}>Fisrt Product:</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          onChangeText={txt => {
            setFisrtProduct(txt);
          }}
        />
      </View>
      <View style={styles.quatityProduct}>
        <Text style={styles.text}>Temperature:</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          onChangeText={txt => {
            setTemperature(txt);
          }}
        />
      </View>
      <View style={styles.quatityProduct}>
        <Text style={styles.text}>Errors:</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          onChangeText={txt => {
            setError(txt);
          }}
        />
      </View>
      <View style={styles.quatityProduct}>
        <Text style={styles.text}>Time stop:</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          onChangeText={txt => {
            setTimeStop(txt);
          }}
        />
      </View>
      <View style={styles.quatityProduct}>
        <Text style={styles.text}>Time work:</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          onChangeText={txt => {
            setTimeWork(txt);
          }}
        />
      </View>
      <View style={styles.resulView}>
        <Text style={[styles.text, {color: '#FFF', fontSize: 15}]}>
          PERCENT: {percent}
        </Text>
        <Text style={[styles.text, {color: '#FFF', fontSize: 15}]}>
          FISRT: {fisrtPercent}
        </Text>
        <Text style={[styles.text, {color: '#FFF', fontSize: 15}]}>
          TEMP: {tempPercent}
        </Text>
        <Text style={[styles.text, {color: '#FFF', fontSize: 15}]}>
          ERROR: {errPercemt}
        </Text>
      </View>
      <View style={styles.handleBtn}>
        <View style={styles.btnCal}>
          <Text style={styles.btnText} onPress={handleCal}>
            Cal
          </Text>
        </View>
        <View style={styles.btnCancel}>
          <Text onPress={handleCancel} style={styles.btnText}>
            Cancel
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Daily;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  productChoice: {
    width: '100%',
    height: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  arrowChoiceProduct: {
    width: 40,
    height: 40,
  },
  text: {
    color: TEXT_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
  },
  quatityProduct: {
    width: '100%',
    height: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  textInput: {
    width: '50%',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
    color: TEXT_COLOR,
  },
  resulView: {
    width: '100%',
    height: 50,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: BG,
  },
  handleBtn: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  btnCal: {
    backgroundColor: THEME_COLOR,
    borderWidth: 1,
    height: 40,
    borderRadius: 25,
    margin: 10,
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: 'red',
    borderWidth: 1,
    height: 40,
    width: '40%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
