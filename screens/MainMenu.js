import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGameLogic } from '../utils/gameLogic';

const MainMenu = () => {
  const navigation = useNavigation();
  const { highScore } = useGameLogic();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>2048</Text>
        <Text style={styles.tagline}>Join the numbers and get to 2048!</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>HIGH SCORE</Text>
          <Text style={styles.statValue}>{highScore}</Text>
        </View>
      </View>
      
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('GameScreen')}
        >
          <Text style={styles.menuButtonText}>PLAY GAME</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('NotificationPermission')}
        >
          <Text style={styles.menuButtonText}>SETTINGS</Text>
        </TouchableOpacity>
        
        {/* Add more menu options as needed */}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Swipe to combine tiles. Get to the 2048 tile!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8EF',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#776E65',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#776E65',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 50,
  },
  statBox: {
    backgroundColor: '#BBADA0',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 150,
  },
  statLabel: {
    color: '#EEE4DA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statValue: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  menuContainer: {
    width: '80%',
    marginBottom: 40,
  },
  menuButton: {
    backgroundColor: '#8F7A66',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#BBADA0',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#776E65',
    textAlign: 'center',
  },
});

export default MainMenu;