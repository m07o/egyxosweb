export interface SiteConfig {
  key: string
  nameAr: string
  nameEn: string
  baseUrl: string
  altDomains: string[]
  isProtected: boolean
}

export const SITES_CONFIG: Record<string, SiteConfig> = {
  wecima: {
    key: 'wecima',
    nameAr: 'ويما',
    nameEn: 'Wecima',
    baseUrl: 'https://wecima.bar',
    altDomains: ['wecima.run', 'wecima.art', 'wecima.one', 'wecima.cfd', 'wecima.lat'],
    isProtected: false,
  },
  dramacafe: {
    key: 'dramacafe',
    nameAr: 'دراما كافيه',
    nameEn: 'DramaCafe',
    baseUrl: 'https://dramacafe.blog',
    altDomains: ['drama-cafe.com', 'dramacafe.co'],
    isProtected: true,
  },
  cimanow: {
    key: 'cimanow',
    nameAr: 'سيما ناو',
    nameEn: 'CimaNow',
    baseUrl: 'https://cimanow.cc',
    altDomains: ['cimanow.bar', 'cimanow.art'],
    isProtected: true,
  },
  arabseed: {
    key: 'arabseed',
    nameAr: 'عرب سيد',
    nameEn: 'ArabSeed',
    baseUrl: 'https://arabseed.life',
    altDomains: ['arabseed.co', 'arabseed.bar', 'arabseed.art'],
    isProtected: true,
  },
}

export const getAllSites = (): SiteConfig[] => Object.values(SITES_CONFIG)
export const getSiteConfig = (key: string): SiteConfig | undefined => SITES_CONFIG[key]

export const SITE_NAMES: Record<string, string> = {
  wecima: 'ويما',
  dramacafe: 'دراما كافيه',
  cimanow: 'سيما ناو',
  arabseed: 'عرب سيد',
}
