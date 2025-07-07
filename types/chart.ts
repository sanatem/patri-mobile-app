export interface ChartDataPoint {
  x: string;
  y: number; 
}

export interface TooltipData {
  date: string;
  value: string;
  subtitle?: string;
}

export interface InteractiveChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  height?: number;
  margin?: number;
  formatValue?: (value: number) => string;
  formatDate?: (date: string) => string;
  gradientId?: string;
  lineColor?: string;
  showDynamicColors?: boolean;
  showDateLabels?: boolean;
  formatDateLabel?: (date: string) => string;
  cardStyle?: any;
  tooltipStyle?: any;
  onTooltipRender?: (data: TooltipData) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  bottomContent?: React.ReactNode;
}

export interface ChartConfig {
  height: number;
  margin: number;
  lineColor: string;
  gradientId: string;
  formatValue: (value: number) => string;
  formatDate: (date: string) => string;
  formatDateLabel: (date: string) => string;
}

export interface ChartStyles {
  defaultCardStyle: any;
  defaultTooltipStyle: any;
} 