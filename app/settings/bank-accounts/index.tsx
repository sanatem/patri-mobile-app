import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button, ConfirmModal } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { getBankAccounts, type BankAccount } from '@/services/investment/bank-accounts/get-bank-account';
import { deleteBankAccount } from '@/services/investment/bank-accounts/delete-bank-account';
import { setDefaultBankAccount } from '@/services/investment/bank-accounts/set-default-bank-account';
import { useAuth } from '@/providers/AuthProvider';
import { Plus, ArrowLeft, X, Trash2, Star } from 'lucide-react-native';

export default function BankAccountsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { accessToken } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    loadBankAccounts();
  }, [accessToken]);

  const loadBankAccounts = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await getBankAccounts(accessToken);

      if (response.success) {
        const sortedAccounts = response.accounts.sort((a, b) => {
          if (a.is_default && !b.is_default) return -1;
          if (!a.is_default && b.is_default) return 1;
          return 0;
        });
        setBankAccounts(sortedAccounts);
      } else {
        Alert.alert('Error', 'No se pudieron cargar las cuentas bancarias');
      }
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar las cuentas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = () => {
    router.push('/settings/bank-accounts/add-bank-account');
  };

  const handleDeleteAccount = (account: BankAccount) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const handleSetDefault = async (account: BankAccount) => {
    if (!accessToken || account.is_default) return;

    try {
      const response = await setDefaultBankAccount(parseInt(account.id), accessToken);

      if (response.success) {
        const updatedAccounts = bankAccounts.map(acc => ({
          ...acc,
          is_default: acc.id === account.id
        }));
        const sortedAccounts = updatedAccounts.sort((a, b) => {
          if (a.is_default && !b.is_default) return -1;
          if (!a.is_default && b.is_default) return 1;
          return 0;
        });
        setBankAccounts(sortedAccounts);
      } else {
        Alert.alert('Error', response.message || 'No se pudo establecer como predeterminada');
      }
    } catch (error) {
      console.error('Error setting default bank account:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar la cuenta');
    }
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete || !accessToken) return;

    setIsDeleting(true);

    try {
      const response = await deleteBankAccount(parseInt(accountToDelete.id), accessToken);

      if (response.success) {
        const updatedAccounts = bankAccounts.filter(acc => acc.id !== accountToDelete.id);
        const sortedAccounts = updatedAccounts.sort((a, b) => {
          if (a.is_default && !b.is_default) return -1;
          if (!a.is_default && b.is_default) return 1;
          return 0;
        });
        setBankAccounts(sortedAccounts);
        setShowDeleteModal(false);
        setAccountToDelete(null);
        Alert.alert('Éxito', 'Cuenta bancaria eliminada correctamente');
      } else {
        Alert.alert('Error', response.message || 'No se pudo eliminar la cuenta');
      }
    } catch (error) {
      console.error('Error deleting bank account:', error);
      Alert.alert('Error', 'Ocurrió un error al eliminar la cuenta');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  const renderBankAccountCard = (account: BankAccount) => (
    <View
      key={account.id}
      style={styles.accountCard}
    >
      <View style={styles.accountCardContent}>
        <View style={styles.accountInfo}>
          <Text style={styles.bankName}>
            {account.bank_name}
          </Text>
          <Text style={styles.accountNumber}>
            ****{account.account_number.slice(-4)}
          </Text>
          <Text style={styles.accountType}>
            {account.account_type}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.starButton}
            onPress={() => handleSetDefault(account)}
            disabled={account.is_default}
          >
            <Star
              size={24}
              color={account.is_default ? Colors.secondary[500] : Colors.gray[400]}
              fill={account.is_default ? Colors.secondary[500] : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteAccount(account)}
          >
            <X size={20} color={Colors.gray[500]} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {t('settings.bankAccounts.noAccounts')}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        Agrega una cuenta bancaria para facilitar tus transacciones
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t('settings.bankAccounts.title')}</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 8 }} />
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.secondary[500]} />
          </View>
        ) : bankAccounts.length > 0 ? (
          <View style={styles.accountsList}>
            {bankAccounts.map(renderBankAccountCard)}
          </View>
        ) : (
          renderEmptyState()
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={t('settings.bankAccounts.addAccount')}
            variant="primary"
            fullWidth
            onPress={handleAddAccount}
            icon={<Plus size={20} color="white" />}
          />
        </View>
      </View>

      <ConfirmModal
        visible={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar cuenta bancaria"
        itemName={accountToDelete?.account_number ? `****${accountToDelete.account_number.slice(-4)}` : ''}
        message="¿Estás seguro de que deseas eliminar esta cuenta bancaria? Esta acción no se puede deshacer."
        isDeleting={isDeleting}
        cancelButtonText={t('common.cancel')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#f8f9fa',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
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
    fontSize: 22,
    color: Colors.primary[700],
    fontWeight: 'bold',

  },
  headerSubtitle: {
    marginTop: 4,
    marginLeft: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray[600],
  },
  accountsList: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  accountCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  accountCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starButton: {
    padding: 8,
  },
  accountInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary[700],
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  accountType: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary[700],
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'white',
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
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
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
  destructiveIconContainer: {
    backgroundColor: Colors.secondary[50],
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.primary[500],
  },
  modalSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    color: Colors.gray[500],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});