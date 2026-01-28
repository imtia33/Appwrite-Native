import React, { useCallback, useMemo, useState, useRef,useEffect } from 'react';
import { View, Text, PanResponder, Animated as RNAnimated, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../lib/theme-context';

// Helper to detect desktop (web) and mouse support
const isWeb = Platform.OS === 'web';

const SmoothLineChart = ({
  data = [],
  width: propWidth,
  height: propHeight = 120,
  totalValue,
  Title = 'Analytics',
  unit = '',
  formatter = (val) => val?.toLocaleString() ?? '0',
  allowNegative = false
}) => {
  const { isDark } = useTheme();

  // Normalize data to an array of series
  const normalizedSeries = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Check if it's a single series (array of points) or multiple series (array of objects)
    if (data[0] && data[0].points) {
        return data;
    }
    
    // Single series format
    return [{
        label: Title,
        points: data,
        color: '#FD366E'
    }];
  }, [data, Title]);

  // Theme colors
  const colors = {
    background: 'transparent',
    card: 'transparent',
    text: isDark ? '#fff' : '#18181b',
    textSecondary: isDark ? '#999' : '#71717a',
    axis: isDark ? '#52525b' : '#a1a1aa',
    grid: isDark ? '#27272a' : '#e4e4e7',
    gridLine: isDark ? '#27272a' : '#f4f4f5',
    gridLineOpacity: 0.8,
    baseline: isDark ? '#3f3f46' : '#e4e4e7',
    indicator: '#FD366E', 
    indicatorBorder: isDark ? '#09090b' : '#fff',
    lineDefault: '#FD366E',
    total: isDark ? '#fff' : '#09090b',
  };

  const [selectedX, setSelectedX] = useState(null);
  const [showIndicator, setShowIndicator] = useState(false);

  const indicatorX = useRef(new RNAnimated.Value(-100)).current;
  
  const [containerSize, setContainerSize] = useState({ width: propWidth || 0, height: propHeight || 0 });

  const paddingRight = 10;
  const paddingLeft = 30;
  const paddingTop = 10;
  const paddingBottom = 10;

  const chartWidth = Math.max(0, (containerSize.width || 0) - (paddingLeft + paddingRight));
  const chartHeight = propHeight;

  // Calculate global Y range across all series
  const { minY, maxY, rawMinY, rawMaxY } = useMemo(() => {
    if (normalizedSeries.length === 0) return { minY: 0, maxY: 0, rawMinY: 0, rawMaxY: 0 };
     
    let allY = [];
    normalizedSeries.forEach(s => {
        s.points.forEach(p => allY.push(p.y));
    });

    if (allY.length === 0) return { minY: 0, maxY: 0, rawMinY: 0, rawMaxY: 0 };

    const rawMinY = Math.min(...allY);
    const rawMaxY = Math.max(...allY);
    const yRange = rawMaxY - rawMinY;
    const yPadding = yRange === 0 ? 10 : yRange * 0.15;

    const minY = allowNegative ? (rawMinY - yPadding) : Math.max(0, rawMinY - yPadding);
    const maxY = rawMaxY + yPadding;

    return { minY, maxY, rawMinY, rawMaxY };
  }, [normalizedSeries, allowNegative]);

  const yRange = maxY - minY;

  // Generate paths for each series
  const seriesPaths = useMemo(() => {
    if (chartWidth <= 0 || chartHeight <= 0 || yRange === 0) return [];

    return normalizedSeries.map(series => {
        const points = series.points;
        const scaledPoints = points.map((p, i) => ({
            x: (i / (points.length - 1)) * chartWidth + paddingLeft,
            y: chartHeight - ((p.y - minY) / yRange) * chartHeight + paddingTop
        }));

        let d = `M ${scaledPoints[0].x} ${scaledPoints[0].y}`;
        for (let i = 1; i < scaledPoints.length; i++) {
            const curr = scaledPoints[i];
            const prev = scaledPoints[i - 1];
            const c1x = prev.x + (curr.x - prev.x) * 0.5;
            const c2x = curr.x - (curr.x - prev.x) * 0.5;
            d += ` C ${c1x} ${prev.y}, ${c2x} ${curr.y}, ${curr.x} ${curr.y}`;
        }

        return {
            ...series,
            path: d,
            scaledPoints
        };
    });
  }, [normalizedSeries, chartWidth, chartHeight, minY, yRange, paddingLeft, paddingTop]);

  // Store dynamic params in ref to avoid PanResponder stale closures
  const chartParamsRef = useRef({
    chartWidth: 0,
    totalPoints: 0,
    paddingLeft: paddingLeft,
    seriesCount: 0
  });

  useEffect(() => {
    chartParamsRef.current = {
      chartWidth,
      totalPoints: normalizedSeries[0]?.points?.length || 0,
      paddingLeft: paddingLeft,
      seriesCount: normalizedSeries.length
    };
  }, [chartWidth, normalizedSeries, paddingLeft]);

  const findClosestIndex = useCallback((x) => {
    const { chartWidth: width, totalPoints, paddingLeft: pLeft } = chartParamsRef.current;
    if (totalPoints <= 0 || width <= 0) return null;
    
    const relativeX = x - pLeft;
    const percent = Math.min(Math.max(relativeX / width, 0), 1);
    return Math.round(percent * (totalPoints - 1));
  }, []);

  const yAxisLabels = useMemo(() => {
    if (maxY === minY || chartHeight <= 0) return [];
    const stepCount = 3;
    const step = (maxY - minY) / stepCount;
    return Array.from({ length: stepCount + 1 }, (_, i) => {
      const value = minY + (step * i);
      const y = chartHeight - ((value - minY) / (maxY - minY)) * chartHeight + paddingTop;
      return { value, y };
    });
  }, [minY, maxY, chartHeight, paddingTop]);

  const zeroIndex = useMemo(() => {
    return yAxisLabels.findIndex(l => Math.round(l.value) === 0);
  }, [yAxisLabels]);

  const zeroY = useMemo(() => {
    if (yRange > 0 && minY <= 0 && maxY >= 0) {
        const y = chartHeight - ((0 - minY) / yRange) * chartHeight + paddingTop;
        return isNaN(y) ? null : y;
    }
    return null;
  }, [minY, maxY, yRange, chartHeight, paddingTop]);

  const handleContainerLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setContainerSize(prev => ({ ...prev, width: propWidth || width }));
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const index = findClosestIndex(evt.nativeEvent.locationX);
        if (index !== null) {
          const { chartWidth: width, totalPoints, paddingLeft: pLeft } = chartParamsRef.current;
          setSelectedX(index);
          setShowIndicator(true);
          const xPos = (index / (totalPoints - 1)) * width + pLeft;
          indicatorX.setValue(xPos - 7);
        }
      },
      onPanResponderMove: (evt) => {
        const index = findClosestIndex(evt.nativeEvent.locationX);
        if (index !== null) {
          const { chartWidth: width, totalPoints, paddingLeft: pLeft } = chartParamsRef.current;
          setSelectedX(index);
          setShowIndicator(true);
          const xPos = (index / (totalPoints - 1)) * width + pLeft;
          indicatorX.setValue(xPos - 7);
        }
      },
      onPanResponderRelease: () => {
        setShowIndicator(false);
        setSelectedX(null);
      },
    })
  ).current;

  const canRenderSvg = containerSize.width > (paddingLeft + paddingRight);

  // Data for selected point info
  const selectedDetails = useMemo(() => {
    if (selectedX === null || normalizedSeries.length === 0) return null;
    return {
        label: normalizedSeries[0].points[selectedX]?.label,
        values: normalizedSeries.map(s => ({
            name: s.label,
            value: s.points[selectedX]?.y,
            color: s.color || colors.lineDefault
        }))
    };
  }, [selectedX, normalizedSeries, colors.lineDefault]);

  // Header details when NOT selecting
  const headerDetails = useMemo(() => {
    if (totalValue !== undefined && normalizedSeries.length <= 1) {
        return [{ name: Title, value: totalValue, color: colors.text }];
    }
    return normalizedSeries.map(s => ({
        name: s.label,
        value: s.total !== undefined ? s.total : s.points.reduce((acc, p) => acc + p.y, 0),
        color: s.color || colors.lineDefault
    }));
  }, [totalValue, Title, normalizedSeries, colors.text, colors.lineDefault]);

  return (
    <View
      style={{ width: propWidth || '100%', backgroundColor: colors.card }}
      onLayout={handleContainerLayout}
    >
      {/* Selection Info / Header */}
      <View style={{ height: 50, marginBottom: 5, justifyContent: 'center' }}>
        {selectedDetails ? (
          <View>
            <Text style={{ fontSize: 10, color: colors.textSecondary }}>{selectedDetails.label}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 2 }}>
                {selectedDetails.values.map((v, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: v.color, marginRight: 4 }} />
                        <Text style={{ fontSize: 13, color: v.color, fontWeight: 'bold' }}>
                            {formatter(v.value)}
                        </Text>
                        <Text style={{ fontSize: 9, color: colors.textSecondary, marginLeft: 2 }}>{v.name}</Text>
                    </View>
                ))}
            </View>
          </View>
        ) : (
          <View>
            <Text style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 2 }}>{Title}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {headerDetails.map((v, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={{ fontSize: 20, color: v.color === colors.text ? colors.text : v.color, fontWeight: 'bold' }}>
                            {formatter(v.value)}
                        </Text>
                        {unit ? <Text style={{ fontSize: 10, color: colors.textSecondary, marginLeft: 2 }}>{unit}</Text> : null}
                        {headerDetails.length > 1 && <Text style={{ fontSize: 8, color: colors.textSecondary, marginLeft: 4, textTransform: 'uppercase' }}>{v.name}</Text>}
                    </View>
                ))}
            </View>
          </View>
        )}
      </View>

      {/* Chart */}
      <View className='mt-2' style={{ height: chartHeight + paddingTop + paddingBottom }}>
        {/* Y-axis */}
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 25, zIndex: 1 }} pointerEvents="none">
          {yAxisLabels.map((label, index) => (
            <Text
              key={index}
              style={{ position: 'absolute', fontSize: 9, color: colors.axis, textAlign: 'right', width: 25, top: label.y - 5 }}
            >
              {label.value >= 1000000 ? (label.value / 1000000).toFixed(1) + 'M' : 
               label.value >= 1000 ? (label.value / 1000).toFixed(1) + 'k' : Math.round(label.value)}
            </Text>
          ))}
        </View>

        {canRenderSvg && (
          <Svg width={containerSize.width} height={chartHeight + paddingTop + paddingBottom} pointerEvents="none">
            {/* Grid */}
            {yAxisLabels.map((line, index) => {
              if (isNaN(line.y) || index === zeroIndex) return null;
              return (
                <Path
                  key={`grid-${index}`}
                  d={`M ${paddingLeft} ${line.y} L ${containerSize.width - paddingRight} ${line.y}`}
                  stroke={colors.gridLine}
                  strokeWidth="1"
                />
              );
            })}

            {/* Zero dash */}
            {zeroY !== null && !isNaN(zeroY) && (
              <Path
                d={`M ${paddingLeft} ${zeroY} L ${containerSize.width - paddingRight} ${zeroY}`}
                stroke={colors.axis}
                strokeWidth="0.5"
                strokeDasharray="4, 4"
              />
            )}

            {/* Paths */}
            {seriesPaths.map((s, i) => (
                <Path
                    key={i}
                    d={s.path}
                    stroke={s.color || colors.lineDefault}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ))}
          </Svg>
        )}

        {/* Selection Marker */}
        {showIndicator && selectedX !== null && (
          <View
              style={{
                position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
              }}
              pointerEvents="none"
            >
            <RNAnimated.View
              style={{
                width: 14, zIndex: 10, position: 'absolute',
                left: indicatorX, 
                top: 0, height: '100%'
              }}
            >
                {/* Vertical Line */}
                <View style={{ width: 1, backgroundColor: colors.indicator, opacity: 0.2, alignSelf: 'center', height: '100%', marginTop: paddingTop }} />
                
                {/* Dots for each series */}
                {seriesPaths.map((s, i) => (
                    <View key={i} style={{
                        position: 'absolute',
                        left: 0,
                        top: s.scaledPoints[selectedX].y - 7,
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: s.color || colors.lineDefault,
                        borderWidth: 2.5,
                        borderColor: colors.indicatorBorder,
                    }} />
                ))}
            </RNAnimated.View>
          </View>
        )}

        {/* Touch Overlay */}
        <View 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }} 
            {...panResponder.panHandlers}
        />
      </View>
    </View>
  );
};

export default SmoothLineChart;
