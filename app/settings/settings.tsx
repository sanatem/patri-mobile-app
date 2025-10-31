import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Button, ConfirmModal } from '@/components/ui';
import {
  HelpCircle,
  FileText,
  Shield,
  ChevronRight,
  ArrowLeft,
  LogOut,
  Trash2,
  X,
  Settings,
  CreditCard,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { deleteUserAccount } from '@/services/user/delete-user';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { BiometricSetup } from '@/components/auth/BiometricSetup';

export default function MoreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { logout, forceLogout, user, accessToken } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const redirectToLogin = () => {
    router.replace('/auth/webview');
  };

  const handleLogout = async () => {
    const logoutMessage = Platform.OS === 'ios'
      ? `${t('settings.logout.message')}\n\nNota: En iOS, la aplicación permanecerá abierta después del logout por políticas de la plataforma.`
      : t('settings.logout.message');

    Alert.alert(
      t('settings.logout.title'),
      logoutMessage,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout.action'),
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              setTimeout(() => {
                redirectToLogin();
              }, 500);
            } catch (error) {
              console.error('Error durante logout:', error);
              try {
                await forceLogout();
                setTimeout(() => {
                  redirectToLogin();
                }, 500);
              } catch (forceError) {
                console.error('Error durante logout forzado:', forceError);
                redirectToLogin();
              }
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setIsDeletingAccount(true);
    try {
      if (!accessToken) throw new Error('No hay token de acceso disponible');
      await deleteUserAccount(accessToken);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      Alert.alert(t('common.error'), error instanceof Error ? error.message : t('settings.delete.error'));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleCloseConfirmationModal = async () => {
    setShowConfirmationModal(false);
    try {
      await logout();
    } catch (err) {
      console.error('Error durante logout después de eliminar:', err);
      await forceLogout();
    }
    redirectToLogin();
  };

  const handleOpenLink = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      supported ? await Linking.openURL(url) : Alert.alert(t('common.error'), t('settings.links.cannotOpen', { title }));
    } catch (error) {
      console.error('Open link error:', error);
      Alert.alert(t('common.error'), t('settings.links.cannotOpen', { title }));
    }
  };

  const menuItems = [
    {
      id: '0',
      title: t('settings.menu.preferences'),
      subtitle: t('settings.menu.preferencesSubtitle'),
      icon: Settings,
      onPress: () => router.push('/settings/preferences'),
    },
    {
      id: '0.5',
      title: 'Autenticación biométrica',
      subtitle: 'Acceso rápido con Face ID o huella digital',
      customRender: () => <BiometricSetup />,
    },
    {
      id: '1',
      title: t('settings.menu.bankAccounts'),
      subtitle: t('settings.menu.bankAccountsSubtitle'),
      icon: CreditCard,
      onPress: () => router.push('/settings/bank-accounts'),
    },
    {
      id: '5',
      title: t('settings.menu.terms'),
      subtitle: t('settings.menu.termsSubtitle'),
      icon: FileText,
      onPress: () => handleOpenLink('https://patrimore.com/terminos-y-condiciones', t('settings.menu.terms')),
    },
    {
      id: '6',
      title: t('settings.menu.privacy'),
      subtitle: t('settings.menu.privacySubtitle'),
      icon: Shield,
      onPress: () => handleOpenLink('https://patrimore.com/politica-de-privacidad', t('settings.menu.privacy')),
    },
    {
      id: '7',
      title: t('settings.menu.help'),
      subtitle: t('settings.menu.helpSubtitle'),
      icon: HelpCircle,
      onPress: () => handleOpenLink('https://patrimore.com/contacto', t('settings.menu.help')),
    },
    {
      id: '8',
      title: t('settings.menu.logout'),
      subtitle: user?.email || t('settings.menu.logoutSubtitle'),
      icon: LogOut,
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  const renderMenuItem = (item: any) => {
    if (item.customRender) {
      return <View key={item.id}>{item.customRender()}</View>;
    }

    return (
      <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
        <View style={styles.menuItemLeft}>
          <View style={[
            styles.iconContainer,
            item.isDestructive && styles.destructiveIconContainer
          ]}>
            <item.icon size={22} color={item.isDestructive ? Colors.secondary[500] : Colors.primary[500]} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[
              styles.menuTitle,
              item.isDestructive && styles.destructiveTitle
            ]}>
              {item.title}
            </Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <ChevronRight size={20} color={Colors.gray[400]} />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>{t('settings.subtitle')}</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map(renderMenuItem)}
      </View>

      <View style={styles.dangerZoneContainer}>
        <View style={styles.dangerZoneCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, styles.destructiveIconContainer]}>
                <Trash2 size={22} color={Colors.secondary[500]} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.menuTitle, styles.destructiveTitle]}>{t('settings.delete.title')}</Text>
                <Text style={styles.menuSubtitle}>{t('settings.delete.subtitle')}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version {Constants.expoConfig?.version ?? 'unknown'}</Text>
      </View>

      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={t('settings.delete.title')}
        message={t('settings.delete.subtitle')}
        confirmButtonText="Eliminar cuenta"
        cancelButtonText={t('common.cancel')}
      />

      <Modal visible={showConfirmationModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseConfirmationModal}
            >
              <X size={24} color={Colors.gray[500]} />
            </TouchableOpacity>

            <View style={styles.confirmationContent}>
              <View style={[styles.modalIconContainer, { backgroundColor: Colors.success[100] }]}>
                <Text style={[styles.checkmarkIcon, { color: Colors.success[500] }]}>✓</Text>
              </View>
              <Text style={styles.confirmationTitle}>{t('settings.confirmation.title')}</Text>
              <Text style={styles.confirmationSubtitle}>{t('settings.confirmation.subtitle')}</Text>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={isLoggingOut || isDeletingAccount}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text style={styles.loadingText}>
              {isDeletingAccount ? t('settings.loading.deleting') : t('settings.loading.loggingOut')}
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: 'white',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginLeft: -8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 40,
  },
  menuContainer: {
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerZoneContainer: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  dangerZoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary[500],
    marginBottom: 8,
    marginLeft: 4,
  },
  dangerZoneCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.secondary[50],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveIconContainer: {
    backgroundColor: Colors.secondary[50],
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  destructiveTitle: {
    color: Colors.secondary[500],
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmationModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmarkIcon: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});
