export const STORAGE_KEYS = {
  DATASETS: 'bi_datasets',
  CHARTS: 'bi_user_queries',
  UI_PREFS: 'bi_ui_preferences',
} as const

export type Field = {
  id: string
  name: string
  dataType: 'string'|'number'|'date'|'boolean'
  description?: string
  aggregation?: 'sum'|'count'|'avg'|'max'|'min'
  type?: 'dimension'|'metric'
}

export type QueryField = { field: Field; aggregation?: Field['aggregation'] }

export type Query = {
  dataset: string
  dimensions: QueryField[]
  metrics: QueryField[]
  filters: any[]
  config: any
}

export type Chart = {
  id: string
  name: string
  creator?: string
  createdAt: string
  updatedAt: string
  dataSource: string
  publishStatus: 'draft'|'published'
  chartType: string
  tags: string[]
  order: number
  query: Query
  config: any
  previewImage?: string|null
}

export const DIMENSION_FIELDS: Field[] = [
  { id: 'date', name: '日期', dataType: 'date', description: '广告投放日期', type:'dimension' },
  { id: 'advertiser_name', name: '广告主名称', dataType: 'string', description: '广告主账户名称', type:'dimension' },
]

export const METRIC_FIELDS: Field[] = [
  { id: 'impressions', name: '展示数', dataType: 'number', description: '广告展示次数', aggregation: 'sum', type:'metric' },
  { id: 'clicks', name: '点击数', dataType: 'number', description: '广告点击次数', aggregation: 'sum', type:'metric' },
  { id: 'cost', name: '消耗', dataType: 'number', description: '广告消耗金额', aggregation: 'sum', type:'metric' },
]

export const SAMPLE_QUERY_DATA = [
  { date: '2025-09-23', impressions: 125430, clicks: 3421, cost: 2156.78 },
  { date: '2025-09-22', impressions: 118920, clicks: 3156, cost: 1987.45 },
  { date: '2025-09-21', impressions: 99012, clicks: 2850, cost: 1655.10 },
  { date: '2025-09-20', impressions: 105331, clicks: 3012, cost: 1788.35 },
]

export const storage = {
  save<T>(key: string, data: T){ localStorage.setItem(key, JSON.stringify(data)) },
  load<T>(key: string, def: T): T { try{ const v = localStorage.getItem(key); return v? JSON.parse(v): def }catch(e){ return def } },
  upsertById<T extends {id:string}>(key: string, item: T){
    const list = storage.load<T[]>(key, [] as T[])
    const i = list.findIndex(x=>x.id===item.id)
    if(i>=0) list[i]=item; else list.push(item)
    storage.save(key, list)
    return list
  },
  removeById(key: string, id: string){
    const list = storage.load<any[]>(key, [])
    const next = list.filter(x=>x.id!==id)
    storage.save(key,next)
    return next
  }
}

export function ensureInit(){
  if(!localStorage.getItem(STORAGE_KEYS.DATASETS)){
    const ds = [{ id:'ads_basic', name:'广告基础数据', description:'演示数据集',
      fields:[...DIMENSION_FIELDS, ...METRIC_FIELDS], lastModified:new Date().toISOString(), category:'demo', rows: SAMPLE_QUERY_DATA }]
    storage.save(STORAGE_KEYS.DATASETS, ds)
  }
  if(!localStorage.getItem(STORAGE_KEYS.CHARTS)) storage.save(STORAGE_KEYS.CHARTS, [])
}

export function uid(prefix='id'){ return `${prefix}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}` }

export function getCharts(){ return storage.load<Chart[]>(STORAGE_KEYS.CHARTS, []) }
export function saveChart(c: Chart){ storage.upsertById<Chart>(STORAGE_KEYS.CHARTS, c) }
export function removeChart(id: string){ return storage.removeById(STORAGE_KEYS.CHARTS, id) }

export function getDatasetById(id: string){
  const datasets = storage.load<any[]>(STORAGE_KEYS.DATASETS, [])
  return datasets.find(d=>d.id===id)
}

export function runLocalQuery({ dataset, dimensions, metrics }: {dataset:string; dimensions:QueryField[]; metrics:QueryField[]}){
  const ds = getDatasetById(dataset)
  const rows = ds?.rows || []
  if(dimensions?.length===1 && metrics?.length===1){
    const dim = dimensions[0].field.id
    const met = metrics[0].field.id
    return rows.map((r:any)=> ({ name: r[dim], value: Number(r[met])||0 }))
  }
  return rows
}

