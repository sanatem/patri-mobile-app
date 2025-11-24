import { useState } from 'react';
import { idAnalyzer, configureIdAnalyzer, resetIdAnalyzerToDevelopment, type IdAnalyzerResponse, type ExtractedPersonalData } from '@/services/id-analyzer';

interface UseIdVerificationReturn {
  isVerifying: boolean;
  verificationResult: IdAnalyzerResponse | null;
  extractedData: ExtractedPersonalData | null;
  error: string | null;
  isUsingMockData: boolean;
  verifyDocument: (frontImage: string, backImage?: string) => Promise<void>;
  reset: () => void;
  configureApi: (apiKey: string) => Promise<void>;
  resetToMock: () => Promise<void>;
}

export function useIdVerification(): UseIdVerificationReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<IdAnalyzerResponse | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedPersonalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [currentAnalyzer, setCurrentAnalyzer] = useState(idAnalyzer);

  const configureApi = async (apiKey: string) => {
    try {
      const newAnalyzer = configureIdAnalyzer(apiKey);
      setCurrentAnalyzer(newAnalyzer);
    } catch (error) {
      throw error;
    }
  };

  const resetToMock = async () => {
    try {
      const newAnalyzer = resetIdAnalyzerToDevelopment();
      setCurrentAnalyzer(newAnalyzer);
    } catch (error) {
      throw error;
    }
  };

  const verifyDocument = async (frontImage: string, backImage?: string) => {
    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);
    setExtractedData(null);
    setIsUsingMockData(false);

    try {
      const result = await currentAnalyzer.verifyDocument(frontImage, backImage);
      setVerificationResult(result);

      const isMock = result.result?.firstName === 'Juan Carlos' &&
                    result.result?.lastName === 'Pérez González' &&
                    result.result?.documentNumber === '12.345.678-9';

      setIsUsingMockData(isMock);

      if (result.success) {
        const personalData = currentAnalyzer.extractPersonalData(result);
        const decision = result.result.authenticity.decision;

        if (decision === 'reject') {
          setError('El documento no pasó la verificación de autenticidad. Por favor, intenta con otro documento.');
        } else {
          setExtractedData(personalData);
        }
      } else {
        const errorMsg = result.error || 'No se pudo verificar el documento';
        setError(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';

      if (errorMessage.includes('Timeout')) {
        setError('La verificación tardó demasiado. Por favor intenta de nuevo.');
      } else if (errorMessage.includes('API Key')) {
        setError(errorMessage);
      } else if (errorMessage.includes('non-JSON') || errorMessage.includes('Non-JSON')) {
        setError('Error del servidor: Respuesta inválida. Por favor, intenta nuevamente.');
      } else if (errorMessage.includes('network') || errorMessage.includes('conexión')) {
        setError('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        setError('Error de autenticación con ID Analyzer. Contacta soporte.');
      } else {
        setError(`Error al verificar: ${errorMessage}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setIsVerifying(false);
    setVerificationResult(null);
    setExtractedData(null);
    setError(null);
    setIsUsingMockData(false);
  };

  return {
    isVerifying,
    verificationResult,
    extractedData,
    error,
    isUsingMockData,
    verifyDocument,
    reset,
    configureApi,
    resetToMock,
  };
}