# Agro Price Forecast Platform

Sistema de predicción de precios agrícolas para productos estratégicos del Ecuador utilizando modelos de Machine Learning y Series Temporales.

## Descripción

Este proyecto implementa una plataforma web para la predicción de precios agrícolas basada en tres enfoques de modelado:

* ARIMA/SARIMAX
* LSTM (Long Short-Term Memory)
* XGBoost

La aplicación permite comparar el comportamiento de los modelos para distintos productos agrícolas y provincias del Ecuador, facilitando el análisis de tendencias y la toma de decisiones basada en datos.

Actualmente se encuentran disponibles los siguientes productos:

* Maracuyá
* Papa Superchola
* Tomate Riñón de Invernadero

---

# Arquitectura General

El proyecto está dividido en dos repositorios independientes:

## Backend

Repositorio FastAPI encargado de:

* Exponer los servicios REST
* Cargar modelos entrenados
* Ejecutar inferencias
* Comparar resultados de modelos
* Proveer métricas de evaluación

### Tecnologías

* Python 3.11
* FastAPI
* Uvicorn
* TensorFlow
* XGBoost
* Statsmodels
* Scikit-Learn
* Pandas
* NumPy
* Docker

---

## Frontend

Repositorio React encargado de:

* Interfaz de usuario
* Visualización de predicciones
* Comparación de modelos
* Presentación de métricas
* Consumo de APIs

### Tecnologías

* React
* TypeScript
* Vite
* Axios
* Recharts
* i18next
* react-i18next

---

# Modelos Implementados

## ARIMA / SARIMAX

Modelo estadístico para series temporales.

Características:

* Entrenamiento por provincia.
* Modelos independientes para cada provincia.
* Pronóstico basado únicamente en la evolución histórica del precio.

Ubicación:

```text
models/<producto>/arima/
```

---

## LSTM

Red neuronal recurrente especializada en series temporales.

Características:

* Ventanas temporales de observación.
* Uso de variables económicas, agrícolas y temporales.
* Escalado de variables mediante MinMaxScaler.

Ubicación:

```text
models/<producto>/lstm/
```

Archivos:

```text
model.keras
feature_scaler.joblib
target_scaler.joblib
training_metadata.json
```

---

## XGBoost

Modelo de Gradient Boosting para regresión.

Características:

* Variables económicas.
* Variables temporales.
* Variables de producción agrícola.
* Variables de fertilizantes.
* Variables macroeconómicas.

Ubicación:

```text
models/<producto>/xgboost/
```

---

# Dataset Utilizado

Los modelos fueron entrenados utilizando variables provenientes de:

* Precios mayoristas
* Precios al productor
* Fertilizantes
* IPC alimentos
* Inflación
* Índices sectoriales

Archivos procesados:

```text
data/processed/
```

Cada producto contiene:

```text
dataset_features.csv
metadata_features.json
```

---

# Funcionalidades Implementadas

## Consulta de Productos

Permite obtener los productos disponibles.

Endpoint:

```http
GET /products
```

---

## Consulta de Resumen

Permite obtener:

* Provincias disponibles
* Modelos disponibles
* Métricas históricas

Endpoint:

```http
GET /products/{product_id}/summary
```

---

## Predicción Individual

Permite ejecutar un modelo específico.

Endpoint:

```http
POST /predict
```

Ejemplo:

```json
{
  "product_id": "papa_superchola",
  "model_name": "xgboost",
  "province": "Pichincha",
  "horizon": 3
}
```

---

## Comparación de Modelos

Permite ejecutar simultáneamente:

* ARIMA
* LSTM
* XGBoost

Endpoint:

```http
POST /predict/compare
```

Ejemplo:

```json
{
  "product_id": "papa_superchola",
  "province": "Pichincha",
  "horizon": 3
}
```

---

# Métricas de Evaluación

Los modelos son evaluados mediante:

* MAE
* RMSE
* MAPE
* R²
* Directional Accuracy

Estas métricas se visualizan directamente en el dashboard.

---

# Frontend

## Características

### Dashboard Analítico

Permite:

* Selección de producto
* Selección de provincia
* Selección de horizonte de predicción

### Comparación de Modelos

Visualización simultánea de:

* ARIMA
* LSTM
* XGBoost

### Métricas Comparativas

Visualización de desempeño histórico por modelo.

### Internacionalización

Implementado mediante:

```text
i18next
react-i18next
```

Actualmente:

```text
Español
```

Preparado para:

```text
Inglés
```

---

# Ejecución Local

## Backend

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Ejecutar:

```bash
uvicorn app.main:app --reload
```

Swagger:

```text
http://localhost:8000/docs
```

---

## Frontend

Instalar dependencias:

```bash
npm install
```

Ejecutar:

```bash
npm run dev
```

Aplicación:

```text
http://localhost:5173
```

---

# Docker

## Backend

Construir:

```bash
docker compose up --build
```

Verificar:

```bash
http://localhost:8000/docs
```

---

# Variables de Entorno

## Backend

```env
ALLOWED_ORIGINS=http://localhost:5173
```

Producción:

```env
ALLOWED_ORIGINS=https://frontend-domain.com
```

---

## Frontend

```env
VITE_API_URL=http://localhost:8000
```

Producción:

```env
VITE_API_URL=https://backend-domain.com
```

---

# Estructura del Proyecto

## Backend

```text
app/
├── core/
├── schemas/
├── services/
├── utils/
├── main.py

models/
data/
```

---

## Frontend

```text
src/
├── api/
├── components/
├── i18n/
├── pages/
├── types/
├── App.tsx
├── main.tsx
```

---

# Objetivo Académico

Este proyecto forma parte de una investigación de Maestría enfocada en la aplicación de técnicas de Inteligencia Artificial y análisis predictivo para la estimación de precios agrícolas en Ecuador.

La plataforma busca proporcionar una herramienta de apoyo para productores, investigadores y tomadores de decisiones mediante la comparación de diferentes enfoques predictivos y la visualización de resultados de manera intuitiva.
