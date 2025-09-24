// Shared utilities, storage, and preset data for Custom Charts
// All data persists in localStorage. No network requests.

export const STORAGE_KEYS = {
  DATASETS: 'bi_datasets',
  CHARTS: 'bi_user_queries', // list of saved charts (Query + metadata)
  UI_PREFS: 'bi_ui_preferences',
};

export const storage = {
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  load(key, def = null) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : def;
    } catch (e) {
      console.error('storage.load error', key, e);
      return def;
    }
  },
  pushToList(key, item) {
    const list = storage.load(key, []);
    list.push(item);
    storage.save(key, list);
    return list;
  },
  upsertInListById(key, item) {
    const list = storage.load(key, []);
    const idx = list.findIndex((x) => x.id === item.id);
    if (idx >= 0) list[idx] = item; else list.push(item);
    storage.save(key, list);
    return list;
  },
  removeFromListById(key, id) {
    const list = storage.load(key, []);
    const next = list.filter((x) => x.id !== id);
    storage.save(key, next);
    return next;
  },
};

// ---------- Preset dataset fields (from PRD Appendix A) ----------
export const DIMENSION_FIELDS = [
  { id: 'date', name: '日期', dataType: 'date', description: '广告投放日期' },
  { id: 'advertiser_name', name: '广告主名称', dataType: 'string', description: '广告主账户名称' },
];

export const METRIC_FIELDS = [
  { id: 'impressions', name: '展示数', dataType: 'number', description: '广告展示次数', aggregation: 'sum' },
  { id: 'clicks', name: '点击数', dataType: 'number', description: '广告点击次数', aggregation: 'sum' },
  { id: 'cost', name: '消耗', dataType: 'number', description: '广告消耗金额', aggregation: 'sum' },
];

export const SAMPLE_QUERY_DATA = [
  { date: '2025-09-23', impressions: 125430, clicks: 3421, cost: 2156.78 },
  { date: '2025-09-22', impressions: 118920, clicks: 3156, cost: 1987.45 },
  { date: '2025-09-21', impressions: 99012, clicks: 2850, cost: 1655.10 },
  { date: '2025-09-20', impressions: 105331, clicks: 3012, cost: 1788.35 },
];

export function ensureInit() {
  // datasets
  if (!storage.load(STORAGE_KEYS.DATASETS)) {
    const ds = [{
      id: 'ads_basic',
      name: '广告基础数据',
      description: '用于演示的广告投放数据',
      fields: [...DIMENSION_FIELDS, ...METRIC_FIELDS],
      lastModified: new Date().toISOString(),
      category: 'demo',
      rows: SAMPLE_QUERY_DATA,
    }];
    storage.save(STORAGE_KEYS.DATASETS, ds);
  }
  // charts list
  if (!storage.load(STORAGE_KEYS.CHARTS)) {
    storage.save(STORAGE_KEYS.CHARTS, []);
  }
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

// Query run (very light: filter/sort omitted for MVP)
export function runLocalQuery({ dataset, dimensions, metrics }) {
  const datasets = storage.load(STORAGE_KEYS.DATASETS, []);
  const ds = datasets.find((d) => d.id === dataset);
  if (!ds) return [];
  const rows = ds.rows || [];
  // For MVP: if single dimension + single metric, return series-ready arrays
  if (dimensions?.length === 1 && metrics?.length === 1) {
    const dim = dimensions[0].field.id;
    const met = metrics[0].field.id;
    return rows.map((r) => ({ name: r[dim], value: Number(r[met]) || 0 }));
  }
  return rows;
}

export function saveChart(chart) {
  chart.updatedAt = new Date().toISOString();
  const charts = storage.load(STORAGE_KEYS.CHARTS, []);
  const i = charts.findIndex((c) => c.id === chart.id);
  if (i >= 0) charts[i] = chart; else charts.push(chart);
  storage.save(STORAGE_KEYS.CHARTS, charts);
}

export function getCharts() {
  return storage.load(STORAGE_KEYS.CHARTS, []);
}

export function getDatasetById(id) {
  const datasets = storage.load(STORAGE_KEYS.DATASETS, []);
  return datasets.find((d) => d.id === id);
}

