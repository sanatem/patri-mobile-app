import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Container, ListItem, Button } from '@/components/ui';
import { listItemStyles } from '@/styles/ui/ListItem.styles';
import Colors from '@/constants/Colors';
import { TabsHeader } from './TabsHeader';
import { EmptyState } from './EmptyState';
import { ListSkeleton } from '../Skeletons/ListSkeleton';

interface AssetsListSectionProps {
  tabs: Array<{ key: string; label: string; badge: string }>;
  activeTab: 'assets' | 'liabilities';
  onTabChange: (key: string) => void;
  totalLabel: string;
  currentTabTotal: number;
  paginatedData: any[];
  isLoadingData: boolean;
  currentError: string | null;
  hasNoCurrentData: boolean;
  canShowMore: boolean;
  isExpanded: boolean;
  showSkeletons: boolean;
  skeletonFadeAnim: Animated.Value;
  onItemPress: (item: any) => void;
  onItemDelete: (item: any) => void;
  onToggleExpand: () => void;
  onAddPress: () => void;
  t: (key: string) => string;
}

export function AssetsListSection({
  tabs,
  activeTab,
  onTabChange,
  totalLabel,
  currentTabTotal,
  paginatedData,
  isLoadingData,
  currentError,
  hasNoCurrentData,
  canShowMore,
  isExpanded,
  showSkeletons,
  skeletonFadeAnim,
  onItemPress,
  onItemDelete,
  onToggleExpand,
  onAddPress,
  t
}: AssetsListSectionProps) {
  return (
    <Container variant="content">
      <View style={listItemStyles.cardContainer}>
        <TabsHeader
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          totalLabel={totalLabel}
          totalAmount={currentTabTotal}
          amountPrefix={activeTab === 'assets' ? '+' : '-'}
        />

        {isLoadingData ? (
          <ListSkeleton skeletonFadeAnim={skeletonFadeAnim} />
        ) : currentError ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text className="font-regular text-base" style={{
              color: Colors.error[500],
              textAlign: 'center',
              marginBottom: 12
            }}>
              {currentError}
            </Text>
            <TouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg"
              onPress={() => {}}
            >
              <Text className="text-white font-regular text-base">Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : hasNoCurrentData ? (
          <EmptyState
            activeTab={activeTab}
            onAddPress={onAddPress}
            titleKey={t(`patrimony.empty.${activeTab}.title`)}
            subtitleKey={t(`patrimony.empty.${activeTab}.subtitle`)}
            buttonTextKey={activeTab === 'assets' ? t('patrimony.createAsset') : t('patrimony.createLiability')}
          />
        ) : showSkeletons ? (
          <ListSkeleton skeletonFadeAnim={skeletonFadeAnim} />
        ) : (
          <>
            <ListItem
              key={`${activeTab}`}
              data={paginatedData}
              showLoadMore={false}
              showContainer={false}
              onItemPress={onItemPress}
              onItemDelete={onItemDelete}
            />

            {(canShowMore && !isExpanded) && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Button
                  variant="ghost"
                  onPress={onToggleExpand}
                  title={isExpanded ? t('common.viewLess') : t('common.viewMore')}
                />
              </View>
            )}
          </>
        )}
      </View>
    </Container>
  );
}
