/**
 * RecoveryCodesModal Component
 *
 * Modal that displays recovery codes to the user.
 * Allows copying all codes or individual codes.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import { X, Copy, Download, AlertTriangle, Check } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';

interface RecoveryCodesModalProps {
  visible: boolean;
  onClose: () => void;
  codes: string[];
  isNewCodes?: boolean;
}

export const RecoveryCodesModal: React.FC<RecoveryCodesModalProps> = ({
  visible,
  onClose,
  codes,
  isNewCodes = false,
}) => {
  const { t } = useTranslation();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const handleCopyCode = (code: string, index: number) => {
    try {
      Clipboard.setString(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      Alert.alert(t('common.error'), t('mfa.recoveryCodes.copyError'));
    }
  };

  const handleCopyAll = () => {
    try {
      const allCodes = codes.join('\n');
      Clipboard.setString(allCodes);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
      Alert.alert(t('mfa.recoveryCodes.copied'));
    } catch (error) {
      Alert.alert(t('common.error'), t('mfa.recoveryCodes.copyError'));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('mfa.recoveryCodes.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>

          {/* Warning */}
          {isNewCodes && (
            <View style={styles.warningContainer}>
              <AlertTriangle size={20} color={Colors.warning[600]} />
              <Text style={styles.warningText}>
                {t('mfa.recoveryCodes.saveWarning')}
              </Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.description}>
            {t('mfa.recoveryCodes.subtitle')}
          </Text>

          {/* Codes List */}
          <ScrollView style={styles.codesContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.codesGrid}>
              {codes.map((code, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.codeItem}
                  onPress={() => handleCopyCode(code, index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.codeText}>{code}</Text>
                  {copiedIndex === index ? (
                    <Check size={16} color={Colors.success[500]} />
                  ) : (
                    <Copy size={16} color={Colors.gray[400]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Warning about single use */}
          <Text style={styles.warningNote}>
            {t('mfa.recoveryCodes.warning')}
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={allCopied ? t('mfa.recoveryCodes.copied') : t('mfa.recoveryCodes.copyAll')}
              onPress={handleCopyAll}
              variant="primary"
              icon={allCopied ? <Check size={18} color="white" /> : <Copy size={18} color="white" />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.warning[700],
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
    marginBottom: 16,
  },
  codesContainer: {
    maxHeight: 250,
    marginBottom: 16,
  },
  codesGrid: {
    gap: 8,
  },
  codeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray[50],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  codeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: Colors.gray[800],
    letterSpacing: 1,
  },
  warningNote: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  actions: {
    gap: 12,
  },
});

