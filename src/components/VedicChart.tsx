import React, { useState } from 'react';
import { SouthIndianChart } from './SouthIndianChart';
import { NorthIndianChart } from './NorthIndianChart';
import type { PlanetPosition, NavamshaChart, VedicChart as VedicChartType } from '../types/astrology';

export interface VedicChartProps {
  planets?: PlanetPosition[];
  lagna?: {
    sign: string;
    degree: number;
    formattedDegree: string;
    nakshatra?: string;
    pada?: number;
  };
  siderealChart?: VedicChartType;
  navamshaChart?: NavamshaChart;
  nativeName?: string;
  defaultMode?: 'south' | 'north';
  defaultDivision?: 'D1' | 'D9';
  className?: string;
}

export const VedicChart: React.FC<VedicChartProps> = ({
  planets: propsPlanets,
  lagna: propsLagna,
  siderealChart,
  navamshaChart: propsNavamshaChart,
  nativeName = 'Native',
  defaultMode = 'south',
  defaultDivision = 'D1',
  className = ''
}) => {
  const planets = propsPlanets || siderealChart?.planets || [];
  const lagna = propsLagna || siderealChart?.lagna || { sign: 'Aries', degree: 0, formattedDegree: "0°00' Aries" };
  const navamshaChart = propsNavamshaChart || siderealChart?.navamshaChart;

  const [chartStyle, setChartStyle] = useState<'south' | 'north'>(defaultMode);
  const [divisionalChart, setDivisionalChart] = useState<'D1' | 'D9'>(defaultDivision);

  // Select active dataset based on D1 or D9
  const isD9 = divisionalChart === 'D9' && !!navamshaChart;
  const activePlanets = isD9 && navamshaChart ? navamshaChart.planets : planets;
  const activeLagna = isD9 && navamshaChart
    ? {
        sign: navamshaChart.lagna.sign,
        degree: 0,
        formattedDegree: navamshaChart.lagna.formattedDegree
      }
    : lagna;

  const chartTitle = isD9 ? 'NAVAMSHA (D9)' : 'RASI (D1)';

  return (
    <div className={`flex flex-col items-center w-full space-y-2.5 ${className}`}>
      {/* Chart Style & Divisional Toggles */}
      <div className="flex items-center justify-between w-full max-w-[440px] px-1 gap-2 flex-wrap">
        {/* South vs North Toggle */}
        <div className="flex p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setChartStyle('south')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              chartStyle === 'south'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            South Indian
          </button>
          <button
            type="button"
            onClick={() => setChartStyle('north')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              chartStyle === 'north'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            North Indian
          </button>
        </div>

        {/* D1 vs D9 Divisional Toggle */}
        <div className="flex p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setDivisionalChart('D1')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              divisionalChart === 'D1'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            D1 Rasi
          </button>
          <button
            type="button"
            onClick={() => setDivisionalChart('D9')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              divisionalChart === 'D9'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            D9 Navamsha
          </button>
        </div>
      </div>

      {/* Render selected SVG visualization */}
      {chartStyle === 'south' ? (
        <SouthIndianChart
          planets={activePlanets}
          lagna={activeLagna}
          nativeName={nativeName}
          chartTitle={chartTitle}
        />
      ) : (
        <NorthIndianChart
          planets={activePlanets}
          lagna={activeLagna}
          nativeName={nativeName}
          chartTitle={chartTitle}
        />
      )}
    </div>
  );
};
