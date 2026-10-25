
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  isOnline: boolean;
  lastSyncedAt: string | null;
  syncing?: boolean;
  error?: string | null;
};

function formatSyncTime(value: string | null): string {
  if (!value) return "Not synced yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Last sync time unavailable";
  }

  return `Last synced ${date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
}

export default function BreedSyncStatus({
  isOnline,
  lastSyncedAt,
  syncing = false,
  error,
}: Props) {
  const hasError = Boolean(error);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        hasError
          ? styles.error
          : isOnline
            ? styles.online
            : styles.offline,
      ]}
    >
      <View style={styles.indicator} />

      <View style={styles.content}>
        <Text style={styles.title}>
          {hasError
            ? "Couldn't refresh breeds"
            : syncing
              ? "Syncing breeds…"
              : isOnline
                ? "You're online"
                : "Offline mode"}
        </Text>

        <Text style={styles.subtitle}>
          {hasError
            ? "Showing saved data where available."
            : formatSyncTime(lastSyncedAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    gap: 9,
  },
  online: {
    backgroundColor: "#EAF5EE",
  },
  offline: {
    backgroundColor: "#FFF4E5",
  },
  error: {
    backgroundColor: "#FDECEC",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#24634B",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#172033",
  },
  subtitle: {
    fontSize: 12,
    color: "#667085",
  },
});
