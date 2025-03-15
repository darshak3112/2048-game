import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GridTile = ({ value, size }) => {
  // Dynamic font size based on number of digits and tile size
  const getFontSize = () => {
    if (!value) return size * 0.5;
    
    if (value >= 1024) {
      return size * 0.28;
    } else if (value >= 100) {
      return size * 0.35;
    } else {
      return size * 0.5;
    }
  };

  return (
    <View 
      style={[
        styles.tile, 
        { 
          width: size, 
          height: size,
          backgroundColor: getTileColor(value),
        }
      ]}
    >
      {value > 0 && (
        <Text 
          style={[
            styles.tileText, 
            { 
              fontSize: getFontSize(),
              color: value <= 4 ? '#776e65' : '#f9f6f2' 
            }
          ]}
        >
          {value}
        </Text>
      )}
    </View>
  );
};

const getTileColor = (value) => {
  const colors = {
    0: '#cdc1b4',
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
    4096: '#3c3a32',
    8192: '#3c3a32',
  };
  return colors[value] || '#3c3a32';
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: 6,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  tileText: {
    fontWeight: 'bold',
  },
});

export default GridTile;