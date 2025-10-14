import config from '@/config/constants';

const ACCOUNT_TYPE_MAPPING: Record<string, string> = {
  checking: 'Cuenta Corriente',
  savings: 'Cuenta de Ahorro',
  vista: 'Cuenta Vista',
  electronic_checkbook: 'Chequera Electrónica'
};

const BANK_NAME_MAPPING: Record<string, string> = {
  '2': 'Bice',
  '3': 'Chile-Edwards',
  '4': 'Banco de Crédito e Inversiones (BCI)',
  '5': 'Banco del Desarrollo',
  '6': 'Falabella',
  '7': 'Internacional',
  '9': 'Penta',
  '10': 'Santander',
  '11': 'Banco Security',
  '12': 'Banco Estado',
  '13': 'BBVA',
  '14': 'Citibank N.A. Chile',
  '15': 'Itau-Corpbanca',
  '16': 'Scotiabank',
  '17': 'Credichile',
  '18': 'Credit Suisse',
  '19': 'Deutsche Bank',
  '20': 'ING Bank',
  '21': 'Ripley',
  '22': 'Banco de Santiago',
  '23': 'TBanc',
  '24': 'Consorcio',
  '25': 'Copeuch',
  '26': 'Prepago Los Héroes',
  '27': 'Tenpo Prepago',
  '28': 'Mercado Pago',
  '29': 'TAPP Caja Los Andes'
};

export interface BankAccount {
  id: string;
  label: string;
  value: string;
  bank_id: number;
  bank_name: string;
  account_number: string;
  account_type: string;
  kind: string; // Valor original del tipo de cuenta
  is_default?: boolean;
}

export interface GetBankAccountResponse {
  accounts: BankAccount[];
  success: boolean;
  message?: string;
}

export async function getBankAccounts(token: string): Promise<GetBankAccountResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/bank_accounts`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });


    if (response.ok) {
      const data = await response.json();

      const accounts: BankAccount[] = (data.bank_accounts || []).map((account: any) => {
        const bankName = BANK_NAME_MAPPING[account.bank_id.toString()] || account.bank_name;
        const accountType = account.kind_name || ACCOUNT_TYPE_MAPPING[account.kind] || account.kind;

        return {
          id: account.id.toString(),
          label: `${bankName} - ****${account.account_number.slice(-4)} (${accountType})`,
          value: account.id.toString(),
          bank_id: account.bank_id,
          bank_name: bankName,
          account_number: account.account_number,
          account_type: accountType,
          kind: account.kind, // Valor original para el formulario
          is_default: account.is_default || false,
        };
      }); 

      return {
        accounts,
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 404) {
      return {
        accounts: [],
        success: true,
        message: 'No bank accounts found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error fetching bank accounts:', error);

    return {
      accounts: [],
      success: false,
      message: 'Error fetching bank accounts',
    };
  }
}