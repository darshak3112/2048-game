import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const MainMenu = ({ navigation }) => {
  const [gridSize, setGridSize] = useState('4');
  const [difficulty, setDifficulty] = useState('normal');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>2048</Text>
      <Text style={styles.subtitle}>Join the numbers and get to the 2048 tile!</Text>
      
      <View style={styles.optionContainer}>
        <Text style={styles.optionLabel}>Grid Size:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gridSize}
            onValueChange={(itemValue) => setGridSize(itemValue)}
            style={styles.picker}
            dropdownIconColor="#776e65"
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="3×3" value="3" />
            <Picker.Item label="4×4" value="4" />
            <Picker.Item label="5×5" value="5" />
            <Picker.Item label="6×6" value="6" />
          </Picker>
        </View>
      </View>
      
      <View style={styles.optionContainer}>
        <Text style={styles.optionLabel}>Difficulty:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={difficulty}
            onValueChange={(itemValue) => setDifficulty(itemValue)}
            style={styles.picker}
            dropdownIconColor="#776e65"
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Normal" value="normal" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => navigation.navigate('GameScreen', { 
          gridSize: parseInt(gridSize),
          difficulty
        })}
      >
        <Text style={styles.startButtonText}>START GAME</Text>
      </TouchableOpacity>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to play:</Text>
        <Text style={styles.instructionsText}>
          • Swipe to move all tiles{'\n'}
          • When two tiles with the same number touch, they merge into one{'\n'}
          • Get to the 2048 tile to win!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ef',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#776e65',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#776e65',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 18,
    color: '#776e65',
    fontWeight: '600',
    width: '30%',
  },
  pickerContainer: {
    backgroundColor: '#eee4da',
    borderRadius: 8,
    width: '70%',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#776e65',
  },
  pickerItem: {
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#8f7a66',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: '#eee4da',
    padding: 20,
    borderRadius: 8,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#776e65',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 16,
    color: '#776e65',
    lineHeight: 24,
  }
});

export default MainMenu;