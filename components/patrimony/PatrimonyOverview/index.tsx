import React from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Container, KeyboardAwareContainer, LockedTabOverlay } from '@/components/ui';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { usePatrimonyOverview } from '@/hooks/patrimony/usePatrimonyOverview';
import { PatrimonyHeader } from './Header';
import { SummarySection } from './Summary';
import { ChartSection } from './Chart';
import { SearchSection } from './Search';
import { AssetsListSection } from './AssetsList';
import { AddItemModal } from './Modals/AddItemModal';
import { DeleteItemModal } from './Modals/DeleteItemModal';

export function PatrimonyOverview() {
  const router = useRouter();
  const {
    // Loading states
    subscriptionLoading,
    shouldBlockTab,
    isLoading,
    error,
    refreshing,
    isLoadingData,
    isLoadingDetail,

    // UI state
    activeTab,
    ownerView,
    showSelector,
    showSkeletons,
    rangeSize,
    skeletonFadeAnim,
    userInitials,
    tabs,
    timeRangeOptions,

    // Data
    totalAssets,
    totalLiabilities,
    netWorth,
    paginatedData,
    currentTabTotal,

    // Flags
    canShowMore,
    hasNoCurrentData,
    isExpanded,
    currentError,

    // Filters
    searchQuery,

    // Modals
    showAddModal,
    modalVisible,
    showDeleteModal,
    itemToDelete,
    isDeleting,
    overlayAnim,
    slideAnim,

    // Handlers
    setSearchQuery,
    setShowSelector,
    setShowAddModal,
    setRangeSize,
    handleUserViewChange,
    handleTabChange,
    handleToggleExpand,
    handleItemPress,
    handleItemDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleAddAsset,
    handleAddLiability,
    closeModal,
    onRefresh,

    // Translation
    t,
  } = usePatrimonyOverview();

  if (subscriptionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  if (shouldBlockTab("Patrimonio")) {
    return <LockedTabOverlay tabName={t('tabs.networth')} />;
  }

  if (isLoading) {
    return (
      <Container variant="secondaryPage" style={{ padding: 20 }}>
        <PatrimonyHeader
          title={t('labels.patrimony.title')}
          ownerView={ownerView}
          showSelector={showSelector}
          userInitials={userInitials}
          onToggleSelector={() => setShowSelector(!showSelector)}
          onViewChange={handleUserViewChange}
          onPlusPress={() => setShowAddModal(true)}
          onSettingsPress={() => router.push('/settings/settings')}
          userSelectorEnabled={false}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </Container>
    );
  }

  if (error) {
    return (
      <Container variant="secondaryPage" style={{ padding: 20 }}>
        <PatrimonyHeader
          title={t('labels.patrimony.title')}
          ownerView={ownerView}
          showSelector={showSelector}
          userInitials={userInitials}
          onToggleSelector={() => setShowSelector(!showSelector)}
          onViewChange={handleUserViewChange}
          onPlusPress={() => setShowAddModal(true)}
          onSettingsPress={() => router.push('/settings/settings')}
          userSelectorEnabled={false}
        />
        <View className="flex-1 items-center justify-center">
          {/* Error view can be extracted to ErrorState component if needed */}
        </View>
      </Container>
    );
  }

  return (
    <Container variant="secondaryPage">
      <PatrimonyHeader
        title={t('labels.patrimony.title')}
        ownerView={ownerView}
        showSelector={showSelector}
        userInitials={userInitials}
        onToggleSelector={() => setShowSelector(!showSelector)}
        onViewChange={handleUserViewChange}
        onPlusPress={() => setShowAddModal(true)}
        onSettingsPress={() => router.push('/settings/settings')}
        userSelectorEnabled={false}
      />

      <KeyboardAwareContainer>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary[500]]}
              tintColor={Colors.primary[500]}
            />
          }
        >
          <SummarySection
            totalNetWorth={netWorth}
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
            variation={netWorth}
            variationPercentage={0}
            currentView={ownerView}
          />

          <ChartSection
            timeRangeOptions={timeRangeOptions}
            rangeSize={rangeSize}
            onRangeChange={setRangeSize}
            showSkeletons={showSkeletons}
            skeletonFadeAnim={skeletonFadeAnim}
          />

          <SearchSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder={t('labels.patrimony.search_placeholder')}
            showSkeletons={showSkeletons}
            skeletonFadeAnim={skeletonFadeAnim}
          />

          <AssetsListSection
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            totalLabel={activeTab === 'assets' ? t('labels.patrimony.total_assets') : t('labels.patrimony.total_liabilities')}
            currentTabTotal={currentTabTotal}
            paginatedData={paginatedData}
            isLoadingData={isLoadingData}
            currentError={currentError}
            hasNoCurrentData={hasNoCurrentData}
            canShowMore={canShowMore}
            isExpanded={isExpanded}
            showSkeletons={showSkeletons}
            skeletonFadeAnim={skeletonFadeAnim}
            onItemPress={handleItemPress}
            onItemDelete={handleItemDelete}
            onToggleExpand={handleToggleExpand}
            onAddPress={() => {
              if (activeTab === 'assets') {
                router.push('/patrimony/add-asset');
              } else {
                router.push('/patrimony/add-liability');
              }
            }}
            t={t}
          />
        </ScrollView>
      </KeyboardAwareContainer>

      <AddItemModal
        visible={showAddModal}
        modalVisible={modalVisible}
        overlayAnim={overlayAnim}
        slideAnim={slideAnim}
        onClose={closeModal}
        onAddAsset={handleAddAsset}
        onAddLiability={handleAddLiability}
        addAssetLabel={t('patrimony.addAsset')}
        addLiabilityLabel={t('patrimony.addLiability')}
      />

      <DeleteItemModal
        visible={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        activeTab={activeTab}
        itemToDelete={itemToDelete}
        isDeleting={isDeleting}
      />

      {isLoadingDetail && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 24,
            alignItems: 'center'
          }}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          </View>
        </View>
      )}
    </Container>
  );
}
