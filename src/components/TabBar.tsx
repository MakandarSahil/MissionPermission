import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const TabBar = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: 'permissions' | 'audio' | 'camera' | 'files' | 'location';
  setActiveTab: (
    tab: 'permissions' | 'audio' | 'camera' | 'files' | 'location',
  ) => void;
}) => {
  const tabs = [
    { key: 'permissions', icon: '🔐', label: 'Permissions' },
    { key: 'audio', icon: '🎤', label: 'Audio' },
    { key: 'camera', icon: '📷', label: 'Media' },
    { key: 'files', icon: '📁', label: 'Files' },
    { key: 'location', icon: '📍', label: 'Location' }, // ✅ Location tab added
  ];

  return (
    <View style={globalStyles.tabContainer}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[
            globalStyles.tabButton,
            activeTab === tab.key && globalStyles.activeTab,
          ]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Text style={globalStyles.tabIcon}>{tab.icon}</Text>
          <Text
            style={[
              globalStyles.tabText,
              activeTab === tab.key && globalStyles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabBar;
