import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ensureInit, getCharts, removeChart, STORAGE_KEYS, storage } from '@/shared/storage'
import '@/styles/manage.css'

ensureInit()

type Chart = ReturnType<typeof getCharts>[number]

function fmt(s?: string){ try{ return s? new Date(s).toLocaleString(): '' }catch{ return s||'' } }

function App(){
  const [q, setQ] = useState('')
  const [charts, setCharts] = useState<Chart[]>([])
  const [type, setType] = useState('')
  const [pub, setPub] = useState('')
  const [sortBy, setSortBy] = useState<'updatedAt'|'createdAt'>('updatedAt')

  useEffect(()=>{ setCharts(getCharts()) },[])

  const filtered = useMemo(()=>{
    return [...charts]
      .filter(c => !q || (c.name||'').toLowerCase().includes(q.toLowerCase()))
      .filter(c => !type || c.chartType===type)
      .filter(c => !pub || c.publishStatus===pub)
      .sort((a,b)=> (b[sortBy]||'').localeCompare(a[sortBy]||''))
  },[charts,q,type,pub,sortBy])

  function onDelete(id: string){
    if(!confirm('确认删除该图表吗？')) return
    const next = removeChart(id)
    setCharts(next as any)
  }

  function addTag(c: Chart){
    const t = prompt('新标签')
    if(!t) return
    const list = storage.load<any[]>(STORAGE_KEYS.CHARTS, [])
    const i = list.findIndex((x:any)=>x.id===c.id)
    if(i>=0){
      const tags = Array.from(new Set([...(list[i].tags||[]), t]))
      list[i] = { ...list[i], tags }
      storage.save(STORAGE_KEYS.CHARTS, list)
      setCharts(getCharts())
    }
  }

  function editTags(c: Chart){
    const v = prompt('用逗号分隔标签', (c.tags||[]).join(','))
    if(v==null) return
    const list = storage.load<any[]>(STORAGE_KEYS.CHARTS, [])
    const i = list.findIndex((x:any)=>x.id===c.id)
    if(i>=0){
      list[i] = { ...list[i], tags: v.split(',').map((s:string)=>s.trim()).filter(Boolean) }
      storage.save(STORAGE_KEYS.CHARTS, list)
      setCharts(getCharts())
    }
  }

  return (
    <div>
      <div className='topbar'>
        <button className='btn primary' onClick={()=> {
          // Try to communicate with parent frame first, fallback to direct navigation
          if(window.parent && window.parent !== window){
            window.parent.postMessage({type: 'OPEN_CUSTOM_CHARTS', which: 'editor'}, '*');
          } else {
            window.location.href = '/editor.html';
          }
        }}>创建图表</button>
        <input className='search' placeholder='搜索图表名称…' value={q} onChange={e=>setQ(e.target.value)} />
        <select className='btn' value={type} onChange={e=>setType(e.target.value)}>
          <option value=''>图表类型</option>
          {['table','bar','line','pie','scatter','heatmap','area','radar'].map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        <select className='btn' value={pub} onChange={e=>setPub(e.target.value)}>
          <option value=''>发布状态</option>
          {['draft','published'].map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        <select className='btn' value={sortBy} onChange={e=>setSortBy(e.target.value as any)}>
          <option value='updatedAt'>按修改时间</option>
          <option value='createdAt'>按创建时间</option>
        </select>
      </div>
      <div className='grid'>
        {filtered.map(c=> (
          <div className='card' key={c.id}>
            <div className='row'>
              <strong>{c.name||'(未命名)'}</strong>
              <div>
                <button className='btn' onClick={()=> {
                  // Try to communicate with parent frame first, fallback to direct navigation
                  if(window.parent && window.parent !== window){
                    window.parent.postMessage({type: 'OPEN_CUSTOM_CHARTS', which: 'editor', chartId: c.id}, '*');
                  } else {
                    window.location.href = `/editor.html?id=${c.id}`;
                  }
                }}>修改</button>{' '}
                <button className='btn' onClick={()=> onDelete(c.id)}>删除</button>
              </div>
            </div>
            <div className='meta'>创建人：{c.creator||'-'}</div>
            <div className='meta'>创建时间：{fmt(c.createdAt)}</div>
            <div className='meta'>修改时间：{fmt(c.updatedAt)}</div>
            <div className='meta'>数据来源：{c.dataSource||'ads_basic'}</div>
            <div className='meta'>发布状态：{c.publishStatus||'draft'}</div>
            <div className='meta'>图表类型：{c.chartType||'bar'}</div>
            <div className='tags'>
              {(c.tags||[]).map((t:string)=> <span className='tag' key={t}>{t}</span>)}
              <button className='btn' onClick={()=> addTag(c)}>+标签</button>
              <button className='btn' onClick={()=> editTags(c)}>编辑标签</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)

