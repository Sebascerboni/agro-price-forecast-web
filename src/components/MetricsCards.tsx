import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ModelMetrics } from '../types/forecast';

interface MetricsCardsProps {
  metrics: Record<string, ModelMetrics>;
  recommendedModel?: string;
}

interface MetricTooltipProps {
  label: string;
  description: string;
}

function MetricTooltip({
  label,
  description,
}: MetricTooltipProps) {
  return (
    <span
      className="info-tooltip"
      tabIndex={0}
      aria-label={`${label}: ${description}`}
    >
      <span
        className="info-icon"
        aria-hidden="true"
      >
        i
      </span>

      <span
        className="tooltip-content"
        role="tooltip"
      >
        <strong>{label}</strong>
        <span>{description}</span>
      </span>
    </span>
  );
}

export function MetricsCards({
  metrics,
  recommendedModel,
}: MetricsCardsProps) {
  const { t } = useTranslation();

  const orderedModels = useMemo(() => {
    return Object.entries(metrics).sort(
      ([modelA, metricsA], [modelB, metricsB]) => {
        if (
          recommendedModel &&
          modelA === recommendedModel
        ) {
          return -1;
        }

        if (
          recommendedModel &&
          modelB === recommendedModel
        ) {
          return 1;
        }

        return metricsA.mape - metricsB.mape;
      },
    );
  }, [metrics, recommendedModel]);

  function getPerformanceLabel(
    mape: number,
  ) {
    if (mape <= 10) {
      return {
        text: t('metrics.performance.excellent'),
        className: 'performance-excellent',
      };
    }

    if (mape <= 20) {
      return {
        text: t('metrics.performance.good'),
        className: 'performance-good',
      };
    }

    return {
      text: t('metrics.performance.limited'),
      className: 'performance-limited',
    };
  }

  return (
    <section className="metrics-comparison">
      <div className="card-heading">
        <span className="section-kicker">
          {t('metrics.sectionLabel')}
        </span>

        <h2>
          {t('metrics.comparisonTitle')}
        </h2>

        <p className="metrics-description">
          {t('metrics.description')}
        </p>
      </div>

      <div className="models-explanation">
        <div className="models-explanation-heading">
          <div>
            <span className="section-kicker">
              {t('metrics.modelsExplanation.label')}
            </span>

            <h3>
              {t('metrics.modelsExplanation.title')}
            </h3>
          </div>

          <p>
            {t('metrics.modelsExplanation.description')}
          </p>
        </div>

        <div className="model-explanation-grid">
          <article className="model-explanation-card">
            <div className="model-explanation-name">

              <strong>SARIMAX</strong>
            </div>

            <p>
              {t('metrics.modelsExplanation.arima')}
            </p>
          </article>

          <article className="model-explanation-card">
            <div className="model-explanation-name">

              <strong>LSTM</strong>
            </div>

            <p>
              {t('metrics.modelsExplanation.lstm')}
            </p>
          </article>

          <article className="model-explanation-card">
            <div className="model-explanation-name">

              <strong>XGBoost</strong>
            </div>

            <p>
              {t('metrics.modelsExplanation.xgboost')}
            </p>
          </article>
        </div>

        <div className="model-selection-note">
          <span className="model-selection-icon">✓</span>

          <div>
            <strong>
              {t('metrics.modelsExplanation.selectionTitle')}
            </strong>

            <p>
              {t('metrics.modelsExplanation.selectionDescription')}
            </p>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        {orderedModels.map(
          ([modelName, metric]) => {
            const isRecommended =
              modelName === recommendedModel;

            const performance =
              getPerformanceLabel(
                metric.mape,
              );

            return (
              <article
                key={modelName}
                className={`metric-card ${
                  isRecommended
                    ? 'metric-card-recommended'
                    : ''
                }`}
              >
                <div className="metric-card-header">
                  <div>
                    <span className="metric-model-label">
                      {t(
                        'metrics.modelLabel',
                      )}
                    </span>

                    <h3>
                      {modelName.toUpperCase() == 'ARIMA' ? 'SARIMAX' : modelName.toUpperCase()}
                    </h3>
                  </div>

                  {isRecommended ? (
                    <span className="recommended-badge">
                      ✓{' '}
                      {t(
                        'metrics.recommended',
                      )}
                    </span>
                  ) : (
                    <span
                      className={`performance-badge ${performance.className}`}
                    >
                      {performance.text}
                    </span>
                  )}
                </div>

                <div className="human-metrics">
                  <div className="human-metric">
                    <div className="human-metric-heading">
                      <span>
                        {t(
                          'metrics.averagePercentageError',
                        )}
                      </span>

                      <MetricTooltip
                        label={t(
                          'metrics.mape',
                        )}
                        description={t(
                          'metrics.tooltips.mape',
                        )}
                      />
                    </div>

                    <strong>
                      {metric.mape.toFixed(
                        1,
                      )}
                      %
                    </strong>

                    <small>
                      {t(
                        'metrics.averagePercentageErrorDescription',
                      )}
                    </small>
                  </div>

                  <div className="human-metric">
                    <div className="human-metric-heading">
                      <span>
                        {t(
                          'metrics.directionAccuracy',
                        )}
                      </span>

                      <MetricTooltip
                        label={t(
                          'metrics.directionalAccuracy',
                        )}
                        description={t(
                          'metrics.tooltips.directionalAccuracy',
                        )}
                      />
                    </div>

                    <strong>
                      {(
                        metric.directional_accuracy *
                        100
                      ).toFixed(1)}
                      %
                    </strong>

                    <small>
                      {t(
                        'metrics.directionAccuracyDescription',
                      )}
                    </small>
                  </div>
                </div>

                <details className="metric-technical-details">
                  <summary>
                    <span>
                      {t(
                        'metrics.technicalDetails',
                      )}
                    </span>

                    <span className="metric-details-indicator">
                      +
                    </span>
                  </summary>

                  <div className="technical-metric-list">
                    <div className="technical-metric-row">
                      <div>
                        <span>
                          {t(
                            'metrics.mae',
                          )}
                        </span>

                        <MetricTooltip
                          label={t(
                            'metrics.mae',
                          )}
                          description={t(
                            'metrics.tooltips.mae',
                          )}
                        />
                      </div>

                      <strong>
                        {metric.mae.toFixed(
                          4,
                        )}
                      </strong>
                    </div>

                    <div className="technical-metric-row">
                      <div>
                        <span>
                          {t(
                            'metrics.rmse',
                          )}
                        </span>

                        <MetricTooltip
                          label={t(
                            'metrics.rmse',
                          )}
                          description={t(
                            'metrics.tooltips.rmse',
                          )}
                        />
                      </div>

                      <strong>
                        {metric.rmse.toFixed(
                          4,
                        )}
                      </strong>
                    </div>

                    <div className="technical-metric-row">
                      <div>
                        <span>
                          {t(
                            'metrics.r2',
                          )}
                        </span>

                        <MetricTooltip
                          label={t(
                            'metrics.r2',
                          )}
                          description={t(
                            'metrics.tooltips.r2',
                          )}
                        />
                      </div>

                      <strong>
                        {metric.r2.toFixed(
                          3,
                        )}
                      </strong>
                    </div>

                    <div className="technical-metric-row">
                      <div>
                        <span>
                          {t(
                            'metrics.testSamples',
                          )}
                        </span>

                        <MetricTooltip
                          label={t(
                            'metrics.testSamples',
                          )}
                          description={t(
                            'metrics.tooltips.testSamples',
                          )}
                        />
                      </div>

                      <strong>
                        {metric.n_test}
                      </strong>
                    </div>
                  </div>
                </details>
              </article>
            );
          },
        )}
      </div>

      <div className="metrics-reading-guide">
        <span>💡</span>

        <p>
          {t(
            'metrics.readingGuide',
          )}
        </p>
      </div>
    </section>
  );
}