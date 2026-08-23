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

import type {
  ComparePredictionResponse,
  ModelInsight,
} from '../types/forecast';

interface PredictionChartProps {
  data: ComparePredictionResponse | null;
}

function formatPrice(value: number, unit: string) {
  return `$${value.toFixed(2)} ${unit}`;
}

function parseDate(value: string) {
  const [year, month] = value
    .slice(0, 10)
    .split('-')
    .map(Number);

  return new Date(year, month - 1, 1);
}

function toPeriodKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

function formatPeriod(period: string) {
  const [year, month] = period.split('-').map(Number);

  return new Intl.DateTimeFormat('es-EC', {
    month: 'short',
    year: 'numeric',
  })
    .format(new Date(year, month - 1, 1))
    .replace('.', '');
}

function formatProductName(productId: string) {
  return productId
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function addMonths(date: Date, months: number) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + months,
    1,
  );
}

function getTrendSymbol(trend: ModelInsight['trend']) {
  if (trend === 'up') return '↗';
  if (trend === 'down') return '↘';
  return '→';
}

export function PredictionChart({
  data,
}: PredictionChartProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!data) return [];

    const modelName = Object.keys(data.predictions)[0];
    const modelKey = modelName?.toUpperCase();

    const historicalRows = data.historical.map(
      (point, index) => {
        const date = parseDate(point.date);

        const isLastHistorical =
          index === data.historical.length - 1;

        return {
          period: toPeriodKey(date),
          historical: Number(point.price.toFixed(4)),

          ...(isLastHistorical && modelKey
            ? {
                [modelKey]: Number(
                  data.current_price.toFixed(4),
                ),
              }
            : {}),
        };
      },
    );

    const lastHistoricalDate = parseDate(
      data.last_observed_date,
    );

    const predictionRows = Array.from(
      { length: data.horizon },
      (_, index) => {
        const forecastDate = addMonths(
          lastHistoricalDate,
          index + 1,
        );

        const row: Record<
          string,
          number | string | null
        > = {
          period: toPeriodKey(forecastDate),
          historical: null,
        };

        Object.entries(data.predictions).forEach(
          ([currentModelName, points]) => {
            const point = points.find(
              (item) => item.period === index + 1,
            );

            if (point) {
              row[currentModelName.toUpperCase()] =
                Number(point.y_pred.toFixed(4));
            }
          },
        );

        return row;
      },
    );

    return [
      ...historicalRows,
      ...predictionRows,
    ];
  }, [data]);

  if (!data) {
    return null;
  }

  const bestModel = data.best_model;

  const bestInsight = bestModel
    ? data.insights[bestModel]
    : Object.values(data.insights)[0];

  const predictedPrice =
    bestInsight?.last_prediction ?? 0;

  const percentageChange =
    bestInsight?.percentage_change ?? 0;

  const absoluteChange =
    bestInsight?.absolute_change ?? 0;

  const trend =
    bestInsight?.trend ?? 'stable';

  const modelKeys = Object.keys(
    data.predictions,
  ).map((model) => model.toUpperCase());

  const productName =
    formatProductName(data.product_id);

  const lastObservedPeriod = toPeriodKey(
    parseDate(data.last_observed_date),
  );

  return (
    <section className="card chart-card">
      <div className="chart-heading">
        <div>
          <span className="section-kicker">
            {t('chart.title')}
          </span>

          <h2>
            {productName} · {data.province}
          </h2>

          <p className="chart-subtitle">
            {t('chart.subtitle', {
              unit: data.unit,
            })}
          </p>
        </div>

        <div className="chart-pill">
          {t('chart.projectionPeriod', {
            count: data.horizon,
          })}
        </div>
      </div>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span>
            {t('insights.currentPrice')}
          </span>

          <strong>
            {formatPrice(
              data.current_price,
              data.unit,
            )}
          </strong>

          <small>
            {t('insights.lastObserved', {
              date: formatPeriod(
                lastObservedPeriod,
              ),
            })}
          </small>
        </article>

        <article className="kpi-card">
          <span>
            {t('insights.expectedPrice')}
          </span>

          <strong>
            {formatPrice(
              predictedPrice,
              data.unit,
            )}
          </strong>

          <small>
            {t(
              'insights.expectedPriceDescription',
              {
                count: data.horizon,
              },
            )}
          </small>
        </article>

        <article
          className={`kpi-card trend-${trend}`}
        >
          <span>
            {t('insights.variation')}
          </span>

          <strong>
            {getTrendSymbol(trend)}{' '}
            {percentageChange.toFixed(1)}%
          </strong>

          <small>
            {t(
              'insights.absoluteVariation',
              {
                value: `${absoluteChange >= 0 ? '+' : ''}${formatPrice(
                  absoluteChange,
                  data.unit,
                )}`,
              },
            )}
          </small>
        </article>

        <article className="kpi-card">
          <span>
            {t('insights.trend')}
          </span>

          <strong>
            {t(`insights.${trend}`)}
          </strong>

          <small>
            {t(
              'insights.trendDescription',
            )}
          </small>
        </article>
      </div>

      <div className="chart-explanation">
        <span className="chart-explanation-icon">
          i
        </span>

        <p>
          {t('chart.explanation')}
        </p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer
          width="100%"
          height={460}
        >
          <LineChart
            data={chartData}
            margin={{
              top: 30,
              right: 30,
              left: 10,
              bottom: 72,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(31, 41, 55, 0.08)"
              vertical={false}
            />

            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              interval={0}
              tickFormatter={formatPeriod}
              tick={{
                fill: '#647168',
                fontSize: 12,
                fontWeight: 500,
              }}
              angle={-35}
              textAnchor="end"
              height={76}
              tickMargin={14}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              width={60}
              tick={{
                fill: '#647168',
                fontSize: 13,
                fontWeight: 500,
              }}
              tickFormatter={(value) =>
                `$${Number(value).toFixed(2)}`
              }
              dx={-4}
            />

            <Tooltip
              labelFormatter={(period) =>
                formatPeriod(String(period))
              }
              formatter={(value, name) => [
                formatPrice(
                  Number(value),
                  data.unit,
                ),
                String(name),
              ]}
              contentStyle={{
                borderRadius: '14px',
                border:
                  '1px solid rgba(31, 41, 55, 0.08)',
                boxShadow:
                  '0 12px 32px rgba(22, 37, 27, 0.12)',
                fontSize: '12px',
                padding: '10px 12px',
              }}
              labelStyle={{
                color: '#35453a',
                fontWeight: 700,
                marginBottom: '6px',
              }}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="line"
              iconSize={18}
              wrapperStyle={{
                paddingTop: '30px',
                fontSize: '12px',
                color: '#59675e',
              }}
            />

            <ReferenceLine
              x={lastObservedPeriod}
              stroke="#cbd5e1"
              strokeWidth={1.5}
              strokeDasharray="4 5"
              label={{
                value: t(
                  'chart.forecastStarts',
                ),
                position:
                  'insideTopRight',
                fill: '#64748b',
                fontSize: 11,
              }}
            />

            <Line
              type="monotone"
              dataKey="historical"
              name={t('chart.historical')}
              stroke="#475569"
              strokeWidth={2.75}
              dot={false}
              activeDot={{
                r: 5,
                fill: '#475569',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
              connectNulls={false}
            />

            {modelKeys.map((modelName) => (
              <Line
                key={modelName}
                type="monotone"
                dataKey={modelName}
                name={t(
                  'chart.estimatedPrice',
                )}
                stroke="#16a34a"
                strokeWidth={2.75}
                strokeDasharray="8 5"
                dot={{
                  r: 5,
                  fill: '#ffffff',
                  stroke: '#16a34a',
                  strokeWidth: 2.5,
                }}
                activeDot={{
                  r: 7,
                  fill: '#16a34a',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {bestInsight && (
        <div
          className={`interpretation-card trend-${trend}`}
        >
          <span>
            {t(
              'insights.interpretation',
            )}
          </span>

          <p>
            {t('insights.summary', {
              trend: t(
                `insights.${trend}`,
              ).toLowerCase(),
              product: productName,
              province: data.province,
              change: Math.abs(
                percentageChange,
              ).toFixed(1),
              horizon: data.horizon,
              currentPrice: formatPrice(
                data.current_price,
                data.unit,
              ),
              expectedPrice:
                formatPrice(
                  predictedPrice,
                  data.unit,
                ),
            })}
          </p>

          <small className="prediction-disclaimer">
            {t(
              'insights.disclaimer',
            )}
          </small>
        </div>
      )}
    </section>
  );
}