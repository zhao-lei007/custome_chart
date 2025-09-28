import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import * as echarts from 'echarts'
import { DIMENSION_FIELDS, METRIC_FIELDS, ensureInit, getCharts, getDatasetById, runLocalQuery, saveChart, uid, type QueryField } from '@/shared/storage'
import '@/styles/editor.css'

ensureInit()

function App(){
  const [dataset, setDataset] = useState('ads_basic')
  const [dims, setDims] = useState<QueryField[]>([])
  const [mets, setMets] = useState<QueryField[]>([])
  const [chartType, setChartType] = useState<'bar'|'line'|'pie'|'table'>('bar')
  const [publishStatus, setPublishStatus] = useState<'draft'|'published'>('draft')
  const [name, setName] = useState('')
  const idRef = useRef<string| null>(null)

  const pvRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.EChartsType | null>(null)

  useEffect(()=>{ // load if editing
    function loadChart(chartId?: string){
      const params = new URLSearchParams(location.search)
      const id = chartId || params.get('id')
      if(!id) return
      const c = getCharts().find((x:any)=>x.id===id)
      if(!c) return
      idRef.current = c.id
      setName(c.name||'')
      setDataset(c.query?.dataset || 'ads_basic')
      setChartType((c.chartType as any) || 'bar')
      setPublishStatus((c.publishStatus as any) || 'draft')
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

  useEffect(()=>{ draw() },[dataset, dims, mets, chartType])

  function draw(){
    if(chartType==='table'){
      if(pvRef.current){
        const ds = getDatasetById(dataset)
        pvRef.current.innerHTML = `<pre style="padding:8px; overflow:auto;">${JSON.stringify(ds?.rows||[],null,2)}</pre>`
      }
      return
    }
    if(!pvRef.current) return
    if(!chartRef.current) chartRef.current = echarts.init(pvRef.current)
    const points = runLocalQuery({ dataset, dimensions: dims, metrics: mets }) as any[]
    const names = points.map(p=>p.name)
    const values = points.map(p=>p.value)
    const option = chartType==='pie' ? { tooltip:{}, series:[{ type:'pie', radius:'60%', data:points }] } :
      { tooltip:{}, xAxis:{ type:'category', data:names }, yAxis:{ type:'value' }, series:[{ type: chartType==='line'?'line':'bar', data:values }] }
    chartRef.current.setOption(option, true)
  }

  function addDim(f:any){ if(!dims.find(d=>d.field.id===f.id)) setDims([ { field:f } as QueryField ]) }
  function addMet(f:any){ if(!mets.find(m=>m.field.id===f.id)) setMets([ { field:f, aggregation: (f.aggregation||'sum') as QueryField['aggregation'] } as QueryField ]) }
  function removeDim(){ setDims([]) }
  function removeMet(){ setMets([]) }

  function onSave(){
    if(!dims.length || !mets.length){ alert('请至少选择一个维度和一个指标'); return }
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
      publishStatus,
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
            <div className='row'><strong>数据集：</strong>
              <select value={dataset} onChange={e=>setDataset(e.target.value)}>
                {[{id:'ads_basic', name:'广告基础数据'}].map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <h4>维度</h4>
            <div>{DIMENSION_FIELDS.map((f:any)=> <div key={f.id} className='field' onClick={()=>addDim(f)}>{f.name} ({f.id})</div>)}</div>
            <h4>指标</h4>
            <div>{METRIC_FIELDS.map((f:any)=> <div key={f.id} className='field' onClick={()=>addMet(f)}>{f.name} ({f.id})</div>)}</div>
          </div>
        </div>
        <div className='panel'>
          <h3>配置预览</h3>
          <div className='content config-preview'>
            <section className='config-preview__top'>
              <div>
                <div><strong>维度</strong></div>
                <div id='pickedDims'>
                  {dims.map(d=> <span key={d.field.id} className='pill'>{d.field.name}<button className='btn' onClick={removeDim}>×</button></span>)}
                </div>
              </div>
              <div style={{marginTop:8}}>
                <div><strong>指标</strong></div>
                <div id='pickedMets'>
                  {mets.map(m=> <span key={m.field.id} className='pill'>{m.field.name}<button className='btn' onClick={removeMet}>×</button></span>)}
                </div>
              </div>
              <div style={{marginTop:8}}>
                <div className='row'>
                  <label>发布状态：</label>
                  <select value={publishStatus} onChange={e=>setPublishStatus(e.target.value as any)}>
                    {['draft','published'].map(t=> <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </section>
            <section className='config-preview__bottom'>
              <div className='row'>
                <label>图表类型：</label>
                <select value={chartType} onChange={e=>setChartType(e.target.value as any)}>
                  {['bar','line','pie','table'].map(t=> <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div ref={pvRef} id='preview' style={{marginTop:10}} />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)

