import Colors from '@/constants/Colors';

const formatDateHelper = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;

    date = new Date(dateString.replace(/-/g, '/'));
    if (!isNaN(date.getTime())) return date;

    const [year, month, day] = dateString.split('-').map(Number);
    if (year && month && day) {
      date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) return date;
    }

    return null;
  } catch {
    return null;
  }
};

export const CHART_CONFIG = {
  height: 180,
  margin: 16,
  lineColor: '#22C55E',
  gradientId: 'chartGradient',
  formatValue: (value: number) => `$${value.toLocaleString('es-CL')}`,
  formatDate: (date: string) => {
    const dateObj = formatDateHelper(date);
    if (!dateObj) return 'Fecha no disponible';
    
    try {
      return dateObj.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][dateObj.getMonth()];
      const year = dateObj.getFullYear();
      return `${day} ${month} ${year}`;
    }
  },
  formatDateLabel: (date: string) => {
    const dateObj = formatDateHelper(date);
    if (!dateObj) return '';
    
    try {
      return dateObj.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][dateObj.getMonth()];
      return `${day} ${month}`;
    }
  },
};

export const CHART_STYLES = {
  defaultCardStyle: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 28,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 10,
    marginHorizontal: 2,
    marginTop: 0,
    marginBottom: 32,
  },
  defaultTooltipStyle: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'flex-start' as const,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    width: '60%',
  },
}; 