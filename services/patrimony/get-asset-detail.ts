import config from '@/config/constants';

export type AssetDetailData =
  | { id: number; name: string; category: string; commercial_value: number; unit: string; kind: string; comments: string; created_at: string; updated_at: string; }
  | { id: number; name: string; type: string; total_amount: number; unit: string; created_at: string; updated_at: string; }
  | { id: number; location: string; commercial_value: number; apartment_number?: number; square_mts: number; number_of_bedrooms?: number; number_of_bathrooms?: number; created_at: string; updated_at: string; kind?: string; };

export type AssetType = 'fixed_asset' | 'saving_instrument' | 'investment_property' | 'main_home';

export interface AssetDetailResponse {
  asset: AssetDetailData;
}

export async function getAssetDetail(token: string, id: number, assetType: AssetType): Promise<AssetDetailData | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/networth/assets/${id}?asset_type=${assetType}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }

      if (response.status === 404) {
        return null;
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const apiResponse: AssetDetailResponse = await response.json();
    return apiResponse.asset;

  } catch (error) {
    console.error('❌ Asset Detail Service: Error fetching asset detail from API:', error);
    throw error;
  }
}
