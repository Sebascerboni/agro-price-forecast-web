import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { forecastApi } from '../api/forecastApi';
import { ForecastForm } from '../components/ForecastForm';
import { MetricsCards } from '../components/MetricsCards';
import { PredictionChart } from '../components/PredictionChart';
import type {
  ComparePredictionResponse,
  ProductSummary,
} from '../types/forecast';

const RECOMMENDED_MODELS: Record<string, string> = {
  papa_superchola: 'xgboost',
  tomate_rinon_invernadero: 'lstm',
  maracuya: 'xgboost',
};

interface SubmittedQuery {
  product: string;
  province: string;
  horizon: number;
  model: string;
}

function formatProductName(productId: string) {
  return productId
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function Dashboard() {
  const { t } = useTranslation();

  const [products, setProducts] = useState<string[]>([]);
  const [summary, setSummary] = useState<ProductSummary | null>(null);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [horizon, setHorizon] = useState(3);

  const [prediction, setPrediction] =
    useState<ComparePredictionResponse | null>(null);

  const [submittedQuery, setSubmittedQuery] =
    useState<SubmittedQuery | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    forecastApi.getProducts().then((productsResponse) => {
      setProducts(productsResponse);

      if (productsResponse.length > 0) {
        setSelectedProduct(productsResponse[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;

    forecastApi.getProductSummary(selectedProduct).then((summaryResponse) => {
      setSummary(summaryResponse);
      setSelectedProvince(summaryResponse.provinces[0] ?? '');

      // Al cambiar de producto eliminamos el resultado anterior
      // para no mostrar información correspondiente a otra consulta.
      setPrediction(null);
      setSubmittedQuery(null);
    });
  }, [selectedProduct]);

  const recommendedModel = useMemo(() => {
    if (!selectedProduct) return null;

    return RECOMMENDED_MODELS[selectedProduct] ?? null;
  }, [selectedProduct]);

  /**
   * El backend conserva las predicciones de los tres modelos para
   * fines comparativos, pero la vista principal solo recibe el modelo
   * recomendado para el producto.
   */
  const primaryPrediction = useMemo(() => {
    if (!prediction || !submittedQuery) {
      return null;
    }

    const modelName = submittedQuery.model;

    const modelPrediction = prediction.predictions[modelName];
    const modelInsight = prediction.insights?.[modelName];

    if (!modelPrediction) {
      return null;
    }

    return {
      ...prediction,
      best_model: modelName,
      predictions: {
        [modelName]: modelPrediction,
      },
      insights: modelInsight
        ? {
            [modelName]: modelInsight,
          }
        : {},
    };
  }, [prediction, submittedQuery]);

  const handlePredict = async () => {
    if (
      !selectedProduct ||
      !selectedProvince ||
      !recommendedModel
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await forecastApi.comparePredictions({
        product_id: selectedProduct,
        province: selectedProvince,
        horizon,
      });

      setPrediction(response);

      // Guardamos exactamente qué consulta produjo el resultado.
      setSubmittedQuery({
        product: selectedProduct,
        province: selectedProvince,
        horizon,
        model: recommendedModel,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard">
      {/* HERO */}
      <section className="hero-panel">
        <div className="hero-content">
          <span className="hero-badge">
            {t('dashboard.badge')}
          </span>

          <h1>{t('app.title')}</h1>

          <p className="hero-main-description">
            {t('app.description')}
          </p>

          <p className="hero-secondary-description">
            {t('app.automaticModel')}
          </p>

          <div className="hero-actions">
            <a href="#forecast" className="primary-link">
              {t('forecast.start')}
            </a>

            <a
              href="#how-it-works"
              className="secondary-link"
            >
              {t('dashboard.howToUse')}
            </a>
          </div>
        </div>

        {/* QUÉ PUEDES CONSULTAR */}
        <div className="hero-card">
          <div className="hero-card-icon">🌱</div>

          <h2>{t('dashboard.whatCanYouCheck')}</h2>

          <div className="capability-list">
            <div className="capability-item">
              <span className="capability-icon">✓</span>

              <div>
                <strong>
                  {t('dashboard.availableProducts', {
                    count: products.length || 3,
                  })}
                </strong>

                <span>
                  {t(
                    'dashboard.availableProductsDescription',
                  )}
                </span>
              </div>
            </div>

            <div className="capability-item">
              <span className="capability-icon">✓</span>

              <div>
                <strong>
                  {t('dashboard.provinces')}
                </strong>

                <span>
                  {t(
                    'dashboard.provincesDescription',
                  )}
                </span>
              </div>
            </div>

            <div className="capability-item">
              <span className="capability-icon">✓</span>

              <div>
                <strong>
                  {t('dashboard.projections')}
                </strong>

                <span>
                  {t(
                    'dashboard.projectionsDescription',
                  )}
                </span>
              </div>
            </div>

            <div className="capability-item">
              <span className="capability-icon">✓</span>

              <div>
                <strong>
                  {t('dashboard.priceUnit')}
                </strong>

                <span>
                  {t(
                    'dashboard.priceUnitDescription',
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO UTILIZAR LA HERRAMIENTA */}
      <section
        id="how-it-works"
        className="usage-section"
      >
        <div className="usage-heading">
          <span className="section-kicker">
            {t('dashboard.howToUse')}
          </span>

          <h2>{t('dashboard.howToUseTitle')}</h2>
        </div>

        <div className="usage-grid">
          <article className="usage-step">
            <span className="step-number">1</span>

            <div>
              <h3>
                {t('instructions.product.title')}
              </h3>

              <p>
                {t(
                  'instructions.product.description',
                )}
              </p>
            </div>
          </article>

          <article className="usage-step">
            <span className="step-number">2</span>

            <div>
              <h3>
                {t('instructions.province.title')}
              </h3>

              <p>
                {t(
                  'instructions.province.description',
                )}
              </p>
            </div>
          </article>

          <article className="usage-step">
            <span className="step-number">3</span>

            <div>
              <h3>
                {t('instructions.period.title')}
              </h3>

              <p>
                {t(
                  'instructions.period.description',
                )}
              </p>
            </div>
          </article>

          <article className="usage-step">
            <span className="step-number">4</span>

            <div>
              <h3>
                {t('instructions.result.title')}
              </h3>

              <p>
                {t(
                  'instructions.result.description',
                )}
              </p>
            </div>
          </article>
        </div>

        <div className="usage-result-hint">
          <span>💡</span>

          <p>{t('dashboard.resultHint')}</p>
        </div>
      </section>

      {/* FORMULARIO */}
      <div id="forecast">
        <ForecastForm
          products={products}
          provinces={summary?.provinces ?? []}
          selectedProduct={selectedProduct}
          selectedProvince={selectedProvince}
          horizon={horizon}
          loading={loading}
          onProductChange={setSelectedProduct}
          onProvinceChange={setSelectedProvince}
          onHorizonChange={setHorizon}
          onSubmit={handlePredict}
        />
      </div>

      {/* ESTADO DE CARGA */}
      {loading && (
        <section className="prediction-status prediction-status-loading">
          <div className="prediction-status-icon">
            ⏳
          </div>

          <div>
            <strong>
              {t('result.generating')}
            </strong>

            <span>
              {t('result.generatingDescription')}
            </span>
          </div>
        </section>
      )}

      {/* CONFIRMACIÓN DE LA CONSULTA */}
      {!loading && submittedQuery && primaryPrediction && (
        <>
          {/* RESULTADO PRINCIPAL:
              SOLO MODELO RECOMENDADO */}
          <PredictionChart
            data={primaryPrediction}
          />
        </>
      )}

      {/* INFORMACIÓN TÉCNICA SECUNDARIA */}
      {summary && prediction && submittedQuery && (
        <section
          id="metrics"
          className="technical-section"
        >
          <details className="technical-details">
            <summary>
              <div>
                <span className="section-kicker">
                  {t('technical.optional')}
                </span>

                <strong>
                  {t('technical.title')}
                </strong>

                <small>
                  {t('technical.description')}
                </small>
              </div>

              <span className="details-indicator">
                +
              </span>
            </summary>

            <div className="technical-details-content">
              <div className="selected-model-explanation">
                <div>
                  <span>
                    {t('technical.modelUsed')}
                  </span>

                  <strong>
                    {submittedQuery.model.toUpperCase()}
                  </strong>
                </div>

                <p>
                  {t(
                    'technical.modelSelectionExplanation',
                    {
                      product: formatProductName(
                        submittedQuery.product,
                      ),
                    },
                  )}
                </p>
              </div>

              <MetricsCards
                metrics={summary.metrics}
                recommendedModel={submittedQuery.model}
              />
            </div>
          </details>
        </section>
      )}
    </main>
  );
}