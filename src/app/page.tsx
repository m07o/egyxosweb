'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Heart,
  Star,
  Search,
  Menu,
  Download,
  Clock,
  Film,
  AlertCircle,
  Clapperboard,
  MonitorPlay,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'

// ── Dummy Data ──────────────────────────────────────────────────────
const movieData = {
  id: 1,
  title: 'ظلال المستقبل',
  originalTitle: 'Shadows of the Future',
  year: 2024,
  rating: 8.5,
  duration: '2ساعة 15دقيقة',
  quality: '1080p BluRay',
  genres: ['أكشن', 'مغامرة', 'خيال علمي'],
  tags: ['HD', 'مترجم', 'جديد', 'حصري'],
  director: 'كريستوفر نولان',
  story:
    'في عام 2087، يكتشف العالم أن الزمن يتجه نحو الانهيار. العالم البروفيسور أحمد العلي، وهو عالم فيزياء فذ، يقود مهمة صعبة لإنقاذ البشرية من الفناء. في رحلة تمتد بين الماضي والحاضر والمستقبل، يواجه أحمد تحديات لم يكن يتخيلها أبداً، حيث يكتشف أن مفتاح إنقاذ العالم يكمن في قرار سيتخذه في الماضي.\n\nمع كل رحلة زمنية، تتغير المعادلة ويزداد التعقيد، ليجد نفسه في سباق مع الزمن نفسه. يكتشف أحمد أن هناك قوى خفية تعمل ضد مهمته، وأن صراعاً قديماً بين العلم والسحر يلعب دوراً حاسماً في مصير البشرية.\n\nفي قلب المعركة، يجد أحمد نفسه مضطراً للتعاون مع خصومه السابقين، بما في ذلك عالمة الذكاء الاصطناعي الدكتورة سارة التي طورت نظاماً يمكنه التنبؤ بالانهيار الزمني قبل حدوثه. معاً، يخوضان مغامرة مليئة بالمفاجآت والعقبات التي تختبر حدود البشرية والإرادة.',
  cast: [
    { name: 'أحمد السقا', character: 'البروفيسور أحمد', image: null },
    { name: 'منى زكي', character: 'الدكتورة سارة', image: null },
    { name: 'كريم عبد العزيز', character: 'الرائد خالد', image: null },
    { name: 'ياسمين عبد العزيز', character: 'المهندسة ليلى', image: null },
    { name: 'محمد رمضان', character: 'العميل عمر', image: null },
    { name: 'نور الشريف', character: 'البروفيسور فؤاد', image: null },
  ],
  similar: [
    { id: 2, title: 'عاصفة الصحراء', year: 2024, rating: 7.8 },
    { id: 3, title: 'آخر المحاربين', year: 2023, rating: 8.1 },
    { id: 4, title: 'سر المحيط', year: 2024, rating: 7.5 },
    { id: 5, title: 'طريق النجوم', year: 2023, rating: 8.3 },
    { id: 6, title: 'ظلام أزلي', year: 2024, rating: 7.9 },
  ],
}

const downloadLinks = [
  { quality: '1080p BluRay', size: '2.1 GB', server: 'سيرفر مباشر' },
  { quality: '720p BluRay', size: '1.2 GB', server: 'سيرفر مباشر' },
  { quality: '480p BluRay', size: '650 MB', server: 'سيرفر مباشر' },
]

const navLinks = [
  { label: 'الرئيسية', href: '#' },
  { label: 'أفلام', href: '#' },
  { label: 'مسلسلات', href: '#' },
  { label: 'أنمي', href: '#' },
]

// ── Animation Variants ──────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

// ── Component ───────────────────────────────────────────────────────
export default function MovieDetailsPage() {
  const [isFavorite, setIsFavorite] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState('1080p')
  const { toast } = useToast()

  const handleFavorite = () => {
    setIsFavorite((prev) => !prev)
    toast({
      title: isFavorite ? 'تم الإزالة من المفضلة' : 'تمت الإضافة للمفضلة',
      description: isFavorite
        ? `تم إزالة "${movieData.title}" من قائمة المفضلة`
        : `تمت إضافة "${movieData.title}" إلى قائمة المفضلة`,
    })
  }

  const handleWatchNow = () => {
    toast({
      title: 'جاري التشغيل...',
      description: `سيتم تشغيل "${movieData.title}" قريباً`,
    })
  }

  const handleDownload = (quality: string) => {
    toast({
      title: 'جاري التحميل',
      description: `بدأ تحميل الفيلم بجودة ${quality}`,
    })
  }

  const handleReport = () => {
    toast({
      title: 'تم الإبلاغ',
      description: 'شكراً لك، سيتم مراجعة الرابط',
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d18 100%)' }}>
      {/* ── Navigation Bar ──────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 right-0 left-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Clapperboard className="size-6 text-streaming-accent" />
              <span className="text-xl font-bold text-white">
                سينما <span className="text-streaming-accent">بلس</span>
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
                    <Search className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">البحث</TooltipContent>
              </Tooltip>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-gray-300 hover:text-white hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="size-5" />
                </Button>
                <SheetContent side="right" className="bg-[#0d0d18] border-white/10 w-72">
                  <SheetHeader>
                    <SheetTitle className="text-white flex items-center gap-2">
                      <Clapperboard className="size-5 text-streaming-accent" />
                      سينما <span className="text-streaming-accent">بلس</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 mt-6">
                    {navLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Banner Section ──────────────────────────────────── */}
      <section className="relative pt-16">
        <div className="relative w-full h-[60vh] min-h-[400px] md:h-[75vh] md:min-h-[550px] overflow-hidden">
          {/* Backdrop Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://placehold.co/1920x800/1a1a2e/e94560?text=Movie+Backdrop')`,
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-end pb-12 md:pb-16">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-2xl"
            >
              {/* Tags */}
              <motion.div variants={fadeInUp} transition={{ duration: 0.5 }} className="flex flex-wrap gap-2 mb-4">
                {movieData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="destructive"
                    className="bg-streaming-accent/90 hover:bg-streaming-accent text-white text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 leading-tight"
              >
                {movieData.title}
              </motion.h1>

              {/* Meta Info */}
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-300"
              >
                <span className="flex items-center gap-1">
                  <Star className="size-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-white">{movieData.rating}</span>
                  <span className="text-gray-400">/10</span>
                </span>
                <span className="text-gray-500">|</span>
                <span>{movieData.year}</span>
                <span className="text-gray-500">|</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {movieData.duration}
                </span>
                <span className="text-gray-500">|</span>
                <div className="flex gap-1.5">
                  {movieData.genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="bg-white/10 text-gray-200 text-xs border-0">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </motion.div>

              {/* Description */}
              <motion.p
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3"
              >
                {movieData.story.split('\n')[0]}
              </motion.p>

              {/* Buttons */}
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <Button
                  size="lg"
                  className="bg-streaming-accent hover:bg-streaming-accent/90 text-white font-semibold px-8 h-12 rounded-lg gap-2 text-base shadow-lg shadow-red-900/30"
                  onClick={handleWatchNow}
                >
                  <Play className="size-5 fill-white" />
                  مشاهدة الآن
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 h-12 rounded-lg gap-2 text-base ${
                    isFavorite ? 'border-streaming-accent text-streaming-accent' : ''
                  }`}
                  onClick={handleFavorite}
                >
                  <Heart className={`size-5 ${isFavorite ? 'fill-streaming-accent text-streaming-accent' : ''}`} />
                  {isFavorite ? 'في المفضلة' : 'أضف للمفضلة'}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Movie Info Section ───────────────────────────────────── */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-10"
          >
            {/* Poster */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.6 }} className="flex justify-center md:justify-start">
              <div className="relative w-56 sm:w-64 md:w-full rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
                <img
                  src="https://placehold.co/300x450/16213e/0f3460?text=Movie+Poster"
                  alt={movieData.title}
                  className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>

            {/* Info */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.6 }} className="space-y-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {movieData.title}
                </h2>
                <p className="text-sm text-gray-400">{movieData.originalTitle}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Star, label: 'التقييم', value: `${movieData.rating}/10`, accent: true },
                  { icon: Film, label: 'السنة', value: movieData.year.toString() },
                  { icon: Clock, label: 'المدة', value: movieData.duration },
                  { icon: MonitorPlay, label: 'الجودة', value: movieData.quality },
                  { icon: User, label: 'المخرج', value: movieData.director },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white/5 rounded-lg p-3 border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className={`size-4 ${item.accent ? 'text-yellow-500' : 'text-gray-500'}`} />
                      <span className="text-xs text-gray-500">{item.label}</span>
                    </div>
                    <p className={`text-sm font-semibold ${item.accent ? 'text-yellow-500' : 'text-white'}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movieData.genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="border-streaming-accent/50 text-streaming-accent text-sm px-3 py-1"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Story */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Film className="size-4 text-streaming-accent" />
                  القصة
                </h3>
                <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
                  {movieData.story.split('\n').filter(Boolean).map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Streaming Servers Section ────────────────────────────── */}
      <section className="py-8 md:py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MonitorPlay className="size-5 text-streaming-accent" />
              سيرفرات المشاهدة
            </h2>

            <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
              <Tabs defaultValue="server1" className="w-full">
                {/* Tabs Header */}
                <div className="border-b border-white/5 bg-white/[0.02]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3">
                    <TabsList className="bg-transparent gap-1">
                      <TabsTrigger
                        value="server1"
                        className="data-[state=active]:bg-streaming-accent data-[state=active]:text-white text-gray-400 px-4 py-2 rounded-lg border border-transparent data-[state=active]:border-streaming-accent"
                      >
                        سيرفر 1
                      </TabsTrigger>
                      <TabsTrigger
                        value="server2"
                        className="data-[state=active]:bg-streaming-accent data-[state=active]:text-white text-gray-400 px-4 py-2 rounded-lg border border-transparent data-[state=active]:border-streaming-accent"
                      >
                        سيرفر 2
                      </TabsTrigger>
                      <TabsTrigger
                        value="server3"
                        className="data-[state=active]:bg-streaming-accent data-[state=active]:text-white text-gray-400 px-4 py-2 rounded-lg border border-transparent data-[state=active]:border-streaming-accent"
                      >
                        سيرفر 3
                      </TabsTrigger>
                    </TabsList>

                    {/* Quality Selector */}
                    <ToggleGroup
                      type="single"
                      value={selectedQuality}
                      onValueChange={(val) => val && setSelectedQuality(val)}
                      className="gap-1"
                    >
                      {['1080p', '720p', '480p'].map((q) => (
                        <ToggleGroupItem
                          key={q}
                          value={q}
                          variant="outline"
                          className={`data-[state=on]:bg-streaming-accent data-[state=on]:text-white data-[state=on]:border-streaming-accent text-gray-400 text-xs px-3 py-1.5 rounded-md border-white/10 hover:bg-white/5 hover:text-white`}
                        >
                          {q}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                </div>

                {/* Player Content */}
                {['server1', 'server2', 'server3'].map((server) => (
                  <TabsContent key={server} value={server}>
                    <div className="p-4 sm:p-6">
                      {/* Player Area */}
                      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center group cursor-pointer border border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f]" />
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-streaming-accent/90 flex items-center justify-center shadow-2xl shadow-red-900/40 group-hover:bg-streaming-accent transition-colors"
                          onClick={handleWatchNow}
                        >
                          <Play className="size-7 sm:size-8 fill-white text-white mr-[-3px]" />
                        </motion.div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                          <div className="h-full w-1/3 bg-streaming-accent rounded-full" />
                        </div>
                        <div className="absolute top-3 left-3 z-10">
                          <Badge variant="destructive" className="bg-streaming-accent/90 text-white text-xs">
                            {selectedQuality}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 right-3 z-10 text-xs text-gray-400">
                          {movieData.duration}
                        </div>
                      </div>

                      {/* Report Link */}
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={handleReport}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-streaming-accent transition-colors"
                        >
                          <AlertCircle className="size-3" />
                          إبلاغ عن رابط معطل
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Download Links Section ───────────────────────────────── */}
      <section className="py-8 md:py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Download className="size-5 text-streaming-accent" />
              روابط التحميل المباشر
            </h2>

            <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-gray-400 text-sm">الجودة</TableHead>
                    <TableHead className="text-gray-400 text-sm">الحجم</TableHead>
                    <TableHead className="text-gray-400 text-sm">السيرفر</TableHead>
                    <TableHead className="text-gray-400 text-sm text-left">تحميل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downloadLinks.map((link) => (
                    <TableRow key={link.quality} className="border-white/5 hover:bg-white/[0.03]">
                      <TableCell className="text-white font-medium text-sm">
                        <Badge variant="outline" className="border-streaming-accent/40 text-streaming-accent text-xs">
                          {link.quality}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">{link.size}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{link.server}</TableCell>
                      <TableCell className="text-left">
                        <Button
                          size="sm"
                          className="bg-streaming-accent hover:bg-streaming-accent/90 text-white gap-1.5 text-xs"
                          onClick={() => handleDownload(link.quality)}
                        >
                          <Download className="size-3.5" />
                          تحميل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Cast Section ─────────────────────────────────────────── */}
      <section className="py-8 md:py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="size-5 text-streaming-accent" />
              طاقم العمل
            </h2>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{ direction: 'rtl' }}>
              {movieData.cast.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="flex flex-col items-center gap-2 min-w-[100px] sm:min-w-[120px] group"
                >
                  <Avatar className="size-20 sm:size-24 border-2 border-white/10 group-hover:border-streaming-accent/50 transition-colors">
                    <AvatarImage src={member.image || undefined} alt={member.name} />
                    <AvatarFallback className="bg-gradient-to-br from-white/10 to-white/5 text-lg font-semibold text-gray-300">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium text-white group-hover:text-streaming-accent transition-colors">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-gray-500">{member.character}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Similar Works Section ────────────────────────────────── */}
      <section className="py-8 md:py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Film className="size-5 text-streaming-accent" />
              أعمال مشابهة
            </h2>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{ direction: 'rtl' }}>
              {movieData.similar.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  whileHover={{ y: -5 }}
                  className="relative flex-shrink-0 w-[140px] sm:w-[170px] group cursor-pointer rounded-xl overflow-hidden"
                >
                  {/* Poster */}
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5">
                    <img
                      src={`https://placehold.co/200x300/1a1a2e/e94560?text=Movie+${movie.id}`}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        className="w-12 h-12 rounded-full bg-streaming-accent flex items-center justify-center shadow-lg"
                      >
                        <Play className="size-5 fill-white text-white mr-[-2px]" />
                      </motion.div>
                    </div>
                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/70 text-yellow-500 text-[10px] gap-1 border-0 backdrop-blur-sm">
                        <Star className="size-2.5 fill-yellow-500 text-yellow-500" />
                        {movie.rating}
                      </Badge>
                    </div>
                    {/* Year Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/70 text-gray-300 text-[10px] border-0 backdrop-blur-sm">
                        {movie.year}
                      </Badge>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mt-2 px-1">
                    <p className="text-xs sm:text-sm font-medium text-white truncate group-hover:text-streaming-accent transition-colors">
                      {movie.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clapperboard className="size-5 text-streaming-accent" />
              <span className="text-lg font-bold text-white">
                سينما <span className="text-streaming-accent">بلس</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">
              © 2024 سينما بلس — جميع الحقوق محفوظة
            </p>
            <div className="flex gap-4 text-xs text-gray-500">
              <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-white transition-colors">اتصل بنا</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
