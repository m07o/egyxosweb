import type { Movie, Genre, CastMember, CrewMember, Season, Episode, DownloadLink } from '@/types'

export const genres: Genre[] = [
  { id: 28, name: 'أكشن' },
  { id: 12, name: 'مغامرة' },
  { id: 16, name: 'أنيميشن' },
  { id: 35, name: 'كوميدي' },
  { id: 80, name: 'جريمة' },
  { id: 99, name: 'وثائقي' },
  { id: 18, name: 'دراما' },
  { id: 10751, name: 'عائلي' },
  { id: 14, name: 'فانتازيا' },
  { id: 36, name: 'تاريخي' },
  { id: 27, name: 'رعب' },
  { id: 10402, name: 'موسيقي' },
  { id: 9648, name: 'غموض' },
  { id: 10749, name: 'رومانسي' },
  { id: 878, name: 'خيال علمي' },
  { id: 10770, name: 'مسلسل تلفزيوني' },
  { id: 53, name: 'إثارة' },
  { id: 10752, name: 'حرب' },
  { id: 37, name: 'غربي' },
]

const makeCast = (names: [string, string][]): CastMember[] =>
  names.map(([name, character], i) => ({
    id: 100 + i,
    name,
    character,
    profilePath: null,
  }))

const makeCrew = (names: [string, string, string][]): CrewMember[] =>
  names.map(([name, job, department], i) => ({
    id: 200 + i,
    name,
    job,
    department,
    profilePath: null,
  }))

const makeDownloadLinks = (id: number): DownloadLink[] => [
  { quality: '1080p BluRay', size: `${(1.5 + Math.random() * 1.5).toFixed(1)} GB`, server: 'سيرفر مباشر', url: '#' },
  { quality: '720p BluRay', size: `${(0.8 + Math.random() * 0.5).toFixed(1)} GB`, server: 'سيرفر مباشر', url: '#' },
  { quality: '480p BluRay', size: `${(0.4 + Math.random() * 0.3).toFixed(1)} GB`, server: 'سيرفر مباشر', url: '#' },
]

// ─── All Movies Database ──────────────────────────────────────────

const allMovies: Movie[] = [
  {
    id: 1,
    title: 'ظلال المستقبل',
    originalTitle: 'Shadows of the Future',
    overview: 'في عام 2087، يكتشف العالم أن الزمن يتجه نحو الانهيار. العالم البروفيسور أحمد العلي يقود مهمة صعبة لإنقاذ البشرية من الفناء. في رحلة تمتد بين الماضي والحاضر والمستقبل، يواجه تحديات لم يكن يتخيلها أبداً.',
    posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=Movie+1',
    backdropPath: 'https://placehold.co/1920x800/1a1a2e/e94560?text=Backdrop+1',
    releaseDate: '2024-06-15',
    voteAverage: 8.5,
    voteCount: 12400,
    genreIds: [28, 12, 878],
    genres: [{ id: 28, name: 'أكشن' }, { id: 12, name: 'مغامرة' }, { id: 878, name: 'خيال علمي' }],
    mediaType: 'movie',
    popularity: 95,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم', 'حصري'],
    runtime: 135,
    credits: {
      cast: makeCast([
        ['أحمد السقا', 'البروفيسور أحمد'],
        ['منى زكي', 'الدكتورة سارة'],
        ['كريم عبد العزيز', 'الرائد خالد'],
        ['ياسمين عبد العزيز', 'المهندسة ليلى'],
        ['محمد رمضان', 'العميل عمر'],
      ]),
      crew: makeCrew([
        ['كريستوفر نولان', 'مخرج', 'Directing'],
        ['هانز زيمر', 'مؤلف موسيقي', 'Sound'],
      ]),
    },
    downloadLinks: makeDownloadLinks(1),
  },
  {
    id: 2,
    title: 'عاصفة الصحراء',
    originalTitle: 'Desert Storm',
    overview: 'في قلب الصحراء العربية، يكتشف فريق من المستكشفين أسراراً قديمة مدفونة تحت الرمال. سر عظيم قد يغير مجرى التاريخ إذا وقع في الأيدي الخطأ. مغامرة مليئة بالإثارة والغموض.',
    posterPath: 'https://placehold.co/300x450/2d1b69/e94560?text=Movie+2',
    backdropPath: 'https://placehold.co/1920x800/2d1b69/e94560?text=Backdrop+2',
    releaseDate: '2024-03-22',
    voteAverage: 7.8,
    voteCount: 8900,
    genreIds: [28, 12, 18],
    genres: [{ id: 28, name: 'أكشن' }, { id: 12, name: 'مغامرة' }, { id: 18, name: 'دراما' }],
    mediaType: 'movie',
    popularity: 88,
    adult: false,
    quality: '4K',
    tags: ['4K', 'مترجم', 'جديد'],
    runtime: 142,
    credits: {
      cast: makeCast([
        ['عمرو واكد', 'القائد حسن'],
        ['هنيدى', 'البروفيسور سمير'],
        ['يسرا', 'الدكتورة نادية'],
      ]),
      crew: makeCrew([
        ['ريدلي سكوت', 'مخرج', 'Directing'],
        ['توماس نيومان', 'مؤلف موسيقي', 'Sound'],
      ]),
    },
    downloadLinks: makeDownloadLinks(2),
  },
  {
    id: 3,
    title: 'آخر المحاربين',
    originalTitle: 'The Last Warrior',
    overview: 'محارب وحيد يقاتل لحماية قريته من غزو شرس. في عالم مليء بالفوضى، يكتشف أن القوة الحقيقية تكمن في الروح والتصميم.',
    posterPath: 'https://placehold.co/300x450/0f3460/e94560?text=Movie+3',
    backdropPath: 'https://placehold.co/1920x800/0f3460/e94560?text=Backdrop+3',
    releaseDate: '2023-11-10',
    voteAverage: 8.1,
    voteCount: 10200,
    genreIds: [28, 18, 14],
    genres: [{ id: 28, name: 'أكشن' }, { id: 18, name: 'دراما' }, { id: 14, name: 'فانتازيا' }],
    mediaType: 'movie',
    popularity: 82,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم'],
    runtime: 128,
    credits: {
      cast: makeCast([
        ['أحمد عز', 'ال warrior'],
        ['غادة عادل', 'الأميرة فاطمة'],
      ]),
      crew: makeCrew([
        ['زاندرا لي', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(3),
  },
  {
    id: 4,
    title: 'سر المحيط',
    originalTitle: 'Ocean Secret',
    overview: 'غواصون يكتشفون مدينة مفقودة في أعماق المحيط. لكنهم ليسوا وحدهم هناك. شيء غريب يراقبهم من الظلام.',
    posterPath: 'https://placehold.co/300x450/1a1a2e/533483?text=Movie+4',
    backdropPath: 'https://placehold.co/1920x800/1a1a2e/533483?text=Backdrop+4',
    releaseDate: '2024-01-20',
    voteAverage: 7.5,
    voteCount: 7600,
    genreIds: [28, 878, 27],
    genres: [{ id: 28, name: 'أكشن' }, { id: 878, name: 'خيال علمي' }, { id: 27, name: 'رعب' }],
    mediaType: 'movie',
    popularity: 76,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم'],
    runtime: 118,
    credits: {
      cast: makeCast([
        ['محمد هنيدي', 'الكابتن أحمد'],
        ['دينا الشربيني', 'الباحثة سلمى'],
      ]),
      crew: makeCrew([
        ['جيمس كاميرون', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(4),
  },
  {
    id: 5,
    title: 'طريق النجوم',
    originalTitle: 'Path of Stars',
    overview: 'شاب يطمح لتغيير العالم يبدأ رحلته من حي فقير في القاهرة. عبر العمل الجاد والمثابرة، يصنع أسطورة تُلهم الملايين.',
    posterPath: 'https://placehold.co/300x450/16213e/0f3460?text=Movie+5',
    backdropPath: 'https://placehold.co/1920x800/16213e/0f3460?text=Backdrop+5',
    releaseDate: '2023-09-05',
    voteAverage: 8.3,
    voteCount: 11300,
    genreIds: [18, 35],
    genres: [{ id: 18, name: 'دراما' }, { id: 35, name: 'كوميدي' }],
    mediaType: 'movie',
    popularity: 85,
    adult: false,
    quality: '720p',
    tags: ['HD', 'مترجم', 'جديد'],
    runtime: 120,
    credits: {
      cast: makeCast([
        ['تامر حسني', 'يوسف'],
        ['شيرين عبد الوهاب', 'نور'],
      ]),
      crew: makeCrew([
        ['خالد يوسف', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(5),
  },
  {
    id: 6,
    title: 'ظلام أزلي',
    originalTitle: 'Eternal Darkness',
    overview: 'في ليلة واحدة، يختفي الضوء من الأرض بالكامل. مجموعة من الناجين يبحثون عن مصدر النور المفقود قبل أن يبتلعهم الظلام للأبد.',
    posterPath: 'https://placehold.co/300x450/0a0a0f/e94560?text=Movie+6',
    backdropPath: 'https://placehold.co/1920x800/0a0a0f/e94560?text=Backdrop+6',
    releaseDate: '2024-10-31',
    voteAverage: 7.9,
    voteCount: 9500,
    genreIds: [27, 878, 53],
    genres: [{ id: 27, name: 'رعب' }, { id: 878, name: 'خيال علمي' }, { id: 53, name: 'إثارة' }],
    mediaType: 'movie',
    popularity: 80,
    adult: false,
    quality: '4K',
    tags: ['4K', 'مترجم', 'حصري'],
    runtime: 110,
    credits: {
      cast: makeCast([
        ['يحيى الفخراني', 'الدكتور علي'],
        ['ليلى علوي', 'عالمة الفلك'],
      ]),
      crew: makeCrew([
        ['مايك فلاناغان', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(6),
  },
  {
    id: 7,
    title: 'حكاية حب',
    originalTitle: 'A Love Story',
    overview: 'في شوارع إسطنبول القديمة، تلتقي شابة مصرية بفنان تركي. حب يجمع بين ثقافتين مختلفين ويواجه تحديات لا حصر لها.',
    posterPath: 'https://placehold.co/300x450/2d1b69/e94560?text=Movie+7',
    backdropPath: 'https://placehold.co/1920x800/2d1b69/e94560?text=Backdrop+7',
    releaseDate: '2024-02-14',
    voteAverage: 7.6,
    voteCount: 8200,
    genreIds: [10749, 18, 35],
    genres: [{ id: 10749, name: 'رومانسي' }, { id: 18, name: 'دراما' }, { id: 35, name: 'كوميدي' }],
    mediaType: 'movie',
    popularity: 78,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم'],
    runtime: 115,
    credits: {
      cast: makeCast([
        ['حسن الرداد', 'كريم'],
        ['هند صبري', 'ليلى'],
      ]),
      crew: makeCrew([
        ['نورى بيلجي جيلان', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(7),
  },
  {
    id: 8,
    title: 'الفارس الأسود',
    originalTitle: 'The Dark Knight Returns',
    overview: 'بطل مظلم يعود بعد سنوات من الاختفاء لمواجهة تهديد جديد يهدد مدينته. معركة أخلاقية بين العدالة والانتقام.',
    posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=Movie+8',
    backdropPath: 'https://placehold.co/1920x800/1a1a2e/e94560?text=Backdrop+8',
    releaseDate: '2025-01-15',
    voteAverage: 9.0,
    voteCount: 15600,
    genreIds: [28, 80, 18],
    genres: [{ id: 28, name: 'أكشن' }, { id: 80, name: 'جريمة' }, { id: 18, name: 'دراما' }],
    mediaType: 'movie',
    popularity: 97,
    adult: false,
    quality: '4K',
    tags: ['4K', 'مترجم', 'حصري', 'جديد'],
    runtime: 155,
    credits: {
      cast: makeCast([
        ['محمد منير', 'الفارس'],
        ['نيللي كريم', 'المحققة'],
      ]),
      crew: makeCrew([
        ['كريستوفر نولان', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(8),
  },
  {
    id: 9,
    title: 'رحلة إلى المريخ',
    originalTitle: 'Journey to Mars',
    overview: 'أول بعثة بشرية إلى المريخ تواجه مشاكل غير متوقعة. فريق من الرواد يقاتلون للبقاء على قيد الحياة في كوكب معاد.',
    posterPath: 'https://placehold.co/300x450/0f3460/e94560?text=Movie+9',
    backdropPath: 'https://placehold.co/1920x800/0f3460/e94560?text=Backdrop+9',
    releaseDate: '2024-07-20',
    voteAverage: 8.2,
    voteCount: 10800,
    genreIds: [878, 28, 18],
    genres: [{ id: 878, name: 'خيال علمي' }, { id: 28, name: 'أكشن' }, { id: 18, name: 'دراما' }],
    mediaType: 'movie',
    popularity: 90,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم', 'جديد'],
    runtime: 148,
    credits: {
      cast: makeCast([
        ['خالد أبو النجا', 'القائد'],
        ['مريم فخر الدين', 'المهندسة'],
      ]),
      crew: makeCrew([
        ['دينيس فيلنوف', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(9),
  },
  {
    id: 10,
    title: 'المافيا العربية',
    originalTitle: 'Arab Mafia',
    overview: 'عالم الجريمة المنظمة في الشرق الأوسط. صراع على السلطة والثروة يكشف أسراراً مظلمة عن عائلات تتحكم في مصائر الملايين.',
    posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=Movie+10',
    backdropPath: 'https://placehold.co/1920x800/1a1a2e/e94560?text=Backdrop+10',
    releaseDate: '2024-04-10',
    voteAverage: 8.4,
    voteCount: 9900,
    genreIds: [80, 18, 53],
    genres: [{ id: 80, name: 'جريمة' }, { id: 18, name: 'دراما' }, { id: 53, name: 'إثارة' }],
    mediaType: 'movie',
    popularity: 87,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم', 'حصري'],
    runtime: 138,
    credits: {
      cast: makeCast([
        ['عادل إمام', 'الزعيم'],
        ['أحمد حلمي', 'الوريث'],
      ]),
      crew: makeCrew([
        ['مارتن سكورسيزي', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(10),
  },
  {
    id: 11,
    title: 'أسرار الليل',
    originalTitle: 'Night Secrets',
    overview: 'محقق خاص يبحث عن حقيقة اختفاء سيدة أعمال شهيرة. كل线索 يقوده إلى عالم أعمق وأكثر خطورة.',
    posterPath: 'https://placehold.co/300x450/2d1b69/e94560?text=Movie+11',
    backdropPath: 'https://placehold.co/1920x800/2d1b69/e94560?text=Backdrop+11',
    releaseDate: '2023-08-18',
    voteAverage: 7.3,
    voteCount: 6800,
    genreIds: [9648, 53, 18],
    genres: [{ id: 9648, name: 'غموض' }, { id: 53, name: 'إثارة' }, { id: 18, name: 'دراما' }],
    mediaType: 'movie',
    popularity: 72,
    adult: false,
    quality: '720p',
    tags: ['HD', 'مترجم'],
    runtime: 125,
    credits: {
      cast: makeCast([
        ['يوسف الشريف', 'المحقق عمر'],
        ['أحمد مالك', 'المشتبه'],
      ]),
      crew: makeCrew([
        ['ديفيد فينشر', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(11),
  },
  {
    id: 12,
    title: 'وادي الذئاب',
    originalTitle: 'Valley of Wolves',
    overview: 'صراع قبلي قديم يتصاعد في وادي نائي. شاب يعود إلى موطنه بعد غياب طويل ليكتشف أن لا شيء تغير سوى الأسلحة.',
    posterPath: 'https://placehold.co/300x450/0f3460/e94560?text=Movie+12',
    backdropPath: 'https://placehold.co/1920x800/0f3460/e94560?text=Backdrop+12',
    releaseDate: '2024-12-01',
    voteAverage: 7.7,
    voteCount: 8400,
    genreIds: [28, 18, 36],
    genres: [{ id: 28, name: 'أكشن' }, { id: 18, name: 'دراما' }, { id: 36, name: 'تاريخي' }],
    mediaType: 'movie',
    popularity: 74,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم', 'جديد'],
    runtime: 132,
    credits: {
      cast: makeCast([
        ['طارق لطفي', 'سالم'],
        ['أمينة خليل', 'هدى'],
      ]),
      crew: makeCrew([
        ['سراج الدين', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(12),
  },
  // ─── Asian Movies ───
  {
    id: 13,
    title: 'الساموراي الأخير',
    originalTitle: 'The Last Samurai',
    overview: 'محارب ساموراي يرفض التخلي عن طريقه القديم في عالم يتغير بسرعة. قصة شرف وتضحية في اليابان القرن التاسع عشر.',
    posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=Movie+13',
    backdropPath: 'https://placehold.co/1920x800/1a1a2e/e94560?text=Backdrop+13',
    releaseDate: '2023-05-20',
    voteAverage: 8.6,
    voteCount: 13200,
    genreIds: [28, 18, 36],
    genres: [{ id: 28, name: 'أكشن' }, { id: 18, name: 'دراما' }, { id: 36, name: 'تاريخي' }],
    mediaType: 'movie',
    popularity: 92,
    adult: false,
    quality: '4K',
    tags: ['4K', 'مترجم', 'آسيوي'],
    runtime: 150,
    credits: {
      cast: makeCast([
        ['كين واتانابي', 'الساموراي'],
        ['توم كروز', 'الجنرال'],
      ]),
      crew: makeCrew([
        ['إدوارد زويك', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(13),
  },
  {
    id: 14,
    title: 'تنين السماء',
    originalTitle: 'Sky Dragon',
    overview: 'فيلم فنون قتالية صيني أسطوري يروي قصة فتاة تتدرب لتصبح أعظم محاربة في التاريخ. مشاهد قتالية مذهلة وقصة ملهمة.',
    posterPath: 'https://placehold.co/300x450/2d1b69/e94560?text=Movie+14',
    backdropPath: 'https://placehold.co/1920x800/2d1b69/e94560?text=Backdrop+14',
    releaseDate: '2024-02-10',
    voteAverage: 8.0,
    voteCount: 9100,
    genreIds: [28, 14, 12],
    genres: [{ id: 28, name: 'أكشن' }, { id: 14, name: 'فانتازيا' }, { id: 12, name: 'مغامرة' }],
    mediaType: 'movie',
    popularity: 79,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم', 'آسيوي'],
    runtime: 135,
    credits: {
      cast: makeCast([
        ['ليو ييفي', 'المحاربة'],
      ]),
      crew: makeCrew([
        ['أنغ لي', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(14),
  },
  {
    id: 15,
    title: 'قلب التاجر',
    originalTitle: 'Heart of the Merchant',
    overview: 'دراما كورية عن تاجر صغير يتحول إلى أقوى رجل أعمال في كوريا. قصة طموح وحب وخيانة في عالم الأعمال.',
    posterPath: 'https://placehold.co/300x450/0f3460/e94560?text=Movie+15',
    backdropPath: 'https://placehold.co/1920x800/0f3460/e94560?text=Backdrop+15',
    releaseDate: '2024-06-05',
    voteAverage: 7.9,
    voteCount: 8700,
    genreIds: [18, 35, 10749],
    genres: [{ id: 18, name: 'دراما' }, { id: 35, name: 'كوميدي' }, { id: 10749, name: 'رومانسي' }],
    mediaType: 'movie',
    popularity: 77,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم', 'آسيوي', 'كوري'],
    runtime: 122,
    credits: {
      cast: makeCast([
        ['لي من هونغ', 'التاجر'],
        ['سونغ هي كيو', 'الحبيبة'],
      ]),
      crew: makeCrew([
        ['بارك تشان ووك', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(15),
  },
  {
    id: 16,
    title: 'أرواح طوكيو',
    originalTitle: 'Tokyo Spirits',
    overview: 'فيلم ياباني عن شبح يعيش في طوكيو ويحاول حل لغز موته قبل أن يختفي إلى الأبد. مزيج بين الرعب والرومانسية.',
    posterPath: 'https://placehold.co/300x450/16213e/0f3460?text=Movie+16',
    backdropPath: 'https://placehold.co/1920x800/16213e/0f3460?text=Backdrop+16',
    releaseDate: '2023-10-15',
    voteAverage: 7.4,
    voteCount: 7200,
    genreIds: [27, 10749, 18],
    genres: [{ id: 27, name: 'رعب' }, { id: 10749, name: 'رومانسي' }, { id: 18, name: 'دراما' }],
    mediaType: 'movie',
    popularity: 71,
    adult: false,
    quality: '720p',
    tags: ['HD', 'مترجم', 'آسيوي'],
    runtime: 118,
    credits: {
      cast: makeCast([
        ['هيريوكي سانادا', 'الشبح'],
      ]),
      crew: makeCrew([
        ['تاكاشي ميكي', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(16),
  },
  {
    id: 17,
    title: 'الموجة الكورية',
    originalTitle: 'The Korean Wave',
    overview: 'دراما اجتماعية عن أثر الثقافة الكورية في العالم العربي. شاب عربي يسافر إلى سيول لتحقيق حلمه ويواجه تحديات ثقافية.',
    posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=Movie+17',
    backdropPath: 'https://placehold.co/1920x800/1a1a2e/e94560?text=Backdrop+17',
    releaseDate: '2024-08-20',
    voteAverage: 7.2,
    voteCount: 6500,
    genreIds: [18, 35],
    genres: [{ id: 18, name: 'دراما' }, { id: 35, name: 'كوميدي' }],
    mediaType: 'movie',
    popularity: 69,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم', 'آسيوي', 'كوري'],
    runtime: 110,
    credits: {
      cast: makeCast([
        ['محمد رمضان', 'الشاب'],
      ]),
      crew: makeCrew([
        ['بونغ جون هو', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(17),
  },
  {
    id: 18,
    title: 'نينجا الظلام',
    originalTitle: 'Dark Ninja',
    overview: 'نينجا محترف يُكلف بمهمة إنقاذ أمير مختطف. في رحلته يواجه أعداء أقوياء ويكتشف مؤامرة تهدد الإمبراطورية.',
    posterPath: 'https://placehold.co/300x450/0a0a0f/e94560?text=Movie+18',
    backdropPath: 'https://placehold.co/1920x800/0a0a0f/e94560?text=Backdrop+18',
    releaseDate: '2024-05-15',
    voteAverage: 7.8,
    voteCount: 8000,
    genreIds: [28, 12, 53],
    genres: [{ id: 28, name: 'أكشن' }, { id: 12, name: 'مغامرة' }, { id: 53, name: 'إثارة' }],
    mediaType: 'movie',
    popularity: 81,
    adult: false,
    quality: '4K',
    tags: ['4K', 'مترجم', 'آسيوي'],
    runtime: 130,
    credits: {
      cast: makeCast([
        ['هيرويوكي سانادا', 'النينجا'],
      ]),
      crew: makeCrew([
        ['تاكاشي مياكي', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(18),
  },
  // ─── Arabic Movies ───
  {
    id: 19,
    title: 'بيت الأسرار',
    originalTitle: 'House of Secrets',
    overview: 'عائلة مصرية تعيش في قصر قديم مليء بالأسرار. بعد وفاة الجد، تبدأ الأحداث المysterious بالظهور واحدة تلو الأخرى.',
    posterPath: 'https://placehold.co/300x450/2d1b69/e94560?text=Movie+19',
    backdropPath: 'https://placehold.co/1920x800/2d1b69/e94560?text=Backdrop+19',
    releaseDate: '2024-09-15',
    voteAverage: 7.5,
    voteCount: 7800,
    genreIds: [18, 9648, 27],
    genres: [{ id: 18, name: 'دراما' }, { id: 9648, name: 'غموض' }, { id: 27, name: 'رعب' }],
    mediaType: 'movie',
    popularity: 75,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'عربي', 'جديد'],
    runtime: 125,
    credits: {
      cast: makeCast([
        ['يحيى الفخراني', 'الجد'],
        ['منى زكي', 'الحفيدة'],
        ['أحمد حلمي', 'الابن'],
      ]),
      crew: makeCrew([
        ['شريف عرفة', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(19),
  },
  {
    id: 20,
    title: 'كازابلانكا',
    originalTitle: 'Casablanca',
    overview: 'فيلم رومانسي يروي قصة حب بين صحفية مصرية ورجل أعمال مغربي في شوارع كازابلانكا الساحرة.',
    posterPath: 'https://placehold.co/300x450/0f3460/e94560?text=Movie+20',
    backdropPath: 'https://placehold.co/1920x800/0f3460/e94560?text=Backdrop+20',
    releaseDate: '2024-03-08',
    voteAverage: 7.1,
    voteCount: 6200,
    genreIds: [10749, 18],
    genres: [{ id: 10749, name: 'رومانسي' }, { id: 18, name: 'دراما' }],
    mediaType: 'movie',
    popularity: 68,
    adult: false,
    quality: '720p',
    tags: ['HD', 'عربي'],
    runtime: 115,
    credits: {
      cast: makeCast([
        ['حسن الرداد', 'الصحفي'],
        ['ياسمين صبري', 'الحبيبة'],
      ]),
      crew: makeCrew([
        ['يوسف شاهين', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(20),
  },
  {
    id: 21,
    title: 'السقا',
    originalTitle: 'The Water Carrier',
    overview: 'دراما تاريخية عن السقا في مصر القديمة. رحلة بطل يبحث عن الماء في وقت الجفاف ويعلم معنى التضحية.',
    posterPath: 'https://placehold.co/300x450/16213e/e94560?text=Movie+21',
    backdropPath: 'https://placehold.co/1920x800/16213e/e94560?text=Backdrop+21',
    releaseDate: '2023-12-25',
    voteAverage: 8.0,
    voteCount: 9300,
    genreIds: [18, 36, 12],
    genres: [{ id: 18, name: 'دراما' }, { id: 36, name: 'تاريخي' }, { id: 12, name: 'مغامرة' }],
    mediaType: 'movie',
    popularity: 83,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'عربي'],
    runtime: 140,
    credits: {
      cast: makeCast([
        ['أحمد السقا', 'السقا'],
        ['منى زكي', 'الزوجة'],
      ]),
      crew: makeCrew([
        ['محمد ياسين', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(21),
  },
  {
    id: 22,
    title: 'كوميدية مصرية',
    originalTitle: 'Egyptian Comedy',
    overview: 'فيلم كوميدي يروي قصة ثلاثة أصدقاء يقررون فتح مطعم في القاهرة. مغامرات مضحكة ومواقف محرجة لا تنتهي.',
    posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=Movie+22',
    backdropPath: 'https://placehold.co/1920x800/1a1a2e/e94560?text=Backdrop+22',
    releaseDate: '2024-07-01',
    voteAverage: 6.8,
    voteCount: 5500,
    genreIds: [35, 18],
    genres: [{ id: 35, name: 'كوميدي' }, { id: 18, name: 'دراما' }],
    mediaType: 'movie',
    popularity: 70,
    adult: false,
    quality: '720p',
    tags: ['HD', 'عربي', 'جديد'],
    runtime: 105,
    credits: {
      cast: makeCast([
        ['أحمد حلمي', 'صاحب المطعم'],
        ['محمد هنيدي', 'الصديق'],
      ]),
      crew: makeCrew([
        ['شريف عرفة', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(22),
  },
  // ─── TV Series ───
  {
    id: 100,
    title: 'عالم الظلال',
    originalTitle: 'Shadow World',
    overview: 'مسلسل إثارة ينشرح عن عالم سري من العملاء. عميل سري يُكلف بمهمة اختراق منظمة دولية خطيرة.',
    posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=Series+1',
    backdropPath: 'https://placehold.co/1920x800/1a1a2e/e94560?text=Backdrop+S1',
    releaseDate: '2024-01-15',
    voteAverage: 8.7,
    voteCount: 14200,
    genreIds: [18, 53, 80],
    genres: [{ id: 18, name: 'دراما' }, { id: 53, name: 'إثارة' }, { id: 80, name: 'جريمة' }],
    mediaType: 'tv',
    popularity: 96,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم', 'حصري'],
    seasons: [
      {
        id: 1001,
        seasonNumber: 1,
        name: 'الموسم الأول',
        episodeCount: 10,
        airDate: '2024-01-15',
        overview: 'يبدأ العميل رحلته في عالم الجاسوسية',
        posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=S1',
        episodes: Array.from({ length: 10 }, (_, i) => ({
          id: 10010 + i,
          seasonNumber: 1,
          episodeNumber: i + 1,
          name: `الحلقة ${i + 1}: البداية`,
          overview: 'في هذه الحلقة نتعرف على بطل المسلسل وتبدأ المهمة الخطيرة.',
          stillPath: null,
          airDate: `2024-01-${15 + i}`,
          runtime: 45,
        })),
      },
      {
        id: 1002,
        seasonNumber: 2,
        name: 'الموسم الثاني',
        episodeCount: 12,
        airDate: '2024-07-01',
        overview: 'تتصاعد الأحداث وتنكشف الأسرار',
        posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=S2',
        episodes: Array.from({ length: 12 }, (_, i) => ({
          id: 20010 + i,
          seasonNumber: 2,
          episodeNumber: i + 1,
          name: `الحلقة ${i + 1}: المواجهة`,
          overview: 'المواجهة الكبرى تبدأ وكل شيء يتغير.',
          stillPath: null,
          airDate: `2024-07-${1 + i}`,
          runtime: 50,
        })),
      },
    ],
    credits: {
      cast: makeCast([
        ['عادل إمام', 'المحقق'],
        ['نيللي كريم', 'العميلة'],
      ]),
      crew: makeCrew([
        ['بيتر مورغان', 'منتج', 'Production'],
      ]),
    },
    downloadLinks: makeDownloadLinks(100),
  },
  {
    id: 101,
    title: 'ملوك الشوارع',
    originalTitle: 'Kings of the Streets',
    overview: 'دراما حضرية عن شباب يكافحون في شوارع القاهرة. قصص حب وأحلام وصراعات في سباق البقاء.',
    posterPath: 'https://placehold.co/300x450/2d1b69/e94560?text=Series+2',
    backdropPath: 'https://placehold.co/1920x800/2d1b69/e94560?text=Backdrop+S2',
    releaseDate: '2024-03-20',
    voteAverage: 7.9,
    voteCount: 9800,
    genreIds: [18, 80, 35],
    genres: [{ id: 18, name: 'دراما' }, { id: 80, name: 'جريمة' }, { id: 35, name: 'كوميدي' }],
    mediaType: 'tv',
    popularity: 84,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'مترجم'],
    seasons: [
      {
        id: 1011,
        seasonNumber: 1,
        name: 'الموسم الأول',
        episodeCount: 8,
        airDate: '2024-03-20',
        overview: 'تبدأ رحلة الأبطال في الشوارع',
        posterPath: 'https://placehold.co/300x450/2d1b69/e94560?text=S1',
        episodes: Array.from({ length: 8 }, (_, i) => ({
          id: 10110 + i,
          seasonNumber: 1,
          episodeNumber: i + 1,
          name: `الحلقة ${i + 1}: في الشارع`,
          overview: 'مواقف يومية من حياة الشباب.',
          stillPath: null,
          airDate: `2024-03-${20 + i}`,
          runtime: 42,
        })),
      },
    ],
    credits: {
      cast: makeCast([
        ['محمد رمضان', 'رامي'],
        ['هند صبري', 'القائدة'],
      ]),
      crew: makeCrew([
        ['محمد سامي', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(101),
  },
  {
    id: 102,
    title: 'خيط العنكبوت',
    originalTitle: 'Spider Web',
    overview: 'مسلسل جريمة يتبع محققة عبقرية تحل أكثر القضايا تعقيداً. كل قضية تقودها إلى خيط عنكبوت أوسع.',
    posterPath: 'https://placehold.co/300x450/0f3460/e94560?text=Series+3',
    backdropPath: 'https://placehold.co/1920x800/0f3460/e94560?text=Backdrop+S3',
    releaseDate: '2024-05-10',
    voteAverage: 8.3,
    voteCount: 11500,
    genreIds: [9648, 80, 53],
    genres: [{ id: 9648, name: 'غموض' }, { id: 80, name: 'جريمة' }, { id: 53, name: 'إثارة' }],
    mediaType: 'tv',
    popularity: 89,
    adult: false,
    quality: '4K',
    tags: ['4K', 'مترجم', 'حصري'],
    seasons: [
      {
        id: 1021,
        seasonNumber: 1,
        name: 'الموسم الأول',
        episodeCount: 10,
        airDate: '2024-05-10',
        overview: 'أولى القضايا المعقدة',
        posterPath: 'https://placehold.co/300x450/0f3460/e94560?text=S1',
        episodes: Array.from({ length: 10 }, (_, i) => ({
          id: 10210 + i,
          seasonNumber: 1,
          episodeNumber: i + 1,
          name: `الحلقة ${i + 1}: القضية ${i + 1}`,
          overview: 'قضية جديدة تُحل بخطوات عبقرية.',
          stillPath: null,
          airDate: `2024-05-${10 + i}`,
          runtime: 55,
        })),
      },
    ],
    credits: {
      cast: makeCast([
        ['يوسف الشريف', 'المحقق'],
        ['غادة عادل', 'المساعدة'],
      ]),
      crew: makeCrew([
        ['هيثم حقي', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(102),
  },
  {
    id: 103,
    title: 'رمضان كريم',
    originalTitle: 'Ramadan Kareem',
    overview: 'مسلسل كوميدي درامي يروي قصة عائلة مصرية خلال شهر رمضان. مواقف مضحكة ودرساً في التسامح.',
    posterPath: 'https://placehold.co/300x450/16213e/0f3460?text=Series+4',
    backdropPath: 'https://placehold.co/1920x800/16213e/e94560?text=Backdrop+S4',
    releaseDate: '2024-03-11',
    voteAverage: 7.4,
    voteCount: 8600,
    genreIds: [35, 18],
    genres: [{ id: 35, name: 'كوميدي' }, { id: 18, name: 'دراما' }],
    mediaType: 'tv',
    popularity: 78,
    adult: false,
    quality: '720p',
    tags: ['HD', 'عربي', 'رمضاني'],
    seasons: [
      {
        id: 1031,
        seasonNumber: 1,
        name: 'الموسم الأول - رمضان 2024',
        episodeCount: 30,
        airDate: '2024-03-11',
        overview: 'الأحداث تبدأ في أول أيام رمضان',
        posterPath: 'https://placehold.co/300x450/16213e/e94560?text=S1',
        episodes: Array.from({ length: 30 }, (_, i) => ({
          id: 10310 + i,
          seasonNumber: 1,
          episodeNumber: i + 1,
          name: `الحلقة ${i + 1}`,
          overview: 'مواقف يومية في شهر رمضان.',
          stillPath: null,
          airDate: `2024-03-${11 + i > 31 ? 31 : 11 + i}`,
          runtime: 45,
        })),
      },
    ],
    credits: {
      cast: makeCast([
        ['أحمد حلمي', 'الأب'],
        ['دينا الشربيني', 'الأم'],
      ]),
      crew: makeCrew([
        ['رامي إمام', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(103),
  },
  {
    id: 104,
    title: 'صرخة حجر',
    originalTitle: 'Cry of Stone',
    overview: 'مسلسل تاريخي عن الفتح الإسلامي. يروي قصة الصحابة والفتوحات بأسلوب درامي مشوق.',
    posterPath: 'https://placehold.co/300x450/0a0a0f/e94560?text=Series+5',
    backdropPath: 'https://placehold.co/1920x800/0a0a0f/e94560?text=Backdrop+S5',
    releaseDate: '2024-03-12',
    voteAverage: 8.8,
    voteCount: 16000,
    genreIds: [18, 36, 12],
    genres: [{ id: 18, name: 'دراما' }, { id: 36, name: 'تاريخي' }, { id: 12, name: 'مغامرة' }],
    mediaType: 'tv',
    popularity: 93,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'عربي', 'رمضاني', 'حصري'],
    seasons: [
      {
        id: 1041,
        seasonNumber: 1,
        name: 'الموسم الأول',
        episodeCount: 30,
        airDate: '2024-03-12',
        overview: 'بداية الفتوحات الإسلامية',
        posterPath: 'https://placehold.co/300x450/0a0a0f/e94560?text=S1',
        episodes: Array.from({ length: 30 }, (_, i) => ({
          id: 10410 + i,
          seasonNumber: 1,
          episodeNumber: i + 1,
          name: `الحلقة ${i + 1}`,
          overview: 'أحداث من التاريخ الإسلامي.',
          stillPath: null,
          airDate: `2024-03-${12 + (i > 19 ? 0 : i)}`,
          runtime: 50,
        })),
      },
    ],
    credits: {
      cast: makeCast([
        ['عمرو واكد', 'القائد'],
        ['أحمد عز', 'الصحابي'],
      ]),
      crew: makeCrew([
        ['محمد ياسين', 'مخرج', 'Directing'],
      ]),
    },
    downloadLinks: makeDownloadLinks(104),
  },
  // ─── Anime ───
  {
    id: 200,
    title: 'فارس الظلام',
    originalTitle: 'Dark Knight Anime',
    overview: 'أنمي أكشن عن فارس يقاتل قوى الظلام لإنقاذ مملكته. في عالم مليء بالسحر والوحوش، فقط الأقوياء يبقون.',
    posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=Anime+1',
    backdropPath: 'https://placehold.co/1920x800/1a1a2e/e94560?text=Backdrop+A1',
    releaseDate: '2024-04-01',
    voteAverage: 8.9,
    voteCount: 18000,
    genreIds: [16, 28, 14],
    genres: [{ id: 16, name: 'أنيميشن' }, { id: 28, name: 'أكشن' }, { id: 14, name: 'فانتازيا' }],
    mediaType: 'tv',
    popularity: 98,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'أنمي', 'مترجم'],
    seasons: [
      {
        id: 2001,
        seasonNumber: 1,
        name: 'الموسم الأول',
        episodeCount: 24,
        airDate: '2024-04-01',
        overview: 'يبدأ الفارس رحلته',
        posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=AS1',
        episodes: Array.from({ length: 24 }, (_, i) => ({
          id: 20010 + i,
          seasonNumber: 1,
          episodeNumber: i + 1,
          name: `الحلقة ${i + 1}`,
          overview: 'معركة جديدة في كل حلقة.',
          stillPath: null,
          airDate: '2024-04-01',
          runtime: 24,
        })),
      },
    ],
    credits: {
      cast: makeCast([
        ['يوتسوبر', 'الفارس'],
      ]),
      crew: makeCrew([
        ['مادهاوس', 'استوديو', 'Production'],
      ]),
    },
    downloadLinks: makeDownloadLinks(200),
  },
  {
    id: 201,
    title: 'روح السيف',
    originalTitle: 'Soul of the Sword',
    overview: 'أنمي عن شاب يجد سيفاً أسطورياً يمنحه قوة خارقة. لكن مع القوة تأتي المسؤولية والعدواء.',
    posterPath: 'https://placehold.co/300x450/2d1b69/e94560?text=Anime+2',
    backdropPath: 'https://placehold.co/1920x800/2d1b69/e94560?text=Backdrop+A2',
    releaseDate: '2024-07-10',
    voteAverage: 8.5,
    voteCount: 14500,
    genreIds: [16, 28, 14],
    genres: [{ id: 16, name: 'أنيميشن' }, { id: 28, name: 'أكشن' }, { id: 14, name: 'فانتازيا' }],
    mediaType: 'tv',
    popularity: 91,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'أنمي', 'مترجم'],
    seasons: [
      {
        id: 2011,
        seasonNumber: 1,
        name: 'الموسم الأول',
        episodeCount: 12,
        airDate: '2024-07-10',
        overview: 'اكتشاف السيف',
        posterPath: 'https://placehold.co/300x450/2d1b69/e94560?text=AS2',
        episodes: Array.from({ length: 12 }, (_, i) => ({
          id: 20110 + i,
          seasonNumber: 1,
          episodeNumber: i + 1,
          name: `الحلقة ${i + 1}`,
          overview: 'تدريب ومغامرة مع السيف.',
          stillPath: null,
          airDate: '2024-07-10',
          runtime: 24,
        })),
      },
    ],
    credits: {
      cast: makeCast([
        ['مؤدي صوت', 'البطل'],
      ]),
      crew: makeCrew([
        ['مابا', 'استوديو', 'Production'],
      ]),
    },
    downloadLinks: makeDownloadLinks(201),
  },
  {
    id: 202,
    title: 'عالم الروبوتات',
    originalTitle: 'Robot World',
    overview: 'في المستقبل البعيد، يتحكم البشر في روبوتات عملاقة في معارك عالمية. شاب يصبح بطلاً بفضل روبوته المتواضع.',
    posterPath: 'https://placehold.co/300x450/0f3460/e94560?text=Anime+3',
    backdropPath: 'https://placehold.co/1920x800/0f3460/e94560?text=Backdrop+A3',
    releaseDate: '2024-01-20',
    voteAverage: 8.1,
    voteCount: 11000,
    genreIds: [16, 878, 28],
    genres: [{ id: 16, name: 'أنيميشن' }, { id: 878, name: 'خيال علمي' }, { id: 28, name: 'أكشن' }],
    mediaType: 'tv',
    popularity: 86,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'أنمي', 'مترجم', 'جديد'],
    seasons: [
      {
        id: 2021,
        seasonNumber: 1,
        name: 'الموسم الأول',
        episodeCount: 26,
        airDate: '2024-01-20',
        overview: 'أول بطولة في عالم الروبوتات',
        posterPath: 'https://placehold.co/300x450/0f3460/e94560?text=AS3',
        episodes: Array.from({ length: 26 }, (_, i) => ({
          id: 20210 + i,
          seasonNumber: 1,
          episodeNumber: i + 1,
          name: `الحلقة ${i + 1}`,
          overview: 'معركة روبوتات جديدة.',
          stillPath: null,
          airDate: '2024-01-20',
          runtime: 24,
        })),
      },
    ],
    credits: {
      cast: makeCast([
        ['مؤدي صوت', 'البطل'],
      ]),
      crew: makeCrew([
        ['بوني', 'استوديو', 'Production'],
      ]),
    },
    downloadLinks: makeDownloadLinks(202),
  },
  {
    id: 203,
    title: 'حكايات يابانية',
    originalTitle: 'Japanese Tales',
    overview: 'أنمي يستند إلى أساطير يابانية قديمة. قصص عن الأرواح والوحوش والآلهة في عالم ساحر.',
    posterPath: 'https://placehold.co/300x450/16213e/e94560?text=Anime+4',
    backdropPath: 'https://placehold.co/1920x800/16213e/e94560?text=Backdrop+A4',
    releaseDate: '2023-10-01',
    voteAverage: 8.7,
    voteCount: 13200,
    genreIds: [16, 14, 27],
    genres: [{ id: 16, name: 'أنيميشن' }, { id: 14, name: 'فانتازيا' }, { id: 27, name: 'رعب' }],
    mediaType: 'tv',
    popularity: 88,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'أنمي', 'مترجم'],
    seasons: [
      {
        id: 2031,
        seasonNumber: 1,
        name: 'الموسم الأول',
        episodeCount: 12,
        airDate: '2023-10-01',
        overview: 'أساطير من الماضي',
        posterPath: 'https://placehold.co/300x450/16213e/e94560?text=AS4',
        episodes: Array.from({ length: 12 }, (_, i) => ({
          id: 20310 + i,
          seasonNumber: 1,
          episodeNumber: i + 1,
          name: `الحلقة ${i + 1}`,
          overview: 'أسطورة يابانية مشوقة.',
          stillPath: null,
          airDate: '2023-10-01',
          runtime: 24,
        })),
      },
    ],
    credits: {
      cast: makeCast([
        ['مؤدي صوت', 'البطل'],
      ]),
      crew: makeCrew([
        ['أوف هيلز', 'استوديو', 'Production'],
      ]),
    },
    downloadLinks: makeDownloadLinks(203),
  },
  {
    id: 204,
    title: 'قائد العصابة',
    originalTitle: 'Gang Leader',
    overview: 'أنمي إثارة عن طالب جامعي يصبح قائد عصابة سرية. صراع على السلطة في عالم الجريمة الخفي.',
    posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=Anime+5',
    backdropPath: 'https://placehold.co/1920x800/1a1a2e/e94560?text=Backdrop+A5',
    releaseDate: '2024-09-15',
    voteAverage: 8.4,
    voteCount: 12800,
    genreIds: [16, 80, 53],
    genres: [{ id: 16, name: 'أنيميشن' }, { id: 80, name: 'جريمة' }, { id: 53, name: 'إثارة' }],
    mediaType: 'tv',
    popularity: 90,
    adult: false,
    quality: '1080p',
    tags: ['HD', 'أنمي', 'مترجم', 'جديد'],
    seasons: [
      {
        id: 2041,
        seasonNumber: 1,
        name: 'الموسم الأول',
        episodeCount: 13,
        airDate: '2024-09-15',
        overview: 'صعود القائد الجديد',
        posterPath: 'https://placehold.co/300x450/1a1a2e/e94560?text=AS5',
        episodes: Array.from({ length: 13 }, (_, i) => ({
          id: 20410 + i,
          seasonNumber: 1,
          episodeNumber: i + 1,
          name: `الحلقة ${i + 1}`,
          overview: 'صراع وتحالفات في عالم العصابات.',
          stillPath: null,
          airDate: '2024-09-15',
          runtime: 24,
        })),
      },
    ],
    credits: {
      cast: makeCast([
        ['مؤدي صوت', 'القائد'],
      ]),
      crew: makeCrew([
        ['مابا', 'استوديو', 'Production'],
      ]),
    },
    downloadLinks: makeDownloadLinks(204),
  },
]

// Add similar movies to each movie
allMovies.forEach((movie) => {
  const similarIds = allMovies
    .filter((m) => m.id !== movie.id && m.mediaType === movie.mediaType)
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)
  movie.similar = similarIds
})

// ─── Category Exports ─────────────────────────────────────────────

export const dummyTrending = allMovies
  .filter((m) => m.popularity >= 85)
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 10)

export const dummyNewMovies = allMovies
  .filter((m) => m.mediaType === 'movie' && m.releaseDate && m.releaseDate >= '2024-06-01')
  .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))

export const dummyForeignMovies = allMovies
  .filter(
    (m) => m.mediaType === 'movie' && !m.tags?.includes('عربي') && !m.tags?.includes('آسيوي')
  )

export const dummyForeignSeries = allMovies
  .filter(
    (m) =>
      m.mediaType === 'tv' &&
      !m.tags?.includes('عربي') &&
      !m.tags?.includes('أنمي') &&
      !m.tags?.includes('رمضاني')
  )

export const dummyAnime = allMovies.filter((m) => m.tags?.includes('أنمي'))

export const dummyAsianMovies = allMovies.filter(
  (m) => m.mediaType === 'movie' && m.tags?.includes('آسيوي')
)

export const dummyArabicMovies = allMovies.filter(
  (m) => m.tags?.includes('عربي') || m.tags?.includes('رمضاني')
)

export const dummyRamadanSeries = allMovies.filter((m) => m.tags?.includes('رمضاني'))

export const dummyAllMovies = allMovies.filter((m) => m.mediaType === 'movie')
export const dummyAllSeries = allMovies.filter((m) => m.mediaType === 'tv')

export function getMovieById(id: number): Movie | undefined {
  return allMovies.find((m) => m.id === id)
}

export function searchMovies(query: string): Movie[] {
  const q = query.toLowerCase()
  return allMovies.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.originalTitle?.toLowerCase().includes(q) ||
      m.overview.toLowerCase().includes(q)
  )
}

export function getMoviesByGenre(genreId: number): Movie[] {
  return allMovies.filter((m) => m.genreIds.includes(genreId))
}

export function getHeroSlides(): Movie[] {
  return allMovies
    .filter((m) => m.backdropPath && m.popularity >= 80)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5)
}
