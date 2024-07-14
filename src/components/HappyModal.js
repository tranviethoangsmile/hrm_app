import React, {useState, useEffect} from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const animations = [
  require('../assets/json/hpbd_1.json'),
  require('../assets/json/hpbd_2.json'),
  require('../assets/json/hpbd_3.json'),
  require('../assets/json/hpbd.json'),
];

const getRandomAnimation = () => {
  const randomIndex = Math.floor(Math.random() * animations.length);
  return animations[randomIndex];
};

const HappyModal = ({visible, onClose}) => {
  const [animation, setAnimation] = useState(getRandomAnimation());
  useEffect(() => {
    if (visible) {
      setAnimation(getRandomAnimation());
    }
  }, []);

  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableWithoutFeedback
        onPress={() => {
          onClose();
        }}>
        <View style={styles.containerModal}>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => {
              onClose();
            }}>
            <Icon name="remove" size={30} color="red" />
          </TouchableOpacity>
          <LottieView
            source={animation}
            style={{width: '100%', height: '100%'}}
            autoPlay
            loop
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  containerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: -1,
  },
  removeBtn: {
    position: 'absolute',
    top: 120,
    right: 20,
    zIndex: 1,
  },
});

export default HappyModal;
