import { View, Text } from 'react-native';
import Colors from '@/constants/Colors';

interface ErrorMessageProps {
  error: string | null;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <View
      style={{
        backgroundColor: Colors.error[50],
        borderWidth: 1,
        borderColor: Colors.error[200],
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
      }}
    >
      <Text
        className="font-medium"
        style={{
          fontSize: 14,
          color: Colors.error[700],
          textAlign: 'center',
        }}
      >
        {error}
      </Text>
    </View>
  );
}
