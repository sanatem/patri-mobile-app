export interface RutValidationResult {
  isValid: boolean;
  isReal: boolean;
  error?: string;
  formattedRut?: string;
}

export function validateRut(rut: string): RutValidationResult {
  const cleanRut = rut.replace(/[.-]/g, '').toUpperCase();
  
  if (!/^[0-9]+[0-9K]$/.test(cleanRut)) {
    return {
      isValid: false,
      isReal: false,
      error: 'El RUT debe contener solo números y terminar en número o K'
    };
  }

  const formattedRut = formatRut(cleanRut);

  return {
    isValid: true,
    isReal: true,
    formattedRut
  };
}

export function formatRutWhileTyping(value: string): string {
  if (value.trim() === '') {
    return '';
  }
  
  const cleanValue = value.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (cleanValue.length === 0) {
    return '';
  }
  
  if (cleanValue.length > 9) {
    return value.slice(0, -1);
  }
  
  let formattedValue = '';
  
  if (cleanValue.length <= 2) {
    formattedValue = cleanValue;
  } else if (cleanValue.length <= 5) {
    formattedValue = `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
  } else if (cleanValue.length <= 8) {
    formattedValue = `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
  } else {
    formattedValue = `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}-${cleanValue.slice(8)}`;
  }
  
  return formattedValue;
}

function calculateDv(rutNumber: string): string {
  let sum = 0;
  let multiplier = 2;
  
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const dv = 11 - remainder;
  
  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
}

function formatRut(rut: string): string {
  const rutNumber = rut.slice(0, -1);
  const dv = rut.slice(-1);
  
  let formatted = '';
  for (let i = rutNumber.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) {
      formatted = '.' + formatted;
    }
    formatted = rutNumber[i] + formatted;
  }
  
  return `${formatted}-${dv}`;
}

function isRealisticRut(rutNumber: string): boolean {
  const rutInt = parseInt(rutNumber);
  
  const digits = rutNumber.split('');
  
  if (digits.every(digit => digit === digits[0])) {
    return false;
  }
  
  if (rutNumber.includes('123456') || rutNumber.includes('654321')) {
    return false;
  }
  
  if (rutInt >= 1000000 && rutInt <= 99999999) {
    return true;
  }
  
  if (rutInt >= 50000000 && rutInt <= 99999999) {
    return true;
  }
  
  return false;
}

export function cleanRutForBackend(rut: string): string {
  return rut.replace(/[.-]/g, '').toUpperCase();
} 