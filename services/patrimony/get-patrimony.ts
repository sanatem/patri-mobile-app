import mockUserData from '@/data/mock/mock-data.json';
import type { PatrimonyData } from '@/types/api';

export const patrimonyService = {
  getPatrimonyData(): PatrimonyData {
    return mockUserData.patrimony as PatrimonyData;
  },
  getPatrimonyDataForComponents() {
    const patrimony = mockUserData.patrimony;
    return {
      MY_ASSETS: patrimony.assets.mine,
      PARTNER_ASSETS: patrimony.assets.partner,
      MY_LIABILITIES: patrimony.liabilities.mine,
      PARTNER_LIABILITIES: patrimony.liabilities.partner,
    };
  }
};