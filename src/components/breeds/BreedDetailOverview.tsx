
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Breed, NumericRange } from "../../types/breed";

type Props = {
  breed: Breed;
};

function formatRange(
  range?: NumericRange,
  suffix = "",
): string {
  if (!range) return "Not available";

  if (range.min === range.max) {
    return `${range.min}${suffix}`;
  }

  return `${range.min}–${range.max}${suffix}`;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function BreedDetailOverview({ breed }: Props) {
  const a = breed.attributes;

  return (
    <View>
      {!!a.description && (
        <Section title="About this breed">
          <Text style={styles.description}>{a.description}</Text>
        </Section>
      )}

      <Section title="Life expectancy">
        <InfoRow
          label="Typical lifespan"
          value={formatRange(a.life, " years")}
        />
      </Section>

      <Section title="Weight">
        <InfoRow
          label="Male"
          value={formatRange(a.male_weight, " kg")}
        />
        <InfoRow
          label="Female"
          value={formatRange(a.female_weight, " kg")}
        />
      </Section>

      <Section title="Height">
        <InfoRow
          label="Male"
          value={formatRange(a.male_height, " cm")}
        />
        <InfoRow
          label="Female"
          value={formatRange(a.female_height, " cm")}
        />
      </Section>

      <Section title="Origin and appearance">
        <InfoRow
          label="Country"
          value={a.origin?.country ?? "Not available"}
        />
        <InfoRow
          label="Region"
          value={a.origin?.region ?? "Not available"}
        />
        <InfoRow
          label="Era"
          value={a.origin?.era ?? "Not available"}
        />
        <InfoRow
          label="Coat type"
          value={a.coat?.type ?? "Not available"}
        />
        <InfoRow
          label="Coat length"
          value={a.coat?.length ?? "Not available"}
        />
        <InfoRow
          label="Coat colors"
          value={a.coat?.colors?.join(", ") || "Not available"}
        />
      </Section>

      <Section title="Other names">
        <Text style={styles.description}>
          {a.other_names?.join(", ") || "No other names listed."}
        </Text>
      </Section>

      <Section title="Recognition">
        <Text style={styles.description}>
          {a.recognized_by?.join(", ") ||
            "Recognition information is not available."}
        </Text>
      </Section>

      <Section title="Hypoallergenic">
        <Text style={styles.description}>
          {a.hypoallergenic === undefined
            ? "Not specified"
            : a.hypoallergenic
              ? "Yes"
              : "No"}
        </Text>
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#172033",
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: "#475467",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 9,
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E4E7EC",
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: "#667085",
  },
  value: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#172033",
    textAlign: "right",
  },
});
