/* eslint-disable no-alert */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import DailyModal from '../components/DailyModal';
import {TEXT_COLOR, THEME_COLOR, BG_COLOR} from '../utils/Colors';
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
    {label: '61PAO', value: '0.9'},
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
        <Text style={styles.text}>Product: {productName}</Text>
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
        <Text style={styles.text}>Quantity:</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          onChangeText={txt => {
            setQuatity(txt);
          }}
        />
      </View>

      <View style={styles.quatityProduct}>
        <Text style={styles.text}>First Product:</Text>
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
        <Text style={styles.text}>Time Stop:</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          onChangeText={txt => {
            setTimeStop(txt);
          }}
        />
      </View>

      <View style={styles.quatityProduct}>
        <Text style={styles.text}>Time Work:</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          onChangeText={txt => {
            setTimeWork(txt);
          }}
        />
      </View>

      <View style={styles.resulView}>
        <Text style={[styles.text, styles.resultText]}>Percent: {percent}</Text>
        <Text style={[styles.text, styles.resultText]}>
          First: {fisrtPercent}
        </Text>
        <Text style={[styles.text, styles.resultText]}>
          Temperature: {tempPercent}
        </Text>
        <Text style={[styles.text, styles.resultText]}>
          Errors: {errPercemt}
        </Text>
      </View>

      <View style={styles.handleBtn}>
        <TouchableOpacity onPress={handleCal} style={styles.btnCal}>
          <Text style={styles.btnText}>Calculate</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCancel} style={styles.btnCancel}>
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Daily;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: BG_COLOR,
  },
  productChoice: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_COLOR,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  arrowChoiceProduct: {
    width: 30,
    height: 30,
  },
  text: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  quatityProduct: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_COLOR,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  textInput: {
    width: '50%',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 5,
    color: TEXT_COLOR,
  },
  resulView: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    borderRadius: 5,
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  handleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  btnCal: {
    backgroundColor: THEME_COLOR,
    borderWidth: 1,
    height: 40,
    borderRadius: 5,
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: 'red',
    borderWidth: 1,
    height: 40,
    borderRadius: 5,
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
