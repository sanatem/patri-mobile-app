import { View, Text, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';

interface LoadingStateProps {
  loadingText: string;
}

export function LoadingState({ loadingText }: LoadingStateProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color={Colors.secondary[500]} />
      <Text
        className="font-regular"
        style={{
          fontSize: 14,
          color: Colors.gray[600],
          marginTop: 16,
        }}
      >
        {loadingText}
      </Text>
    </View>
  );
}
