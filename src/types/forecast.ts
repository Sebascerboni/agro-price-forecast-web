export interface ProductSummary {
    product_id: string;
    models: string[];
    provinces: string[];
    metrics: Record<string, ModelMetrics>;
  }
  
  export interface ModelMetrics {
    mae: number;
    rmse: number;
    mape: number;
    r2: number;
    directional_accuracy: number;
    n_test: number;
  }
  
  export interface PredictionPoint {
    period: number;
    y_pred: number;
  }
  
  export interface ComparePredictionRequest {
    product_id: string;
    province: string;
    horizon: number;
  }
  
  export interface HistoricalPoint {
    date: string;
    price: number;
  }
  
  export interface ModelInsight {
    model_name: string;
    first_prediction: number;
    last_prediction: number;
    absolute_change: number;
    percentage_change: number;
    trend: 'up' | 'down' | 'stable';
  }
  
  export interface ComparePredictionResponse {
    product_id: string;
    province: string;
    horizon: number;
    unit: string;
    last_observed_date: string;
    current_price: number;
    best_model: string | null;
    predictions: Record<string, PredictionPoint[]>;
    historical: HistoricalPoint[];
    insights: Record<string, ModelInsight>;
    pending_models: string[];
  }