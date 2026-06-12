import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ComparePredictionResponse, ModelInsight } from '../types/forecast';

interface PredictionChartProps {
  data: ComparePredictionResponse | null;
}

function formatPrice(value: number, unit: string) {
  return `$${value.toFixed(2)} ${unit}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-EC', {
    month: 'short',
    year: 'numeric',
  });
}

function getTrendSymbol(trend: ModelInsight['trend']) {
  if (trend === 'up') return '↗';
  if (trend === 'down') return '↘';
  return '→';
}

export function PredictionChart({ data }: PredictionChartProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!data) return [];

    const historicalRows = data.historical.map((point) => ({
      period: formatDate(point.date),
      historical: Number(point.price.toFixed(4)),
    }));

    const lastHistoricalDate = new Date(data.last_observed_date);

    const predictionRows = Array.from({ length: data.horizon }, (_, index) => {
      const forecastDate = new Date(lastHistoricalDate);
      forecastDate.setMonth(forecastDate.getMonth() + index + 1);

      const row: Record<string, number | string | null> = {
        period: formatDate(forecastDate.toISOString()),
        historical: null,
      };

      Object.entries(data.predictions).forEach(([modelName, points]) => {
        const point = points.find((item) => item.period === index + 1);
        row[modelName.toUpperCase()] = Number(point?.y_pred.toFixed(4) ?? 0);
      });

      return row;
    });

    return [...historicalRows, ...predictionRows];
  }, [data]);

  if (!data) {
    return null;
  }

  const bestModel = data.best_model;
  const bestInsight = bestModel ? data.insights[bestModel] : Object.values(data.insights)[0];

  const predictedPrice = bestInsight?.last_prediction ?? 0;
  const percentageChange = bestInsight?.percentage_change ?? 0;
  const absoluteChange = bestInsight?.absolute_change ?? 0;
  const trend = bestInsight?.trend ?? 'stable';

  const modelKeys = Object.keys(data.predictions).map((model) => model.toUpperCase());

  return (
    <section className="card chart-card">
      <div className="chart-heading">
        <div>
          <span className="section-kicker">{t('chart.title')}</span>
          <h2>
            {data.product_id.replaceAll('_', ' ')} · {data.province}
          </h2>
          <p className="chart-subtitle">
            {t('insights.chartSubtitle', { unit: data.unit })}
          </p>
        </div>

        <div className="chart-pill">
          {data.horizon} meses
        </div>
      </div>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span>{t('insights.currentPrice')}</span>
          <strong>{formatPrice(data.current_price, data.unit)}</strong>
          <small>
            {t('insights.lastObserved')}: {formatDate(data.last_observed_date)}
          </small>
        </article>

        <article className="kpi-card">
          <span>{t('insights.expectedPrice')}</span>
          <strong>{formatPrice(predictedPrice, data.unit)}</strong>
          <small>{bestModel?.toUpperCase()}</small>
        </article>

        <article className={`kpi-card trend-${trend}`}>
          <span>{t('insights.variation')}</span>
          <strong>
            {getTrendSymbol(trend)} {percentageChange.toFixed(1)}%
          </strong>
          <small>
            {absoluteChange >= 0 ? '+' : ''}
            {formatPrice(absoluteChange, data.unit)}
          </small>
        </article>

        <article className="kpi-card">
          <span>{t('insights.bestModel')}</span>
          <strong>{bestModel?.toUpperCase() ?? '-'}</strong>
          <small>Según RMSE histórico</small>
        </article>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartData} margin={{ top: 10, right: 24, left: 4, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(31, 41, 55, 0.12)" />
            <XAxis dataKey="period" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${Number(value).toFixed(2)}`}
            />
            <Tooltip
              formatter={(value) => formatPrice(Number(value), data.unit)}
            />
            <Legend />
            <ReferenceLine
              x={formatDate(data.last_observed_date)}
              stroke="#6b7280"
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="historical"
              name="Histórico"
              strokeWidth={3}
              dot={false}
              connectNulls={false}
            />
            {modelKeys.map((modelName) => (
              <Line
                key={modelName}
                type="monotone"
                dataKey={modelName}
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {bestInsight && (
        <div className={`interpretation-card trend-${trend}`}>
          <span>{t('insights.interpretation')}</span>
          <p>
            {t('insights.summary', {
              model: bestInsight.model_name.toUpperCase(),
              trend: t(`insights.${trend}`),
              product: data.product_id.replaceAll('_', ' '),
              province: data.province,
              change: percentageChange.toFixed(1),
              horizon: data.horizon,
            })}
          </p>
        </div>
      )}
    </section>
  );
}