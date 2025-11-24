import { useState, useEffect, useRef } from 'react';
import { Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAssetEditStore } from '@/store/assetEditStore';
import { useLiabilityEditStore } from '@/store/liabilityEditStore';
import { deleteAsset } from '@/services/patrimony/delete-asset';
import { deleteDebt } from '@/services/patrimony/delete-debt';

interface UsePatrimonyModalsProps {
  activeTab: 'assets' | 'liabilities';
  accessToken: string | null;
  refetchAssets: () => void;
  refetchDebts: () => void;
  loadPatrimonyData: () => Promise<void>;
}

export function usePatrimonyModals({
  activeTab,
  accessToken,
  refetchAssets,
  refetchDebts,
  loadPatrimonyData,
}: UsePatrimonyModalsProps) {
  const router = useRouter();
  const { setEditData: setAssetEditData } = useAssetEditStore();
  const { setEditData: setLiabilityEditData } = useLiabilityEditStore();

  // State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Animations
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Add modal animations
  useEffect(() => {
    if (showAddModal) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [showAddModal]);

  // Handlers
  const closeModal = () => {
    setShowAddModal(false);
  };

  const handleItemPress = (item: any) => {
    if (!accessToken || isLoadingDetail) return;

    try {
      if (activeTab === 'assets') {
        setAssetEditData({
          editMode: true,
          itemId: parseInt(item.id),
          itemType: item.type
        });
        router.push('/(tabs)/patrimony/add-asset');
      } else {
        setLiabilityEditData({
          editMode: true,
          itemId: parseInt(item.id),
          itemType: item.type
        });
        router.push('/(tabs)/patrimony/add-liability');
      }
    } catch (error) {
      console.error('Error navigating to edit:', error);
      Alert.alert('Error', 'Ocurrió un error. Por favor intenta nuevamente.');
    }
  };

  const handleItemDelete = (item: any) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    if (!accessToken) {
      Alert.alert('Error', 'Sesión no disponible. Intenta nuevamente.');
      return;
    }

    setIsDeleting(true);

    try {
      if (activeTab === 'assets') {
        const response = await deleteAsset(itemToDelete.rawData.id, accessToken, itemToDelete.type);

        if (response.success) {
          // Asset deleted successfully
        } else {
          console.error('Delete asset failed:', response.error);
          Alert.alert('Error', response.error || 'No se pudo eliminar el activo');
          setIsDeleting(false);
          setShowDeleteModal(false);
          setItemToDelete(null);
          return;
        }
      } else {
        const response = await deleteDebt(itemToDelete.rawData.id, accessToken);
        if (response.success) {
          // Debt deleted successfully
        } else {
          console.error('Delete debt failed:', response.error);
          Alert.alert('Error', response.error || 'No se pudo eliminar el pasivo');
          setIsDeleting(false);
          setShowDeleteModal(false);
          setItemToDelete(null);
          return;
        }
      }

      if (activeTab === 'assets') {
        refetchAssets();
      } else {
        refetchDebts();
      }

      await loadPatrimonyData();

      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'No se pudo eliminar el elemento');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleAddAsset = () => {
    closeModal();
    router.push('/patrimony/add-asset');
  };

  const handleAddLiability = () => {
    closeModal();
    router.push('/patrimony/add-liability');
  };

  return {
    // State
    showAddModal,
    modalVisible,
    showDeleteModal,
    itemToDelete,
    isDeleting,
    isLoadingDetail,

    // Animations
    overlayAnim,
    slideAnim,

    // Handlers
    setShowAddModal,
    closeModal,
    handleItemPress,
    handleItemDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleAddAsset,
    handleAddLiability,
  };
}
