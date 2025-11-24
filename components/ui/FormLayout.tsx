import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  Button, 
  Container, 
  Card, 
  KeyboardAwareContainer 
} from '@/components/ui';
import Colors from '@/constants/Colors';
import { PatrimoreIcon } from '@/components/icons';
import { useKeyboardHandler } from '@/hooks/common/useKeyboardHandler';
import { useTranslation } from 'react-i18next';

const { height } = Dimensions.get('window');

interface FormLayoutProps {
  title: string;
  subtitle: string;
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onCancel?: () => void;
  nextButtonTitle?: string;
  previousButtonTitle?: string;
  cancelButtonTitle?: string;
  isLoading?: boolean;
  isSaved?: boolean;
  isNextDisabled?: boolean;
  error?: string | null;
  showLogo?: boolean;
  loadingText?: string;
  savedText?: string;
}

export default function FormLayout({
  title,
  subtitle,
  currentStep,
  totalSteps,
  children,
  onNext,
  onPrevious,
  onCancel,
  nextButtonTitle,
  previousButtonTitle,
  cancelButtonTitle,
  isLoading = false,
  isSaved = false,
  isNextDisabled = false,
  error = null,
  showLogo = true,
  loadingText,
  savedText
}: FormLayoutProps) {
  const { t } = useTranslation();
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHandler();

  const _nextTitle = nextButtonTitle ?? t('common.next');
  const _prevTitle = previousButtonTitle ?? t('common.back');
  const _cancelTitle = cancelButtonTitle ?? t('common.cancel');
  const _loadingText = loadingText ?? t('common.saving');
  const _savedText = savedText ?? t('common.saved');

  const renderProgressIndicators = () => {
    return (
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: 16,
        gap: 8
      }}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={{
              width: 20,
              height: 4,
              backgroundColor: currentStep >= index + 1 ? Colors.secondary[500] : Colors.gray[300],
              borderRadius: 2,
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <KeyboardAwareContainer>
      <Container variant="secondaryPage">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={{ flex: 1 }}>
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: height * 0.1 }}>
                {showLogo && (
                  <View style={{ alignItems: 'center', marginBottom: 10 }}>
                    <PatrimoreIcon width={140} height={50} color={Colors.secondary[500]} />
                  </View>
                )}

                <Card style={{ padding: 24, marginBottom: 40 }}>
                  <View style={{ marginBottom: 24 }}>
                    <Text className='font-medium text-2xl'
                      style={{
                        color: Colors.primary[700],
                        textAlign: 'center',
                        marginBottom: 8,
                      }}
                    >
                      {title}
                    </Text>
                    <Text className='text-base font-regular text-center'
                      style={{
                        color: Colors.primary[500],
                        textAlign: 'center',
                      }}
                    >
                      {subtitle}
                    </Text>

                    {totalSteps > 1 && renderProgressIndicators()}
                  </View>

                  <View style={{ gap: 20 }}>
                    {children}
                  </View>

                  {error && (
                    <View style={{
                      backgroundColor: Colors.error[50],
                      borderWidth: 1,
                      borderColor: Colors.error[200],
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 16,
                      marginTop: 16
                    }}>
                      <Text className="text-sm font-medium" style={{ color: Colors.error[700] }}>
                        Error
                      </Text>
                      <Text className="text-sm font-regular" style={{ color: Colors.error[600], marginTop: 4 }}>
                        {error}
                      </Text>
                    </View>
                  )}
                </Card>
              </View>
            </ScrollView>

            <View style={{
              backgroundColor: '#fff',
              paddingHorizontal: 24,
              paddingVertical: 16,
              gap: 10,
            }}>
              {onNext && (
                <Button
                  title={isSaved ? _savedText : (isLoading ? _loadingText : _nextTitle)}
                  onPress={onNext}
                  disabled={isLoading || isNextDisabled || isSaved}
                  loading={isLoading}
                  saved={isSaved}
                  variant="primary"
                  fullWidth
                />
              )}

              {onPrevious && currentStep > 1 && (
                <Button
                  title={_prevTitle}
                  onPress={onPrevious}
                  disabled={isLoading}
                  variant="ghost"
                  fullWidth
                />
              )}

              {onCancel && (
                <Button
                  title={_cancelTitle}
                  onPress={onCancel}
                  disabled={isLoading}
                  variant="ghost"
                  fullWidth
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Container>
    </KeyboardAwareContainer>
  );
} 