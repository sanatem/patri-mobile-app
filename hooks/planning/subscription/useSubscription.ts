import { useState, useEffect, useCallback } from 'react';
import { 
  getSubscription, 
  getSubscriptionPayments,
  SubscriptionResponse,
  SubscriptionPaymentsResponse,
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
  allPayments: Payment[];
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

  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [paymentsMeta, setPaymentsMeta] = useState<PaymentsPaginationMeta | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsPerPage, setPaymentsPerPage] = useState(3);
  const FRONTEND_PAGE_SIZE = 3;

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

      const firstResponse = await getSubscriptionPayments(accessToken, {
        page: 1,
        per_page: 15, 
      });

      if (!firstResponse) {
        setAllPayments([]);
        setPaymentsMeta(null);
        return;
      }

      let allPaymentsArray = [...firstResponse.data.payments];
      const totalPages = firstResponse.data.meta.total_pages;

      if (totalPages > 1) {
        const pagePromises: Promise<SubscriptionPaymentsResponse | null>[] = [];
        for (let page = 2; page <= totalPages; page++) {
          pagePromises.push(
            getSubscriptionPayments(accessToken, {
              page,
              per_page: 15,
            })
          );
        }

        const remainingResponses = await Promise.all(pagePromises);
        
        remainingResponses.forEach(response => {
          if (response) {
            allPaymentsArray = [...allPaymentsArray, ...response.data.payments];
          }
        });
      }

      setAllPayments(allPaymentsArray);
      
      setPaymentsMeta({
        current_page: paymentsPage,
        total_pages: Math.ceil(allPaymentsArray.length / FRONTEND_PAGE_SIZE),
        total_count: allPaymentsArray.length,
        per_page: FRONTEND_PAGE_SIZE,
      });
    } catch (err) {
      setPaymentsError(err instanceof Error ? err.message : 'Error desconocido');
      setAllPayments([]);
      setPaymentsMeta(null);
    } finally {
      setPaymentsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [accessToken]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const startIndex = (paymentsPage - 1) * FRONTEND_PAGE_SIZE;
  const endIndex = startIndex + FRONTEND_PAGE_SIZE;
  const paginatedPayments = allPayments.slice(startIndex, endIndex);

  const frontendMeta: PaymentsPaginationMeta | null = allPayments.length > 0 ? {
    current_page: paymentsPage,
    total_pages: Math.ceil(allPayments.length / FRONTEND_PAGE_SIZE),
    total_count: allPayments.length,
    per_page: FRONTEND_PAGE_SIZE,
  } : null;

  return {
    subscriptionData,
    loading,
    error,
    refetch: fetchSubscriptionData,
    payments: paginatedPayments,
    allPayments,
    paymentsMeta: frontendMeta,
    paymentsLoading,
    paymentsError,
    setPaymentsPage,
    setPaymentsPerPage,
    refetchPayments: fetchPayments,
  };
}
