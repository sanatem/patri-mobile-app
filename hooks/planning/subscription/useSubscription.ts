import { useState, useEffect, useCallback } from 'react';
import { 
  getSubscription, 
  getSubscriptionPayments,
  SubscriptionResponse,
  Payment,
  PaymentsPaginationMeta
} from '@/services/planning/subscription/get-subscription';
import { useAuth } from '@/providers/AuthProvider';

interface UseSubscriptionReturn {
  subscriptionData: SubscriptionResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  payments: Payment[];
  paymentsMeta: PaymentsPaginationMeta | null;
  paymentsLoading: boolean;
  paymentsError: string | null;
  setPaymentsPage: (page: number) => void;
  setPaymentsPerPage: (perPage: number) => void;
  refetchPayments: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { accessToken } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsMeta, setPaymentsMeta] = useState<PaymentsPaginationMeta | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsPerPage, setPaymentsPerPage] = useState(3);

  const fetchSubscriptionData = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getSubscription(accessToken);
      setSubscriptionData(data);
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = useCallback(async () => {
    if (!accessToken) {
      setPaymentsLoading(false);
      return;
    }

    try {
      setPaymentsLoading(true);
      setPaymentsError(null);

      const response = await getSubscriptionPayments(accessToken, {
        page: paymentsPage,
        per_page: paymentsPerPage,
      });

      if (response) {
        console.log('✅ Payments received in hook:', response.data.payments);
        console.log('✅ Payments meta:', response.data.meta);
        setPayments(response.data.payments);
        setPaymentsMeta(response.data.meta);
      } else {
        console.log('⚠️ No payment response');
        setPayments([]);
        setPaymentsMeta(null);
      }
    } catch (err) {
      console.error('Error fetching subscription payments:', err);
      setPaymentsError(err instanceof Error ? err.message : 'Error desconocido');
      setPayments([]);
      setPaymentsMeta(null);
    } finally {
      setPaymentsLoading(false);
    }
  }, [accessToken, paymentsPage, paymentsPerPage]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [accessToken]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    subscriptionData,
    loading,
    error,
    refetch: fetchSubscriptionData,
    payments,
    paymentsMeta,
    paymentsLoading,
    paymentsError,
    setPaymentsPage,
    setPaymentsPerPage,
    refetchPayments: fetchPayments,
  };
}
