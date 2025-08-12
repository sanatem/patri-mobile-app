import config from '@/config/constants';
import type { ApiPropertiesResponse } from '@/types/api';

interface GetPropertiesParams {
  page?: number;
  per_page?: number;
  property_type?: 'main_home' | 'investment';
  kind?: 'own' | 'rent';
}

export async function getProperties(token: string, params: GetPropertiesParams = {}): Promise<ApiPropertiesResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const queryParams = new URLSearchParams();
    
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }
    
    if (params.property_type) {
      queryParams.append('property_type', params.property_type);
    }
    
    if (params.kind) {
      queryParams.append('kind', params.kind);
    }

    const url = `${config.apiBaseUrl}/api/v2/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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

    const raw: any = await response.json();

    if (raw && Array.isArray(raw.properties)) {
      return raw as ApiPropertiesResponse;
    }

    if (raw && raw.success === true && raw.data) {
      const mainHomes: any[] = Array.isArray(raw.data.main_homes) ? raw.data.main_homes : [];
      const investmentProps: any[] = Array.isArray(raw.data.investment_properties) ? raw.data.investment_properties : [];

      const normalized = [
        ...mainHomes.map((item) => {
          const kindRaw = item.kind as string | undefined;
          const kind: 'own' | 'rent' = kindRaw === 'leased' ? 'rent' : 'own';
          const square_mts = typeof item.square_mts === 'number' ? item.square_mts : 0;
          const apartment_number = typeof item.apartment_number === 'number' ? item.apartment_number : undefined;
          const number_of_bedrooms = typeof item.number_of_bedrooms === 'number' ? item.number_of_bedrooms : undefined;
          const number_of_bathrooms = typeof item.number_of_bathrooms === 'number' ? item.number_of_bathrooms : undefined;

          return {
            id: item.id,
            property_type: 'main_home' as const,
            kind,
            location: item.location,
            commercial_value: Number(item.commercial_value) || 0,
            square_mts,
            apartment_number,
            number_of_bedrooms,
            number_of_bathrooms,
            created_at: item.created_at,
            updated_at: item.updated_at,
          };
        }),
        ...investmentProps.map((item) => {
          const square_mts = typeof item.square_mts === 'number' ? item.square_mts : 0;
          const apartment_number = typeof item.apartment_number === 'number' ? item.apartment_number : undefined;
          const number_of_bedrooms = typeof item.number_of_bedrooms === 'number' ? item.number_of_bedrooms : undefined;
          const number_of_bathrooms = typeof item.number_of_bathrooms === 'number' ? item.number_of_bathrooms : undefined;

          return {
            id: item.id,
            property_type: 'investment' as const,
            kind: 'own' as const,
            location: item.location,
            commercial_value: Number(item.commercial_value) || 0,
            square_mts,
            apartment_number,
            number_of_bedrooms,
            number_of_bathrooms,
            created_at: item.created_at,
            updated_at: item.updated_at,
          };
        }),
      ];

      const responseAdapted: ApiPropertiesResponse = {
        properties: normalized,
        totals: {
          total_properties: normalized.length,
          main_homes_total: mainHomes.length,
          investment_properties_total: investmentProps.length,
        },
        pagination: {
          current_page: params.page ?? 1,
          per_page: params.per_page ?? normalized.length,
          total_count: normalized.length,
          total_pages: 1,
          has_next_page: false,
          has_prev_page: false,
        },
      };

      return responseAdapted;
    }

    throw new Error('Formato de respuesta de propiedades no reconocido');

  } catch (error) {
    console.error('❌ Properties Service: Error fetching properties from API:', error);
    throw error;
  }
}