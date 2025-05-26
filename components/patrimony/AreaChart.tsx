import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useChartRangeStore } from '@/store/chartRangeStore';
import patrimonyData from '@/assets/data/patrimony-daily.json';

const { width: screenWidth } = Dimensions.get('window');

function AreaChart() {
  const { rangeSize } = useChartRangeStore();

  // Filter data based on range
  const filterData = () => {
    const dates = patrimonyData.map((d) => new Date(d.date));
    const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    let filteredData;

    switch (rangeSize) {
      case '1m': {
        const oneMonthAgo = new Date(latestDate);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredData = patrimonyData.filter(
          (d) =>
            new Date(d.date) >= oneMonthAgo && new Date(d.date) <= latestDate
        );
        break;
      }
      case '6m': {
        const sixMonthsAgo = new Date(latestDate);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        filteredData = patrimonyData.filter(
          (d) =>
            new Date(d.date) >= sixMonthsAgo && new Date(d.date) <= latestDate
        );
        break;
      }
      case '1y': {
        const oneYearAgo = new Date(latestDate);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        filteredData = patrimonyData.filter(
          (d) =>
            new Date(d.date) >= oneYearAgo && new Date(d.date) <= latestDate
        );
        break;
      }
      case 'all':
      default:
        filteredData = patrimonyData;
        break;
    }

    return filteredData;
  };

  const data = filterData();

  // Generate the HTML content for the WebView
  const generateHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 16px;
            font-family: system-ui, -apple-system, sans-serif;
            background-color: white;
        }
        #chart {
            width: 100%;
            height: 250px;
            position: relative;
            border: 1px solid #eee;
        }
        .tooltip {
            position: absolute;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 8px 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            z-index: 10;
        }
        .status {
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
        .error { color: red; }
        .loading { color: #666; }
        .success { color: green; }
    </style>
</head>
<body>
    <div id="status" class="status loading">Iniciando...</div>
    <div id="chart"></div>
    
    <script>
        const status = document.getElementById('status');
        const chartDiv = document.getElementById('chart');
        
        function updateStatus(message, type = 'loading') {
            status.textContent = message;
            status.className = 'status ' + type;
            console.log('[STATUS]', message);
        }
        
        function showError(message) {
            updateStatus('Error: ' + message, 'error');
            chartDiv.innerHTML = '';
        }
        
        try {
            updateStatus('Verificando datos...');
            
            const data = ${JSON.stringify(data)};
            console.log('Datos recibidos:', data?.length || 0, 'puntos');
            
            if (!data || data.length === 0) {
                throw new Error('No hay datos disponibles');
            }
            
            updateStatus('Cargando D3.js...');
            
            // Create script element to load D3
            const script = document.createElement('script');
            script.src = 'https://d3js.org/d3.v7.min.js';
            script.onload = function() {
                try {
                    updateStatus('D3.js cargado, creando gráfico...');
                    createChart();
                } catch (error) {
                    showError('Error al crear gráfico: ' + error.message);
                }
            };
            script.onerror = function() {
                showError('No se pudo cargar D3.js');
            };
            document.head.appendChild(script);
            
            function createChart() {
                if (typeof d3 === 'undefined') {
                    throw new Error('D3 no está disponible');
                }
                
                updateStatus('Procesando datos...');
                
                // Convert dates
                data.forEach(d => {
                    d.date = new Date(d.date);
                });
                
                updateStatus('Configurando dimensiones...');
                
                const margin = { top: 40, right: 20, bottom: 20, left: 20 };
                const width = ${screenWidth - 64} - margin.left - margin.right;
                const height = 250 - margin.top - margin.bottom;
                
                console.log('Dimensiones:', width, 'x', height);
                
                if (width <= 0 || height <= 0) {
                    throw new Error('Dimensiones inválidas');
                }
                
                updateStatus('Creando SVG...');
                
                chartDiv.innerHTML = '';
                
                const svg = d3.select('#chart')
                    .append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom);
                
                const g = svg.append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                
                updateStatus('Configurando escalas...');
                
                const xScale = d3.scaleTime()
                    .domain(d3.extent(data, d => d.date))
                    .range([0, width]);
                
                const yScale = d3.scaleLinear()
                    .domain(d3.extent(data, d => d.value))
                    .nice()
                    .range([height, 0]);
                
                updateStatus('Creando gradiente...');
                
                const defs = svg.append('defs');
                const gradient = defs.append('linearGradient')
                    .attr('id', 'areaGradient')
                    .attr('x1', '0%').attr('y1', '0%')
                    .attr('x2', '0%').attr('y2', '100%');
                
                gradient.append('stop')
                    .attr('offset', '0%')
                    .attr('stop-color', '#B9EBD4')
                    .attr('stop-opacity', 0.8);
                
                gradient.append('stop')
                    .attr('offset', '100%')
                    .attr('stop-color', '#B9EBD4')
                    .attr('stop-opacity', 0.1);
                
                updateStatus('Dibujando área...');
                
                const area = d3.area()
                    .x(d => xScale(d.date))
                    .y0(height)
                    .y1(d => yScale(d.value))
                    .curve(d3.curveMonotoneX);
                
                g.append('path')
                    .datum(data)
                    .attr('fill', 'url(#areaGradient)')
                    .attr('d', area);
                
                updateStatus('Dibujando línea...');
                
                const line = d3.line()
                    .x(d => xScale(d.date))
                    .y(d => yScale(d.value))
                    .curve(d3.curveMonotoneX);
                
                g.append('path')
                    .datum(data)
                    .attr('fill', 'none')
                    .attr('stroke', '#00BA62')
                    .attr('stroke-width', 2)
                    .attr('d', line);
                
                updateStatus('Añadiendo interactividad...');
                
                // Tooltip
                const tooltip = d3.select('#chart')
                    .append('div')
                    .attr('class', 'tooltip');
                
                // Hover point
                const hoverPoint = g.append('circle')
                    .attr('r', 5)
                    .attr('fill', '#00BA62')
                    .attr('stroke', 'white')
                    .attr('stroke-width', 2)
                    .style('opacity', 0);
                
                // Overlay for interactions
                g.append('rect')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('fill', 'none')
                    .attr('pointer-events', 'all')
                    .on('mousemove touchmove', function(event) {
                        const [mouseX] = d3.pointer(event);
                        const date = xScale.invert(mouseX);
                        
                        // Find closest data point
                        let closestIndex = 0;
                        let minDistance = Math.abs(data[0].date - date);
                        
                        for (let i = 1; i < data.length; i++) {
                            const distance = Math.abs(data[i].date - date);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestIndex = i;
                            }
                        }
                        
                        const d = data[closestIndex];
                        const pointX = xScale(d.date);
                        const pointY = yScale(d.value);
                        
                        hoverPoint
                            .attr('cx', pointX)
                            .attr('cy', pointY)
                            .style('opacity', 1);
                        
                        const formatter = new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                            minimumFractionDigits: 0
                        });
                        
                        tooltip
                            .style('left', (pointX + margin.left - 80) + 'px')
                            .style('top', (pointY + margin.top - 60) + 'px')
                            .style('opacity', 1)
                            .html(
                                '<div style="font-size: 12px; color: #666;">' + 
                                d.date.toLocaleDateString('es-CL') + 
                                '</div><div style="font-weight: 600;">' + 
                                formatter.format(d.value) + 
                                '</div>'
                            );
                    })
                    .on('mouseleave', function() {
                        hoverPoint.style('opacity', 0);
                        tooltip.style('opacity', 0);
                    });
                
                updateStatus('¡Gráfico completado!', 'success');
                setTimeout(() => {
                    status.style.display = 'none';
                }, 2000);
            }
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message);
        }
    </script>
</body>
</html>
    `;
    return htmlContent;
  };

  return (
    <View style={{ height: 300, marginTop: 16 }}>
      <WebView
        source={{ html: generateHTML() }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        onError={(error) => {
          console.error('WebView error:', error);
        }}
        onConsoleMessage={(event: any) => {
          console.log('WebView console:', event.nativeEvent.message);
        }}
        onLoadEnd={() => {
          console.log('WebView loaded successfully');
        }}
        onLoadStart={() => {
          console.log('WebView loading started');
        }}
        onHttpError={(error) => {
          console.error('WebView HTTP error:', error);
        }}
        renderError={(errorName) => (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <Text style={{ color: 'red', textAlign: 'center' }}>
              Error al cargar el gráfico: {errorName}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

export default AreaChart;
