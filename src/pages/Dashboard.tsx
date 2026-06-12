import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { forecastApi } from '../api/forecastApi';
import { ForecastForm } from '../components/ForecastForm';
import { MetricsCards } from '../components/MetricsCards';
import { PredictionChart } from '../components/PredictionChart';
import type { ComparePredictionResponse, ProductSummary } from '../types/forecast';

export function Dashboard() {
  const { t } = useTranslation();

  const [products, setProducts] = useState<string[]>([]);
  const [summary, setSummary] = useState<ProductSummary | null>(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [horizon, setHorizon] = useState(3);
  const [prediction, setPrediction] = useState<ComparePredictionResponse | null>(null);
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
      setPrediction(null);
    });
  }, [selectedProduct]);

  const handleCompare = async () => {
    if (!selectedProduct || !selectedProvince) return;

    setLoading(true);

    try {
      const response = await forecastApi.comparePredictions({
        product_id: selectedProduct,
        province: selectedProvince,
        horizon,
      });

      setPrediction(response);
    } finally {
      setLoading(false);
    }
  };

  const bestModel = useMemo(() => {
    if (!summary?.metrics) return null;

    return Object.entries(summary.metrics).sort(([, a], [, b]) => a.rmse - b.rmse)[0]?.[0] ?? null;
  }, [summary]);

  return (
    <main className="dashboard">
      <section className="hero-panel">
        <div className="hero-content">
          <span className="hero-badge">{t('dashboard.badge')}</span>
          <h1>{t('app.title')}</h1>
          <p>{t('app.subtitle')}</p>

          <div className="hero-actions">
            <a href="#forecast" className="primary-link">
              {t('forecast.compareModels')}
            </a>
            <a href="#metrics" className="secondary-link">
              {t('metrics.title')}
            </a>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-icon">🌱</div>
          <h2>{t('dashboard.quickStatsTitle')}</h2>

          <div className="stat-row">
            <span>{t('dashboard.products')}</span>
            <strong>{products.length}</strong>
          </div>

          <div className="stat-row">
            <span>{t('dashboard.models')}</span>
            <strong>{summary?.models.length ?? 3}</strong>
          </div>

          <div className="stat-row">
            <span>{t('dashboard.horizon')}</span>
            <strong>
              {horizon} {t('dashboard.months')}
            </strong>
          </div>

          {bestModel && (
            <div className="best-model">
              <span>Modelo destacado</span>
              <strong>{bestModel.toUpperCase()}</strong>
            </div>
          )}
        </div>
      </section>

      <section className="insight-card">
        <div>
          <span className="section-kicker">{t('dashboard.insightTitle')}</span>
          <p>{t('dashboard.insightText')}</p>
        </div>
      </section>

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
          onSubmit={handleCompare}
        />
      </div>

      <PredictionChart data={prediction} />

      <div id="metrics">
        {summary && <MetricsCards metrics={summary.metrics} />}
      </div>
    </main>
  );
}