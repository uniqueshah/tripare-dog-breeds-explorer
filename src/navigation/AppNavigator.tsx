
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./types";
import BreedListScreen from "../screens/BreedListScreen";
import BreedDetailScreen from "../screens/BreedDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="BreedList"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="BreedList"
          component={BreedListScreen}
        />
        <Stack.Screen
          name="BreedDetail"
          component={BreedDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
