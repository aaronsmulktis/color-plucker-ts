import React, { useState, useEffect, useLayoutEffect } from 'react'
import {
  Animated,
  Image,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native'
import {
  Brightness,
  ColorMatrix,
  concatColorMatrices,
} from 'react-native-color-matrix-image-filters'
import colorsys from 'colorsys'

type WheelProps = {
  loupeSize: number;
  initialColor: string;
  brightness: number;
  onBrightnessChange: () => void;
  onColorChange: () => void;
  onColorChangeComplete: () => void;
}

type LoupeShape = {
  x: number;
  y: number;
}

type PanShape = {
  x: number;
  y: number;
}

type HsvShape = {
  h: number;
  s: number;
  v: number;
}

export const Wheel: React.FC<WheelProps> = props => {
  const [hsv, setHsv] = useState<HsvShape>(colorsys.hexToHsv(props.initialColor));
  const [brightness, setBrightness] = useState<number>(props.brightness);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [top, setTop] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);
  const [loupeReady, setLoupeReady] = useState<boolean>(false);
  const [loupeSpot, setLoupeSpot] = useState<LoupeShape>({x: 0, y: 0});
  const [currentColor, setCurrentColor] = useState<string>(props.initialColor);
  // TO DO: Change Any to PanShape
  const [pan, setPan] = useState<Any>(new Animated.ValueXY());
  const [radius, setRadius] = useState<number>(0);

  const loupeStyle = [
    wheelStyles.circle,
    {
      width: props.loupeSize,
      height: props.loupeSize,
      borderRadius: props.loupeSize / 2,
      backgroundColor: currentColor,
      opacity: loupeSpot.x === 0 ? 0 : 1,
    }
  ]

  const onLayout = () => {
    measureOffset()
  }

  const measureOffset = () => {
    self.measureInWindow((x, y, width, height) => {
      const window = Dimensions.get('window')
      const absX = x % width
      setRadius(Math.min(width, height) / 2)
      setLoupeSpot({
        x: absX + width / 2,
        y: y % window.height + height / 2,
      })
      setWidth(width)
      setHeight(height)
      setTop(y % window.height)
      setLeft(absX)
      forceUpdate(currentColor)
    })
  }

  const calcPolar = gestureState => {
    const {
      pageX, pageY, moveX, moveY,
    } = gestureState
    const [x, y] = [pageX || moveX, pageY || moveY]
    const [dx, dy] = [x - loupeSpot.x, y - loupeSpot.y]
    return {
      deg: Math.atan2(dy, dx) * (-180 / Math.PI),
      // pitagoras r^2 = x^2 + y^2 normalized
      radius: Math.sqrt(dy * dy + dx * dx) / radius,
    }
  }

  const outBounds = gestureState => {
    const {radius} = calcPolar(gestureState)
    return radius > 1
  }

  const resetLoupe = () => {
    if (!loupeReady) {
      return
    }

    setLoupeReady(false)
    pan.setOffset({
      x: pan.x._value,
      y: pan.y._value,
    })
    pan.setValue({x: 0, y: 0})
  }

  const calcCartesian = (deg: number, radi: number) => {
    const r = radi * radius
    const rad = Math.PI * deg / 180
    const x = r * Math.cos(rad)
    const y = r * Math.sin(rad)
    return {
      left: width / 2,
      top: height / 2,
    }
  }

  const updateColor = ({ nativeEvent }) => {
    const {deg, radius} = calcPolar(nativeEvent)
    const newHsv = {h: deg, s: 100 * radius, v: (props.brightness / 2) * 100}
    const newColor = colorsys.hsv2Hex(hsv)
    setHsv(newHsv)
    setCurrentColor(newColor)
    props.setGlobalColor(newColor)
    props.onColorChange(hsv)
  }

  const updateBrightness = value => {
    console.log(`updateBrightness: ${value}`)
    const {h,s,v} = hsv;
    const newHsv = {h: h, s: s, v: value}
    const newColor = colorsys.hsv2Hex(hsv)
    setHsv(newHsv)
    setCurrentColor(newColor)
    props.onColorChange(hsv)
  }

  const forceUpdate = color => {
    const {h, s, v} = colorsys.hex2Hsv(color)
    const {left, top} = calcCartesian(h, s / 100)
    setCurrentColor(color)
    props.onColorChange({h, s, v})
    pan.setValue({
      x: left - props.loupeSize / 2,
      y: top - props.loupeSize / 2,
    })
  }

  const animateUpdate = color => {
    const {h, s, v} = colorsys.hex2Hsv(color)
    const {left, top} = calcCartesian(h, s / 100)
    setCurrentColor(color)
    props.onColorChange({h, s, v})
    Animated.spring(pan, {
      useNativeDriver: true,
      duration: 500,
      toValue: {
        x: left - props.loupeSize / 2,
        y: top - props.loupeSize / 2,
      },
    }).start()
  }

  const loupe = PanResponder.create({
    onStartShouldSetPanResponderCapture: ({nativeEvent}) => {
      if (outBounds(nativeEvent)) return
      updateColor({nativeEvent})
      setLoupeReady(true)

      pan.setValue({
        x: -left + nativeEvent.pageX - props.loupeSize / 2,
        y: -top + nativeEvent.pageY - props.loupeSize / 2,
      })
      return true
    },
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: () => true,
    // onPanResponderEnd: () => console.log(gestureState),
    onPanResponderMove: (event, gestureState) => {
      if (outBounds(gestureState)) return

      resetLoupe()
      return Animated.event(
        [
          null,
          {
            dx: pan.x,
            dy: pan.y,
          },
        ],
        // [{ nativeEvent: {
        //   dx: pan.x,
        //   dy: pan.y,
        // }}],
        { useNativeDriver: false }
      )(event, gestureState)
    },
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: ({nativeEvent}) => {
      setLoupeReady(true)
      pan.flattenOffset()
      const {radius} = calcPolar(nativeEvent)
      if (radius < 0.1) {
        forceUpdate('#ffffff')
      }
      if (outBounds(nativeEvent)) return
      updateColor({nativeEvent})
      setLoupeReady(true)

      if (props.onColorChangeComplete) {
        props.onColorChangeComplete(hsv);
      }
    },
  })
  const panHandlers = loupe && loupe.panHandlers || {}

  useEffect(() => {
    measureOffset()
  }, [])


  return (
    <View
      ref={node => {
        self = node
      }}
      {...panHandlers}
      onLayout={nativeEvent => onLayout(nativeEvent)}
      style={[wheelStyles.coverResponder, props.style]}>
      <Brightness amount={props.brightness / 2}>
        <Image
          style={[wheelStyles.img, {
            height: radius * 2 - props.loupeSize,
            width: radius * 2 - props.loupeSize
          }]}
          source={require('./color-wheel.png')}
        />
      </Brightness>
      <Animated.View style={[pan.getLayout(), loupeStyle]} />
    </View>
  )
}

const wheelStyles = StyleSheet.create({
  coverResponder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    alignSelf: 'center',
  },
  circle: {
    position: 'absolute',
    backgroundColor: '#EEEEEE',
    borderWidth: 3,
    borderColor: '#EEEEEE',
    elevation: 3,
    shadowColor: 'rgb(46, 48, 58)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
})