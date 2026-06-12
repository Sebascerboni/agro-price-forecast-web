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
        <span className="section-kicker">{t('forecast.parameters')}</span>
        <h2>{t('forecast.compareModels')}</h2>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>{t('forecast.product')}</span>
          <select value={selectedProduct} onChange={(e) => onProductChange(e.target.value)}>
            {products.map((product) => (
              <option key={product} value={product}>
                {product.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t('forecast.province')}</span>
          <select value={selectedProvince} onChange={(e) => onProvinceChange(e.target.value)}>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t('forecast.horizon')}</span>
          <select value={horizon} onChange={(e) => onHorizonChange(Number(e.target.value))}>
            <option value={1}>{t('forecast.oneMonth')}</option>
            <option value={2}>{t('forecast.twoMonths')}</option>
            <option value={3}>{t('forecast.threeMonths')}</option>
          </select>
        </label>
      </div>

      <button className="primary-button" disabled={loading || !selectedProduct || !selectedProvince} onClick={onSubmit}>
        {loading ? t('forecast.loading') : t('forecast.compareModels')}
      </button>
    </section>
  );
}