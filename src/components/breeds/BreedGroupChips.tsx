
import React from "react";
import {
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import type { BreedGroup } from "../../types/breed";

type Props = {
  groups: BreedGroup[];
  selectedGroupIds: string[];
  onToggleGroup: (groupId: string) => void;
};

export default function BreedGroupChips({
  groups,
  selectedGroupIds,
  onToggleGroup,
}: Props) {
  const allSelected = selectedGroupIds.length === 0;

  const renderChip = (
    label: string,
    selected: boolean,
    onPress: () => void,
    key: string,
  ) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.chipSelected,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.chipText,
          selected && styles.chipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView
      horizontal
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {renderChip(
        "All groups",
        allSelected,
        () => {
          // Empty selection means no group filter.
          selectedGroupIds.forEach(onToggleGroup);
        },
        "all",
      )}

      {groups.map((group) =>
        renderChip(
          group.attributes.name,
          selectedGroupIds.includes(group.id),
          () => onToggleGroup(group.id),
          group.id,
        ),
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    height: 52,
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 8,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCE2E9",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  chipSelected: {
    backgroundColor: "#24634B",
    borderColor: "#24634B",
  },
  chipText: {
    color: "#475467",
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
});
