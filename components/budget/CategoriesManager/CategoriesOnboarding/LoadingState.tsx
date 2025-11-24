import { View, Text } from 'react-native';
import { LoadingSpinner } from '@/components/ui';
import Colors from '@/constants/Colors';

interface LoadingStateProps {
  loadingText: string;
}

export function LoadingState({ loadingText }: LoadingStateProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <LoadingSpinner />
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
