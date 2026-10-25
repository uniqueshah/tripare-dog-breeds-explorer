
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";
import type { Breed } from "../types/breed";
import { fetchBreedById } from "../api/breeds";
import { getBreedById, saveBreeds } from "../database/breedsDatabase";
import BreedDetailOverview from "../components/breeds/BreedDetailOverview";
import BreedTraitsTab from "../components/breeds/BreedTraitsTab";
import BreedGalleryTab from "../components/breeds/BreedGalleryTab";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "BreedDetail"
>;

type DetailTab = "Overview" | "Traits" | "Gallery";

const TABS: DetailTab[] = ["Overview", "Traits", "Gallery"];

export default function BreedDetailScreen({
  route,
  navigation,
}: Props) {
  const { breedId } = route.params;

  const [breed, setBreed] = useState<Breed | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("Overview");

  const loadBreed = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    let cachedBreed: Breed | null = null;

    try {
      cachedBreed = await getBreedById(breedId);

      if (cachedBreed) {
        setBreed(cachedBreed);
        setLoading(false);
      }

      const freshBreed = await fetchBreedById(breedId);

      setBreed(freshBreed);

      try {
        await saveBreeds([freshBreed]);
      } catch (cacheError) {
        console.warn("Unable to update cached breed:", cacheError);
      }
    } catch (loadError) {
      if (!cachedBreed) {
        setError(
          "We couldn't load this breed. Check your connection and try again.",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [breedId]);

  useEffect(() => {
    void loadBreed();
  }, [loadBreed]);

  const heroImage =
    breed?.attributes.images?.[0]?.large ??
    breed?.attributes.images?.[0]?.medium ??
    breed?.attributes.images?.[0]?.url;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back to breed list"
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text numberOfLines={1} style={styles.topBarTitle}>
          {breed?.attributes.name ?? "Breed details"}
        </Text>

        <View style={styles.topBarSpacer} />
      </View>

      {loading && !breed ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#24634B" />
          <Text style={styles.muted}>Loading breed details…</Text>
        </View>
      ) : error && !breed ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => void loadBreed()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : breed ? (
        <>
          {heroImage ? (
            <Image
              source={{ uri: heroImage }}
              style={styles.heroImage}
              contentFit="cover"
              cachePolicy="disk"
              transition={180}
              accessibilityLabel={breed.attributes.name}
            />
          ) : (
            <View style={[styles.heroImage, styles.imagePlaceholder]}>
              <Text style={styles.muted}>No image available</Text>
            </View>
          )}

          <View style={styles.breedHeading}>
            <Text style={styles.breedName}>
              {breed.attributes.name}
            </Text>
            {!!breed.attributes.origin?.country && (
              <Text style={styles.origin}>
                {breed.attributes.origin.country}
              </Text>
            )}
          </View>

          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const selected = activeTab === tab;

              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  style={[
                    styles.tab,
                    selected && styles.selectedTab,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      selected && styles.selectedTabText,
                    ]}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.tabContentInner}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "Overview" && (
              <BreedDetailOverview breed={breed} />
            )}

            {activeTab === "Traits" && (
              <BreedTraitsTab breed={breed} />
            )}

            {activeTab === "Gallery" && (
              <BreedGalleryTab breed={breed} />
            )}
          </ScrollView>

          {refreshing && (
            <View style={styles.refreshIndicator}>
              <ActivityIndicator size="small" color="#24634B" />
              <Text style={styles.muted}>Refreshing…</Text>
            </View>
          )}
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  topBar: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  backText: {
    fontSize: 34,
    color: "#24634B",
    lineHeight: 38,
  },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#172033",
  },
  topBarSpacer: {
    width: 40,
  },
  heroImage: {
    width: "100%",
    height: 230,
    backgroundColor: "#E7EBEF",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  breedHeading: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  breedName: {
    fontSize: 27,
    fontWeight: "800",
    color: "#172033",
  },
  origin: {
    fontSize: 14,
    color: "#667085",
    marginTop: 5,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#E8ECF1",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    borderRadius: 11,
  },
  selectedTab: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667085",
  },
  selectedTabText: {
    color: "#24634B",
  },
  tabContent: {
    flex: 1,
  },
  tabContentInner: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  muted: {
    color: "#667085",
    fontSize: 14,
  },
  errorText: {
    color: "#B42318",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#24634B",
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  refreshIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
});
