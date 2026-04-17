'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Heart,
  Star,
  Download,
  Clock,
  Film,
  AlertCircle,
  MonitorPlay,
  User,
  Tv,
  ArrowRight,
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/useAppStore'
import { fetchMovieDetails, fetchTvDetails } from '@/lib/tmdb'
import { useToast } from '@/hooks/use-toast'
import { MovieCard } from '@/components/home/MovieCard'
import type { Movie, Episode } from '@/types'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export function DetailsView() {
  const { selectedMovieId, selectedMediaType, navigateTo } = useAppStore()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState('1080p')
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!selectedMovieId) return
    setLoading(true)
    setSelectedEpisode(null)

    const fetchDetails = async () => {
      try {
        const data = selectedMediaType === 'tv'
          ? await fetchTvDetails(selectedMovieId)
          : await fetchMovieDetails(selectedMovieId)
        setMovie(data)
        setIsFavorite(useAppStore.getState().isInWatchlist(selectedMovieId))
      } catch {
        setMovie(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [selectedMovieId, selectedMediaType])

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <Skeleton className="w-full h-[60vh] bg-white/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
            <Skeleton className="w-56 h-[420px] rounded-xl bg-white/5" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-64 bg-white/5" />
              <Skeleton className="h-6 w-48 bg-white/5" />
              <Skeleton className="h-32 w-full bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <Film className="size-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl text-gray-400 mb-2">لم يتم العثور على المحتوى</h2>
          <Button onClick={() => navigateTo('home')} variant="outline" className="text-gray-300">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    )
  }

  const handleFavorite = () => {
    const store = useAppStore.getState()
    if (isFavorite) {
      store.removeFromWatchlist(movie.id)
      toast({ title: 'تم الإزالة من المفضلة' })
    } else {
      store.addToWatchlist({
        id: movie.id,
        mediaType: movie.mediaType,
        title: movie.title,
        posterPath: movie.posterPath,
        addedAt: Date.now(),
      })
      toast({ title: 'تمت الإضافة للمفضلة' })
    }
    setIsFavorite(!isFavorite)
  }

  const handleWatchNow = () => {
    toast({ title: 'جاري التشغيل...', description: `سيتم تشغيل "${movie.title}" قريباً` })
  }

  const handleDownload = (quality: string) => {
    toast({ title: 'جاري التحميل', description: `بدأ تحميل بجودة ${quality}` })
  }

  const handleReport = () => {
    toast({ title: 'تم الإبلاغ', description: 'شكراً لك، سيتم مراجعة الرابط' })
  }

  const handleRequest = () => {
    toast({ title: 'تم إرسال الطلب', description: 'شكراً لك، سيتم إضافة المحتوى قريباً' })
  }

  const year = movie.releaseDate?.split('-')[0] || ''
  const director = movie.credits?.crew?.find((c) => c.job === 'مخرج' || c.job === 'Director')?.name

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative pt-16">
        <div className="relative w-full h-[50vh] min-h-[350px] md:h-[65vh] md:min-h-[480px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${movie.backdropPath}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-end pb-10 md:pb-14">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl">
              {movie.tags && (
                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }} className="flex flex-wrap gap-2 mb-3">
                  {movie.tags.map((tag) => (
                    <Badge key={tag} variant="destructive" className="bg-streaming-accent/90 hover:bg-streaming-accent text-white text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {movie.mediaType === 'tv' && (
                    <Badge className="bg-purple-600/80 text-white text-xs border-0">مسلسل</Badge>
                  )}
                </motion.div>
              )}

              <motion.h1 variants={fadeInUp} transition={{ duration: 0.5 }} className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                {movie.title}
              </motion.h1>

              <motion.div variants={fadeInUp} transition={{ duration: 0.5 }} className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Star className="size-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-white">{movie.voteAverage.toFixed(1)}</span>
                  <span className="text-gray-400">/10</span>
                </span>
                {year && <><span className="text-gray-500">|</span><span>{year}</span></>}
                {movie.runtime && (
                  <>
                    <span className="text-gray-500">|</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {movie.runtime} دقيقة
                    </span>
                  </>
                )}
                {movie.genres && movie.genres.length > 0 && (
                  <>
                    <span className="text-gray-500">|</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {movie.genres.slice(0, 3).map((genre) => (
                        <Badge key={genre.id} variant="secondary" className="bg-white/10 text-gray-200 text-xs border-0">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>

              <motion.p variants={fadeInUp} transition={{ duration: 0.5 }} className="text-gray-300 text-sm sm:text-base leading-relaxed mb-5 line-clamp-3">
                {movie.overview}
              </motion.p>

              <motion.div variants={fadeInUp} transition={{ duration: 0.5 }} className="flex flex-wrap gap-3">
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
                  className={`border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 h-12 rounded-lg gap-2 text-base ${isFavorite ? 'border-streaming-accent text-streaming-accent' : ''}`}
                  onClick={handleFavorite}
                >
                  <Heart className={`size-5 ${isFavorite ? 'fill-streaming-accent text-streaming-accent' : ''}`} />
                  {isFavorite ? 'في المفضلة' : 'أضف للمفضلة'}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigateTo('home')}
            className="absolute top-20 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all border border-white/10"
          >
            <ArrowRight className="size-5" />
          </button>
        </div>
      </section>

      {/* Movie Info */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-10"
          >
            {/* Poster */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.6 }} className="flex justify-center md:justify-start">
              <div className="relative w-52 sm:w-60 md:w-full rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
                <img
                  src={movie.posterPath}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </motion.div>

            {/* Info */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.6 }} className="space-y-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{movie.title}</h2>
                {movie.originalTitle && <p className="text-sm text-gray-400">{movie.originalTitle}</p>}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Star, label: 'التقييم', value: `${movie.voteAverage.toFixed(1)}/10`, accent: true },
                  ...(year ? [{ icon: Film, label: 'السنة', value: year }] : []),
                  ...(movie.runtime ? [{ icon: Clock, label: 'المدة', value: `${movie.runtime} دقيقة` }] : []),
                  ...(movie.quality ? [{ icon: MonitorPlay, label: 'الجودة', value: movie.quality }] : []),
                  ...(director ? [{ icon: User, label: 'المخرج', value: director }] : []),
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 rounded-lg p-3 border border-white/5">
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
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Badge key={genre.id} variant="outline" className="border-streaming-accent/50 text-streaming-accent text-sm px-3 py-1">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Story */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Film className="size-4 text-streaming-accent" />
                  القصة
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">{movie.overview}</p>
              </div>

              {/* Request Button */}
              <Button
                variant="outline"
                className="border-streaming-accent/30 text-streaming-accent hover:bg-streaming-accent/10 gap-2"
                onClick={handleRequest}
              >
                <AlertCircle className="size-4" />
                طلب فيلم / مسلسل
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TV Seasons/Episodes */}
      {movie.mediaType === 'tv' && movie.seasons && movie.seasons.length > 0 && (
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
                <Tv className="size-5 text-streaming-accent" />
                المواسم والحلقات
              </h2>

              <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden p-4">
                <Accordion type="single" collapsible className="w-full">
                  {movie.seasons.map((season) => (
                    <AccordionItem key={season.id} value={`season-${season.seasonNumber}`} className="border-white/10">
                      <AccordionTrigger className="text-white hover:no-underline hover:text-streaming-accent transition-colors py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-semibold">{season.name}</span>
                          <Badge variant="secondary" className="bg-white/10 text-gray-300 text-xs border-0">
                            {season.episodeCount} حلقة
                          </Badge>
                          {season.airDate && (
                            <span className="text-xs text-gray-500">{season.airDate.split('-')[0]}</span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {season.episodes && season.episodes.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                            {season.episodes.map((ep) => (
                              <button
                                key={ep.id}
                                onClick={() => setSelectedEpisode(ep)}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-right ${
                                  selectedEpisode?.id === ep.id
                                    ? 'bg-streaming-accent/10 border-streaming-accent/50'
                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                  {ep.episodeNumber}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-white truncate">{ep.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{ep.overview}</p>
                                </div>
                                {ep.runtime > 0 && (
                                  <span className="text-xs text-gray-500 flex-shrink-0">{ep.runtime} د</span>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 py-4 text-center">لا تتوفر معلومات الحلقات حالياً</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Streaming Servers */}
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
              {selectedEpisode ? `مشاهدة: ${selectedEpisode.name}` : 'سيرفرات المشاهدة'}
            </h2>

            <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
              <Tabs defaultValue="server1" className="w-full">
                <div className="border-b border-white/5 bg-white/[0.02]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3">
                    <TabsList className="bg-transparent gap-1">
                      {['سيرفر 1', 'سيرفر 2', 'سيرفر 3'].map((name, i) => (
                        <TabsTrigger
                          key={i}
                          value={`server${i + 1}`}
                          className="data-[state=active]:bg-streaming-accent data-[state=active]:text-white text-gray-400 px-4 py-2 rounded-lg border border-transparent data-[state=active]:border-streaming-accent"
                        >
                          {name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <ToggleGroup type="single" value={selectedQuality} onValueChange={(val) => val && setSelectedQuality(val)} className="gap-1">
                      {['1080p', '720p', '480p'].map((q) => (
                        <ToggleGroupItem
                          key={q}
                          value={q}
                          variant="outline"
                          className="data-[state=on]:bg-streaming-accent data-[state=on]:text-white data-[state=on]:border-streaming-accent text-gray-400 text-xs px-3 py-1.5 rounded-md border-white/10 hover:bg-white/5 hover:text-white"
                        >
                          {q}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                </div>

                {['server1', 'server2', 'server3'].map((server) => (
                  <TabsContent key={server} value={server}>
                    <div className="p-4 sm:p-6">
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
                      </div>
                      <div className="flex justify-center mt-4">
                        <button onClick={handleReport} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-streaming-accent transition-colors">
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

      {/* Download Links */}
      {movie.downloadLinks && movie.downloadLinks.length > 0 && (
        <section className="py-8 md:py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} transition={{ duration: 0.6 }}>
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
                    {movie.downloadLinks.map((link) => (
                      <TableRow key={link.quality} className="border-white/5 hover:bg-white/[0.03]">
                        <TableCell className="text-white font-medium text-sm">
                          <Badge variant="outline" className="border-streaming-accent/40 text-streaming-accent text-xs">
                            {link.quality}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">{link.size}</TableCell>
                        <TableCell className="text-gray-400 text-sm">{link.server}</TableCell>
                        <TableCell className="text-left">
                          <Button size="sm" className="bg-streaming-accent hover:bg-streaming-accent/90 text-white gap-1.5 text-xs" onClick={() => handleDownload(link.quality)}>
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
      )}

      {/* Cast */}
      {movie.credits?.cast && movie.credits.cast.length > 0 && (
        <section className="py-8 md:py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} transition={{ duration: 0.6 }}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="size-5 text-streaming-accent" />
                طاقم العمل
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{ direction: 'rtl' }}>
                {movie.credits.cast.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="flex flex-col items-center gap-2 min-w-[100px] sm:min-w-[120px] group"
                  >
                    <Avatar className="size-20 sm:size-24 border-2 border-white/10 group-hover:border-streaming-accent/50 transition-colors">
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
      )}

      {/* Similar */}
      {movie.similar && movie.similar.length > 0 && (
        <section className="py-8 md:py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} transition={{ duration: 0.6 }}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Film className="size-5 text-streaming-accent" />
                أعمال مشابهة
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{ direction: 'rtl' }}>
                {movie.similar.slice(0, 8).map((s) => (
                  <MovieCard key={s.id} movie={s} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}
