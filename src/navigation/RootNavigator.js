import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import LearningScreen from '../screens/LearningScreen';
import RoadmapScreen from '../screens/RoadmapScreen';
import CPTrackerScreen from '../screens/CPTrackerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs({ navigation }) {
  const goHome = () => navigation.navigate('Dashboard');
  const HomeBtn = () => (
    <TouchableOpacity onPress={goHome} style={{ paddingHorizontal: 8 }}>
      <Ionicons name="home-outline" size={22} />
    </TouchableOpacity>
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: HomeBtn,
        tabBarIcon: ({ color, size }) => {
          const m = {
            Projects: 'folder-outline',
            Learning: 'play-circle-outline',
            Roadmap: 'map-outline',
            CP: 'trophy-outline',
          };
          return <Ionicons name={m[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Learning" component={LearningScreen} />
      <Tab.Screen name="Roadmap" component={RoadmapScreen} />
      <Tab.Screen name="CP" component={CPTrackerScreen} options={{ title: 'CP Tracker' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'LockIN' }}
      />
      <Stack.Screen
        name="Tabs"
        component={Tabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
