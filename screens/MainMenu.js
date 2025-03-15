"use client"

import { useState, useEffect } from "react"
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  Modal, 
  ImageBackground,
  Animated
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useGameLogic } from "../utils/gameLogic"
import ThemeSelector from "../components/ThemeSelector"
import { LinearGradient } from "expo-linear-gradient"
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5,
  Feather
} from "@expo/vector-icons"

const MainMenu = () => {
  const navigation = useNavigation()
  const { highScore, gridSize, changeGridSize, boardSizes, ongoingGames, theme } = useGameLogic()

  const [showBoardSizeModal, setShowBoardSizeModal] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [pulseAnim] = useState(new Animated.Value(1))

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const hasOngoingGames = Object.keys(ongoingGames).length > 0

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.name === "Dark" ? "light-content" : "dark-content"} />
      
      {/* Header with Game Logo */}
      <LinearGradient
        colors={[theme.gradient1 || theme.button, theme.gradient2 || theme.grid]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>2048</Text>
            <MaterialCommunityIcons name="puzzle" size={28} color="#FFFFFF" style={styles.logoIcon} />
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowThemeModal(true)}
            >
              <Ionicons name="color-palette" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate("NotificationPermission")}
            >
              <Ionicons name="settings" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Stats Overview */}
        <View style={styles.statsOverview}>
          <View style={styles.statCard}>
            <FontAwesome5 name="trophy" size={20} color="#FFFFFF" />
            <Text style={styles.statValue}>{highScore}</Text>
            <Text style={styles.statLabel}>HIGH SCORE</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => setShowBoardSizeModal(true)}
          >
            <MaterialCommunityIcons name="grid" size={22} color="#FFFFFF" />
            <Text style={styles.statValue}>{gridSize}×{gridSize}</Text>
            <Text style={styles.statLabel}>BOARD SIZE</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Play Button - Animated and Prominent */}
        <View style={styles.playButtonContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: theme.button }]}
              onPress={() => navigation.navigate("GameScreen")}
            >
              <LinearGradient
                colors={[theme.button, theme.buttonGradient || '#F67C5F']}
                style={styles.playButtonGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Ionicons name="play" size={36} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          <Text style={[styles.playButtonText, { color: theme.text }]}>NEW GAME</Text>
        </View>

        {/* Game Introduction */}
        <View style={[styles.introCard, { backgroundColor: theme.grid }]}>
          <MaterialCommunityIcons name="lightbulb-on" size={24} color={theme.buttonText} style={styles.introIcon} />
          <Text style={[styles.introText, { color: theme.buttonText }]}>
            Join the numbers and get to the <Text style={styles.highlightText}>2048</Text> tile!
          </Text>
        </View>
        
        {/* Ongoing Games Section */}
        {hasOngoingGames && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="clock" size={20} color={theme.text} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>CONTINUE PLAYING</Text>
            </View>
            
            <ScrollView 
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gameCardsContainer}
            >
              {Object.keys(ongoingGames).map((size) => (
                <TouchableOpacity
                key={`ongoing-${size}`}
                  style={[styles.gameCard, { backgroundColor: theme.secondaryButton }]}
                  onPress={() => {
                    changeGridSize(Number.parseInt(size,10))
                    navigation.navigate("GameScreen")
                  }}
                >
                  <LinearGradient
                    colors={[theme.gradient1 || theme.secondaryButton, theme.gradient2 || theme.grid]}
                    style={styles.gameCardHeader}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  >
                    <View style={styles.gridBadge}>
                      <Text style={styles.gridBadgeText}>
                        {size}×{size}
                      </Text>
                    </View>
                  </LinearGradient>
                  
                  <View style={styles.gameCardContent}>
                    <View style={styles.gamePreview}>
                      <View style={styles.tileRowPreview}>
                        <View style={[styles.tilePreview, { backgroundColor: theme.tile2 || "#EEE4DA" }]} />
                        <View style={[styles.tilePreview, { backgroundColor: theme.tile4 || "#EDE0C8" }]} />
                      </View>
                      <View style={styles.tileRowPreview}>
                        <View style={[styles.tilePreview, { backgroundColor: theme.tile8 || "#F2B179" }]} />
                        <View style={[styles.tilePreview, { backgroundColor: theme.tile2 || "#EEE4DA" }]} />
                      </View>
                    </View>
                    
                    <View style={styles.gameCardInfo}>
                      <View style={styles.scoreInfo}>
                        <FontAwesome5 name="star" size={14} color={theme.buttonText} />
                        <Text style={[styles.scoreText, { color: theme.buttonText }]}>
                          {ongoingGames[size].score}
                        </Text>
                      </View>
                      
                      <View style={[styles.resumeButton, { backgroundColor: theme.button }]}>
                        <Text style={styles.resumeText}>RESUME</Text>
                        <MaterialCommunityIcons name="chevron-right" size={16} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* How to Play Section - Card-based Design */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color={theme.text} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>HOW TO PLAY</Text>
          </View>
          
          <View style={[styles.howToPlayContainer, { backgroundColor: theme.grid }]}>
            <View style={styles.instructionCard}>
              <View style={[styles.instructionIcon, { backgroundColor: theme.button }]}>
                <Feather name="move" size={22} color="#FFFFFF" />
              </View>
              <Text style={[styles.instructionText, { color: theme.buttonText }]}>
                Swipe to move all tiles in one direction
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.background }]} />
            
            <View style={styles.instructionCard}>
              <View style={[styles.instructionIcon, { backgroundColor: theme.button }]}>
              <Ionicons name="git-merge" size={22} color="#FFFFFF" />              </View>
              <Text style={[styles.instructionText, { color: theme.buttonText }]}>
                When two tiles with the same number touch, they merge into one!
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.background }]} />
            
            <View style={styles.instructionCard}>
              <View style={[styles.instructionIcon, { backgroundColor: theme.button }]}>
                <MaterialCommunityIcons name="target" size={22} color="#FFFFFF" />
              </View>
              <Text style={[styles.instructionText, { color: theme.buttonText }]}>
                Get to the 2048 tile to win the game!
              </Text>
            </View>
          </View>
        </View>
        
        {/* Extra Features Section */}
        <View style={styles.section}>
          <View style={styles.extraFeatures}>
            <TouchableOpacity 
              style={[styles.featureButton, { backgroundColor: theme.secondaryButton }]}
              onPress={() => navigation.navigate("Leaderboard")}
            >
              <FontAwesome5 name="medal" size={20} color={theme.buttonText} />
              <Text style={[styles.featureText, { color: theme.buttonText }]}>
                Leaderboard
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureButton, { backgroundColor: theme.secondaryButton }]}
              onPress={() => navigation.navigate("Achievements")}
            >
              <MaterialCommunityIcons name="star-box-multiple" size={20} color={theme.buttonText} />
              <Text style={[styles.featureText, { color: theme.buttonText }]}>
                Achievements
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Board Size Selection Modal */}
      <Modal
        transparent={true}
        visible={showBoardSizeModal}
        animationType="slide"
        onRequestClose={() => setShowBoardSizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Board Size</Text>
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: theme.grid }]}
                onPress={() => setShowBoardSizeModal(false)}
              >
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.boardSizeList}>
              {boardSizes.map((size) => (
                <TouchableOpacity
                  key={`size-${size}`}
                  style={[
                    styles.boardSizeOption,
                    {
                      backgroundColor: gridSize === size ? theme.secondaryButton : "transparent",
                      borderBottomColor: theme.grid,
                    },
                  ]}
                  onPress={() => {
                     changeGridSize(parseInt(size, 10))
                    setShowBoardSizeModal(false)
                  }}
                >
                  <View style={styles.boardSizeInfo}>
                    <MaterialCommunityIcons 
                      name="grid" 
                      size={20} 
                      color={theme.text} 
                      style={styles.boardSizeIcon}
                    />
                    <Text style={[styles.boardSizeText, { color: theme.text }]}>
                      {size} × {size}
                    </Text>
                    
                    {ongoingGames[size.toString()] && (
                      <View style={[styles.inProgressBadge, { backgroundColor: theme.button }]}>
                        <Text style={styles.inProgressText}>
                          In Progress
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {gridSize === size && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.button} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Theme Selector Modal */}
      <ThemeSelector visible={showThemeModal} onClose={() => setShowThemeModal(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  logoIcon: {
    marginLeft: 5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  statsOverview: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 120,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 2,
  },
  statLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  playButtonContainer: {
    alignItems: "center",
    marginVertical: 25,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },
  introCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  introIcon: {
    marginRight: 14,
  },
  introText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  highlightText: {
    fontWeight: "bold",
    color: "#F67C5F",
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  gameCardsContainer: {
    paddingRight: 20,
  },
  gameCard: {
    width: 180,
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  gameCardHeader: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  gridBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  gridBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  gameCardContent: {
    padding: 15,
  },
  gamePreview: {
    marginBottom: 15,
  },
  tileRowPreview: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 6,
  },
  tilePreview: {
    width: 40,
    height: 40,
    borderRadius: 6,
    margin: 3,
  },
  gameCardInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  resumeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 4,
  },
  howToPlayContainer: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  instructionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  instructionText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },
  extraFeatures: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  featureButton: {
    flex: 0.48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 2,
  },
  featureText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  boardSizeList: {
    maxHeight: 300,
  },
  boardSizeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  boardSizeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  boardSizeIcon: {
    marginRight: 12,
  },
  boardSizeText: {
    fontSize: 18,
    fontWeight: "500",
    marginRight: 10,
  },
  inProgressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inProgressText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  }
});


export default MainMenu;