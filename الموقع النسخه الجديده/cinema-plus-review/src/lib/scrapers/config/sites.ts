export interface SiteConfig {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
  selectors: {
    movieCard: string;
    movieTitle: string;
    movieLink: string;
    movieImage: string;
    movieQuality?: string;
    // Page detail selectors
    serversContainer?: string;
    serverItem?: string;
    serverLink?: string;
    downloadContainer?: string;
    downloadItem?: string;
    downloadLink?: string;
  };
  pagination?: {
    nextPage: string;
    pageParam: string;
  };
}

export const SITES_CONFIG: Record<string, SiteConfig> = {
  wecima: {
    id: "wecima",
    name: "Wecima",
    baseUrl: "https://wecima.bar",
    enabled: true,
    selectors: {
      movieCard: ".Grid--WecimaPosts .GridItem",
      movieTitle: ".GridItem .post-title a",
      movieLink: ".GridItem .post-title a",
      movieImage: ".GridItem img",
      movieQuality: ".GridItem .quality",
      serversContainer: ".List--SeasonsEpisodes",
      serverItem: ".List--SeasonsEpisodes li a",
      serverLink: ".List--SeasonsEpisodes li a",
      downloadContainer: ".List--Downloads--Single",
      downloadItem: ".List--Downloads--Single li a",
      downloadLink: ".List--Downloads--Single li a",
    },
    pagination: {
      nextPage: ".pagination .next",
      pageParam: "page",
    },
  },
  mycima: {
    id: "mycima",
    name: "MyCima",
    baseUrl: "https://mycima.cc",
    enabled: false,
    selectors: {
      movieCard: ".post-item",
      movieTitle: ".post-title a",
      movieLink: ".post-title a",
      movieImage: ".post-item img",
      movieQuality: ".quality",
    },
  },
};

export const AD_PATTERNS = [
  /\badvertising\b/i,
  /\bad\b/i,
  /\bclick\b.*\badvert/i,
  /\bsponsored\b/i,
  /\baffiliate\b/i,
  /\btracking\b/i,
  /\bredirect\b/i,
  /doubleclick\.net/i,
  /googleads/i,
  /googlesyndication/i,
  /facebook\.com\/plugins/i,
  /ad\./i,
  /ads\./i,
  /popunder/i,
  /popup/i,
  /banner/i,
  /analytics/i,
  /pixel\./i,
];

export const SUPPORTED_QUALITIES = ["1080p", "720p", "480p", "360p", "CAM"];
