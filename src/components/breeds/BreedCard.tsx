import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import type { Breed } from "../../types/breed";

type Props = { breed: Breed; onPress?: () => void };

function BreedCard({ breed, onPress }: Props) {
  const image = breed.attributes.images?.[0];
  const [imageFailed, setImageFailed] = React.useState(false);
  const imageUri = image?.thumb || image?.medium || image?.url;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`View ${breed.attributes.name}`} style={styles.card}>
     {imageUri && !imageFailed ? (
  <Image
    source={{ uri: imageUri }}
    style={styles.image}
    contentFit="cover"
    cachePolicy="memory-disk"
    transition={150}
    onError={() => setImageFailed(true)}
    accessibilityLabel={breed.attributes.name}
  />
) : (
  <View style={[styles.image, styles.placeholder]}>
    <Text style={styles.dog}>🐶</Text>
  </View>
)}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>{breed.attributes.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{breed.attributes.description ?? "Discover more about this breed."}</Text>
        <Text style={styles.life}>Life expectancy: {breed.attributes.life ? `${breed.attributes.life.min}–${breed.attributes.life.max} years` : "Not available"}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default React.memo(BreedCard);

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", marginBottom: 12, padding: 12, borderRadius: 16, backgroundColor: "#FFFFFF" },
  image: { width: 94, height: 104, borderRadius: 12, backgroundColor: "#E8EBF0" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  dog: { fontSize: 28 },
  details: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "700", color: "#172033" },
  description: { marginTop: 5, fontSize: 13, lineHeight: 18, color: "#687386" },
  life: { marginTop: 8, fontSize: 12, color: "#39765A" },
  chevron: { marginLeft: 6, fontSize: 26, color: "#8992A3" },
});
