import React, { useState } from 'react'
import {
  Dimensions,
  View,
  StyleSheet
} from 'react-native'
import Slider from '@react-native-community/slider'

import { Wheel } from '../Wheel'

export const ColorPicker: React.FC = () => {
  // const [wheelSize, setWheelSize] = useState<number>(50);
  const [currentColor, setCurrentColor] = useState<string>('#0066ff');
  const [wheelBrightness, setWheelBrightness] = useState<number>(1);
  return (
    <View style={styles.container}>
      <Wheel
        initialColor={currentColor}
        brightness={wheelBrightness}
        setGlobalColor={value => setCurrentColor(value)}
        onColorChange={color => console.log({color})}
        onColorChangeComplete={color => console.log({color})}
        style={{
          width: Dimensions.get('window').width,
        }}
        loupeSize={50}
        loupeStyle={{ height: 30, width: 30, borderRadius: 30}}
      />
      <Slider
        minimumValue={0}
        maximumValue={2}
        minimumTrackTintColor={"#ccc"}
        maximumTrackTintColor={currentColor}
        minimumTrackImage={require('./light-bulb-off-sm.png')}
        maximumTrackImage={require('./light-bulb-on-sm.png')}
        step={0.1}
        value={wheelBrightness}
        thumbTintColor={currentColor}
        onSlidingComplete={value => {
          console.log(value)
          setWheelBrightness(value)
        }}
        style={{
          top: -100,
          width: 200,
          height: 40,
          paddingLeft: 40,
        }}
      />
      <View style={{
        flex: 0,
        width: 50,
        heigth: 50,
        backgroundColor: currentColor
      }}></View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
})