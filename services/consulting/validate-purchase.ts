import Purchases, { PurchasesEntitlementInfos, CustomerInfo } from 'react-native-purchases';

const CONSULTING_PRODUCT_ID = 'consulting_hour_120';
const LAST_SCHEDULED_DATE_ATTRIBUTE = 'consulting_last_scheduled_date';

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

export async function canPurchaseConsultingHour(): Promise<{
  canPurchase: boolean;
  reason?: string;
  lastPurchaseDate?: Date;
}> {
  try {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    const nonSubscriptionTransactions = customerInfo.nonSubscriptionTransactions || [];

    const consultingPurchase = nonSubscriptionTransactions.find(
      (transaction) => transaction.productIdentifier === CONSULTING_PRODUCT_ID
    );

    if (!consultingPurchase) {
      return {
        canPurchase: true
      };
    }

    const lastPurchaseDate = new Date(consultingPurchase.purchaseDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (lastPurchaseDate > oneYearAgo) {
      const nextAvailableDate = new Date(lastPurchaseDate);
      nextAvailableDate.setFullYear(nextAvailableDate.getFullYear() + 1);

      return {
        canPurchase: false,
        reason: `Ya compraste una hora este año. Podrás comprar otra el ${nextAvailableDate.toLocaleDateString()}`,
        lastPurchaseDate
      };
    }

    return {
      canPurchase: true,
      lastPurchaseDate
    };

  } catch (error) {
    return {
      canPurchase: true
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

  const lastPurchaseDate = purchaseValidation.purchaseDate!;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (lastPurchaseDate > oneYearAgo) {
    if (lastScheduledDate) {
      const lastScheduled = new Date(lastScheduledDate);

      if (lastScheduled >= lastPurchaseDate) {
        const nextAvailableDate = new Date(lastPurchaseDate);
        nextAvailableDate.setFullYear(nextAvailableDate.getFullYear() + 1);

        return {
          canSchedule: false,
          reason: `Ya agendaste tu hora este año. Podrás comprar otra el ${nextAvailableDate.toLocaleDateString()}`
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

  return {
    canSchedule: true,
    purchaseInfo: {
      purchaseDate: purchaseValidation.purchaseDate!,
      transactionId: purchaseValidation.transactionId!
    }
  };
}
