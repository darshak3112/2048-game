import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppNavigator } from './navigation/AppNavigator';
import { GameLogicProvider } from './utils/gameLogic';

export default function App() {
  return (
    <GameLogicProvider>
      <View style={styles.container}>
        <AppNavigator />
      </View>
    </GameLogicProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8EF',
  },
});