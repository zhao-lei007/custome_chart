import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import * as echarts from 'echarts'
import ExcelJS from 'exceljs'
import { ensureInit, getCharts, getDatasetById, getAllDatasets, runLocalQuery, saveChart, uid, type QueryField, type Field } from '@/shared/storage'
import '@/styles/editor.css'
import chinaGeoJSON from '@/assets/china.json'

// 维度筛选器类型定义
type DateGranularity = 'day' | 'week' | 'month' | 'quarter' | 'year'

type DateFilterConfig = {
  granularity: DateGranularity
  startDate: string
  endDate: string
  aggregateData: boolean
}

type CategoricalFilterConfig = {
  selectedValues: string[]
  searchTerm: string
}

type DimensionFilter = {
  dimensionId: string
  type: 'date' | 'categorical'
  config: DateFilterConfig | CategoricalFilterConfig
}

// 注册中国地图
echarts.registerMap('china', chinaGeoJSON as any)

ensureInit()

// 图表类型配置
type ChartTypeConfig = {
  value: string
  label: string
  dataRequirement: string
  scenario: string
  validate: (dims: number, mets: number) => boolean
}

const CHART_TYPES: ChartTypeConfig[] = [
  {
    value: 'bar',
    label: '柱状图 (Bar)',
    dataRequirement: '1个或多个维度 + 1个或多个指标',
    scenario: '在不同类别下显示指标值',
    validate: (dims, mets) => dims >= 1 && mets >= 1
  },
  {
    value: 'line',
    label: '折线图 (Line Chart)',
    dataRequirement: '1个或多个维度 + 1个或多个指标',
    scenario: '显示指标随时间的变化',
    validate: (dims, mets) => dims >= 1 && mets >= 1
  },
  {
    value: 'pie',
    label: '饼图 (Pie Chart)',
    dataRequirement: '(1个或多个维度 + 1个指标) 或 (0个维度 + 2个或多个指标)',
    scenario: '显示不同类别的比例',
    validate: (dims, mets) => (dims >= 1 && mets === 1) || (dims === 0 && mets >= 2)
  },
  {
    value: 'table',
    label: '表格 (Table)',
    dataRequirement: '(1个或多个维度 + 0个或多个指标) 或 (0个或多个维度 + 1个或多个指标)',
    scenario: '显示统计数据',
    validate: (dims, mets) => (dims >= 1) || (mets >= 1)
  },
  {
    value: 'pivot-table',
    label: '数据透视表 (Pivot Table)',
    dataRequirement: '(1个或多个维度 + 0个或多个指标) 或 (0个或多个维度 + 1个或多个指标)',
    scenario: '显示统计数据或原始数据',
    validate: (dims, mets) => (dims >= 1) || (mets >= 1)
  },
  {
    value: 'trend-analysis',
    label: '趋势分析表 (Trend Analysis Table)',
    dataRequirement: '1个"day"类型的列日期字段 + 0个或多个行维度 + 1个或多个指标',
    scenario: '根据核心指标按不同日期粒度分析数据聚合，并进一步比较各个指标、查看趋势和计算平均值',
    validate: (dims, mets) => dims >= 1 && mets >= 1
  },
  {
    value: 'okr-table',
    label: 'OKR 表格 (OKR Table)',
    dataRequirement: '1个"day"类型的日期字段 + 0至5个维度 + 1个或多个指标',
    scenario: '在 OKR 周期内核心指标的进度和完成情况',
    validate: (dims, mets) => dims >= 1 && dims <= 6 && mets >= 1
  },
  {
    value: 'raw-data-table',
    label: '原始数据表 (Raw-data Table)',
    dataRequirement: '(1个或多个维度 + 0个或多个指标) 或 (0个或多个维度 + 1个或多个指标)',
    scenario: '显示原始数据',
    validate: (dims, mets) => (dims >= 1) || (mets >= 1)
  },
  {
    value: 'tree-table',
    label: '树形表格 (Tree Table)',
    dataRequirement: '2个或多个维度（按层级顺序） + 1个或多个指标',
    scenario: '按层级结构展示维度交叉分析，支持展开/折叠，显示小计和总计',
    validate: (dims, mets) => dims >= 2 && dims <= 5 && mets >= 1
  },
  {
    value: 'stacked-column',
    label: '堆叠柱状图 (Stacked Column Chart)',
    dataRequirement: '1个或多个维度 + 1个或多个指标',
    scenario: '在不同类别下显示指标值',
    validate: (dims, mets) => dims >= 1 && mets >= 1
  },
  {
    value: 'stacking-bar',
    label: '堆叠条形图 (Stacking Bar Chart)',
    dataRequirement: '1个或多个维度 + 1个或多个指标',
    scenario: '在不同类别下显示指标值',
    validate: (dims, mets) => dims >= 1 && mets >= 1
  },
  {
    value: 'area',
    label: '面积图 (Area Chart)',
    dataRequirement: '1个或多个维度 + 1个或多个指标',
    scenario: '显示不同类别下指标值随时间的变化',
    validate: (dims, mets) => dims >= 1 && mets >= 1
  },
  {
    value: 'dual-axis',
    label: '双轴图 (Dual-Axis Chart)',
    dataRequirement: '1个或多个维度 + 1个或多个指标 + 0个或多个次轴指标',
    scenario: '使用不同的轴图表类型和 Y 轴范围来显示两组在指标值范围上差异较大的指标',
    validate: (dims, mets) => dims >= 1 && mets >= 1
  },
  {
    value: 'filling-map',
    label: '填充地图 (Filling Map)',
    dataRequirement: '1个维度 + 1个指标',
    scenario: '显示省份/国家的热力图',
    validate: (dims, mets) => dims === 1 && mets === 1
  },
  {
    value: 'bi-directional-bar',
    label: '双向条形图 (Bi-directional Bar Chart)',
    dataRequirement: '1个维度 + 2个指标',
    scenario: '在同一维度中比较两个指标',
    validate: (dims, mets) => dims === 1 && mets === 2
  },
  {
    value: 'word-cloud',
    label: '词云图 (Word Cloud)',
    dataRequirement: '1个维度 + 0个或1个指标',
    scenario: '显示大量文本数据，通常用于描述关键词或标签',
    validate: (dims, mets) => dims === 1 && mets <= 1
  },
  {
    value: 'histogram',
    label: '直方图 (Histogram)',
    dataRequirement: '1个维度 + 0个指标',
    scenario: '显示数据分布、不同间隔的数据频率',
    validate: (dims, mets) => dims === 1 && mets === 0
  },
  {
    value: 'measure-card',
    label: '指标卡 (Measure Card)',
    dataRequirement: '0个或1个维度 + 1个或多个指标',
    scenario: '用于可视化显示多个核心指标数据（仅显示前 100 张卡片）',
    validate: (dims, mets) => dims <= 1 && mets >= 1
  },
  {
    value: 'funnel',
    label: '漏斗图 (Funnel Map)',
    dataRequirement: '(1个维度 + 1个指标) 或 (0个维度 + 2个或多个指标)',
    scenario: '显示数据漏斗',
    validate: (dims, mets) => (dims === 1 && mets === 1) || (dims === 0 && mets >= 2)
  },
  {
    value: 'radar',
    label: '雷达图 (Radar Map)',
    dataRequirement: '0个或多个维度 + 1个或多个指标',
    scenario: '展示多维度评估分数',
    validate: (_dims, mets) => mets >= 1
  },
  {
    value: 'sankey',
    label: '桑基图 (Sankey)',
    dataRequirement: '2个或多个维度 + 1个指标',
    scenario: '显示不同维度下的流量分布或数据流',
    validate: (dims, mets) => dims >= 2 && mets === 1
  },
  {
    value: 'waterfall',
    label: '比例瀑布图 (Proportion Waterfall Plot)',
    dataRequirement: '1个维度 + 1个指标',
    scenario: '通常用于理解初始值如何受到一系列中间正值或负值的影响',
    validate: (dims, mets) => dims === 1 && mets === 1
  }
]

function App(){
  const [datasets, setDatasets] = useState<any[]>([])
  const [dataset, setDataset] = useState('web_traffic')
  const [currentDatasetFields, setCurrentDatasetFields] = useState<{dimensions: Field[], metrics: Field[]}>({dimensions: [], metrics: []})
  const [dims, setDims] = useState<QueryField[]>([])
  const [mets, setMets] = useState<QueryField[]>([])
  const [chartType, setChartType] = useState<string>('bar')
  const [name, setName] = useState('')
  const [validationError, setValidationError] = useState<string>('')
  const [dimensionFilters, setDimensionFilters] = useState<Map<string, DimensionFilter>>(new Map())
  const [showFilterDropdown, setShowFilterDropdown] = useState<string | null>(null)
  const [datasetSearchTerm, setDatasetSearchTerm] = useState('')
  const [dimensionSearchTerm, setDimensionSearchTerm] = useState('')
  const [metricSearchTerm, setMetricSearchTerm] = useState('')
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false)
  const idRef = useRef<string| null>(null)

  const pvRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.EChartsType | null>(null)
  const downloadDropdownRef = useRef<HTMLDivElement>(null)

  // 树形表格状态管理
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  // Load all datasets on mount
  useEffect(() => {
    const allDatasets = getAllDatasets()
    setDatasets(allDatasets)
  }, [])

  // Update fields when dataset changes
  useEffect(() => {
    const ds = getDatasetById(dataset)
    if (ds && ds.fields) {
      const dimensions = ds.fields.filter((f: Field) => f.type === 'dimension')
      const metrics = ds.fields.filter((f: Field) => f.type === 'metric')
      setCurrentDatasetFields({ dimensions, metrics })

      // 自动选择日期维度（必选）
      const dateField = dimensions.find((f: Field) => f.dataType === 'date')
      if (dateField) {
        setDims([{ field: dateField } as QueryField])
      } else {
        setDims([])
      }

      setMets([])
      setDimensionFilters(new Map())
    }
  }, [dataset])

  // Initialize filters when dimensions change
  useEffect(() => {
    const newFilters = new Map<string, DimensionFilter>()
    const ds = getDatasetById(dataset)
    const rows = ds?.rows || []

    dims.forEach(dim => {
      const field = dim.field
      if (field.dataType === 'date') {
        // 日期类型维度 - 初始化日期筛选器
        const existingFilter = dimensionFilters.get(field.id)
        if (existingFilter && existingFilter.type === 'date') {
          newFilters.set(field.id, existingFilter)
        } else {
          const dateValues = rows.map((r: any) => r[field.id]).filter((v: any) => v)
          const sortedDates = dateValues.sort()
          newFilters.set(field.id, {
            dimensionId: field.id,
            type: 'date',
            config: {
              granularity: 'day',
              startDate: sortedDates[0] || '',
              endDate: sortedDates[sortedDates.length - 1] || '',
              aggregateData: false
            }
          })
        }
      } else {
        // 分类类型维度 - 初始化多选筛选器
        const existingFilter = dimensionFilters.get(field.id)
        const uniqueValues = Array.from(new Set(rows.map((r: any) => r[field.id]).filter((v: any) => v))) as string[]

        if (existingFilter && existingFilter.type === 'categorical') {
          newFilters.set(field.id, {
            ...existingFilter,
            config: {
              ...(existingFilter.config as CategoricalFilterConfig),
              selectedValues: (existingFilter.config as CategoricalFilterConfig).selectedValues.filter(v => uniqueValues.includes(v))
            }
          })
        } else {
          newFilters.set(field.id, {
            dimensionId: field.id,
            type: 'categorical',
            config: {
              selectedValues: uniqueValues,
              searchTerm: ''
            }
          })
        }
      }
    })

    setDimensionFilters(newFilters)
  }, [dims, dataset])

  useEffect(()=>{ // load if editing
    function loadChart(chartId?: string){
      const params = new URLSearchParams(location.search)
      const id = chartId || params.get('id')
      if(!id) return
      const c = getCharts().find((x:any)=>x.id===id)
      if(!c) return
      idRef.current = c.id
      setName(c.name||'')
      setDataset(c.query?.dataset || 'web_traffic')
      setChartType((c.chartType as any) || 'bar')
      setDims((c.query?.dimensions||[]) as QueryField[])
      setMets((c.query?.metrics||[]) as QueryField[])
    }

    // Load from URL params
    loadChart()

    // Listen for messages from parent frame
    function handleMessage(event: MessageEvent){
      if(event.data && event.data.type === 'LOAD_CHART' && event.data.chartId){
        loadChart(event.data.chartId)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  },[])

  useEffect(()=>{ draw() },[dataset, dims, mets, chartType, dimensionFilters, expandedKeys])

  // 点击外部关闭筛选器下拉菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('.filter-item')) {
        setShowFilterDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 点击外部关闭下载下拉菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(e.target as Node)) {
        setDownloadDropdownOpen(false)
      }
    }

    if (downloadDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [downloadDropdownOpen])

  // 验证当前选择的维度和指标是否符合图表类型要求
  useEffect(() => {
    const currentChartConfig = CHART_TYPES.find(ct => ct.value === chartType)
    if (currentChartConfig) {
      const isValid = currentChartConfig.validate(dims.length, mets.length)
      if (!isValid) {
        setValidationError(`当前选择不符合${currentChartConfig.label}的数据要求：${currentChartConfig.dataRequirement}`)
      } else {
        setValidationError('')
      }
    }
  }, [dims, mets, chartType])

  // 应用维度筛选
  function applyDimensionFilters(rows: any[]): any[] {
    if (dimensionFilters.size === 0) return rows

    return rows.filter(row => {
      for (const [dimId, filter] of dimensionFilters.entries()) {
        const value = row[dimId]

        if (filter.type === 'date') {
          const config = filter.config as DateFilterConfig
          if (config.startDate && value < config.startDate) return false
          if (config.endDate && value > config.endDate) return false
        } else if (filter.type === 'categorical') {
          const config = filter.config as CategoricalFilterConfig
          if (config.selectedValues.length > 0 && !config.selectedValues.includes(value)) {
            return false
          }
        }
      }
      return true
    })
  }

  // 树形表格数据结构类型
  type TreeNode = {
    key: string
    level: number
    dimensionValue: string
    dimensionName: string
    metrics: Record<string, number>
    children: TreeNode[]
  }

  // 构建树形数据结构
  function buildTreeData(rows: any[], dimensions: QueryField[], metrics: QueryField[]): TreeNode[] {
    if (dimensions.length === 0 || rows.length === 0) return []

    // 递归构建树形结构
    function buildLevel(data: any[], dimIndex: number, parentKey: string = ''): TreeNode[] {
      if (dimIndex >= dimensions.length) return []

      const currentDim = dimensions[dimIndex]
      const dimId = currentDim.field.id
      const dimName = currentDim.field.name

      // 按当前维度分组
      const grouped = new Map<string, any[]>()
      data.forEach(row => {
        const value = String(row[dimId] || '')
        if (!grouped.has(value)) {
          grouped.set(value, [])
        }
        grouped.get(value)!.push(row)
      })

      // 构建当前层级的节点
      const nodes: TreeNode[] = []
      grouped.forEach((groupRows, dimValue) => {
        const key = parentKey ? `${parentKey}-${dimValue}` : dimValue

        // 计算当前节点的指标聚合值
        const nodeMetrics: Record<string, number> = {}
        metrics.forEach(met => {
          const metId = met.field.id
          const agg = met.aggregation || met.field.aggregation || 'sum'
          const values = groupRows.map(r => Number(r[metId])).filter(v => !isNaN(v))

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
          nodeMetrics[metId] = value
        })

        // 递归构建子节点
        const children = buildLevel(groupRows, dimIndex + 1, key)

        nodes.push({
          key,
          level: dimIndex,
          dimensionValue: dimValue,
          dimensionName: dimName,
          metrics: nodeMetrics,
          children
        })
      })

      return nodes
    }

    return buildLevel(rows, 0)
  }

  // 渲染树形表格节点为HTML
  function renderTreeNode(node: TreeNode, metrics: QueryField[], isExpanded: boolean): string {
    const indent = node.level * 20 // 每层缩进20px
    const hasChildren = node.children.length > 0
    const expandIcon = hasChildren
      ? (isExpanded ? '▼' : '▶')
      : '　'

    // 格式化指标值
    const formatValue = (value: number) => {
      if (value === 0) return '0'
      if (Math.abs(value) >= 1000000) {
        return (value / 1000000).toFixed(2) + 'M'
      }
      if (Math.abs(value) >= 1000) {
        return (value / 1000).toFixed(2) + 'K'
      }
      return value.toFixed(2)
    }

    let html = `
      <tr data-key="${node.key}" style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 8px; border: 1px solid #e0e0e0;">
          <div style="display: flex; align-items: center; padding-left: ${indent}px;">
            ${hasChildren ? `<span class="tree-expand-icon" data-key="${node.key}" style="cursor: pointer; margin-right: 4px; user-select: none; color: #1890ff;">${expandIcon}</span>` : `<span style="margin-right: 4px;">${expandIcon}</span>`}
            <span>${node.dimensionValue}</span>
          </div>
        </td>
        ${metrics.map(met => {
          const value = node.metrics[met.field.id] || 0
          return `<td style="padding: 8px; border: 1px solid #e0e0e0; text-align: right; font-family: 'Monaco', monospace;">${formatValue(value)}</td>`
        }).join('')}
      </tr>
    `

    // 如果展开且有子节点，递归渲染子节点
    if (isExpanded && hasChildren) {
      node.children.forEach(child => {
        html += renderTreeNode(child, metrics, expandedKeys.has(child.key))
      })
    }

    return html
  }

  function draw(){
    // 处理树形表格类型
    if (chartType === 'tree-table') {
      // 销毁ECharts实例（如果存在）
      if(chartRef.current){
        chartRef.current.dispose()
        chartRef.current = null
      }

      if(pvRef.current){
        const ds = getDatasetById(dataset)
        let rows = ds?.rows || []
        rows = applyDimensionFilters(rows)

        // 验证数据和配置
        if (rows.length === 0) {
          pvRef.current.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">暂无数据</div>'
          return
        }

        if (dims.length < 2) {
          pvRef.current.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">树形表格至少需要2个维度</div>'
          return
        }

        if (mets.length === 0) {
          pvRef.current.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">树形表格至少需要1个指标</div>'
          return
        }

        // 构建树形数据
        const treeData = buildTreeData(rows, dims, mets)

        if (treeData.length === 0) {
          pvRef.current.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">无法构建树形结构</div>'
          return
        }

        // 计算总计
        const totals: Record<string, number> = {}
        mets.forEach(met => {
          const metId = met.field.id
          totals[metId] = treeData.reduce((sum, node) => sum + (node.metrics[metId] || 0), 0)
        })

        // 生成表格HTML
        const tableHTML = `
          <div style="overflow: auto; max-height: 600px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f5f5f5; position: sticky; top: 0;">
                  <th style="padding: 8px; border: 1px solid #e0e0e0; text-align: left; font-weight: 600;">维度层级</th>
                  ${mets.map(met => `<th style="padding: 8px; border: 1px solid #e0e0e0; text-align: right; font-weight: 600;">${met.field.name}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${treeData.map(node => renderTreeNode(node, mets, expandedKeys.has(node.key))).join('')}
                <tr style="background: #f0f0f0; font-weight: 700; border-top: 2px solid #d0d0d0;">
                  <td style="padding: 8px; border: 1px solid #e0e0e0;">总计</td>
                  ${mets.map(met => {
                    const value = totals[met.field.id] || 0
                    const formatValue = (v: number) => {
                      if (v === 0) return '0'
                      if (Math.abs(v) >= 1000000) return (v / 1000000).toFixed(2) + 'M'
                      if (Math.abs(v) >= 1000) return (v / 1000).toFixed(2) + 'K'
                      return v.toFixed(2)
                    }
                    return `<td style="padding: 8px; border: 1px solid #e0e0e0; text-align: right; font-family: 'Monaco', monospace;">${formatValue(value)}</td>`
                  }).join('')}
                </tr>
              </tbody>
            </table>
          </div>
        `
        pvRef.current.innerHTML = tableHTML

        // 添加展开/折叠事件监听
        const expandIcons = pvRef.current.querySelectorAll('.tree-expand-icon')
        expandIcons.forEach(icon => {
          icon.addEventListener('click', (e) => {
            const target = e.target as HTMLElement
            const key = target.getAttribute('data-key')
            if (key) {
              setExpandedKeys(prev => {
                const next = new Set(prev)
                if (next.has(key)) {
                  next.delete(key)
                } else {
                  next.add(key)
                }
                return next
              })
            }
          })
        })
      }
      return
    }

    // 处理所有表格类型 - 渲染HTML表格
    const tableTypes = ['table', 'pivot-table', 'trend-analysis', 'okr-table', 'raw-data-table']
    if(tableTypes.includes(chartType)){
      // 销毁ECharts实例（如果存在）
      if(chartRef.current){
        chartRef.current.dispose()
        chartRef.current = null
      }
      // 渲染HTML表格
      if(pvRef.current){
        const ds = getDatasetById(dataset)
        let rows = ds?.rows || []
        rows = applyDimensionFilters(rows)

        if (rows.length === 0) {
          pvRef.current.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">暂无数据</div>'
          return
        }

        // 获取表头（使用第一行的键）
        const headers = Object.keys(rows[0])

        // 生成表格HTML
        const tableHTML = `
          <div style="overflow: auto; max-height: 600px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f5f5f5; position: sticky; top: 0;">
                  ${headers.map(h => `<th style="padding: 8px; border: 1px solid #e0e0e0; text-align: left; font-weight: 600;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.slice(0, 100).map((row: any) => `
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    ${headers.map(h => {
                      const value = row[h]
                      const displayValue = value === null || value === undefined ? '-' : String(value)
                      return `<td style="padding: 8px; border: 1px solid #e0e0e0;">${displayValue}</td>`
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${rows.length > 100 ? `<div style="padding: 10px; text-align: center; color: #999; background: #fafafa;">仅显示前 100 条数据，共 ${rows.length} 条</div>` : ''}
          </div>
        `
        pvRef.current.innerHTML = tableHTML
      }
      return
    }

    // 处理图表类型 - 使用ECharts渲染
    if(!pvRef.current) return

    // 如果之前是表格，清除innerHTML
    if(pvRef.current.innerHTML && pvRef.current.querySelector('pre')){
      pvRef.current.innerHTML = ''
      chartRef.current = null
    }

    // 初始化或获取ECharts实例
    if(!chartRef.current){
      chartRef.current = echarts.init(pvRef.current)
    }

    // 获取数据源并应用筛选
    const ds = getDatasetById(dataset)
    let filteredRows = ds?.rows || []
    filteredRows = applyDimensionFilters(filteredRows)

    // 检查是否启用数据汇总
    const dateFilters = Array.from(dimensionFilters.values()).filter(f => f.type === 'date')
    const shouldAggregate = dateFilters.some(f => (f.config as DateFilterConfig).aggregateData)

    let points: any[]
    if (shouldAggregate && mets.length > 0) {
      // 数据汇总模式：忽略日期维度，保留其他维度进行分组聚合
      // 过滤掉日期类型的维度
      const nonDateDims = dims.filter(d => d.field.dataType !== 'date')

      if (nonDateDims.length === 0) {
        // 如果没有非日期维度，对所有指标进行全局汇总
        points = mets.map(met => {
          const metId = met.field.id
          const agg = met.aggregation || met.field.aggregation || 'sum'
          const values = filteredRows.map((r: any) => Number(r[metId])).filter((v: number) => !isNaN(v))

          let value = 0
          if (values.length > 0) {
            switch(agg) {
              case 'sum':
                value = values.reduce((a: number, b: number) => a + b, 0)
                break
              case 'avg':
                value = values.reduce((a: number, b: number) => a + b, 0) / values.length
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
                value = values.reduce((a: number, b: number) => a + b, 0)
            }
          }

          return { name: met.field.name, value }
        })
      } else {
        // 有非日期维度，按非日期维度分组聚合（忽略日期维度）
        points = runLocalQuery({ dataset, dimensions: nonDateDims, metrics: mets, rows: filteredRows }) as any[]
      }
    } else {
      // 正常模式：按所有维度分组
      points = runLocalQuery({ dataset, dimensions: dims, metrics: mets, rows: filteredRows }) as any[]
    }

    // 构建图表数据
    const names = points.map(p=>p.name)
    const values = points.map(p=>p.value)

    // 根据图表类型构建配置
    const option = buildChartOption(chartType, names, values, points)

    // 渲染图表
    chartRef.current.setOption(option, true)
  }

  // 构建不同图表类型的 ECharts 配置
  function buildChartOption(chartType: string, names: any[], values: any[], points: any[]) {
    const baseTooltip = { trigger: 'axis' }
    const baseXAxis = { type: 'category', data: names }
    const baseYAxis = { type: 'value' }

    switch (chartType) {
      case 'bar':
        return {
          tooltip: baseTooltip,
          xAxis: baseXAxis,
          yAxis: baseYAxis,
          series: [{ type: 'bar', data: values }]
        }

      case 'line':
        return {
          tooltip: baseTooltip,
          xAxis: baseXAxis,
          yAxis: baseYAxis,
          series: [{ type: 'line', data: values, smooth: true }]
        }

      case 'pie':
        return {
          tooltip: { trigger: 'item' },
          series: [{ type: 'pie', radius: '60%', data: points, emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }]
        }

      case 'area':
        return {
          tooltip: baseTooltip,
          xAxis: baseXAxis,
          yAxis: baseYAxis,
          series: [{ type: 'line', data: values, areaStyle: {}, smooth: true }]
        }

      case 'stacked-column':
      case 'stacking-bar':
        return {
          tooltip: baseTooltip,
          xAxis: chartType === 'stacking-bar' ? baseYAxis : baseXAxis,
          yAxis: chartType === 'stacking-bar' ? { ...baseXAxis, type: 'category' } : baseYAxis,
          series: [{ type: 'bar', data: values, stack: 'total', emphasis: { focus: 'series' } }]
        }

      case 'funnel':
        return {
          tooltip: { trigger: 'item', formatter: '{b}: {c}' },
          series: [{ type: 'funnel', sort: 'descending', gap: 2, data: points.map(p => ({ value: p.value, name: p.name })) }]
        }

      case 'radar':
        const indicators = names.map(name => ({ name, max: Math.max(...values) * 1.2 }))
        return {
          tooltip: {},
          radar: { indicator: indicators },
          series: [{ type: 'radar', data: [{ value: values, name: '评分' }] }]
        }

      case 'waterfall':
        // 瀑布图：显示累积效果（暂用柱状图表示）
        return {
          tooltip: baseTooltip,
          xAxis: baseXAxis,
          yAxis: baseYAxis,
          series: [{ type: 'bar', data: values, itemStyle: { color: (params: any) => params.value > 0 ? '#5470c6' : '#ee6666' } }]
        }

      case 'dual-axis':
        return {
          tooltip: baseTooltip,
          xAxis: baseXAxis,
          yAxis: [baseYAxis, { ...baseYAxis, splitLine: { show: false } }],
          series: [
            { type: 'bar', data: values },
            { type: 'line', data: values.map(v => v * 1.2), yAxisIndex: 1 }
          ]
        }

      case 'bi-directional-bar':
        return {
          tooltip: baseTooltip,
          xAxis: { ...baseYAxis, splitLine: { show: false } },
          yAxis: { ...baseXAxis, type: 'category' },
          series: [
            { type: 'bar', data: values.map(v => -Math.abs(v * 0.6)), stack: 'total' },
            { type: 'bar', data: values, stack: 'total' }
          ]
        }

      case 'measure-card':
        // 指标卡显示为柱状图的简化版本
        return {
          tooltip: {},
          xAxis: { show: false },
          yAxis: { show: false },
          series: [{ type: 'bar', data: values, itemStyle: { color: '#3772FF' } }]
        }

      case 'word-cloud':
        // 词云图 (ECharts 需要 echarts-wordcloud 插件，这里用散点图模拟)
        return {
          tooltip: {},
          xAxis: { show: false },
          yAxis: { show: false },
          series: [{
            type: 'scatter',
            symbolSize: (val: any) => Math.sqrt(val[1]) * 10,
            data: points.map((p, i) => [i, p.value, p.name]),
            label: { show: true, formatter: (params: any) => params.data[2], position: 'inside' }
          }]
        }

      case 'histogram':
        // 直方图：显示数据分布
        return {
          tooltip: baseTooltip,
          xAxis: baseXAxis,
          yAxis: baseYAxis,
          series: [{ type: 'bar', data: values, barCategoryGap: '0%' }]
        }

      case 'sankey':
        // 桑基图：显示流量
        return {
          tooltip: {},
          series: [{
            type: 'sankey',
            data: names.map(name => ({ name })),
            links: points.slice(0, -1).map((p, i) => ({ source: p.name, target: points[i + 1]?.name || p.name, value: p.value }))
          }]
        }

      case 'filling-map':
        // 填充地图 (使用中国地图展示地理数据热力分布)
        return {
          tooltip: {
            trigger: 'item',
            formatter: '{b}<br/>{c}'
          },
          visualMap: {
            min: Math.min(...values),
            max: Math.max(...values),
            text: ['高', '低'],
            realtime: false,
            calculable: true,
            inRange: {
              color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
            }
          },
          series: [{
            type: 'map',
            map: 'china',
            roam: true,
            label: {
              show: true,
              fontSize: 10
            },
            emphasis: {
              label: {
                show: true
              },
              itemStyle: {
                areaColor: '#ffd700'
              }
            },
            data: points.map(p => ({ name: p.name, value: p.value }))
          }]
        }

      default:
        // 默认使用柱状图
        return {
          tooltip: baseTooltip,
          xAxis: baseXAxis,
          yAxis: baseYAxis,
          series: [{ type: 'bar', data: values }]
        }
    }
  }

  function addDim(f:any){ if(!dims.find(d=>d.field.id===f.id)) setDims([...dims, { field:f } as QueryField ]) }
  function addMet(f:any){ if(!mets.find(m=>m.field.id===f.id)) setMets([...mets, { field:f, aggregation: (f.aggregation||'sum') as QueryField['aggregation'] } as QueryField ]) }
  function removeDim(e: React.MouseEvent, field: Field){
    // 禁止删除日期维度（必选项）
    if (field.dataType === 'date') {
      alert('日期维度是必选项，不能删除')
      return
    }
    const btn = e.target as HTMLButtonElement
    const pill = btn.parentElement
    const fieldName = pill?.textContent?.replace('×', '').trim()
    setDims(dims.filter(d => d.field.name !== fieldName))
  }
  function removeMet(e: React.MouseEvent){
    const btn = e.target as HTMLButtonElement
    const pill = btn.parentElement
    const fieldName = pill?.textContent?.replace('×', '').trim()
    setMets(mets.filter(m => m.field.name !== fieldName))
  }

  // 更新维度筛选器配置
  function updateFilterConfig(dimensionId: string, config: Partial<DateFilterConfig | CategoricalFilterConfig>) {
    setDimensionFilters(prev => {
      const newFilters = new Map(prev)
      const filter = newFilters.get(dimensionId)
      if (filter) {
        newFilters.set(dimensionId, {
          ...filter,
          config: { ...filter.config, ...config }
        })
      }
      return newFilters
    })
  }

  // 切换分类维度值选择
  function toggleCategoricalValue(dimensionId: string, value: string) {
    const filter = dimensionFilters.get(dimensionId)
    if (filter && filter.type === 'categorical') {
      const config = filter.config as CategoricalFilterConfig
      const selectedValues = config.selectedValues.includes(value)
        ? config.selectedValues.filter(v => v !== value)
        : [...config.selectedValues, value]
      updateFilterConfig(dimensionId, { selectedValues })
    }
  }

  // 获取维度的可用值（用于分类筛选）
  function getAvailableValues(dimensionId: string): string[] {
    const ds = getDatasetById(dataset)
    const rows = ds?.rows || []
    return Array.from(new Set(rows.map((r: any) => r[dimensionId]).filter((v: any) => v))) as string[]
  }

  // 下载图表
  function downloadChart(format: 'png' | 'jpeg') {
    const tableTypes = ['table', 'pivot-table', 'trend-analysis', 'okr-table', 'raw-data-table']

    // 表格类型不支持下载
    if (tableTypes.includes(chartType)) {
      alert('表格类型暂不支持下载，请使用图表类型')
      return
    }

    // 检查是否有图表实例
    if (!chartRef.current) {
      alert('请先配置并预览图表')
      return
    }

    try {
      // 使用 ECharts 的 getDataURL 方法获取图片
      const url = chartRef.current.getDataURL({
        type: format,
        pixelRatio: 2,
        backgroundColor: '#fff'
      })

      // 创建下载链接
      const link = document.createElement('a')
      link.href = url
      const fileExtension = format === 'jpeg' ? 'jpg' : format
      link.download = `${name || '图表'}_${new Date().toISOString().slice(0, 10)}.${fileExtension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请稍后重试')
    }
  }

  // 下载为 Excel 文件（包含图表和数据）
  async function downloadExcel() {
    const tableTypes = ['table', 'pivot-table', 'trend-analysis', 'okr-table', 'raw-data-table']

    try {
      const workbook = new ExcelJS.Workbook()

      // 对于表格类型，只导出数据表
      if (tableTypes.includes(chartType)) {
        const ds = getDatasetById(dataset)
        let rows = ds?.rows || []
        rows = applyDimensionFilters(rows)

        if (rows.length === 0) {
          alert('没有数据可导出')
          return
        }

        const worksheet = workbook.addWorksheet('数据')

        // 添加表头和数据
        const headers = Object.keys(rows[0])
        worksheet.addRow(headers)

        // 样式化表头
        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        }

        // 添加数据行（限制 10000 行）
        rows.slice(0, 10000).forEach((row: any) => {
          worksheet.addRow(headers.map(h => row[h]))
        })

        // 自动调整列宽
        worksheet.columns.forEach(column => {
          column.width = 15
        })
      } else {
        // 对于图表类型，导出图表图片 + 数据表
        if (!chartRef.current) {
          alert('请先配置并预览图表')
          return
        }

        // 获取图表图片
        const imageDataUrl = chartRef.current.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff'
        })
        const imageBase64 = imageDataUrl.split(',')[1] // 移除 data:image/png;base64, 前缀

        // Sheet 1: 图表
        const chartSheet = workbook.addWorksheet('图表')
        const imageId = workbook.addImage({
          base64: imageBase64,
          extension: 'png'
        })
        chartSheet.addImage(imageId, {
          tl: { col: 1, row: 1 },
          ext: { width: 800, height: 500 }
        })

        // Sheet 2: 数据
        const ds = getDatasetById(dataset)
        let filteredRows = ds?.rows || []
        filteredRows = applyDimensionFilters(filteredRows)

        const dataSheet = workbook.addWorksheet('数据')

        // 构建表头
        const headers: string[] = []
        const dimFields = dims.map(d => d.field)
        const metFields = mets.map(m => m.field)

        dimFields.forEach(f => headers.push(f.name))
        metFields.forEach(f => headers.push(f.name))

        dataSheet.addRow(headers)

        // 样式化表头
        dataSheet.getRow(1).font = { bold: true }
        dataSheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        }

        // 添加数据行（限制 10000 行）
        filteredRows.slice(0, 10000).forEach((row: any) => {
          const rowData: any[] = []
          dimFields.forEach(f => rowData.push(row[f.id]))
          metFields.forEach(f => rowData.push(row[f.id]))
          dataSheet.addRow(rowData)
        })

        // 自动调整列宽
        dataSheet.columns.forEach(column => {
          column.width = 15
        })
      }

      // 生成 Excel 文件并下载
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${name || '图表'}_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Excel导出失败:', error)
      alert('Excel导出失败，请稍后重试')
    }
  }

  function onSave(){
    // 验证数据要求
    const currentChartConfig = CHART_TYPES.find(ct => ct.value === chartType)
    if (currentChartConfig) {
      const isValid = currentChartConfig.validate(dims.length, mets.length)
      if (!isValid) {
        alert(`保存失败：当前选择不符合${currentChartConfig.label}的数据要求\n\n${currentChartConfig.dataRequirement}`)
        return
      }
    }

    draw()
    let previewImage: string | null = null
    try{ previewImage = chartRef.current?.getDataURL({ pixelRatio:2, backgroundColor:'#fff' }) || null }catch{}
    const now = new Date().toISOString()
    const obj = {
      id: idRef.current || uid('chart'),
      name: name || '未命名图表',
      creator: '本机用户',
      createdAt: idRef.current ? undefined : now,
      updatedAt: now,
      dataSource: dataset,
      chartType,
      tags: [],
      order: Date.now(),
      query: { dataset, dimensions: dims, metrics: mets, filters: [], config: {} },
      config: {},
      previewImage,
    }
    const prev = idRef.current ? getCharts().find(c=>c.id===obj.id) : null
    if(!obj.createdAt) (obj as any).createdAt = prev?.createdAt || now
    saveChart(obj as any)
    alert('已保存')
  }

  return (
    <div>
      <div className='toolbar'>
        <button className='btn'>撤销</button>
        <button className='btn'>重做</button>
        <div style={{flex:1}} />
        <input placeholder='输入图表名称...' value={name} onChange={e=>setName(e.target.value)} />
        <button className='btn primary' onClick={onSave}>保存</button>
      </div>
      <div className='layout'>
        <div className='panel'>
          <h3>数据集与字段</h3>
          <div className='content'>
            <div style={{marginBottom: 8}}>
              <strong style={{display: 'block', marginBottom: 6}}>数据集：</strong>
              <input
                type="text"
                placeholder="搜索数据集..."
                value={datasetSearchTerm}
                onChange={e => setDatasetSearchTerm(e.target.value)}
                className='field-search-input'
                style={{marginBottom: 6}}
              />
              <select
                value={dataset}
                onChange={e=>setDataset(e.target.value)}
                style={{width: '100%'}}
              >
                {datasets
                  .filter((d:any) => {
                    if (!datasetSearchTerm) return true
                    const term = datasetSearchTerm.toLowerCase()
                    return d.name.toLowerCase().includes(term) || (d.id && d.id.toLowerCase().includes(term))
                  })
                  .map((d:any)=> <option key={d.id} value={d.id}>{d.name}</option>)
                }
              </select>
            </div>
            <div style={{fontSize: 12, color: '#666', marginTop: 4, marginBottom: 12}}>
              {getDatasetById(dataset)?.description || ''}
            </div>
            <h4>维度</h4>
            <input
              type="text"
              placeholder="搜索维度..."
              value={dimensionSearchTerm}
              onChange={e => setDimensionSearchTerm(e.target.value)}
              className='field-search-input'
              style={{marginBottom: 8}}
            />
            <div>
              {currentDatasetFields.dimensions
                .filter((f:any) => {
                  if (!dimensionSearchTerm) return true
                  const term = dimensionSearchTerm.toLowerCase()
                  return f.name.toLowerCase().includes(term) || f.id.toLowerCase().includes(term)
                })
                .map((f:any)=> <div key={f.id} className='field' onClick={()=>addDim(f)}>{f.name} ({f.id})</div>)
              }
              {currentDatasetFields.dimensions.filter((f:any) => {
                if (!dimensionSearchTerm) return false
                const term = dimensionSearchTerm.toLowerCase()
                return !(f.name.toLowerCase().includes(term) || f.id.toLowerCase().includes(term))
              }).length === currentDatasetFields.dimensions.length && dimensionSearchTerm && (
                <div style={{padding: '8px', color: '#999', fontSize: 12, textAlign: 'center'}}>
                  未找到匹配的维度
                </div>
              )}
            </div>
            <h4>指标</h4>
            <input
              type="text"
              placeholder="搜索指标..."
              value={metricSearchTerm}
              onChange={e => setMetricSearchTerm(e.target.value)}
              className='field-search-input'
              style={{marginBottom: 8}}
            />
            <div>
              {currentDatasetFields.metrics
                .filter((f:any) => {
                  if (!metricSearchTerm) return true
                  const term = metricSearchTerm.toLowerCase()
                  return f.name.toLowerCase().includes(term) || f.id.toLowerCase().includes(term)
                })
                .map((f:any)=> <div key={f.id} className='field' onClick={()=>addMet(f)}>{f.name} ({f.id})</div>)
              }
              {currentDatasetFields.metrics.filter((f:any) => {
                if (!metricSearchTerm) return false
                const term = metricSearchTerm.toLowerCase()
                return !(f.name.toLowerCase().includes(term) || f.id.toLowerCase().includes(term))
              }).length === currentDatasetFields.metrics.length && metricSearchTerm && (
                <div style={{padding: '8px', color: '#999', fontSize: 12, textAlign: 'center'}}>
                  未找到匹配的指标
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='panel'>
          <h3>配置预览</h3>
          <div className='content config-preview'>
            <section className='config-preview__top'>
              <div className='field-selector-row'>
                <div className='field-label'><strong>维度</strong></div>
                <div id='pickedDims' className='picked-fields'>
                  {dims.map(d=> (
                    <span key={d.field.id} className='pill pill-selected'>
                      {d.field.dataType === 'date' && '🔒 '}
                      {d.field.name}
                      {d.field.dataType !== 'date' && <button className='btn' onClick={(e) => removeDim(e, d.field)}>×</button>}
                    </span>
                  ))}
                </div>
              </div>
              <div className='field-selector-row' style={{marginTop:8}}>
                <div className='field-label'><strong>指标</strong></div>
                <div id='pickedMets' className='picked-fields'>
                  {mets.map(m=> <span key={m.field.id} className='pill pill-selected'>{m.field.name}<button className='btn' onClick={removeMet}>×</button></span>)}
                </div>
              </div>
            </section>

            {/* 维度筛选器和图表类型选择栏 */}
            <section className='dimension-filter-bar'>
              {/* 图表类型选择器 - 固定在左侧 */}
              <div className='chart-type-selector'>
                <label className='chart-type-label'>图表类型：</label>
                <select
                  value={chartType}
                  onChange={e=>setChartType(e.target.value)}
                  className='chart-type-select'
                >
                  {CHART_TYPES.map(ct => (
                    <option key={ct.value} value={ct.value}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 维度筛选器 - 靠右侧 */}
              {dims.length > 0 && dims.map(dim => {
                const filter = dimensionFilters.get(dim.field.id)
                if (!filter) return null

                const field = dim.field

                if (filter.type === 'date') {
                  const config = filter.config as DateFilterConfig
                  return (
                    <div key={field.id} className='filter-item'>
                      <span className='filter-icon'>📅</span>
                      <select
                        value={config.granularity}
                        onChange={e => updateFilterConfig(field.id, { granularity: e.target.value as DateGranularity })}
                        className='filter-select'
                      >
                        <option value="day">日</option>
                        <option value="week">周</option>
                        <option value="month">月</option>
                        <option value="quarter">季</option>
                        <option value="year">年</option>
                      </select>
                      <input
                        type="date"
                        value={config.startDate}
                        onChange={e => updateFilterConfig(field.id, { startDate: e.target.value })}
                        className='filter-date'
                      />
                      <span className='filter-separator'>~</span>
                      <input
                        type="date"
                        value={config.endDate}
                        onChange={e => updateFilterConfig(field.id, { endDate: e.target.value })}
                        className='filter-date'
                      />
                      <label style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer', marginLeft: 6}}>
                        <input
                          type="checkbox"
                          checked={config.aggregateData}
                          onChange={e => updateFilterConfig(field.id, { aggregateData: e.target.checked })}
                          style={{cursor: 'pointer'}}
                        />
                        <span>数据汇总</span>
                      </label>
                      {/* 下载按钮（下拉菜单） */}
                      <div
                        ref={downloadDropdownRef}
                        style={{
                          position: 'relative',
                          marginLeft: 12
                        }}
                      >
                        <button
                          onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
                          className='btn'
                          style={{
                            fontSize: 13,
                            padding: '4px 12px',
                            background: '#1890ff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                          title="下载图表"
                        >
                          📥 下载图表 {downloadDropdownOpen ? '▲' : '▼'}
                        </button>

                        {downloadDropdownOpen && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              marginTop: 4,
                              background: '#fff',
                              border: '1px solid #d9d9d9',
                              borderRadius: '4px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              zIndex: 1000,
                              minWidth: 120
                            }}
                          >
                            <button
                              onClick={() => {
                                downloadChart('png')
                                setDownloadDropdownOpen(false)
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: 13,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              🖼️ PNG 格式
                            </button>
                            <button
                              onClick={() => {
                                downloadChart('jpeg')
                                setDownloadDropdownOpen(false)
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                borderTop: '1px solid #f0f0f0',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: 13,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              📷 JPG 格式
                            </button>
                            <button
                              onClick={() => {
                                downloadExcel()
                                setDownloadDropdownOpen(false)
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                borderTop: '1px solid #f0f0f0',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: 13,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              📊 Excel 格式
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                } else {
                  const config = filter.config as CategoricalFilterConfig
                  const availableValues = getAvailableValues(field.id)
                  const filteredValues = availableValues.filter(v =>
                    v.toLowerCase().includes(config.searchTerm.toLowerCase())
                  )
                  const isOpen = showFilterDropdown === field.id

                  return (
                    <div key={field.id} className='filter-item'>
                      <span className='filter-icon'>🔽</span>
                      <button
                        className='filter-dropdown-btn'
                        onClick={() => setShowFilterDropdown(isOpen ? null : field.id)}
                      >
                        {field.name} ({config.selectedValues.length}/{availableValues.length})
                      </button>
                      {isOpen && (
                        <div className='filter-dropdown-menu'>
                          <div className='filter-dropdown-search'>
                            <input
                              type="text"
                              placeholder="搜索..."
                              value={config.searchTerm}
                              onChange={e => updateFilterConfig(field.id, { searchTerm: e.target.value })}
                              className='filter-search-input'
                            />
                          </div>
                          <div className='filter-dropdown-actions'>
                            <button
                              onClick={() => updateFilterConfig(field.id, { selectedValues: availableValues })}
                              className='filter-action-btn'
                            >
                              全选
                            </button>
                            <button
                              onClick={() => updateFilterConfig(field.id, { selectedValues: [] })}
                              className='filter-action-btn'
                            >
                              清空
                            </button>
                          </div>
                          <div className='filter-dropdown-list'>
                            {filteredValues.map(value => (
                              <label key={value} className='filter-checkbox-label'>
                                <input
                                  type="checkbox"
                                  checked={config.selectedValues.includes(value)}
                                  onChange={() => toggleCategoricalValue(field.id, value)}
                                />
                                <span>{value}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }
              })}
            </section>

            <section className='config-preview__bottom'>
              {(() => {
                const currentConfig = CHART_TYPES.find(ct => ct.value === chartType)
                return currentConfig ? (
                  <div style={{
                    marginTop: 8,
                    padding: '10px 12px',
                    background: '#f0f5ff',
                    border: '1px solid #adc6ff',
                    borderRadius: '4px',
                    fontSize: '13px',
                    lineHeight: '1.6'
                  }}>
                    <div style={{marginBottom: 4}}>
                      <span style={{color: '#1890ff', fontWeight: 500}}>📊 数据要求：</span>
                      <span style={{color: '#333'}}>{currentConfig.dataRequirement}</span>
                    </div>
                    <div>
                      <span style={{color: '#1890ff', fontWeight: 500}}>💡 适用场景：</span>
                      <span style={{color: '#333'}}>{currentConfig.scenario}</span>
                    </div>
                  </div>
                ) : null
              })()}
              {validationError && (
                <div style={{
                  marginTop: 8,
                  padding: '8px 12px',
                  background: '#fff2e8',
                  border: '1px solid #ffbb96',
                  borderRadius: '4px',
                  color: '#d4380d',
                  fontSize: '13px'
                }}>
                  ⚠️ {validationError}
                </div>
              )}
              <div ref={pvRef} id='preview' style={{marginTop:10}} />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)

