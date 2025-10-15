import Purchases, { PurchasesEntitlementInfos, CustomerInfo } from 'react-native-purchases';

const CONSULTING_PRODUCT_ID = 'consulting_hour_120';

interface PurchaseValidationResult {
  hasPurchased: boolean;
  purchaseDate?: Date;
  transactionId?: string;
  canSchedule: boolean;
  reason?: string;
}

export async function validateConsultingPurchase(): Promise<PurchaseValidationResult> {
  try {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    const nonSubscriptionTransactions = customerInfo.nonSubscriptionTransactions || [];

    const consultingPurchase = nonSubscriptionTransactions.find(
      (transaction) => transaction.productIdentifier === CONSULTING_PRODUCT_ID
    );

    if (!consultingPurchase) {
      return {
        hasPurchased: false,
        canSchedule: false,
        reason: 'No se encontró compra de hora de asesoría'
      };
    }

    return {
      hasPurchased: true,
      purchaseDate: new Date(consultingPurchase.purchaseDate),
      transactionId: consultingPurchase.transactionIdentifier,
      canSchedule: true
    };

  } catch (error) {
    console.error('Error validando compra en RevenueCat:', error);
    return {
      hasPurchased: false,
      canSchedule: false,
      reason: 'Error al validar la compra'
    };
  }
}

export async function canScheduleSession(lastScheduledDate?: string): Promise<{
  canSchedule: boolean;
  reason?: string;
  purchaseInfo?: {
    purchaseDate: Date;
    transactionId: string;
  };
}> {
  const purchaseValidation = await validateConsultingPurchase();

  if (!purchaseValidation.hasPurchased) {
    return {
      canSchedule: false,
      reason: 'Necesitas comprar una hora de asesoría primero'
    };
  }

  if (lastScheduledDate) {
    const lastScheduled = new Date(lastScheduledDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (lastScheduled > oneYearAgo) {
      const nextAvailableDate = new Date(lastScheduled);
      nextAvailableDate.setFullYear(nextAvailableDate.getFullYear() + 1);

      return {
        canSchedule: false,
        reason: `Ya agendaste una hora este año. Podrás agendar nuevamente el ${nextAvailableDate.toLocaleDateString()}`
      };
    }
  }

  return {
    canSchedule: true,
    purchaseInfo: {
      purchaseDate: purchaseValidation.purchaseDate!,
      transactionId: purchaseValidation.transactionId!
    }
  };
}
