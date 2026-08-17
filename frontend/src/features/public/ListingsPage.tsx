import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, ChevronRight, LoaderCircle, MapPin, RefreshCw, Search, SlidersHorizontal, X } from 'lucide-react'
import type { AppProps } from '../../app/types'
import { EmptyState, FilterGroup, SelectControl } from '../../components/shared/Primitives'
import { ListingGrid } from '../../components/listings/ListingGrid'
import './PublicPages.css'

const roomTypeOptions = [
  ['single', 'Single room'],
  ['shared', 'Shared room'],
  ['studio', 'Studio'],
  ['apartment', 'Apartment'],
] as const

export function ListingsPage(props: AppProps) {
  const params = new URLSearchParams(window.location.search)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [campus, setCampus] = useState('All campuses')
  const [availability, setAvailability] = useState('Any availability')
  const [roomTypes, setRoomTypes] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('Freshest')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const loadingMoreRef = useRef(false)
  const userScrolledRef = useRef(false)
  const lastLoadScrollYRef = useRef(0)
  const filters = useMemo(() => ({ q: query, campus, availability, roomTypes, minPrice, maxPrice, sort }), [query, campus, availability, roomTypes, minPrice, maxPrice, sort])
  const activeFilterCount = Number(Boolean(query)) + Number(campus !== 'All campuses') + Number(availability !== 'Any availability') + roomTypes.length + Number(Boolean(minPrice || maxPrice))
  const campusOptions = [...new Set(props.db.locations.filter((location) => location.active).map((location) => location.campus))]
  const ensureLocations = () => {
    if (props.db.locations.length === 0) props.loadLocations().catch((error) => console.error('Location options failed', error))
  }
  const clearFilters = () => {
    setQuery('')
    setCampus('All campuses')
    setAvailability('Any availability')
    setRoomTypes([])
    setMinPrice('')
    setMaxPrice('')
    setSort('Freshest')
  }
  const toggleRoomType = (value: string) => setRoomTypes((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  useEffect(() => {
    let active = true
    userScrolledRef.current = false
    lastLoadScrollYRef.current = 0
    const timer = window.setTimeout(async () => {
      setLoading(true)
      await props.loadListingPage('public', filters)
      if (active) setLoading(false)
    }, 250)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [filters])
  useEffect(() => {
    const markScrolled = () => { userScrolledRef.current = true }
    window.addEventListener('scroll', markScrolled, { passive: true })
    window.addEventListener('wheel', markScrolled, { passive: true })
    window.addEventListener('touchmove', markScrolled, { passive: true })
    return () => {
      window.removeEventListener('scroll', markScrolled)
      window.removeEventListener('wheel', markScrolled)
      window.removeEventListener('touchmove', markScrolled)
    }
  }, [])
  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || !props.listingNextPage) return
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || loading || loadingMoreRef.current) return
      if (!userScrolledRef.current || Math.abs(window.scrollY - lastLoadScrollYRef.current) < 80) return
      loadingMoreRef.current = true
      setLoadingMore(true)
      props.loadMoreListings('public', filters).finally(() => {
        lastLoadScrollYRef.current = window.scrollY
        loadingMoreRef.current = false
        setLoadingMore(false)
      })
    }, { rootMargin: '0px 0px 40% 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [filters, loading, props.listingNextPage])
  const listings = props.db.listings.filter((listing) => listing.availability !== 'Unavailable')
  const listingCountText = props.listingTotal === null ? `${listings.length} listings loaded` : `${listings.length} of ${props.listingTotal} listings loaded`
  return (
    <div className={`browse-layout ${filtersCollapsed ? 'filters-collapsed' : ''}`}>
      <aside className={`filter-rail ${filtersOpen ? 'open' : ''} ${filtersCollapsed ? 'collapsed' : ''}`}>
        <div className="filter-icon-rail" aria-label="Filter shortcuts">
          <button className="icon-btn has-tip" data-tip="Open filters" aria-label="Open filters" onClick={() => setFiltersCollapsed(false)}><SlidersHorizontal /></button>
          <button className={`icon-btn has-tip ${campus !== 'All campuses' ? 'active' : ''}`} data-tip="Campus filter" aria-label="Campus filter" onClick={() => { setFiltersCollapsed(false); ensureLocations() }}><MapPin /></button>
          <button className={`icon-btn has-tip ${availability !== 'Any availability' ? 'active' : ''}`} data-tip="Availability filter" aria-label="Availability filter" onClick={() => setFiltersCollapsed(false)}><CheckCircle2 /></button>
          <button className="icon-btn has-tip" data-tip="Clear filters" aria-label="Clear filters" onClick={clearFilters}><RefreshCw /></button>
        </div>
        <div className="filter-panel-content">
          <div className="filter-title"><strong>Filters {activeFilterCount > 0 && <span>{activeFilterCount}</span>}</strong><div className="filter-title-actions"><button className="icon-btn desktop-filter-toggle has-tip tip-left" data-tip="Collapse filters" aria-label="Collapse filters" onClick={() => setFiltersCollapsed(true)}><ChevronRight /></button><button className="icon-btn mobile-only" aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X /></button></div></div>
          <FilterGroup label="Campus"><SelectControl value={campus} onFocus={ensureLocations} onPointerDown={ensureLocations} onChange={(e) => setCampus(e.target.value)}><option>All campuses</option>{campusOptions.map((x) => <option key={x}>{x}</option>)}</SelectControl></FilterGroup>
          <FilterGroup label="Availability"><SelectControl value={availability} onChange={(e) => setAvailability(e.target.value)}><option>Any availability</option><option>Available</option><option>Limited</option><option>Full</option></SelectControl></FilterGroup>
          <FilterGroup label="Price range"><div className="price-inputs"><input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" inputMode="numeric" /><input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" inputMode="numeric" /></div></FilterGroup>
          <FilterGroup label="Room type"><div className="chip-options">{roomTypeOptions.map(([value, text]) => <label className="check chip-check" key={value}><input type="checkbox" checked={roomTypes.includes(value)} onChange={() => toggleRoomType(value)} /><span>{text}</span></label>)}</div></FilterGroup>
          <FilterGroup label="Freshness"><label className="check chip-check"><input type="checkbox" defaultChecked /><span>Confirmed this week</span></label></FilterGroup>
        </div>
      </aside>
      <section className="browse-results"><div className="page-header compact-page"><div><span className="eyebrow">Room discovery</span><h1>Find a room that is still available</h1><p>{loading ? 'Loading backend results...' : listingCountText}</p></div></div><div className="search-toolbar"><div className="input-with-icon"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search campus, area, or property" /></div><button className="btn secondary filter-button" onClick={() => { setFiltersOpen(true); ensureLocations() }}><SlidersHorizontal size={17} />Filters</button><SelectControl aria-label="Sort listings" value={sort} onChange={(e) => setSort(e.target.value)}><option>Freshest</option><option>Popular</option><option>Lowest price</option><option>Highest price</option></SelectControl></div>{listings.length ? <><ListingGrid listings={listings} {...props} /><div ref={loadMoreRef} className="load-more-sentinel" aria-live="polite">{loadingMore ? <><LoaderCircle size={17} />Loading more rooms</> : props.listingNextPage ? 'Scroll for more rooms' : 'All rooms loaded'}</div></> : <EmptyState icon={loading ? <LoaderCircle /> : <Search />} title={loading ? 'Loading rooms' : 'No rooms match those filters'} body={loading ? 'Waiting for the backend response.' : 'Try another area or widen your availability filter.'} action="Clear filters" onAction={clearFilters} />}</section>
    </div>
  )
}
