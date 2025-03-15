import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { useGameLogic } from '../utils/gameLogic';

const GridTile = ({ value, row, col }) => {
  const { getColor, getTextColor } = useGameLogic();
  const scale = React.useRef(new Animated.Value(value ? 1 : 0.3)).current;
  
  useEffect(() => {
    if (value) {
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true
      }).start();
    } else {
      scale.setValue(0.3);
    }
  }, [value]);

  const getFontSize = () => {
    if (!value) return 28;
    const length = value.toString().length;
    if (length > 3) return 20;
    if (length > 2) return 24;
    return 28;
  };

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          backgroundColor: getColor(value),
          transform: [{ scale }]
        }
      ]}
    >
      {value ? (
        <Text
          style={[
            styles.tileText,
            {
              color: getTextColor(value),
              fontSize: getFontSize()
            }
          ]}
        >
          {value}
        </Text>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: 70,
    height: 70,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2
  },
  tileText: {
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default GridTile;