import { useState } from 'react';
import FreePlanIndex from './free-plan';
import PaidPlanIndex from './paid-plan';

export default function PlanningScreen() {
  const [userHasPlan, setUserHasPlan] = useState(true);

  const handlePurchase = () => {
    setUserHasPlan(true);
  };

  if (!userHasPlan) {
    return <FreePlanIndex onPurchase={handlePurchase} />;
  }
  return <PaidPlanIndex />;
}
