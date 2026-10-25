import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import type { Breed, BreedGroup } from "../types/breed";
import { getAllBreeds, getAllGroups, saveGroups, replaceAllBreeds } from "../database/breedsDatabase";
import { fetchAllBreeds } from "../api/breeds";
import { fetchAllGroups } from "../api/groups";
import BreedSyncStatus from "../components/breeds/BreedSyncStatus";
import {
  getLastBreedSync,
  saveLastBreedSync,
} from "../database/breedsDatabase";


import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

import BreedCard from "../components/breeds/BreedCard";
import BreedSearchBar from "../components/breeds/BreedSearchBar";
import BreedGroupChips from "../components/breeds/BreedGroupChips";
import BreedFiltersModal from "../components/breeds/BreedFiltersModal";
import {
  filterBreeds,
  getBreedSize,
  type AdvancedFilters,
  type FilterableTrait,
  type Size,
} from "../utils/filterBreeds";


const EMPTY_FILTERS: AdvancedFilters = { size: null, coat: null, hypoallergenic: null, traits: {} };
const TRAITS: { key: FilterableTrait; label: string }[] = [
  { key: "energy", label: "Energy" }, { key: "trainability", label: "Trainability" },
  { key: "good_with_children", label: "With children" }, { key: "good_with_dogs", label: "With dogs" },
  { key: "good_with_strangers", label: "With strangers" },
];

export default function BreedListScreen() {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<BreedGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState<AdvancedFilters>(EMPTY_FILTERS);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const syncInFlight = useRef(false);
  const wasOnline = useRef<boolean | null>(null);


  const loadBreeds = useCallback(async () => {
    setError(null);
    try {
      const cached = await getAllBreeds();
      if (cached.length > 0) { setBreeds(cached); setLoading(false); }
    } catch { /* Try the network if cache reading fails. */ }
    try {
    
      const freshBreeds = await fetchAllBreeds();

      await replaceAllBreeds(freshBreeds);

      const syncedAt = new Date().toISOString();
      // Record freshness only after both operations succeed.
      
      await saveLastBreedSync(syncedAt);
      setLastSyncedAt(syncedAt);
      setBreeds(freshBreeds);
      
      setSyncError(null);
    } catch (err: unknown) {
  const message =
    err instanceof Error
      ? err.message
      : "Unable to refresh dog breeds.";

  setError(message);
  setSyncError(message);
} finally {
  setLoading(false);
  setRefreshing(false);
}
  }, []);


useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    const online =
      state.isConnected === true &&
      state.isInternetReachable !== false;

    setIsOnline(online);

    const wasPreviouslyOffline = wasOnline.current === false;
    wasOnline.current = online;

    if (online && wasPreviouslyOffline && !syncInFlight.current) {
      void loadBreeds();
    }
  });

  return unsubscribe;
}, [loadBreeds]);


  useEffect(() => { void loadBreeds(); }, [loadBreeds]);

  useEffect(() => {
    let active = true;
    async function loadGroups() {
      try { const cached = await getAllGroups(); if (active && cached.length) setGroups(cached); } catch { /* Continue to API. */ }
      try {
        const fresh = await fetchAllGroups();
        if (!active) return;
        setGroups(fresh);
        try { await saveGroups(fresh); } catch { /* Fresh groups still work in memory. */ }
      } catch { /* Cached groups remain available offline. */ }
    }
    void loadGroups();
    return () => { active = false; };
  }, []);


useEffect(() => {
  let active = true;

  getLastBreedSync()
    .then((timestamp) => {
      if (active) setLastSyncedAt(timestamp);
    })
    .catch((error) => {
      console.warn("Unable to read sync timestamp:", error);
    });

  return () => {
    active = false;
  };
}, []);



const navigation =
  useNavigation<
    NativeStackNavigationProp<RootStackParamList, "BreedList">
  >();


  const toggleGroup = useCallback((groupId: string) => {
    if (!groupId) { setSelectedGroupIds([]); return; }
    setSelectedGroupIds((prev) => prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]);
  }, []);

  // filteredBreeds is the list of breeds that match the current search query, selected groups, and advanced filters. It is recalculated whenever any of those dependencies change.
  const filteredBreeds = useMemo(
  () =>
    filterBreeds({
      breeds,
      searchQuery,
      selectedGroupIds,
      filters,
    }),
  [breeds, searchQuery, selectedGroupIds, filters],
);

  
// draftFilters are used in the modal to allow users to adjust filters without immediately applying them. The draftResultCount is calculated based on the draftFilters to show how many breeds would match if those filters were applied.
  const draftResultCount = useMemo(
  () =>
    filterBreeds({
      breeds,
      searchQuery,
      selectedGroupIds,
      filters: draftFilters,
    }).length,
  [breeds, searchQuery, selectedGroupIds, draftFilters],
);

  const activeFilterCount = Number(!!filters.size) + Number(!!filters.coat) + Number(filters.hypoallergenic !== null) + Object.keys(filters.traits).length;
  const openFilters = () => { setDraftFilters({ ...filters, traits: { ...filters.traits } }); setFiltersVisible(true); };
  const cycleTrait = (trait: FilterableTrait) => setDraftFilters((prev) => {
    const current = prev.traits[trait] ?? 0; const next = current === 0 ? 3 : current === 3 ? 4 : current === 4 ? 5 : 0;
    const traits = { ...prev.traits }; if (!next) delete traits[trait]; else traits[trait] = next;
    return { ...prev, traits };
  });
  const resetAdvanced = () => setDraftFilters(EMPTY_FILTERS);

  if (loading && breeds.length === 0) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" /><Text style={styles.message}>Fetching dog breeds...</Text></SafeAreaView>;

  if (error && breeds.length === 0) return <SafeAreaView style={styles.center}><Text style={styles.error}>{error}</Text><Text onPress={() => void loadBreeds()} style={styles.retry}>Tap here to retry</Text></SafeAreaView>;


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerCopy}><Text style={styles.title}>Tripare AI</Text><Text style={styles.subtitle}>Explore the world of dogs</Text><Text style={styles.count}>{breeds.length} breeds loaded</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open filters" onPress={openFilters} style={styles.settingsButton}><Text style={styles.settingsIcon}>⚙</Text></Pressable>
      </View>
      {error ? <Text style={styles.banner}>Refresh failed: {error}</Text> : null}


{/* Check sync status */}
{(!isOnline || syncing || syncError) && (
  <BreedSyncStatus
    isOnline={isOnline}
    lastSyncedAt={lastSyncedAt}
    syncing={syncing}
    error={syncError}
  />
)}

      <BreedSearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <BreedGroupChips groups={groups} selectedGroupIds={selectedGroupIds} onToggleGroup={toggleGroup} />
      <View style={styles.toolbar}>
        <View><Text style={styles.resultCount}>{filteredBreeds.length} breeds</Text><Text style={styles.resultHint}>of {breeds.length} available</Text></View>


{/* last synced at */}
{lastSyncedAt ? (
  <Text style={styles.freshnessText}>
    Updated {new Date(lastSyncedAt).toLocaleDateString()} {new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
  </Text>
) : (
  <Text style={styles.freshnessText}>
    Saved data available when synced
  </Text>
)}

        <Pressable onPress={openFilters} style={styles.filterButton}><Text style={styles.filterButtonText}>☷ Filters{activeFilterCount ? ` · ${activeFilterCount}` : ""}</Text></Pressable>
      </View>

      {/* Breed List */}
      <FlatList
        style={styles.list}
        data={filteredBreeds}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>  <BreedCard
    breed={item}
    onPress={() =>
      navigation.navigate("BreedDetail", {
        breedId: item.id,
      })
    }
  />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadBreeds(); }} />}
        contentContainerStyle={styles.listContent}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews={false}
        ListEmptyComponent={<Text style={styles.empty}>No breeds match. Try changing your search or filters.</Text>}
      />

      {/* Breed Filters Modal */}
      <BreedFiltersModal visible={filtersVisible} onClose={() => setFiltersVisible(false)} onApply={() => { setFilters(draftFilters); setFiltersVisible(false); }} onReset={resetAdvanced} resultCount={draftResultCount}>
        <Text style={styles.sectionTitle}>Size</Text>
        <View style={styles.chips}>{(["small", "medium", "large"] as const).map((size) => <FilterChip key={size} label={size[0].toUpperCase() + size.slice(1)} selected={draftFilters.size === size} onPress={() => setDraftFilters((p) => ({ ...p, size: p.size === size ? null : size }))} />)}</View>
        <Text style={styles.sectionTitle}>Coat length</Text>
        <View style={styles.chips}>{["short", "medium", "long", "wire"].map((coat) => <FilterChip key={coat} label={coat[0].toUpperCase() + coat.slice(1)} selected={draftFilters.coat === coat} onPress={() => setDraftFilters((p) => ({ ...p, coat: p.coat === coat ? null : coat }))} />)}</View>
        <Text style={styles.sectionTitle}>Hypoallergenic</Text>
        <View style={styles.chips}>{([{ label: "Any", value: null }, { label: "Yes", value: true }, { label: "No", value: false }] as const).map((option) => <FilterChip key={option.label} label={option.label} selected={draftFilters.hypoallergenic === option.value} onPress={() => setDraftFilters((p) => ({ ...p, hypoallergenic: option.value }))} />)}</View>
        <Text style={styles.sectionTitle}>Minimum trait scores</Text>
        <Text style={styles.hint}>Tap a trait to cycle through Any, 3+, 4+, and 5.</Text>
        <View style={styles.chips}>{TRAITS.map((trait) => { const threshold = draftFilters.traits[trait.key] ?? 0; return <FilterChip key={trait.key} label={`${trait.label}: ${threshold ? `${threshold}+` : "Any"}`} selected={threshold > 0} onPress={() => cycleTrait(trait.key)} />; })}</View>
        <Text style={styles.note}>Size is estimated from the available maximum weight or height; it is a browsing aid, not an official breed classification.</Text>
      </BreedFiltersModal>
    </SafeAreaView>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F7F8FA" },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerCopy: { flex: 1 },
  title: { fontSize: 28, fontWeight: "800", color: "#172033" },
  subtitle: { marginTop: 2, fontSize: 14, color: "#687386" },
  count: { marginTop: 7, fontSize: 12, fontWeight: "600", color: "#39765A" },
  settingsButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#087FE5", marginLeft: 12 },
  settingsIcon: { fontSize: 24, color: "#FFFFFF" },
  banner: { paddingHorizontal: 14, paddingVertical: 8, color: "#B42318", backgroundColor: "#FEE4E2" },
  toolbar: { paddingHorizontal: 18, paddingTop: 2, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultCount: { fontSize: 14, fontWeight: "700", color: "#172033" },
  resultHint: { marginTop: 1, fontSize: 11, color: "#687386" },
  filterButton: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: "#DCE2E9", backgroundColor: "#FFFFFF" },
  filterButtonText: { fontSize: 13, fontWeight: "700", color: "#245C45" },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24, flexGrow: 1 },
  message: { marginTop: 12, fontSize: 15, color: "#687386", textAlign: "center" },
  error: { color: "#B42318", textAlign: "center" },
  retry: { marginTop: 16, color: "#245EC7", fontWeight: "700" },
  empty: { padding: 24, color: "#687386", textAlign: "center" },
  sectionTitle: { marginTop: 18, marginBottom: 10, fontSize: 16, fontWeight: "700", color: "#172033" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, borderWidth: 1, borderColor: "#DDE2EA", backgroundColor: "#FFFFFF" },
  chipSelected: { backgroundColor: "#245C45", borderColor: "#245C45" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#4B5565" },
  chipTextSelected: { color: "#FFFFFF" },
  hint: { marginTop: -3, marginBottom: 10, fontSize: 12, color: "#687386" },
  note: { marginTop: 22, fontSize: 12, lineHeight: 17, color: "#687386" },

freshnessText: {
  marginTop: 3,
  fontSize: 11,
  color: "#667085",
},

});
