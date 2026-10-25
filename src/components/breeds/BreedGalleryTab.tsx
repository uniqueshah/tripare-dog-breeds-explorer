
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import type { Breed, BreedImage } from "../../types/breed";

type Props = {
  breed: Breed;
};

function GalleryItem({ image }: { image: BreedImage }) {
  const uri = image.medium || image.thumb || image.url;
  const attribution = image.attribution;

  const [imageFailed, setImageFailed] = React.useState(false);

  return (
    <View style={styles.item}>
      {!imageFailed ? (
  <Image
    source={{ uri }}
    style={styles.image}
    contentFit="cover"
    cachePolicy="memory-disk"
    transition={150}
    onError={() => setImageFailed(true)}
  />
) : (
  <View style={[styles.image, styles.placeholder]}>
    <Text>🐶</Text>
  </View>
)}

      {!!attribution && (
        <View style={styles.caption}>
          {!!attribution.author && (
            <Text style={styles.author}>
              Photo: {attribution.author}
            </Text>
          )}

          {!!attribution.license && (
            <Text style={styles.license}>
              License: {attribution.license}
            </Text>
          )}

          {!!attribution.source_url && (
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                void Linking.openURL(attribution.source_url)
              }
            >
              <Text style={styles.link}>View original source</Text>
            </Pressable>
          )}

          {!!attribution.license_url && (
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                void Linking.openURL(attribution.license_url)
              }
            >
              <Text style={styles.link}>View license</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export default function BreedGalleryTab({ breed }: Props) {
  const images = breed.attributes.images ?? [];

  if (images.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No gallery images</Text>
        <Text style={styles.emptyText}>
          There are no additional images available for this breed.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.grid}>
        {images.map((image, index) => (
          <GalleryItem
            key={image.id || `${breed.id}-${index}`}
            image={image}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  item: {
    width: "48%",
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 4,
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: "#E8ECF1",
  },
  caption: {
    padding: 10,
    gap: 5,
  },
  author: {
    fontSize: 12,
    color: "#475467",
  },
  license: {
    fontSize: 11,
    color: "#667085",
  },
  link: {
    fontSize: 12,
    color: "#24634B",
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    padding: 28,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  emptyTitle: {
    marginBottom: 8,
    fontSize: 17,
    fontWeight: "700",
    color: "#172033",
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 21,
    color: "#667085",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EBF0",
  },
});
