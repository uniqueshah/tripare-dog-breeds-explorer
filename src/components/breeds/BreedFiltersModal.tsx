import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  resultCount: number;
  children: React.ReactNode;
};

export default function BreedFiltersModal({ visible, onClose, onApply, onReset, resultCount, children }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}><Text style={styles.action}>Cancel</Text></Pressable>
          <Text style={styles.title}>Filters</Text>
          <Pressable onPress={onReset} hitSlop={12}><Text style={styles.action}>Reset</Text></Pressable>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable onPress={onApply} style={styles.apply} accessibilityRole="button"><Text style={styles.applyText}>Show {resultCount} breeds</Text></Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  header: { minHeight: 58, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#DCE2E9" },
  title: { fontSize: 18, fontWeight: "700", color: "#172033" },
  action: { color: "#24634B", fontSize: 16, fontWeight: "600" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 28 },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#DCE2E9", backgroundColor: "#FFFFFF" },
  apply: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#24634B" },
  applyText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
