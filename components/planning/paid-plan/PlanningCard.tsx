import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Download, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { planningCardStyles } from '@/styles/planning/PlanningCard.styles';

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
      style={[
        planningCardStyles.container,
        { width }
      ]}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <TouchableOpacity 
        style={planningCardStyles.aiButton}
        onPress={onAIPress}
        activeOpacity={0.8}
      >
        <Sparkles size={14} color="#ffffff" fill="#ffffff" />
      </TouchableOpacity>
      <View style={planningCardStyles.contentContainer}>
        <View style={planningCardStyles.textContainer}>
          <Text style={planningCardStyles.title}>
            {title}
          </Text>
          <Text style={planningCardStyles.description}>
            {description}
          </Text>
          <View style={planningCardStyles.pointsContainer}>
            {contentPoints.map((point, index) => (
              <View key={index} style={planningCardStyles.pointRow}>
                <View style={[
                  planningCardStyles.bullet,
                  { backgroundColor: bulletColor }
                ]} />
                <Text style={planningCardStyles.pointText}>
                  {point}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={planningCardStyles.footer}>
        <View style={planningCardStyles.fileInfo}>
          <Text style={planningCardStyles.fileType}>
            {fileType}
          </Text>
          <Text style={planningCardStyles.fileSize}>
            {fileSize}
          </Text>
        </View>
        <TouchableOpacity 
          style={planningCardStyles.downloadButton}
          onPress={onPress}
        >
          <Download size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
} 