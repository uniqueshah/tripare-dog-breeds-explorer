import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type Props = { value: string; onChangeText: (value: string) => void };

export default function BreedSearchBar({ value, onChangeText }: Props) {
  return (
    <View style={styles.wrapper}>
      <TextInput value={value} onChangeText={onChangeText} placeholder="Search breeds or other names..." placeholderTextColor="#8992A3" style={styles.input} autoCapitalize="none" autoCorrect={false} returnKeyType="search" accessibilityLabel="Search dog breeds" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10 },
  input: { paddingHorizontal: 16, paddingVertical: 13, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3E7EE", fontSize: 15, color: "#172033" },
});
