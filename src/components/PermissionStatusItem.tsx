import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PermissionStatusItemProps {
  label: string;
  granted: boolean;
}

const PermissionStatusItem: React.FC<PermissionStatusItemProps> = ({
  label,
  granted,
}) => (
  <View style={styles.permissionItem}>
    <Text style={styles.permissionLabel}>{label}</Text>
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: granted ? '#4CAF50' : '#F44336' },
      ]}
    >
      <Text style={styles.statusText}>
        {granted ? '✅ Granted' : '❌ Denied'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  permissionLabel: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PermissionStatusItem;
