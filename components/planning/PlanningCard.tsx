import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Download, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface PlanningCardProps {
  title: string;
  description: string;
  contentPoints: string[];
  fileType: string;
  fileSize: string;
  bulletColor: string;
  onPress?: () => void;
  onAIPress?: () => void;
  width?: number;
}

export function PlanningCard({
  title,
  description,
  contentPoints,
  fileType,
  fileSize,
  bulletColor,
  onPress,
  onAIPress,
  width = 280,
}: PlanningCardProps) {
  return (
    <TouchableOpacity
      style={{
        width,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        position: 'relative',
        justifyContent: 'space-between',
        minHeight: 200,
      }}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <TouchableOpacity 
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: Colors.primary[600],
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
        onPress={onAIPress}
        activeOpacity={0.8}
      >
        <Sparkles size={14} color="#ffffff" fill="#ffffff" />
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text style={{
            fontFamily: 'Poppins-SemiBold',
            fontSize: 17,
            color: Colors.gray[900],
            marginBottom: 8,
          }}>
            {title}
          </Text>
          <Text style={{
            fontFamily: 'Poppins-Regular',
            fontSize: 13,
            color: Colors.gray[700],
            lineHeight: 18,
            marginBottom: 20,
          }}>
            {description}
          </Text>
          <View style={{ marginBottom: 24 }}>
            {contentPoints.map((point, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: bulletColor,
                  marginRight: 8,
                }} />
                <Text style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 13,
                  color: Colors.gray[700],
                  lineHeight: 16,
                  flex: 1,
                }}>
                  {point}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 12,
            color: Colors.gray[700],
            backgroundColor: Colors.gray[100],
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
            marginRight: 8,
          }}>
            {fileType}
          </Text>
          <Text style={{
            fontFamily: 'Poppins-Regular',
            fontSize: 12,
            color: Colors.gray[500],
          }}>
            {fileSize}
          </Text>
        </View>
        <TouchableOpacity 
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.primary[500],
          }}
          onPress={onPress}
        >
          <Download size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
} 