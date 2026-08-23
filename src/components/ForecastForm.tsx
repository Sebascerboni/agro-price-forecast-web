import { useTranslation } from 'react-i18next';

interface ForecastFormProps {
  products: string[];
  provinces: string[];
  selectedProduct: string;
  selectedProvince: string;
  horizon: number;
  loading: boolean;
  onProductChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onHorizonChange: (value: number) => void;
  onSubmit: () => void;
}

export function ForecastForm({
  products,
  provinces,
  selectedProduct,
  selectedProvince,
  horizon,
  loading,
  onProductChange,
  onProvinceChange,
  onHorizonChange,
  onSubmit,
}: ForecastFormProps) {
  const { t } = useTranslation();

  return (
    <section className="card forecast-card">
      <div className="card-heading">
        <span className="section-kicker">{t('forecast.sectionLabel')}</span>

        <h2>{t('forecast.title')}</h2>

        <p className="forecast-description">
          {t('forecast.description')}
        </p>
      </div>

      <div className="form-grid">
        <label className="field">
          <span className="field-label">
            {t('forecast.product')}

            <span
              className="info-tooltip"
              tabIndex={0}
              aria-label={t('forecast.productHelp')}
            >
              <span className="info-icon" aria-hidden="true">
                i
              </span>

              <span className="tooltip-content" role="tooltip">
                {t('forecast.productHelp')}
              </span>
            </span>
          </span>

          <select
            value={selectedProduct}
            onChange={(event) => onProductChange(event.target.value)}
          >
            {products.map((product) => (
              <option key={product} value={product}>
                {product.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">
            {t('forecast.province')}

            <span
              className="info-tooltip"
              tabIndex={0}
              aria-label={t('forecast.provinceHelp')}
            >
              <span className="info-icon" aria-hidden="true">
                i
              </span>

              <span className="tooltip-content" role="tooltip">
                {t('forecast.provinceHelp')}
              </span>
            </span>
          </span>

          <select
            value={selectedProvince}
            onChange={(event) => onProvinceChange(event.target.value)}
          >
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">
            {t('forecast.period')}

            <span
              className="info-tooltip"
              tabIndex={0}
              aria-label={t('forecast.periodHelp')}
            >
              <span className="info-icon" aria-hidden="true">
                i
              </span>

              <span className="tooltip-content" role="tooltip">
                {t('forecast.periodHelp')}
              </span>
            </span>
          </span>

          <select
            value={horizon}
            onChange={(event) =>
              onHorizonChange(Number(event.target.value))
            }
          >
            <option value={1}>{t('forecast.oneMonth')}</option>
            <option value={2}>{t('forecast.twoMonths')}</option>
            <option value={3}>{t('forecast.threeMonths')}</option>
          </select>
        </label>
      </div>

      <div className="forecast-action">
        <button
          className="primary-button"
          disabled={loading || !selectedProduct || !selectedProvince}
          onClick={onSubmit}
        >
          {loading ? t('forecast.loading') : t('forecast.generate')}
        </button>

        <p className="forecast-action-hint">
          {t('forecast.actionHint')}
        </p>
      </div>
    </section>
  );
}