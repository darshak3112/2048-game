"use client"

import React, { useEffect, useRef } from "react"
import { StyleSheet, Text, Animated, View } from "react-native"
import { useGameLogic } from "../utils/gameLogic"

const GridTile = ({ value, row, col, hasMoved, isMerged }) => {
  const { getColor, getTextColor } = useGameLogic()
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(1)).current
  const translateX = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(0)).current
  const prevValue = useRef(null)
  const prevPosition = useRef({ row, col })

  useEffect(() => {
    // Animation for new tiles appearing
    if (value && !prevValue.current) {
      scale.setValue(0.3)
      opacity.setValue(0)

      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
    // Animation for merging tiles
    else if (value && prevValue.current && value === prevValue.current * 2 && isMerged) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start()
    }
    // Animation for moving tiles
    else if (hasMoved && (prevPosition.current.row !== row || prevPosition.current.col !== col)) {
      // Calculate movement distance (each tile is 80px including margin)
      const moveX = (prevPosition.current.col - col) * 80
      const moveY = (prevPosition.current.row - row) * 80

      // Set initial position
      translateX.setValue(moveX)
      translateY.setValue(moveY)

      // Animate to new position with spring physics for more natural movement
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start()
    }

    // Update previous value and position
    prevValue.current = value
    prevPosition.current = { row, col }
  }, [value, row, col, hasMoved, isMerged])

  const getFontSize = () => {
    if (!value) return 28
    const length = value.toString().length
    if (length === 1) return 32
    if (length === 2) return 28
    if (length === 3) return 24
    return 20
  }

  if (!value) {
    return <View style={[styles.tile, { backgroundColor: getColor() }]} />
  }

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          backgroundColor: getColor(value),
          transform: [{ translateX }, { translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <Text
        style={[
          styles.tileText,
          {
            color: getTextColor(value),
            fontSize: getFontSize(),
          },
        ]}
      >
        {value}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  tile: {
    width: 70,
    height: 70,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  tileText: {
    fontWeight: "bold",
    textAlign: "center",
  },
})

export default React.memo(GridTile)

