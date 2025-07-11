import Colors from '@/constants/Colors';

export const CHART_CONFIG = {
  height: 180,
  margin: 16,
  lineColor: '#22C55E',
  gradientId: 'chartGradient',
  formatValue: (value: number) => `$${value.toLocaleString('es-CL')}`,
  formatDate: (date: string) => {
    if (!date) return '';
    const safeDate = date.replace(/-/g, '/');
    const dateObj = new Date(safeDate);
    if (isNaN(dateObj.getTime())) return 'Fecha no disponible';
    return dateObj.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },
  formatDateLabel: (date: string) => {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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