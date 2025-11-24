import React, {useEffect, useState} from 'react'
import axios from 'axios'

function Badge({children}){ return <span className="text-xs px-2 py-1 rounded-full border">{children}</span> }

function BookCard({b, onFav}){
  return (
    <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-lg overflow-hidden flex flex-col">
      <div className="h-44 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
        <img src={b.cover} alt={b.title} className="max-h-40 object-contain"/>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold">{b.title}</h3>
        <div className="text-sm text-gray-500">{b.author} · {b.year}</div>
        <p className="text-sm text-gray-600 mt-2 flex-1">{b.description?.slice(0,140)}{b.description && b.description.length>140 ? '…':''}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2 items-center text-xs">
            <Badge>{b.atmosphere||'—'}</Badge>
            <Badge>{b.pace||'—'}</Badge>
            <Badge>{b.style||'—'}</Badge>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>onFav(b.id)} className="px-3 py-1 rounded-md bg-brand text-white">❤</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App(){
  const [db, setDb] = useState([])
  const [filters, setFilters] = useState({atmos:'', pace:'', hero:'', style:'', text:''})
  const [favs, setFavs] = useState(()=> JSON.parse(localStorage.getItem('favs')||'[]'))

  useEffect(()=>{ async function load(){ try{ const r = await axios.get('/api/books'); setDb(r.data); }catch(e){ console.warn('API error, falling back to local seed'); const seed = (await import('../db/seed.json')).default; setDb(seed); } } load() },[])

  useEffect(()=> localStorage.setItem('favs', JSON.stringify(favs)), [favs])

  function toggleFav(id){
    setFavs(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  }

  function filtered(){
    return db.filter(b=>{
      if(filters.atmos && b.atmosphere!==filters.atmos) return false
      if(filters.pace && b.pace!==filters.pace) return false
      if(filters.hero && b.hero!==filters.hero) return false
      if(filters.style && b.style!==filters.style) return false
      if(filters.text){
        const hay = (b.title+' '+b.author+' '+b.description).toLowerCase()
        if(!hay.includes(filters.text.toLowerCase())) return false
      }
      return true
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b132b] to-[#071027] text-white font-sans">
      <header className="max-w-7xl mx-auto p-6 flex items-center gap-6">
        <div className="text-2xl font-bold tracking-wider">BookHunt</div>
        <nav className="ml-auto flex gap-3 items-center">
          <div className="text-sm opacity-80">Избранное: {favs.length}</div>
          <button className="px-3 py-1 rounded-md bg-accent text-black font-semibold">Войти</button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="col-span-1 bg-white/6 p-4 rounded-xl border border-white/10 backdrop-blur-md">
          <h3 className="font-semibold mb-2">Фильтры</h3>
          <div className="space-y-3 text-black">
            <select className="w-full p-2 rounded" value={filters.atmos} onChange={e=>setFilters({...filters,atmos:e.target.value})}>
              <option value="">Атмосфера — Любая</option>
              <option>Уютная</option><option>Мрачная</option><option>Меланхоличная</option><option>Надрывная</option><option>Романтичная</option><option>Постапокалипсис</option><option>Ироничная</option>
            </select>
            <select className="w-full p-2 rounded" value={filters.pace} onChange={e=>setFilters({...filters,pace:e.target.value})}>
              <option value="">Темп — Любой</option><option>Медленный</option><option>Средний</option><option>Быстрый</option>
            </select>
            <select className="w-full p-2 rounded" value={filters.hero} onChange={e=>setFilters({...filters,hero:e.target.value})}>
              <option value="">Тип героя — Любой</option><option>Антигерой</option><option>Обычный человек</option><option>Искатель</option><option>Детектив</option>
            </select>
            <select className="w-full p-2 rounded" value={filters.style} onChange={e=>setFilters({...filters,style:e.target.value})}>
              <option value="">Стиль — Любой</option><option>Лирический</option><option>Ироничный</option><option>Суровый</option><option>Экспериментальный</option>
            </select>
            <input className="w-full p-2 rounded" placeholder="Поиск по названию/автору" value={filters.text} onChange={e=>setFilters({...filters,text:e.target.value})} />
            <div className="flex gap-2">
              <button className="flex-1 p-2 rounded bg-accent text-black font-semibold" onClick={()=>{}}>Применить</button>
              <button className="flex-1 p-2 rounded border border-white/20 bg-transparent" onClick={()=>setFilters({atmos:'',pace:'',hero:'',style:'',text:''})}>Сброс</button>
            </div>
          </div>
          <div className="mt-6 text-sm opacity-80">
            <h4 className="font-semibold">Система рекомендаций</h4>
            <p>Прототип: персональные рекомендации будут добавлены на серверной стороне с AI-моделью.</p>
          </div>
        </aside>

        <section className="col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered().map(b=> <BookCard key={b.id} b={b} onFav={toggleFav} />)}
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto p-6 text-sm opacity-70 text-center">BookHunt — прототип. Дизайн: классика + футуризм, контрастные акценты.</footer>
    </div>
  )
}
