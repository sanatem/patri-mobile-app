import { useCallback } from 'react';

export const useFormatValue = () => {
  const formatValue = useCallback((value: string) => {
    if (!value) return '';
    
    const clean = value.replace(/[^\d.,]/g, '');
    
    if (!clean) return '';
    
    const number = parseFloat(clean);
    
    if (isNaN(number)) return '';
    
    return `$${Math.floor(number).toLocaleString('es-CL')}`;
  }, []);

  const cleanNumericValue = useCallback((text: string) => {
    return text.replace(/[^\d]/g, '');
  }, []);

  return {
    formatValue,
    cleanNumericValue,
  };
}; 