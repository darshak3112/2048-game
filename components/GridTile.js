import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, Animated, View } from 'react-native';
import { useGameLogic } from '../utils/gameLogic';

const GridTile = ({ value, row, col, hasMoved, isMerged }) => {
  const { getColor, getTextColor } = useGameLogic();
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const prevValue = useRef(value);
  const prevPosition = useRef({ row, col });
  const [tileStyle, setTileStyle] = useState({});

  useEffect(() => {
    // Animation for new tiles appearing
    if (value && !prevValue.current) {
      // New tile animation (scale from small to normal)
      scale.setValue(0.3);
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } 
    // Animation for merging tiles
    else if (value && prevValue.current && value === prevValue.current * 2 && isMerged) {
      // Merged tile animation (quick pulse)
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // Animation for moving tiles
    else if (hasMoved && 
            (prevPosition.current.row !== row || prevPosition.current.col !== col)) {
      // Calculate movement distance (each tile is 80px including margin)
      const moveX = (prevPosition.current.col - col) * 80;
      const moveY = (prevPosition.current.row - row) * 80;
      
      // Set initial position (where the tile is coming from)
      translateX.setValue(moveX);
      translateY.setValue(moveY);
      
      // Animate to current position (0,0)
      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(translateY, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }

    // Update previous value and position
    prevValue.current = value;
    prevPosition.current = { row, col };
    
    // Set background color based on tile value
    setTileStyle({
      backgroundColor: getColor(value),
    });
  }, [value, row, col, hasMoved, isMerged]);

  const getFontSize = () => {
    if (!value) return 28;
    const length = value.toString().length;
    if (length === 1) return 28;
    if (length === 2) return 24;
    if (length === 3) return 20;
    return 16;
  };

  if (!value) {
    return <View style={[styles.tile, { backgroundColor: getColor() }]} />;
  }

  return (
    <Animated.View
      style={[
        styles.tile,
        tileStyle,
        {
          transform: [
            { translateX },
            { translateY },
            { scale }
          ]
        }
      ]}
    >
      <Text 
        style={[
          styles.tileText, 
          { color: getTextColor(value), fontSize: getFontSize() }
        ]}
      >
        {value}
      </Text>
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
    elevation: 2,
  },
  tileText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GridTile;