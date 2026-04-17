import { create } from 'zustand'

export interface LinkItem {
  id: string
  title: string
  site: 'dramacafe' | 'wecima' | 'cimanow' | 'arabseed'
  siteName: string
  linkType: 'watch' | 'download'
  url: string
  quality: string
  addedAt: string
  source: 'auto' | 'manual'
  episodeInfo?: string
}

const LINKS_KEY = 'cinemaplus_links'

export const SITE_NAMES: Record<string, string> = {
  dramacafe: 'دراما كافيه',
  wecima: 'ويما',
  cimanow: 'سيما ناو',
  arabseed: 'عرب سيد',
}

function getStoredLinks(): LinkItem[] {
  if (typeof window === 'undefined') return []
  try { const d = localStorage.getItem(LINKS_KEY); return d ? JSON.parse(d) : [] }
  catch { return [] }
}

function saveLinks(links: LinkItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LINKS_KEY, JSON.stringify(links))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

interface LinksState {
  links: LinkItem[]
  initialized: boolean
  init: () => void
  addLink: (data: Omit<LinkItem, 'id' | 'addedAt'>) => void
  addLinks: (items: Omit<LinkItem, 'id' | 'addedAt'>[]) => number
  updateLink: (id: string, data: Partial<LinkItem>) => void
  deleteLink: (id: string) => void
  deleteMany: (ids: string[]) => void
  importLinks: (items: LinkItem[]) => number
  exportLinks: () => LinkItem[]
  clearAll: () => void
  getStats: () => { total: number; watch: number; download: number; sites: Record<string, number> }
  getFiltered: (filters: { search?: string; site?: string; linkType?: string; sortBy?: string; page?: number; perPage?: number }) => { items: LinkItem[]; total: number; pages: number }
}

export const useLinksStore = create<LinksState>((set, get) => ({
  links: [],
  initialized: false,

  init: () => {
    if (get().initialized) return
    set({ links: getStoredLinks(), initialized: true })
  },

  addLink: (data) => {
    const newLink: LinkItem = { ...data, id: generateId(), addedAt: new Date().toISOString() }
    const updated = [newLink, ...get().links]
    saveLinks(updated)
    set({ links: updated })
  },

  addLinks: (items) => {
    const newLinks = items.map((item) => ({ ...item, id: generateId() + Math.random().toString(36).substr(2, 5), addedAt: new Date().toISOString() }))
    const updated = [...newLinks, ...get().links]
    saveLinks(updated)
    set({ links: updated })
    return newLinks.length
  },

  updateLink: (id, data) => {
    const updated = get().links.map((l) => (l.id === id ? { ...l, ...data } : l))
    saveLinks(updated)
    set({ links: updated })
  },

  deleteLink: (id) => {
    const updated = get().links.filter((l) => l.id !== id)
    saveLinks(updated)
    set({ links: updated })
  },

  deleteMany: (ids) => {
    const idSet = new Set(ids)
    const updated = get().links.filter((l) => !idSet.has(l.id))
    saveLinks(updated)
    set({ links: updated })
  },

  importLinks: (items) => {
    const existing = get().links
    const existingIds = new Set(existing.map((l) => l.title + l.url))
    const newItems = items.filter((item) => !existingIds.has(item.title + item.url)).map((item) => ({ ...item, id: item.id || generateId() }))
    const updated = [...newItems, ...existing]
    saveLinks(updated)
    set({ links: updated })
    return newItems.length
  },

  exportLinks: () => get().links,

  clearAll: () => { saveLinks([]); set({ links: [] }) },

  getStats: () => {
    const links = get().links
    const sites: Record<string, number> = {}
    for (const s of Object.keys(SITE_NAMES)) sites[s] = 0
    links.forEach((l) => { if (sites[l.site] !== undefined) sites[l.site]++ })
    return { total: links.length, watch: links.filter((l) => l.linkType === 'watch').length, download: links.filter((l) => l.linkType === 'download').length, sites }
  },

  getFiltered: (filters) => {
    let items = [...get().links]
    const { search, site, linkType, sortBy = 'newest', page = 1, perPage = 20 } = filters
    if (search) { const q = search.toLowerCase(); items = items.filter((l) => l.title.toLowerCase().includes(q) || (l.episodeInfo && l.episodeInfo.toLowerCase().includes(q))) }
    if (site) items = items.filter((l) => l.site === site)
    if (linkType) items = items.filter((l) => l.linkType === linkType)
    if (sortBy === 'newest') items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    else if (sortBy === 'oldest') items.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime())
    else if (sortBy === 'title') items.sort((a, b) => a.title.localeCompare(b.title, 'ar'))
    const total = items.length
    const pages = Math.ceil(total / perPage)
    return { items: items.slice((page - 1) * perPage, page * perPage), total, pages }
  },
}))
