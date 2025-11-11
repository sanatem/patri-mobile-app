import { Platform } from 'react-native';

interface IdAnalyzerConfig {
  apiKey: string;
  region?: 'US' | 'EU' | 'AS';
}

interface IdAnalyzerResponse {
  success: boolean;
  result: {
    documentType: string;
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: string;
    birthdate: string;
    nationality: string;
    documentNumber: string;
    expiryDate: string;
    issueDate: string;
    confidence: number;
    authenticity: {
      score: number;
      decision: 'accept' | 'review' | 'reject';
      tampered: boolean;
    };
  };
  error?: string;
}

interface ExtractedPersonalData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  birthdate: string;
  nationality: string;
  documentNumber: string;
}

interface IValidator {
  verifyDocument(frontImage: string, backImage?: string): Promise<IdAnalyzerResponse>;
}

class RealValidator implements IValidator {
  private config: IdAnalyzerConfig;
  private baseUrl: string;

  constructor(config: IdAnalyzerConfig) {
    this.config = config;
    this.baseUrl = this.getBaseUrl(config.region || 'US');
  }

  private getBaseUrl(region: string): string {
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3001/api/id-analyzer';
    }
    
    switch (region) {
      case 'US':
        return 'https://api.idanalyzer.com';
      case 'EU':
        return 'https://api-eu.idanalyzer.com';
      case 'AS':
        return 'https://api-as.idanalyzer.com';
      default:
        return 'https://api.idanalyzer.com';
    }
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      if (imageUri.startsWith('data:')) {
        return imageUri.split(',')[1];
      }

      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  async verifyDocument(frontImage: string, backImage?: string): Promise<IdAnalyzerResponse> {
    try {
      const frontBase64 = await this.convertImageToBase64(frontImage);
      let backBase64: string | undefined;
      
      if (backImage) {
        backBase64 = await this.convertImageToBase64(backImage);
      }

      const payload = {
        document: frontBase64,
        documentback: backBase64,
        dualsidecheck: true,
        verify_expiry: true,
        return_confidence: true,
        accuracy: 2,
        authenticate: true,
        ocr: true,
        aml: false,
        biometric: false,
        // Configuración adicional para mejorar la detección de documentos chilenos nuevos
        region: 'CL', // Especificar región Chile
        type: 'DI', // Driver License / Identity Document
      };

      const response = await fetch(`${this.baseUrl}/scan`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 0 || response.statusText === 'Failed to fetch') {
          throw new Error('CORS Error: No se puede conectar a la API. Verifica que tu localhost esté configurado en el dashboard de ID Analyzer.');
        }
        
        if (response.status === 403) {
          throw new Error('API Key Error: Verifica tu API key de ID Analyzer.');
        }
        
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        throw new Error('Non-JSON response');
      }

      const result = await response.json();

      const transformedResult: IdAnalyzerResponse = {
        success: result.success || false,
        result: {
          documentType: result.result?.documentType || '',
          firstName: result.result?.firstName || '',
          lastName: result.result?.lastName || '',
          fullName: result.result?.fullName || `${result.result?.firstName || ''} ${result.result?.lastName || ''}`.trim(),
          dateOfBirth: result.result?.dob || '',
          birthdate: result.result?.birthdate || result.result?.dob || '',
          nationality: result.result?.nationality || '',
          documentNumber: result.result?.documentNumber || '',
          expiryDate: result.result?.expiry || '',
          issueDate: result.result?.issueDate || '',
          confidence: result.result?.confidence || 0,
          authenticity: {
            score: result.authentication?.score || 0,
            decision: result.decision || 'review',
            tampered: result.authentication?.tampered || false,
          },
        },
        error: result.error,
      };

      return transformedResult;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('CORS Error: No se puede conectar a la API de ID Analyzer. Verifica que tu localhost esté configurado en el dashboard.');
      }
      
      throw error;
    }
  }
}

class FakeValidator implements IValidator {
  async verifyDocument(frontImage: string, backImage?: string): Promise<IdAnalyzerResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      result: {
        documentType: 'Cedula de Identidad',
        firstName: 'Walter',
        lastName: 'White',
        fullName: 'Walter White',
        dateOfBirth: '1965-05-15',
        birthdate: '1965-05-15',
        nationality: 'Chilean',
        documentNumber: '12.345.678-9',
        expiryDate: '2030-12-31',
        issueDate: '2020-01-15',
        confidence: 95,
        authenticity: {
          score: 98,
          decision: 'accept',
          tampered: false,
        },
      },
    };
  }
}

class IdAnalyzerVerifier {
  private validator: IValidator;
  private forceRealValidator: boolean = false;

  constructor(config: IdAnalyzerConfig, forceReal: boolean = false) {
    this.forceRealValidator = forceReal;
    
    const shouldUseRealValidator = 
      this.forceRealValidator ||
      (process.env.NODE_ENV !== 'development' && 
       config.apiKey && 
       config.apiKey !== 'YOUR_API_KEY_HERE');

    this.validator = shouldUseRealValidator 
      ? new RealValidator(config)
      : new FakeValidator();
  }

  async verifyDocument(frontImage: string, backImage?: string): Promise<IdAnalyzerResponse> {
    try {
      const result = await this.validator.verifyDocument(frontImage, backImage);
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        const fakeValidator = new FakeValidator();
        return await fakeValidator.verifyDocument(frontImage, backImage);
      }
      
      throw error;
    }
  }

  extractPersonalData(response: IdAnalyzerResponse): ExtractedPersonalData | null {
    if (!response.success || !response.result) {
      return null;
    }

    const { result } = response;
    
    return {
      firstName: result.firstName,
      lastName: result.lastName,
      dateOfBirth: result.dateOfBirth,
      birthdate: result.birthdate || result.dateOfBirth,
      nationality: result.nationality,
      documentNumber: result.documentNumber,
    };
  }
}

const getIdAnalyzerConfig = (): IdAnalyzerConfig => ({
  apiKey: process.env.EXPO_PUBLIC_ID_ANALYZER_API_KEY || '',
  region: process.env.EXPO_PUBLIC_ID_ANALYZER_REGION as 'US',
});

let currentIdAnalyzer: IdAnalyzerVerifier | null = null;

const initializeIdAnalyzer = () => {
  if (currentIdAnalyzer) return currentIdAnalyzer;
  
  const config = getIdAnalyzerConfig();
  
  if (process.env.EXPO_PUBLIC_ID_ANALYZER_API_KEY && 
      process.env.EXPO_PUBLIC_ID_ANALYZER_API_KEY !== 'YOUR_API_KEY_HERE') {
    currentIdAnalyzer = new IdAnalyzerVerifier(config, true);
  } else {
    currentIdAnalyzer = new IdAnalyzerVerifier(config, false);
  }
  
  return currentIdAnalyzer;
};

export function configureIdAnalyzer(apiKey: string, region: 'US' | 'EU' | 'AS' = 'US') {
  const config: IdAnalyzerConfig = { apiKey, region };
  
  currentIdAnalyzer = new IdAnalyzerVerifier(config, true);
  
  return currentIdAnalyzer;
}

export function resetIdAnalyzerToDevelopment() {
  const config = getIdAnalyzerConfig();
  currentIdAnalyzer = new IdAnalyzerVerifier(config, false);
  return currentIdAnalyzer;
}

export const idAnalyzer = {
  verifyDocument: (frontImage: string, backImage?: string) => {
    const analyzer = initializeIdAnalyzer();
    return analyzer.verifyDocument(frontImage, backImage);
  },
  extractPersonalData: (response: IdAnalyzerResponse) => {
    const analyzer = initializeIdAnalyzer();
    return analyzer.extractPersonalData(response);
  }
};
export type { IdAnalyzerResponse, ExtractedPersonalData };