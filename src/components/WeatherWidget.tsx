import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudSun, CloudRain, CloudLightning, CloudFog, Wind, Droplets, Thermometer, RefreshCw, ChevronDown, MapPin } from 'lucide-react';
import clsx from 'clsx';

interface WeatherData {
  temperature: number;
  humidity: number;
  feelsLike: number;
  weatherCode: number;
  windSpeed: number;
  conditionLabel: string;
}

export default function WeatherWidget({ ecoMode }: { ecoMode?: boolean }) {
  const [weather, setWeather] = useState<WeatherData | null>({
    temperature: 29,
    humidity: 58,
    feelsLike: 31,
    weatherCode: 0,
    windSpeed: 11,
    conditionLabel: 'Soleado / Cálido'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=25.7928&longitude=-108.9902&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=America%2FMazatlan'
      );
      if (res.ok) {
        const data = await res.json();
        const current = data.current;
        if (current) {
          const code = current.weather_code ?? 0;
          let label = 'Soleado / Cálido';
          if (code === 1 || code === 2 || code === 3) label = 'Parcialmente Nublado';
          else if (code === 45 || code === 48) label = 'Neblina Ligera';
          else if (code >= 51 && code <= 67) label = 'Lluvia Moderada';
          else if (code >= 80 && code <= 82) label = 'Chubascos Dispersos';
          else if (code >= 95) label = 'Tormenta Eléctrica';

          setWeather({
            temperature: Math.round(current.temperature_2m),
            humidity: Math.round(current.relative_humidity_2m),
            feelsLike: Math.round(current.apparent_temperature),
            weatherCode: code,
            windSpeed: Math.round(current.wind_speed_10m),
            conditionLabel: label
          });
        }
      }
    } catch (err) {
      console.warn('Weather fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />;
    if (code === 1 || code === 2 || code === 3) return <CloudSun className="w-4 h-4 text-amber-300" />;
    if (code === 45 || code === 48) return <CloudFog className="w-4 h-4 text-slate-300" />;
    if (code >= 51 && code <= 82) return <CloudRain className="w-4 h-4 text-sky-400" />;
    if (code >= 95) return <CloudLightning className="w-4 h-4 text-purple-400" />;
    return <Sun className="w-4 h-4 text-amber-400" />;
  };

  if (!weather) return null;

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setExpanded(!expanded)}
        className={clsx(
          "px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm",
          ecoMode
            ? "bg-slate-900 border-slate-700 text-slate-200"
            : "bg-slate-900/90 hover:bg-slate-800 text-white border-amber-500/30 shadow-amber-500/10"
        )}
        title="Clima en Tiempo Real • Los Mochis, Sinaloa"
      >
        <div className="flex items-center gap-1">
          {getWeatherIcon(weather.weatherCode)}
          <span className="font-mono text-amber-400 font-extrabold">{weather.temperature}°C</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 border-l border-slate-700 pl-1.5 text-[10px] text-slate-300">
          <MapPin className="w-2.5 h-2.5 text-amber-500 shrink-0" />
          <span>Los Mochis</span>
        </div>
        <ChevronDown className={clsx("w-3 h-3 text-slate-400 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-3.5 z-50 text-white space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <h4 className="text-xs font-black text-white leading-tight">Los Mochis, Sin.</h4>
                <p className="text-[9px] text-slate-400">Estación meteorológica en vivo</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); fetchWeather(); }}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Actualizar clima"
            >
              <RefreshCw className={clsx("w-3 h-3", loading && "animate-spin text-amber-400")} />
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                {getWeatherIcon(weather.weatherCode)}
              </div>
              <div>
                <span className="text-xl font-black font-mono text-amber-400 block leading-tight">
                  {weather.temperature}°C
                </span>
                <span className="text-[10px] text-slate-300 font-medium block">
                  {weather.conditionLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
              <Thermometer className="w-3 h-3 text-amber-400 mx-auto mb-1" />
              <span className="text-slate-400 block text-[9px]">Sensación</span>
              <span className="font-bold text-white font-mono">{weather.feelsLike}°C</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
              <Droplets className="w-3 h-3 text-sky-400 mx-auto mb-1" />
              <span className="text-slate-400 block text-[9px]">Humedad</span>
              <span className="font-bold text-white font-mono">{weather.humidity}%</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
              <Wind className="w-3 h-3 text-emerald-400 mx-auto mb-1" />
              <span className="text-slate-400 block text-[9px]">Viento</span>
              <span className="font-bold text-white font-mono">{weather.windSpeed} km/h</span>
            </div>
          </div>

          <div className="text-[9px] text-slate-400 text-center pt-1 border-t border-slate-900">
            Fuente: Open-Meteo • Valle del Fuerte, Sinaloa
          </div>
        </div>
      )}
    </div>
  );
}
