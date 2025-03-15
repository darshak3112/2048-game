import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from "react-native"
import { useGameLogic } from "../utils/gameLogic"

const ThemeSelector = ({ visible, onClose }) => {
  const { theme, themes, changeTheme } = useGameLogic()

  const handleThemeChange = (themeName) => {
    changeTheme(themeName)
    onClose()
  }

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Select Theme</Text>

          <ScrollView style={styles.themeList}>
            {Object.keys(themes).map((themeName) => {
              const themeData = themes[themeName]
              return (
                <TouchableOpacity
                  key={`theme-${themeName}`}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: themeData.background,
                      borderColor: theme.name === themeData.name ? themeData.button : "transparent",
                    },
                  ]}
                  onPress={() => handleThemeChange(themeName)}
                >
                  <View style={styles.themePreview}>
                    <View style={[styles.previewGrid, { backgroundColor: themeData.grid }]}>
                      <View style={[styles.previewTile, { backgroundColor: themeData.tile }]} />
                      <View style={[styles.previewTile, { backgroundColor: "#EDE0C8" }]} />
                      <View style={[styles.previewTile, { backgroundColor: "#F2B179" }]} />
                    </View>
                  </View>
                  <Text style={[styles.themeName, { color: themeData.text }]}>{themeData.name}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.button }]} onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: theme.buttonText }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  themeList: {
    maxHeight: 300,
  },
  themeOption: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  themePreview: {
    marginRight: 15,
  },
  previewGrid: {
    width: 60,
    height: 60,
    borderRadius: 4,
    padding: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  previewTile: {
    width: 16,
    height: 16,
    borderRadius: 2,
    margin: 2,
  },
  themeName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default ThemeSelector


