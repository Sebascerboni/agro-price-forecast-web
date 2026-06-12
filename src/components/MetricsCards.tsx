import { useTranslation } from 'react-i18next';

import type { ModelMetrics } from '../types/forecast';

interface MetricsCardsProps {
  metrics: Record<string, ModelMetrics>;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const { t } = useTranslation();

  return (
    <section className="card">
      <div className="card-heading">
        <span className="section-kicker">{t('metrics.title')}</span>
        <h2>Evaluación comparativa</h2>
      </div>

      <div className="metrics-grid">
        {Object.entries(metrics).map(([modelName, metric]) => (
          <article key={modelName} className="metric-card">
            <div className="metric-card-header">
              <span>{modelName.toUpperCase()}</span>
              <strong>{metric.r2.toFixed(2)}</strong>
            </div>

            <div className="metric-list">
              <p>
                <span>{t('metrics.mae')}</span>
                <strong>{metric.mae.toFixed(4)}</strong>
              </p>
              <p>
                <span>{t('metrics.rmse')}</span>
                <strong>{metric.rmse.toFixed(4)}</strong>
              </p>
              <p>
                <span>{t('metrics.mape')}</span>
                <strong>{metric.mape.toFixed(2)}%</strong>
              </p>
              <p>
                <span>{t('metrics.directionalAccuracy')}</span>
                <strong>{(metric.directional_accuracy * 100).toFixed(1)}%</strong>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}