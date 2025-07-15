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
  Linking
} from 'react-native';
import { 
  HelpCircle, 
  FileText, 
  Shield, 
  ChevronRight,
  ArrowLeft,
  LogOut,
  Trash2,
  X
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { deleteUserAccount } from '@/services/user/delete-user';

import Constants from 'expo-constants';


export default function MoreScreen() {
  const router = useRouter();
  const { logout, forceLogout, user, accessToken, isAuthenticated, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            
            try {
              await logout();
              router.dismissAll();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error durante logout:', error);
              try {
                await forceLogout();
              } catch (forceError) {
                console.error('Error durante logout forzado:', forceError);
              }
              router.dismissAll();
              router.replace('/auth/login');
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
      if (!accessToken) {
        throw new Error('No hay token de acceso disponible');
      }

      const result = await deleteUserAccount(accessToken);
      
      console.log('✅ Solicitud de eliminación enviada exitosamente:', result);
      
      setShowConfirmationModal(true);
      
    } catch (error) {
      console.error('Error durante solicitud de eliminación de cuenta:', error);
      
      let errorMessage = 'Hubo un problema al solicitar la eliminación de tu cuenta.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Error al solicitar eliminación',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleCloseConfirmationModal = async () => {
    setShowConfirmationModal(false);
    
    try {
      await logout();
    } catch (logoutError) {
      console.error('Error durante logout después de solicitar eliminación:', logoutError);
      await forceLogout();
    }
    
    router.dismissAll();
    router.replace('/auth/login');
  };

  const handleOpenLink = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          `No se puede abrir el enlace: ${title}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert(
        'Error',
        `Hubo un problema al abrir el enlace: ${title}`,
        [{ text: 'OK' }]
      );
    }
  };

  const menuItems = [
    {
      id: '5',
      title: 'Términos y Condiciones',
      subtitle: 'Políticas de uso',
      icon: FileText,
      onPress: () => handleOpenLink('https://patrimore.com/normas-de-conducta', 'Términos y Condiciones'),
    },
    {
      id: '6',
      title: 'Privacidad y Seguridad',
      subtitle: 'Configuración de privacidad',
      icon: Shield,
      onPress: () => handleOpenLink('https://patrimore.com/politica-de-privacidad', 'Política de Privacidad'),
    },
    {
      id: '7',
      title: 'Ayuda y Soporte',
      subtitle: 'Centro de ayuda y contacto',
      icon: HelpCircle,
      onPress: () => handleOpenLink('https://patrimore.com/contacto', 'Ayuda y Soporte'),
    },
    {
      id: '8',
      title: 'Cerrar sesión',
      subtitle: user?.email || 'Salir de la aplicación',
      icon: LogOut,
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  const renderMenuItem = (item: any) => (
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

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#1f2937" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Configuración</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Configuración y herramientas adicionales</Text>
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
                  <Text style={[styles.menuTitle, styles.destructiveTitle]}>
                    Eliminar cuenta
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    Eliminar permanentemente tu cuenta y todos tus datos
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.versionText}>Versión {Constants.expoConfig?.version ?? 'desconocida'}</Text>
        </View>
      </ScrollView>
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, styles.destructiveIconContainer]}>
                <Trash2 size={32} color={Colors.secondary[500]} />
              </View>
              <Text style={styles.modalTitle}>Eliminar cuenta</Text>
              <Text style={styles.modalSubtitle}>
                ¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.deleteButtonText}>Eliminar cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
      >
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
              <Text style={styles.confirmationTitle}>Solicitud procesada</Text>
              <Text style={styles.confirmationSubtitle}>
                Tu solicitud de eliminación de cuenta será procesada dentro de los siguientes días hábiles.
              </Text>
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
              {isDeletingAccount ? 'Enviando solicitud...' : 'Cerrando sesión...'}
            </Text>
          </View>
        </View>
      </Modal>
    </>
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
    marginLeft: 40, // Alineado con el título
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
  // Estilos para modales
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
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: 'white',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.secondary[500],
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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