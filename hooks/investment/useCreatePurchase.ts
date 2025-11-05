import { useState } from 'react';
import { createPurchaseService, CreatePurchaseRequest, CreatePurchaseResponse } from '@/services/investment/portfolio/movements/create-purchase';
import { useAuth } from '@/providers/AuthProvider';

interface UseCreatePurchaseReturn {
  createPurchase: (purchaseData: CreatePurchaseRequest) => Promise<CreatePurchaseResponse>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

export function useCreatePurchase(): UseCreatePurchaseReturn {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createPurchase = async (purchaseData: CreatePurchaseRequest): Promise<CreatePurchaseResponse> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }

      // Validar datos antes de enviar
      const validationErrors = await createPurchaseService.validatePurchaseData(purchaseData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }
      
      const result = await createPurchaseService.createPurchase(purchaseData, accessToken);
      
      setSuccess(true);
      return result;
      
    } catch (err) {
      console.error('useCreatePurchase: Error creating purchase:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear la compra';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  return {
    createPurchase,
    loading,
    error,
    success,
    reset,
  };
}
