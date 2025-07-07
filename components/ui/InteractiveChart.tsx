import { View, Text } from 'react-native';
import { InteractiveChartProps, TooltipData } from '@/types/chart';
import { CHART_CONFIG, CHART_STYLES } from '@/constants/ChartConfig';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { useChartScales } from '@/hooks/useChartScales';
import { useChartPaths } from '@/hooks/useChartPaths';
import { useChartInteraction } from '@/hooks/useChartInteraction';
import { ChartSvg } from '@/components/ui/chart/ChartSvg';
import { ChartTooltip } from '@/components/ui/chart/ChartTooltip';
import { ChartDateLabels } from '@/components/ui/chart/ChartDateLabels';
import Colors from '@/constants/Colors';

export function InteractiveChart({
  data = [],
  loading = false,
  error = null,
  title,
  height = CHART_CONFIG.height,
  margin = CHART_CONFIG.margin,
  formatValue = CHART_CONFIG.formatValue,
  formatDate = CHART_CONFIG.formatDate,
  gradientId = CHART_CONFIG.gradientId,
  lineColor = CHART_CONFIG.lineColor,
  showDynamicColors = false,
  showDateLabels = false,
  formatDateLabel = CHART_CONFIG.formatDateLabel,
  cardStyle,
  tooltipStyle,
  onTooltipRender,
  loadingComponent,
  errorComponent,
  bottomContent
}: InteractiveChartProps) {
  
  const { chartWidth } = useChartDimensions(margin);
  const { x, y, values } = useChartScales(data, chartWidth, height);
  const { activeIndex, isDragging, panResponder } = useChartInteraction(data, chartWidth);
  const { area, greenLine, grayLine, normalLine } = useChartPaths(
    data, x, y, values, activeIndex, showDynamicColors
  );

  const activeData = data[activeIndex] || data[0] || { x: '', y: 0 };
  const cx = data.length > 0 ? x(activeIndex) : 0;
  const cy = data.length > 0 ? y(activeData.y) : 0;

  if (loading && loadingComponent) {
    return (
      <View style={[CHART_STYLES.defaultCardStyle, cardStyle]}>
        {title && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Poppins-SemiBold',
              color: Colors.gray[700],
              marginBottom: 4,
              paddingHorizontal: 16,
            }}>
              {title}
            </Text>
          </View>
        )}
        {loadingComponent}
      </View>
    );
  }

  if (error && errorComponent) {
    return (
      <View style={[CHART_STYLES.defaultCardStyle, cardStyle]}>
        {title && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Poppins-SemiBold',
              color: Colors.gray[700],
              marginBottom: 4,
              paddingHorizontal: 16,
            }}>
              {title}
            </Text>
          </View>
        )}
        {errorComponent}
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[CHART_STYLES.defaultCardStyle, cardStyle]}>
        {title && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Poppins-SemiBold',
              color: Colors.gray[700],
              marginBottom: 4,
              paddingHorizontal: 16,
            }}>
              {title}
            </Text>
          </View>
        )}
        <Text style={{
          fontSize: 14,
          fontFamily: 'Poppins-Regular',
          color: Colors.gray[500],
          paddingHorizontal: 16,
        }}>
          No hay datos disponibles
        </Text>
      </View>
    );
  }

  const tooltipData: TooltipData = {
    date: formatDate(activeData.x),
    value: formatValue(activeData.y),
  };

  return (
    <View style={[CHART_STYLES.defaultCardStyle, cardStyle]}>
      {title && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{
            fontSize: 18,
            fontFamily: 'Poppins-SemiBold',
            color: Colors.gray[700],
            marginBottom: 4,
            paddingHorizontal: 16,
          }}>
            {title}
          </Text>
        </View>
      )}
      
      <ChartTooltip
        tooltipData={tooltipData}
        onTooltipRender={onTooltipRender}
        tooltipStyle={tooltipStyle}
        defaultTooltipStyle={CHART_STYLES.defaultTooltipStyle}
      />

      <ChartSvg
        chartWidth={chartWidth}
        height={height}
        margin={margin}
        gradientId={gradientId}
        lineColor={lineColor}
        area={area}
        greenLine={greenLine}
        grayLine={grayLine}
        normalLine={normalLine}
        showDynamicColors={showDynamicColors}
        cx={cx}
        cy={cy}
        isDragging={isDragging}
        panResponder={panResponder}
      />

      <ChartDateLabels
        showDateLabels={showDateLabels}
        data={data}
        formatDateLabel={formatDateLabel}
        margin={margin}
      />

      {bottomContent && (
        <View style={{ marginTop: 20, padding: 16 }}>
          {bottomContent}
        </View>
      )}
    </View>
  );
} 