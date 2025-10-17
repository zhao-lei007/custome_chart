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

// ==================== 广告数据集字段 ====================
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

// ==================== 销售数据集字段 ====================
export const SALES_DIMENSIONS: Field[] = [
  { id: 'date', name: '日期', dataType: 'date', description: '销售日期', type:'dimension' },
  { id: 'region', name: '地区', dataType: 'string', description: '销售区域', type:'dimension' },
  { id: 'product_category', name: '产品类别', dataType: 'string', description: '产品分类', type:'dimension' },
  { id: 'quarter', name: '季度', dataType: 'string', description: '销售季度', type:'dimension' },
  { id: 'salesperson', name: '销售员', dataType: 'string', description: '销售人员姓名', type:'dimension' },
]

export const SALES_METRICS: Field[] = [
  { id: 'revenue', name: '销售额', dataType: 'number', description: '总销售收入', aggregation: 'sum', type:'metric' },
  { id: 'units_sold', name: '销量', dataType: 'number', description: '销售数量', aggregation: 'sum', type:'metric' },
  { id: 'profit', name: '利润', dataType: 'number', description: '净利润', aggregation: 'sum', type:'metric' },
  { id: 'growth_rate', name: '增长率', dataType: 'number', description: '同比增长率(%)', aggregation: 'avg', type:'metric' },
]

// ==================== 网站流量数据集字段 ====================
export const WEB_DIMENSIONS: Field[] = [
  { id: 'date', name: '日期', dataType: 'date', description: '访问日期', type:'dimension' },
  { id: 'traffic_source', name: '流量来源', dataType: 'string', description: '访问来源渠道', type:'dimension' },
  { id: 'device_type', name: '设备类型', dataType: 'string', description: '访问设备', type:'dimension' },
  { id: 'page_category', name: '页面类别', dataType: 'string', description: '页面分类', type:'dimension' },
]

export const WEB_METRICS: Field[] = [
  { id: 'page_views', name: '页面浏览量', dataType: 'number', description: '总页面浏览次数', aggregation: 'sum', type:'metric' },
  { id: 'unique_visitors', name: '独立访客', dataType: 'number', description: '独立访客数', aggregation: 'sum', type:'metric' },
  { id: 'bounce_rate', name: '跳出率', dataType: 'number', description: '跳出率(%)', aggregation: 'avg', type:'metric' },
  { id: 'avg_duration', name: '平均停留时间', dataType: 'number', description: '平均停留时间(秒)', aggregation: 'avg', type:'metric' },
]

// ==================== 客户满意度数据集字段 ====================
export const SATISFACTION_DIMENSIONS: Field[] = [
  { id: 'date', name: '日期', dataType: 'date', description: '调查日期', type:'dimension' },
  { id: 'department', name: '部门', dataType: 'string', description: '服务部门', type:'dimension' },
  { id: 'survey_month', name: '调查月份', dataType: 'date', description: '调查时间', type:'dimension' },
  { id: 'customer_segment', name: '客户类型', dataType: 'string', description: '客户细分', type:'dimension' },
]

export const SATISFACTION_METRICS: Field[] = [
  { id: 'satisfaction_score', name: '满意度评分', dataType: 'number', description: '客户满意度(1-10)', aggregation: 'avg', type:'metric' },
  { id: 'response_time', name: '响应时间', dataType: 'number', description: '平均响应时间(分钟)', aggregation: 'avg', type:'metric' },
  { id: 'resolution_rate', name: '解决率', dataType: 'number', description: '问题解决率(%)', aggregation: 'avg', type:'metric' },
  { id: 'nps_score', name: 'NPS分数', dataType: 'number', description: '净推荐值(-100~100)', aggregation: 'avg', type:'metric' },
  { id: 'repeat_rate', name: '复购率', dataType: 'number', description: '客户复购率(%)', aggregation: 'avg', type:'metric' },
]

// ==================== 地理销售数据集字段 ====================
export const GEO_DIMENSIONS: Field[] = [
  { id: 'date', name: '日期', dataType: 'date', description: '统计日期', type:'dimension' },
  { id: 'province', name: '省份', dataType: 'string', description: '省份名称', type:'dimension' },
  { id: 'city', name: '城市', dataType: 'string', description: '城市名称', type:'dimension' },
  { id: 'store_type', name: '门店类型', dataType: 'string', description: '门店类别', type:'dimension' },
]

export const GEO_METRICS: Field[] = [
  { id: 'store_count', name: '门店数量', dataType: 'number', description: '门店总数', aggregation: 'sum', type:'metric' },
  { id: 'total_sales', name: '总销售额', dataType: 'number', description: '区域总销售额', aggregation: 'sum', type:'metric' },
  { id: 'employee_count', name: '员工数', dataType: 'number', description: '员工总数', aggregation: 'sum', type:'metric' },
  { id: 'avg_order_value', name: '平均订单价值', dataType: 'number', description: '平均订单金额', aggregation: 'avg', type:'metric' },
]

// ==================== 产品目录数据集字段 ====================
export const PRODUCT_DIMENSIONS: Field[] = [
  { id: 'date', name: '日期', dataType: 'date', description: '销售日期', type:'dimension' },
  { id: 'product_name', name: '产品名称', dataType: 'string', description: '产品名', type:'dimension' },
  { id: 'category', name: '类别', dataType: 'string', description: '产品类别', type:'dimension' },
  { id: 'brand', name: '品牌', dataType: 'string', description: '品牌名称', type:'dimension' },
  { id: 'price_range', name: '价格区间', dataType: 'string', description: '价格分级', type:'dimension' },
]

export const PRODUCT_METRICS: Field[] = [
  { id: 'sales_volume', name: '销量', dataType: 'number', description: '产品销量', aggregation: 'sum', type:'metric' },
  { id: 'revenue', name: '收入', dataType: 'number', description: '产品收入', aggregation: 'sum', type:'metric' },
  { id: 'rating', name: '评分', dataType: 'number', description: '用户评分(1-5)', aggregation: 'avg', type:'metric' },
  { id: 'review_count', name: '评论数', dataType: 'number', description: '评论总数', aggregation: 'sum', type:'metric' },
  { id: 'return_rate', name: '退货率', dataType: 'number', description: '退货率(%)', aggregation: 'avg', type:'metric' },
]

// ==================== 营销漏斗数据集字段 ====================
export const FUNNEL_DIMENSIONS: Field[] = [
  { id: 'date', name: '日期', dataType: 'date', description: '统计日期', type:'dimension' },
  { id: 'funnel_stage', name: '漏斗阶段', dataType: 'string', description: '转化漏斗阶段', type:'dimension' },
  { id: 'campaign', name: '营销活动', dataType: 'string', description: '活动名称', type:'dimension' },
  { id: 'channel', name: '渠道', dataType: 'string', description: '营销渠道', type:'dimension' },
]

export const FUNNEL_METRICS: Field[] = [
  { id: 'user_count', name: '用户数', dataType: 'number', description: '阶段用户数', aggregation: 'sum', type:'metric' },
  { id: 'conversion_rate', name: '转化率', dataType: 'number', description: '转化率(%)', aggregation: 'avg', type:'metric' },
  { id: 'cost', name: '成本', dataType: 'number', description: '营销成本', aggregation: 'sum', type:'metric' },
  { id: 'roi', name: 'ROI', dataType: 'number', description: '投资回报率(%)', aggregation: 'avg', type:'metric' },
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

// ==================== 数据生成函数 ====================
function generateSalesData() {
  const regions = ['华北', '华东', '华南', '西南', '东北']
  const categories = ['电子产品', '服装', '食品', '家居', '图书']
  const quarters = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4']
  const salespeople = ['张伟', '李娜', '王强', '刘敏', '陈杰']

  const data = []
  const startDate = new Date('2024-01-01')
  for(let day = 0; day < 120; day++) {
    const date = new Date(startDate.getTime() + day * 86400000)
    const dateStr = date.toISOString().split('T')[0]
    const region = regions[Math.floor(Math.random() * regions.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const quarter = quarters[Math.floor(day / 30)]
    const salesperson = salespeople[Math.floor(Math.random() * salespeople.length)]

    data.push({
      date: dateStr,
      region, product_category: category, quarter, salesperson,
      revenue: Math.floor(Math.random() * 500000) + 100000,
      units_sold: Math.floor(Math.random() * 5000) + 500,
      profit: Math.floor(Math.random() * 150000) + 30000,
      growth_rate: parseFloat((Math.random() * 40 - 10).toFixed(2))
    })
  }
  return data
}

function generateWebTrafficData() {
  const sources = ['直接访问', '搜索引擎', '社交媒体', '广告推广']
  const devices = ['桌面', '移动', '平板']
  const pages = ['首页', '产品页', '博客', '关于']

  const data = []
  const startDate = new Date('2024-07-01')
  for(let day = 0; day < 90; day++) {
    const date = new Date(startDate.getTime() + day * 86400000)
    const dateStr = date.toISOString().split('T')[0]

    for(const source of sources) {
      const device = devices[Math.floor(Math.random() * devices.length)]
      const page = pages[Math.floor(Math.random() * pages.length)]
      data.push({
        date: dateStr, traffic_source: source, device_type: device, page_category: page,
        page_views: Math.floor(Math.random() * 10000) + 1000,
        unique_visitors: Math.floor(Math.random() * 3000) + 500,
        bounce_rate: parseFloat((Math.random() * 50 + 20).toFixed(2)),
        avg_duration: Math.floor(Math.random() * 300) + 60
      })
    }
  }
  return data
}

function generateSatisfactionData() {
  const departments = ['销售部', '技术支持', '产品部', '售后服务', '客户成功']
  const segments = ['企业客户', '个人客户', '教育机构']

  const data = []
  const startDate = new Date('2024-01-01')

  // 生成90天的数据，每天都有调查记录
  for(let day = 0; day < 90; day++) {
    const date = new Date(startDate.getTime() + day * 86400000)
    const dateStr = date.toISOString().split('T')[0]
    const monthStr = `2024-${String(date.getMonth() + 1).padStart(2, '0')}`

    // 每天随机选择一些部门和客户类型组合
    const dept = departments[Math.floor(Math.random() * departments.length)]
    const segment = segments[Math.floor(Math.random() * segments.length)]

    data.push({
      date: dateStr,
      department: dept,
      survey_month: monthStr,
      customer_segment: segment,
      satisfaction_score: parseFloat((Math.random() * 3 + 7).toFixed(1)),
      response_time: parseFloat((Math.random() * 30 + 5).toFixed(1)),
      resolution_rate: parseFloat((Math.random() * 20 + 75).toFixed(2)),
      nps_score: Math.floor(Math.random() * 70 + 20),
      repeat_rate: parseFloat((Math.random() * 30 + 60).toFixed(2))
    })
  }
  return data
}

function generateGeoData() {
  const provinces = [
    {province: '北京', city: '北京'},
    {province: '上海', city: '上海'},
    {province: '广东', city: '广州'}, {province: '广东', city: '深圳'},
    {province: '浙江', city: '杭州'}, {province: '浙江', city: '宁波'},
    {province: '江苏', city: '南京'}, {province: '江苏', city: '苏州'},
    {province: '四川', city: '成都'},
    {province: '湖北', city: '武汉'},
    {province: '陕西', city: '西安'},
    {province: '辽宁', city: '沈阳'}, {province: '辽宁', city: '大连'},
    {province: '山东', city: '青岛'}, {province: '山东', city: '济南'},
    {province: '福建', city: '福州'}, {province: '福建', city: '厦门'},
    {province: '河北', city: '石家庄'},
    {province: '河南', city: '郑州'},
    {province: '湖南', city: '长沙'},
    {province: '安徽', city: '合肥'},
    {province: '重庆', city: '重庆'},
    {province: '天津', city: '天津'},
  ]
  const storeTypes = ['旗舰店', '标准店', '便利店']

  const data = []
  const startDate = new Date('2024-01-01')
  for(let day = 0; day < 90; day++) {
    const date = new Date(startDate.getTime() + day * 86400000)
    const dateStr = date.toISOString().split('T')[0]
    const {province, city} = provinces[Math.floor(Math.random() * provinces.length)]
    const storeType = storeTypes[Math.floor(Math.random() * storeTypes.length)]

    data.push({
      date: dateStr,
      province, city, store_type: storeType,
      store_count: Math.floor(Math.random() * 50) + 5,
      total_sales: Math.floor(Math.random() * 5000000) + 500000,
      employee_count: Math.floor(Math.random() * 200) + 20,
      avg_order_value: parseFloat((Math.random() * 300 + 100).toFixed(2))
    })
  }
  return data
}

function generateProductData() {
  const products = [
    '智能手机', '笔记本电脑', '平板电脑', '智能手表', '无线耳机',
    '机械键盘', '电竞鼠标', '显示器', '移动电源', '充电器',
    '休闲T恤', '运动鞋', '牛仔裤', '连衣裙', '商务衬衫',
    '有机大米', '橄榄油', '坚果礼盒', '茶叶', '咖啡豆',
    '沙发', '床垫', '书桌', '台灯', '收纳柜',
    '编程入门', '商业管理', '历史小说', '科幻小说', '儿童绘本',
    '空气净化器', '扫地机器人', '洗碗机', '电饭煲', '榨汁机',
    '瑜伽垫', '哑铃套装', '跑步机', '健身球', '跳绳',
    '护肤套装', '香水', '化妆刷', '面膜', '洗发水',
    '玩具积木', '遥控汽车', '益智拼图', '毛绒玩具', '芭比娃娃'
  ]
  const categories = ['数码', '家电', '服饰', '食品', '家居', '图书', '运动', '美妆', '玩具']
  const brands = ['品牌A', '品牌B', '品牌C', '品牌D', '品牌E']
  const priceRanges = ['经济型', '中端', '高端']

  const data = []
  const startDate = new Date('2024-01-01')
  for(let day = 0; day < 90; day++) {
    const date = new Date(startDate.getTime() + day * 86400000)
    const dateStr = date.toISOString().split('T')[0]
    const product = products[Math.floor(Math.random() * products.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const brand = brands[Math.floor(Math.random() * brands.length)]
    const priceRange = priceRanges[Math.floor(Math.random() * priceRanges.length)]

    data.push({
      date: dateStr,
      product_name: product, category, brand, price_range: priceRange,
      sales_volume: Math.floor(Math.random() * 10000) + 500,
      revenue: Math.floor(Math.random() * 500000) + 50000,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      review_count: Math.floor(Math.random() * 5000) + 100,
      return_rate: parseFloat((Math.random() * 10 + 1).toFixed(2))
    })
  }
  return data
}

function generateFunnelData() {
  const stages = ['曝光', '点击', '注册', '试用', '付费', '续费']
  const campaigns = ['春季促销', '618大促', '双十一', '年终大促']
  const channels = ['搜索广告', '社交媒体', '展示广告', '邮件营销']

  const data = []
  const startDate = new Date('2024-01-01')
  for(let day = 0; day < 120; day++) {
    const date = new Date(startDate.getTime() + day * 86400000)
    const dateStr = date.toISOString().split('T')[0]
    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)]
    const channel = channels[Math.floor(Math.random() * channels.length)]
    const stage = stages[Math.floor(Math.random() * stages.length)]
    const convRate = parseFloat((Math.random() * 30 + 40).toFixed(2))

    data.push({
      date: dateStr,
      funnel_stage: stage, campaign, channel,
      user_count: Math.floor(Math.random() * 100000) + 10000,
      conversion_rate: convRate,
      cost: Math.floor(Math.random() * 50000) + 10000,
      roi: parseFloat((Math.random() * 200 + 50).toFixed(2))
    })
  }
  return data
}

export function ensureInit(){
  if(!localStorage.getItem(STORAGE_KEYS.DATASETS)){
    const datasets = [
      {
        id:'ads_basic',
        name:'广告基础数据',
        description:'广告投放效果数据',
        fields:[...DIMENSION_FIELDS, ...METRIC_FIELDS],
        lastModified:new Date().toISOString(),
        category:'营销',
        rows: SAMPLE_QUERY_DATA
      },
      {
        id:'sales_performance',
        name:'销售业绩数据',
        description:'多维度销售业绩分析数据',
        fields:[...SALES_DIMENSIONS, ...SALES_METRICS],
        lastModified:new Date().toISOString(),
        category:'销售',
        rows: generateSalesData()
      },
      {
        id:'web_traffic',
        name:'网站流量数据',
        description:'网站访问流量统计数据',
        fields:[...WEB_DIMENSIONS, ...WEB_METRICS],
        lastModified:new Date().toISOString(),
        category:'运营',
        rows: generateWebTrafficData()
      },
      {
        id:'customer_satisfaction',
        name:'客户满意度数据',
        description:'客户满意度调查数据',
        fields:[...SATISFACTION_DIMENSIONS, ...SATISFACTION_METRICS],
        lastModified:new Date().toISOString(),
        category:'客服',
        rows: generateSatisfactionData()
      },
      {
        id:'geo_sales',
        name:'地理销售数据',
        description:'各省市销售分布数据',
        fields:[...GEO_DIMENSIONS, ...GEO_METRICS],
        lastModified:new Date().toISOString(),
        category:'销售',
        rows: generateGeoData()
      },
      {
        id:'product_catalog',
        name:'产品目录数据',
        description:'产品销售与评价数据',
        fields:[...PRODUCT_DIMENSIONS, ...PRODUCT_METRICS],
        lastModified:new Date().toISOString(),
        category:'产品',
        rows: generateProductData()
      },
      {
        id:'marketing_funnel',
        name:'营销漏斗数据',
        description:'营销转化漏斗数据',
        fields:[...FUNNEL_DIMENSIONS, ...FUNNEL_METRICS],
        lastModified:new Date().toISOString(),
        category:'营销',
        rows: generateFunnelData()
      }
    ]
    storage.save(STORAGE_KEYS.DATASETS, datasets)
  }
  if(!localStorage.getItem(STORAGE_KEYS.CHARTS)) storage.save(STORAGE_KEYS.CHARTS, [])
}

export function uid(prefix='id'){ return `${prefix}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}` }

export function getCharts(){ return storage.load<Chart[]>(STORAGE_KEYS.CHARTS, []) }
export function saveChart(c: Chart){ storage.upsertById<Chart>(STORAGE_KEYS.CHARTS, c) }
export function removeChart(id: string){ return storage.removeById(STORAGE_KEYS.CHARTS, id) }

export function getAllDatasets(){
  return storage.load<any[]>(STORAGE_KEYS.DATASETS, [])
}

export function getDatasetById(id: string){
  const datasets = storage.load<any[]>(STORAGE_KEYS.DATASETS, [])
  return datasets.find(d=>d.id===id)
}

export function runLocalQuery({ dataset, dimensions, metrics, rows: inputRows }: {dataset:string; dimensions:QueryField[]; metrics:QueryField[]; rows?: any[]}){
  const ds = getDatasetById(dataset)
  const rows = inputRows || ds?.rows || []
  if(dimensions?.length===1 && metrics?.length===1){
    const dim = dimensions[0].field.id
    const met = metrics[0].field.id
    const agg = metrics[0].aggregation || 'sum'

    // 按维度分组聚合数据
    const grouped = new Map<string, number[]>()
    rows.forEach((r: any) => {
      const key = r[dim]
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      const val = Number(r[met])
      if (!isNaN(val)) {
        grouped.get(key)!.push(val)
      }
    })

    // 根据聚合类型计算结果
    return Array.from(grouped.entries()).map(([name, values]) => {
      let value = 0
      if (values.length > 0) {
        switch(agg) {
          case 'sum':
            value = values.reduce((a, b) => a + b, 0)
            break
          case 'avg':
            value = values.reduce((a, b) => a + b, 0) / values.length
            break
          case 'max':
            value = Math.max(...values)
            break
          case 'min':
            value = Math.min(...values)
            break
          case 'count':
            value = values.length
            break
          default:
            value = values.reduce((a, b) => a + b, 0)
        }
      }
      return { name, value }
    })
  }
  return rows
}

