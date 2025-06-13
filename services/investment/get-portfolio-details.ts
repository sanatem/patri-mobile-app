import mockUserData from '../../assets/data/mock-data.json';

export const investmentService = {
  getPortfolioData() {
    return mockUserData.investmentPortfolio.investments;
  },

};