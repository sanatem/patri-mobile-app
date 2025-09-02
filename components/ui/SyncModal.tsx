import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, Text, ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface SyncModalProps {
  visible: boolean;
  onClose?: () => void;
  onSyncComplete?: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ visible, onClose, onSyncComplete }) => {
  const { width: screenWidth } = Dimensions.get('window');
  const modalWidth = Math.min(screenWidth - 40, 320);
  const [timeLeft, setTimeLeft] = useState(60);

  const handleSyncComplete = useCallback(() => {
    if (onSyncComplete) {
      setTimeout(() => {
        onSyncComplete();
      }, 0);
    }
  }, [onSyncComplete]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (visible) {
      setTimeLeft(60);
      
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (onClose) {
              setTimeout(() => {
                onClose();
              }, 0);
            }
            handleSyncComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, onClose, handleSyncComplete]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
    handleSyncComplete();
  }, [onClose, handleSyncComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={false}
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { width: modalWidth }]}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <X size={24} color={Colors.gray[500]} />
          </TouchableOpacity>
          
          <View style={styles.modalHeader}>
            <ActivityIndicator size="large" color={Colors.secondary[500]} />
            
            <Text className='font-medium' style={styles.modalTitle}>
              Sincronizando datos
            </Text>
            
            <Text className='font-regular' style={styles.modalSubtitle}>
              Se están sincronizando sus datos con Floid. Esto podría tardar unos minutos.
            </Text>
            
            <Text className='font-regular' style={styles.timerText}>
              Tiempo restante: {formatTime(timeLeft)}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: Colors.primary[700],
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.primary[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  timerText: {
    fontSize: 14,
    color: Colors.primary[500],
    textAlign: 'center',
    marginTop: 16,
  },
});
