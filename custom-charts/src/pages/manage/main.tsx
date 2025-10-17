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
  const [sortBy, setSortBy] = useState<'updatedAt'|'createdAt'>('updatedAt')

  useEffect(()=>{ setCharts(getCharts()) },[])

  const filtered = useMemo(()=>{
    return [...charts]
      .filter(c => !q || (c.name||'').toLowerCase().includes(q.toLowerCase()))
      .filter(c => !type || c.chartType===type)
      .sort((a,b)=> (b[sortBy]||'').localeCompare(a[sortBy]||''))
  },[charts,q,type,sortBy])

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

  function openEditor(chartId: string){
    // Try to communicate with parent frame first, fallback to direct navigation
    if(window.parent && window.parent !== window){
      window.parent.postMessage({type: 'OPEN_CUSTOM_CHARTS', which: 'editor', chartId}, '*');
    } else {
      window.location.href = `/editor.html?id=${chartId}`;
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
        <select className='btn' value={sortBy} onChange={e=>setSortBy(e.target.value as any)}>
          <option value='updatedAt'>按修改时间</option>
          <option value='createdAt'>按创建时间</option>
        </select>
      </div>
      <div className='grid'>
        {filtered.map(c=> (
          <div className='card' key={c.id} onClick={()=> openEditor(c.id)}>
            {/* Chart Preview - 80% */}
            {c.previewImage ? (
              <div className='preview'>
                <img src={c.previewImage} alt={c.name||'chart preview'} />
              </div>
            ) : (
              <div className='preview placeholder'>
                <span>📊</span>
                <span style={{fontSize: 14, marginTop: 8}}>{c.chartType||'chart'}</span>
              </div>
            )}

            {/* Content Area - 20% */}
            <div>
              <div className='row' style={{marginTop: 4}}>
                <strong style={{fontSize: 13}}>{c.name||'(未命名)'}</strong>
                <div>
                  <button className='btn' style={{padding: '4px 8px', fontSize: 12}} onClick={(e)=> {e.stopPropagation(); openEditor(c.id)}}>修改</button>{' '}
                  <button className='btn' style={{padding: '4px 8px', fontSize: 12}} onClick={(e)=> {e.stopPropagation(); onDelete(c.id)}}>删除</button>
                </div>
              </div>
              <div className='meta'>{c.chartType||'bar'} · {c.publishStatus||'draft'}</div>
              <div className='meta'>{fmt(c.updatedAt)}</div>
              <div className='tags'>
                {(c.tags||[]).map((t:string)=> <span className='tag' key={t}>{t}</span>)}
                <button className='btn' style={{padding: '2px 6px', fontSize: 11}} onClick={(e)=> {e.stopPropagation(); addTag(c)}}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)

