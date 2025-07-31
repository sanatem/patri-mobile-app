import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator 
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
  isNextDisabled?: boolean;
  error?: string | null;
  showLogo?: boolean;
  loadingText?: string;
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
  nextButtonTitle = "Siguiente",
  previousButtonTitle = "Atrás",
  cancelButtonTitle = "Cancelar",
  isLoading = false,
  isNextDisabled = false,
  error = null,
  showLogo = true,
  loadingText = "Guardando..."
}: FormLayoutProps) {
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHandler();

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
        <ScrollView
          style={{
            flex: 1,
            paddingBottom: isKeyboardVisible ? keyboardHeight + 20 : 0
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: height * 0.1 }}>
            {showLogo && (
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                <PatrimoreIcon width={160} height={80} color={Colors.secondary[500]} />
              </View>
            )}

            <Card style={{ padding: 24 }}>
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
                  marginBottom: 16
                }}>
                  <Text className="text-sm font-medium" style={{ color: Colors.error[700] }}>
                    Error
                  </Text>
                  <Text className="text-sm font-regular" style={{ color: Colors.error[600], marginTop: 4 }}>
                    {error}
                  </Text>
                </View>
              )}

              <View style={{ marginTop: 32, gap: 12 }}>
                {onCancel && (
                  <Button
                    title={cancelButtonTitle}
                    onPress={onCancel}
                    disabled={isLoading}
                    variant="outline"
                    fullWidth
                  />
                )}
                
                {onPrevious && currentStep > 1 && (
                  <Button
                    title={previousButtonTitle}
                    onPress={onPrevious}
                    disabled={isLoading}
                    variant="outline"
                    fullWidth
                  />
                )}
                
                {onNext && (
                  <Button
                    title={isLoading ? loadingText : nextButtonTitle}
                    onPress={onNext}
                    disabled={isLoading || isNextDisabled}
                    loading={isLoading}
                    variant="primary"
                    fullWidth
                  />
                )}
              </View>
            </Card>
          </View>
        </ScrollView>
      </Container>
    </KeyboardAwareContainer>
  );
} 