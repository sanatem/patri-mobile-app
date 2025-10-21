import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Header, Container } from '@/components/ui';
import { useAuth0 } from 'react-native-auth0';
import { useConsultingHours } from '@/hooks/consulting/useConsultingHours';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { canScheduleSession } from '@/services/consulting/validate-purchase';
import Colors from '@/constants/Colors';

export default function ScheduleMeeting() {
  const { t } = useTranslation();
  const { user } = useAuth0();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const { scheduleSession, lastScheduledDate, availableHours, canScheduleThisYear } = useConsultingHours();
  const [loading, setLoading] = useState(true);
  const [canProceed, setCanProceed] = useState(false);

  const ZOHO_SERVICE_ID = '3991565000012163274';

  const zohoWidgetUrl = `https://patrimore.zohobookings.com/portal-embed#/${ZOHO_SERVICE_ID}?name=${encodeURIComponent(user?.name || '')}&email=${encodeURIComponent(user?.email || '')}`;

  useEffect(() => {
    const validateAccess = async () => {
      try {
        if (__DEV__ && availableHours > 0) {
          if (!canScheduleThisYear) {
            Alert.alert(
              t('planning.consulting.schedule.error.title'),
              t('planning.consulting.schedule.error.alreadyScheduled'),
              [
                {
                  text: 'OK',
                  onPress: () => router.back()
                }
              ]
            );
            setCanProceed(false);
          } else {
            setCanProceed(true);
          }
          return;
        }

        const validation = await canScheduleSession(lastScheduledDate);

        if (!validation.canSchedule) {
          Alert.alert(
            t('planning.consulting.schedule.error.title'),
            validation.reason || t('planning.consulting.schedule.error.unknown'),
            [
              {
                text: 'OK',
                onPress: () => router.back()
              }
            ]
          );
          setCanProceed(false);
        } else {
          setCanProceed(true);
        }
      } catch (error) {
        Alert.alert(
          t('common.error'),
          t('planning.consulting.schedule.error.validation'),
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
        setCanProceed(false);
      }
    };

    validateAccess();
  }, [lastScheduledDate, availableHours, canScheduleThisYear]);

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'booking_success') {
        await scheduleSession({
          bookingId: data.booking_id,
          scheduledDate: data.scheduled_date || new Date().toISOString(),
          advisorName: data.staff_name || 'Asesor Patrimore',
        });

        Alert.alert(
          t('planning.consulting.schedule.success.title'),
          t('planning.consulting.schedule.success.message'),
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(tabs)/planning');
              },
            },
          ]
        );
      }
    } catch (error) {
    }
  };

  const handleError = (syntheticEvent: any) => {
    Alert.alert(
      t('common.error'),
      t('planning.consulting.schedule.error.widget'),
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  return (
    <Container variant="secondaryPage">
      <Header
        title={t('planning.consulting.schedule.title')}
        subtitle={t('planning.consulting.schedule.subtitle')}
        showBackButton
        variant="transparent"
        titleClassName="text-white font-medium text-center"
        subtitleClassName="text-white text-center font-regular"
        backButtonColor={Colors.primary[600]}
      />

      <View style={styles.container}>
        {(!canProceed || loading) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          </View>
        )}

        {canProceed && (
          <WebView
            ref={webViewRef}
            source={{ uri: zohoWidgetUrl }}
            style={styles.webview}
            onMessage={handleMessage}
            onError={handleError}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
          />
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 999,
  },
});
