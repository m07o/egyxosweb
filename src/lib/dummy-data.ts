export interface CastMember {
  id: number;
  name: string;
  character: string;
  photo: string;
}

export interface Server {
  id: number;
  name: string;
  provider: string;
  qualities: Quality[];
  isActive?: boolean;
}

export interface Quality {
  label: string;
  value: string;
  size?: string;
}

export interface DownloadLink {
  quality: string;
  size: string;
  serverName: string;
  url: string;
}

export interface Episode {
  id: number;
  episodeNumber: number;
  title: string;
  thumbnail: string;
  duration: string;
  hasSubtitle: boolean;
}

export interface Season {
  id: number;
  seasonNumber: number;
  title: string;
  episodeCount: number;
  episodes: Episode[];
}

export interface SimilarItem {
  id: number;
  title: string;
  year: number;
  rating: number;
  type: "movie" | "series" | "anime";
  poster: string;
  quality: string;
}

export interface MediaItem {
  id: number;
  tmdbId: number;
  title: string;
  originalTitle: string;
  year: number;
  rating: number;
  duration: string;
  quality: string;
  genres: string[];
  countries: string[];
  story: string;
  director: string;
  directorPhoto: string;
  cast: CastMember[];
  backdrop: string;
  poster: string;
  trailerUrl: string;
  servers: Server[];
  downloadLinks: DownloadLink[];
  similar: SimilarItem[];
  tags: string[];
  isSeries: boolean;
  seasons: Season[];
  totalSeasons?: number;
  status?: string;
  airDate?: string;
}

export const movieDetails: MediaItem = {
  id: 1,
  tmdbId: 550,
  title: "مقاتل الشارع 6: الانتقام",
  originalTitle: "Street Fighter 6: Revenge",
  year: 2025,
  rating: 8.4,
  duration: "2س 15د",
  quality: "1080p WEB-DL",
  genres: ["أكشن", "مغامرة", "خيال علمي"],
  countries: ["الولايات المتحدة", "اليابان"],
  story:
    "في عالم مستقبلي حيث أصبحت القتال الشارعي رياضة عالمية، يقوم المحارب الأسطوري ريو هاشي بتنظيم بطولة عالمية كبرى لجمع أقوى المقاتلين من كل أنحاء العالم. لكن خلف هذه البطولة تكمن مؤامرة خطيرة تقودها منظمة شادوو التي تسعى للسيطرة على العالم باستخدام تقنية النانو القتالية. على ريو وصديقه القديم كين ماسترز التغلب على خلافاتهما القديمة والتعاون مع محاربين جدد مثل تشون-لي وغايل لإحباط المؤامرة قبل فوات الأوان. في رحلة مليئة بالمعارك الملحمية والألغاز، يكتشف ريو سراً قديماً عن أصله الذي قد يغير مصير البشرية جمعاء.",
  director: "تاكيشي كويتشي",
  directorPhoto: "https://picsum.photos/seed/director1/200/200",
  cast: [
    {
      id: 1,
      name: "مايكل فاسبيندر",
      character: "ريو هاشي",
      photo: "https://picsum.photos/seed/cast1/200/200",
    },
    {
      id: 2,
      name: "جون تشو",
      character: "كين ماسترز",
      photo: "https://picsum.photos/seed/cast2/200/200",
    },
    {
      id: 3,
      name: "لوي تشاو",
      character: "تشون-لي",
      photo: "https://picsum.photos/seed/cast3/200/200",
    },
    {
      id: 4,
      name: "إيدريس إلبا",
      character: "غايل",
      photo: "https://picsum.photos/seed/cast4/200/200",
    },
    {
      id: 5,
      name: "تيلدا سوينتون",
      character: "م. بايسون",
      photo: "https://picsum.photos/seed/cast5/200/200",
    },
    {
      id: 6,
      name: "مانويل غارسيا",
      character: "فيغو",
      photo: "https://picsum.photos/seed/cast6/200/200",
    },
    {
      id: 7,
      name: "روني تشينغ",
      character: "صانع",
      photo: "https://picsum.photos/seed/cast7/200/200",
    },
    {
      id: 8,
      name: "سارة شاهي",
      character: "كامي",
      photo: "https://picsum.photos/seed/cast8/200/200",
    },
  ],
  backdrop: "https://picsum.photos/seed/backdrop-movie/1920/800",
  poster: "https://picsum.photos/seed/poster-movie/400/600",
  trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  servers: [
    {
      id: 1,
      name: "سيرفر 1",
      provider: "VidSrc",
      isActive: true,
      qualities: [
        { label: "1080p", value: "1080", size: "2.8 GB" },
        { label: "720p", value: "720", size: "1.5 GB" },
        { label: "480p", value: "480", size: "800 MB" },
      ],
    },
    {
      id: 2,
      name: "سيرفر 2",
      provider: "VidSrc",
      qualities: [
        { label: "1080p", value: "1080", size: "2.6 GB" },
        { label: "720p", value: "720", size: "1.4 GB" },
      ],
    },
    {
      id: 3,
      name: "سيرفر 3",
      provider: "MultiEmbed",
      qualities: [
        { label: "720p", value: "720", size: "1.3 GB" },
        { label: "480p", value: "480", size: "750 MB" },
      ],
    },
    {
      id: 4,
      name: "سيرفر 4",
      provider: "AutoEmbed",
      qualities: [
        { label: "1080p", value: "1080", size: "2.7 GB" },
        { label: "720p", value: "720", size: "1.4 GB" },
        { label: "480p", value: "480", size: "780 MB" },
      ],
    },
  ],
  downloadLinks: [
    {
      quality: "1080p WEB-DL",
      size: "2.8 GB",
      serverName: "سيرفر التحميل 1",
      url: "#",
    },
    {
      quality: "1080p WEB-DL",
      size: "2.6 GB",
      serverName: "سيرفر التحميل 2",
      url: "#",
    },
    {
      quality: "720p WEB-DL",
      size: "1.5 GB",
      serverName: "سيرفر التحميل 1",
      url: "#",
    },
    {
      quality: "720p WEB-DL",
      size: "1.4 GB",
      serverName: "سيرفر التحميل 2",
      url: "#",
    },
    {
      quality: "480p WEB-DL",
      size: "800 MB",
      serverName: "سيرفر التحميل 1",
      url: "#",
    },
    {
      quality: "480p WEB-DL",
      size: "750 MB",
      serverName: "سيرفر التحميل 2",
      url: "#",
    },
  ],
  similar: [
    {
      id: 101,
      title: "نينجا سلاير: الحرب الأخيرة",
      year: 2025,
      rating: 7.8,
      type: "movie",
      poster: "https://picsum.photos/seed/sim1/400/600",
      quality: "1080p",
    },
    {
      id: 102,
      title: "أسطورة المحارب",
      year: 2024,
      rating: 8.1,
      type: "movie",
      poster: "https://picsum.photos/seed/sim2/400/600",
      quality: "1080p",
    },
    {
      id: 103,
      title: "ملك الكونغ فو",
      year: 2024,
      rating: 7.5,
      type: "movie",
      poster: "https://picsum.photos/seed/sim3/400/600",
      quality: "1080p",
    },
    {
      id: 104,
      title: "المقاتل الأخير",
      year: 2025,
      rating: 7.2,
      type: "movie",
      poster: "https://picsum.photos/seed/sim4/400/600",
      quality: "720p",
    },
    {
      id: 105,
      title: "حرب الأبطال",
      year: 2024,
      rating: 8.0,
      type: "movie",
      poster: "https://picsum.photos/seed/sim5/400/600",
      quality: "1080p",
    },
    {
      id: 106,
      title: "ظل النينجا",
      year: 2023,
      rating: 6.9,
      type: "movie",
      poster: "https://picsum.photos/seed/sim6/400/600",
      quality: "720p",
    },
    {
      id: 107,
      title: "تيكن: صراع الأبطال",
      year: 2025,
      rating: 7.6,
      type: "movie",
      poster: "https://picsum.photos/seed/sim7/400/600",
      quality: "1080p",
    },
    {
      id: 108,
      title: "وحش الأسطورة",
      year: 2024,
      rating: 6.5,
      type: "movie",
      poster: "https://picsum.photos/seed/sim8/400/600",
      quality: "720p",
    },
    {
      id: 109,
      title: "حارس المجرة",
      year: 2025,
      rating: 8.3,
      type: "anime",
      poster: "https://picsum.photos/seed/sim9/400/600",
      quality: "1080p",
    },
    {
      id: 110,
      title: "معركة الظلام",
      year: 2024,
      rating: 7.0,
      type: "movie",
      poster: "https://picsum.photos/seed/sim10/400/600",
      quality: "1080p",
    },
  ],
  tags: ["جديد", "حصري", "HD"],
  isSeries: false,
  seasons: [],
};

export const seriesDetails: MediaItem = {
  id: 2,
  tmdbId: 1396,
  title: "إمبراطورية الظلام",
  originalTitle: "Empire of Darkness",
  year: 2023,
  rating: 9.2,
  duration: "55 دقيقة لكل حلقة",
  quality: "1080p BluRay",
  genres: ["دراما", "إثارة", "خيال علمي"],
  countries: ["الولايات المتحدة", "المملكة المتحدة"],
  story:
    "في عام 2150، بعد انهيار الحضارة البشرية بسبب حرب بيولوجية مدمرة، تقوم مجموعة من الناجين ببناء مدينة محصنة تحت الأرض تُدعى \"نيو إدين\". لكن هذه المدينة تخفي أسراراً مظلمة حيث يحكمها مجلس من النخبة يستغلون الموارد لصالحهم. عندما تكتشف الشابة \"ليلا\" الحقيقة وراء جدار الحماية، تبدأ رحلة مليئة بالخطر والمؤامرات للكشف عن الحقيقة والتحرر من سيطرة المجلس. مع كل حلقة جديدة، تتكشف طبقات جديدة من المؤامرة وتتعمق الروابط بين الشخصيات في عالم ما بعد الكارثة.",
  director: "كريستوفر نولان، ليزا جوي",
  directorPhoto: "https://picsum.photos/seed/director2/200/200",
  cast: [
    {
      id: 1,
      name: "إيميليا كلارك",
      character: "ليلا فورسيث",
      photo: "https://picsum.photos/seed/scast1/200/200",
    },
    {
      id: 2,
      name: "أوسكار إسحاق",
      character: "القيصر مالكوم",
      photo: "https://picsum.photos/seed/scast2/200/200",
    },
    {
      id: 3,
      name: "بيتر دينكليدج",
      character: "الدكتور إفرايم",
      photo: "https://picsum.photos/seed/scast3/200/200",
    },
    {
      id: 4,
      name: "زيندايا",
      character: "نورة",
      photo: "https://picsum.photos/seed/scast4/200/200",
    },
    {
      id: 5,
      name: "بيدرو باسكال",
      character: "الرائد كارل",
      photo: "https://picsum.photos/seed/scast5/200/200",
    },
    {
      id: 6,
      name: "فلورنس بيو",
      character: "دكتورة آفا",
      photo: "https://picsum.photos/seed/scast6/200/200",
    },
    {
      id: 7,
      name: "جون برنثال",
      character: "القناص ريد",
      photo: "https://picsum.photos/seed/scast7/200/200",
    },
  ],
  backdrop: "https://picsum.photos/seed/backdrop-series/1920/800",
  poster: "https://picsum.photos/seed/poster-series/400/600",
  trailerUrl: "https://www.youtube.com/embed/Cu9E9bvJt1U",
  servers: [
    {
      id: 1,
      name: "سيرفر 1",
      provider: "VidSrc",
      isActive: true,
      qualities: [
        { label: "1080p", value: "1080" },
        { label: "720p", value: "720" },
      ],
    },
    {
      id: 2,
      name: "سيرفر 2",
      provider: "VidSrc",
      qualities: [
        { label: "1080p", value: "1080" },
        { label: "720p", value: "720" },
        { label: "480p", value: "480" },
      ],
    },
    {
      id: 3,
      name: "سيرفر 3",
      provider: "MultiEmbed",
      qualities: [{ label: "720p", value: "720" }],
    },
  ],
  downloadLinks: [
    {
      quality: "1080p BluRay",
      size: "4.2 GB",
      serverName: "سيرفر التحميل 1",
      url: "#",
    },
    {
      quality: "720p BluRay",
      size: "2.1 GB",
      serverName: "سيرفر التحميل 1",
      url: "#",
    },
    {
      quality: "480p BluRay",
      size: "1.1 GB",
      serverName: "سيرفر التحميل 1",
      url: "#",
    },
  ],
  similar: [
    {
      id: 201,
      title: "عصر التقهقر",
      year: 2024,
      rating: 8.5,
      type: "series",
      poster: "https://picsum.photos/seed/ssim1/400/600",
      quality: "1080p",
    },
    {
      id: 202,
      title: "المستعمرة الأخيرة",
      year: 2023,
      rating: 7.9,
      type: "series",
      poster: "https://picsum.photos/seed/ssim2/400/600",
      quality: "1080p",
    },
    {
      id: 203,
      title: "حرب الفضاء",
      year: 2024,
      rating: 8.1,
      type: "anime",
      poster: "https://picsum.photos/seed/ssim3/400/600",
      quality: "1080p",
    },
    {
      id: 204,
      title: "ظلال المدينة",
      year: 2025,
      rating: 7.6,
      type: "series",
      poster: "https://picsum.photos/seed/ssim4/400/600",
      quality: "1080p",
    },
    {
      id: 205,
      title: "المتمردون",
      year: 2023,
      rating: 8.8,
      type: "series",
      poster: "https://picsum.photos/seed/ssim5/400/600",
      quality: "1080p",
    },
    {
      id: 206,
      title: "العصر المظلم",
      year: 2024,
      rating: 7.3,
      type: "series",
      poster: "https://picsum.photos/seed/ssim6/400/600",
      quality: "720p",
    },
    {
      id: 207,
      title: "بعد الانهيار",
      year: 2025,
      rating: 8.0,
      type: "movie",
      poster: "https://picsum.photos/seed/ssim7/400/600",
      quality: "1080p",
    },
    {
      id: 208,
      title: "أبطال النور",
      year: 2024,
      rating: 6.8,
      type: "anime",
      poster: "https://picsum.photos/seed/ssim8/400/600",
      quality: "1080p",
    },
  ],
  tags: ["جديد", "مميز", "كامل"],
  isSeries: true,
  totalSeasons: 3,
  status: "مكتمل",
  airDate: "2023 - 2025",
  seasons: [
    {
      id: 1,
      seasonNumber: 1,
      title: "الموسم الأول",
      episodeCount: 10,
      episodes: [
        {
          id: 1,
          episodeNumber: 1,
          title: "الفجر الجديد",
          thumbnail: "https://picsum.photos/seed/ep1s1/320/180",
          duration: "55 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 2,
          episodeNumber: 2,
          title: "تحت السطح",
          thumbnail: "https://picsum.photos/seed/ep2s1/320/180",
          duration: "52 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 3,
          episodeNumber: 3,
          title: "أسرار المجلس",
          thumbnail: "https://picsum.photos/seed/ep3s1/320/180",
          duration: "58 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 4,
          episodeNumber: 4,
          title: "التمرد الأول",
          thumbnail: "https://picsum.photos/seed/ep4s1/320/180",
          duration: "50 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 5,
          episodeNumber: 5,
          title: "في قلب الظلام",
          thumbnail: "https://picsum.photos/seed/ep5s1/320/180",
          duration: "56 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 6,
          episodeNumber: 6,
          title: "الحقيقة المرة",
          thumbnail: "https://picsum.photos/seed/ep6s1/320/180",
          duration: "54 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 7,
          episodeNumber: 7,
          title: "خيانة القادة",
          thumbnail: "https://picsum.photos/seed/ep7s1/320/180",
          duration: "53 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 8,
          episodeNumber: 8,
          title: "شعلة الأمل",
          thumbnail: "https://picsum.photos/seed/ep8s1/320/180",
          duration: "57 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 9,
          episodeNumber: 9,
          title: "الاصطدام",
          thumbnail: "https://picsum.photos/seed/ep9s1/320/180",
          duration: "60 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 10,
          episodeNumber: 10,
          title: "بداية النهاية",
          thumbnail: "https://picsum.photos/seed/ep10s1/320/180",
          duration: "62 دقيقة",
          hasSubtitle: true,
        },
      ],
    },
    {
      id: 2,
      seasonNumber: 2,
      title: "الموسم الثاني",
      episodeCount: 10,
      episodes: [
        {
          id: 11,
          episodeNumber: 1,
          title: "من الأنقاض",
          thumbnail: "https://picsum.photos/seed/ep1s2/320/180",
          duration: "55 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 12,
          episodeNumber: 2,
          title: "العالم الخارجي",
          thumbnail: "https://picsum.photos/seed/ep2s2/320/180",
          duration: "58 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 13,
          episodeNumber: 3,
          title: "أعداء جدد",
          thumbnail: "https://picsum.photos/seed/ep3s2/320/180",
          duration: "53 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 14,
          episodeNumber: 4,
          title: "تحالف مظلم",
          thumbnail: "https://picsum.photos/seed/ep4s2/320/180",
          duration: "56 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 15,
          episodeNumber: 5,
          title: "القرار الصعب",
          thumbnail: "https://picsum.photos/seed/ep5s2/320/180",
          duration: "52 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 16,
          episodeNumber: 6,
          title: "الهجوم الكبير",
          thumbnail: "https://picsum.photos/seed/ep6s2/320/180",
          duration: "60 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 17,
          episodeNumber: 7,
          title: "خسائر فادحة",
          thumbnail: "https://picsum.photos/seed/ep7s2/320/180",
          duration: "54 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 18,
          episodeNumber: 8,
          title: "الناجون",
          thumbnail: "https://picsum.photos/seed/ep8s2/320/180",
          duration: "57 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 19,
          episodeNumber: 9,
          title: "خطة ليلا",
          thumbnail: "https://picsum.photos/seed/ep9s2/320/180",
          duration: "55 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 20,
          episodeNumber: 10,
          title: "انتصار باهظ",
          thumbnail: "https://picsum.photos/seed/ep10s2/320/180",
          duration: "65 دقيقة",
          hasSubtitle: true,
        },
      ],
    },
    {
      id: 3,
      seasonNumber: 3,
      title: "الموسم الثالث",
      episodeCount: 8,
      episodes: [
        {
          id: 21,
          episodeNumber: 1,
          title: "فجر جديد",
          thumbnail: "https://picsum.photos/seed/ep1s3/320/180",
          duration: "58 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 22,
          episodeNumber: 2,
          title: "مملكة الظل",
          thumbnail: "https://picsum.photos/seed/ep2s3/320/180",
          duration: "55 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 23,
          episodeNumber: 3,
          title: "الجيش الأخير",
          thumbnail: "https://picsum.photos/seed/ep3s3/320/180",
          duration: "60 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 24,
          episodeNumber: 4,
          title: "ثمن الحرية",
          thumbnail: "https://picsum.photos/seed/ep4s3/320/180",
          duration: "56 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 25,
          episodeNumber: 5,
          title: "المعركة النهائية",
          thumbnail: "https://picsum.photos/seed/ep5s3/320/180",
          duration: "62 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 26,
          episodeNumber: 6,
          title: "تضحية",
          thumbnail: "https://picsum.photos/seed/ep6s3/320/180",
          duration: "59 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 27,
          episodeNumber: 7,
          title: "نور في الظلام",
          thumbnail: "https://picsum.photos/seed/ep7s3/320/180",
          duration: "57 دقيقة",
          hasSubtitle: true,
        },
        {
          id: 28,
          episodeNumber: 8,
          title: "النهاية والبداية",
          thumbnail: "https://picsum.photos/seed/ep8s3/320/180",
          duration: "70 دقيقة",
          hasSubtitle: true,
        },
      ],
    },
  ],
};
