
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Breed } from "../../types/breed";

type Props = {
  breed: Breed;
};

const TRAITS = [
  { key: "energy", label: "Energy" },
  { key: "barking", label: "Barking" },
  { key: "drooling", label: "Drooling" },
  { key: "grooming", label: "Grooming needs" },
  { key: "shedding", label: "Shedding" },
  { key: "trainability", label: "Trainability" },
  { key: "good_with_dogs", label: "Good with dogs" },
  { key: "good_with_children", label: "Good with children" },
  { key: "good_with_strangers", label: "Good with strangers" },
  { key: "apartment_friendly", label: "Apartment friendly" },
] as const;

export default function BreedTraitsTab({ breed }: Props) {
  const traits = breed.attributes.traits;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Personality and care</Text>

        {TRAITS.map(({ key, label }) => {
          const score = traits?.[key];

          return (
            <View key={key} style={styles.trait}>
              <View style={styles.traitHeader}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.score}>
                  {typeof score === "number"
                    ? `${score}/5`
                    : "Not rated"}
                </Text>
              </View>

              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width:
                        typeof score === "number"
                          ? `${Math.max(0, Math.min(5, score)) * 20}%`
                          : "0%",
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}

        <View style={styles.extra}>
          <Text style={styles.label}>Exercise needed</Text>
          <Text style={styles.value}>
            {typeof traits?.exercise_minutes === "number"
              ? `${traits.exercise_minutes} minutes`
              : "Not available"}
          </Text>
        </View>

        <View style={styles.extra}>
          <Text style={styles.label}>Temperament</Text>
          <Text style={styles.value}>
            {traits?.temperament?.join(", ") || "Not available"}
          </Text>
        </View>
      </View>

      <Text style={styles.note}>
        Trait scores are shown on a 0–5 scale when supplied by the API.
        Missing scores are displayed as unavailable rather than guessed.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  title: {
    marginBottom: 18,
    fontSize: 17,
    fontWeight: "700",
    color: "#172033",
  },
  trait: {
    marginBottom: 18,
  },
  traitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: "#475467",
  },
  score: {
    fontSize: 13,
    fontWeight: "700",
    color: "#24634B",
  },
  track: {
    height: 7,
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#E8ECF1",
  },
  fill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#24634B",
  },
  extra: {
    paddingTop: 14,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E4E7EC",
    gap: 6,
  },
  value: {
    fontSize: 14,
    lineHeight: 21,
    color: "#172033",
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: "#667085",
  },
});
