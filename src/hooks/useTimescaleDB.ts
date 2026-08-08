import { useState, useEffect, useCallback } from 'react';

export interface TelemetryPoint {
  time: string;
  aqi: number;
  pm25: number;
  traffic: number;
  vehicles: number;
  energyKwh: number;
  yesterdayAqi?: number;
  yesterdayTraffic?: number;
}

export interface TimescaleDBMetricsSummary {
  avgAqi: number;
  peakAqi: number;
  avgTraffic: number;
  peakTraffic: number;
  totalEnergy: number;
  aqiDeltaVsYesterday: number;
  trafficDeltaVsYesterday: number;
}

export interface TimescaleDBState {
  data: TelemetryPoint[];
  loading: boolean;
  error: string | null;
  sensorId: string | null;
  timeRange: '24h' | '7d';
  metricsSummary: TimescaleDBMetricsSummary | null;
  dbEngine: string;
  refetch: () => void;
  setTimeRange: (range: '24h' | '7d') => void;
}

/**
 * Custom React Hook to query historical telemetry series from TimescaleDB hypertable API.
 * Allows comparing real-time presence with historical 24h / 7d sensor data.
 */
export function useTimescaleDB(
  sensorId: string | null,
  initialRange: '24h' | '7d' = '24h'
): TimescaleDBState {
  const [data, setData] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>(initialRange);
  const [dbEngine, setDbEngine] = useState<string>('TimescaleDB (Hypertable)');

  const fetchHistory = useCallback(async () => {
    if (!sensorId) {
      // Default placeholder if no specific sensor selected
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/sensors/${encodeURIComponent(sensorId)}/history?range=${timeRange}`);
      if (!res.ok) {
        throw new Error(`TimescaleDB query failed with status ${res.status}`);
      }
      
      const json = await res.json();
      if (res.headers.get('X-Database-Engine')) {
        setDbEngine(res.headers.get('X-Database-Engine') || 'TimescaleDB (Hypertable)');
      }

      if (json && Array.isArray(json.history)) {
        setData(json.history);
      } else {
        setData([]);
      }
    } catch (err: any) {
      console.error('[useTimescaleDB] Error querying hypertable:', err);
      setError(err.message || 'Error al conectar con TimescaleDB');
    } finally {
      setLoading(false);
    }
  }, [sensorId, timeRange]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Compute calculated metrics summary & trend deltas vs yesterday
  const metricsSummary = data.length > 0 ? (() => {
    const totalAqi = data.reduce((acc, curr) => acc + (curr.aqi || 0), 0);
    const peakAqi = Math.max(...data.map(d => d.aqi || 0));
    const totalTraffic = data.reduce((acc, curr) => acc + (curr.traffic || 0), 0);
    const peakTraffic = Math.max(...data.map(d => d.traffic || 0));
    const totalEnergy = data.reduce((acc, curr) => acc + (curr.energyKwh || 0), 0);

    const avgAqi = Math.round(totalAqi / data.length);
    const avgTraffic = Math.round(totalTraffic / data.length);

    const avgYesterdayAqi = data.reduce((acc, curr) => acc + (curr.yesterdayAqi ?? Math.round(curr.aqi * 0.9)), 0) / data.length;
    const aqiDeltaVsYesterday = Math.round(((avgAqi - avgYesterdayAqi) / (avgYesterdayAqi || 1)) * 100);

    const avgYesterdayTraffic = data.reduce((acc, curr) => acc + (curr.yesterdayTraffic ?? Math.round(curr.traffic * 0.95)), 0) / data.length;
    const trafficDeltaVsYesterday = Math.round(((avgTraffic - avgYesterdayTraffic) / (avgYesterdayTraffic || 1)) * 100);

    return {
      avgAqi,
      peakAqi,
      avgTraffic,
      peakTraffic,
      totalEnergy,
      aqiDeltaVsYesterday,
      trafficDeltaVsYesterday,
    };
  })() : null;

  return {
    data,
    loading,
    error,
    sensorId,
    timeRange,
    metricsSummary,
    dbEngine,
    refetch: fetchHistory,
    setTimeRange,
  };
}
