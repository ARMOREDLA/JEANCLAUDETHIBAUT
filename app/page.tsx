"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Player from "@vimeo/player"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { InfoPanel } from "@/components/info-panel"
import { ProjectNav } from "@/components/project-nav"
import { WorkCategory } from "@/components/work-menu"

// Helper to convert Google Drive sharing URL to direct image URL
const convertGoogleDriveUrl = (url: string): string => {
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (driveMatch) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}=s0`
  }
  const directMatch = url.match(/drive\.google\.com\/uc\?.*id=([^&]+)/)
  if (directMatch) {
    return `https://lh3.googleusercontent.com/d/${directMatch[1]}=s0`
  }
  return url
}

interface Project {
  id: string
  title: string
  client: string
  vimeoId?: string
  verticalVimeoId?: string
  imageUrl?: string
  category: "film" | "photo"
  aspectRatio?: "cinemascope" | "16:9" // defaults to cinemascope
}

// Jean Claude Thibaut's projects
const projects: Project[] = [
  // Film projects
  { id: "1", title: "INTUITION - DWAYNE WADE", client: "ARAMIS", vimeoId: "1112466337", verticalVimeoId: "1183814123", category: "film" },
  { id: "2", title: "RE-Nutriv DIAMOND LIPS - ANA DE ARMAS", client: "ESTÉE LAUDER", vimeoId: "1183986630", category: "film" },
  { id: "3", title: "DARE - IMAAN HAMMAM, GRACE ELIZABETH", client: "ESTÉE LAUDER", vimeoId: "896626191", category: "film" },
  { id: "4", title: "OLD FASHIONED - LUCIEN LAVISCOUNT", client: "KILIAN PARIS", vimeoId: "995446230", category: "film", aspectRatio: "16:9" },
  { id: "6", title: "THE INVITATION", client: "S9 HUAWEI", vimeoId: "1031749834", category: "film" },
  { id: "7", title: "THE ONE AND ONLY", client: "BLENDER'S PRIDE", vimeoId: "1169793531", category: "film", aspectRatio: "16:9" },
  { id: "8", title: "AT LARGE", client: "MAGAZINE", vimeoId: "1182293334", verticalVimeoId: "1183821352", category: "film" },
  { id: "9", title: "BLUE SERUM - LIU WEN", client: "CHANEL", vimeoId: "258186791", category: "film" },
  { id: "5", title: "VIII", client: "DIOR", vimeoId: "794239674", category: "film" },
  // Photo projects
  { id: "p1", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1lHVls4Z5YVC9utIsi2C1l-Oml6KAq5lO/view?usp=share_link", category: "photo" },
  { id: "p2", title: "", client: "AT LARGE Magazine", imageUrl: "https://drive.google.com/file/d/1mqUKGNTViuVZyupQg7cwxE8wJ8Z7-Lpy/view?usp=share_link", category: "photo" },
  { id: "p3", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1j1ag9ga5RFul5aHDieeeuV5Lq8X0HM8c/view?usp=share_link", category: "photo" },
  { id: "p4", title: "INTUITION", client: "ARAMIS", imageUrl: "https://drive.google.com/file/d/15OQJfRWsY0bIOX6UejBSm-ZkkF0vD8uQ/view?usp=share_link", category: "photo" },
  { id: "p5", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1Ws9d3HNIht2dn0UVMkwUEu0HJqefmjL9/view?usp=share_link", category: "photo" },
  { id: "p6", title: "", client: "ESTÉE LAUDER", imageUrl: "https://drive.google.com/file/d/1iz2RKVJGWxVMxHn7ZZp-XTp7mlAG5hK9/view?usp=share_link", category: "photo" },
  { id: "p7", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1dSTXYWxDqSkRniRdg_7MJhhsdiMKKeWp/view?usp=share_link", category: "photo" },
  { id: "p8", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1mCbhZh-wlS7Z2QtzmEyivl3s4-QndL9Y/view?usp=share_link", category: "photo" },
  { id: "p9", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1-Rc5VbDz9Sc0h5Mdmz5sLPgcQXuE0bpe/view?usp=share_link", category: "photo" },
  { id: "p10", title: "", client: "", imageUrl: "https://drive.google.com/file/d/12p0-Ykp337COjRfcdD8lrNc6FGSSpUWc/view?usp=share_link", category: "photo" },
  { id: "p11", title: "", client: "ESTÉE LAUDER", imageUrl: "https://drive.google.com/file/d/1ux8X7Kz1s5F7bV4OwOABC1zCAY7CuY6x/view?usp=share_link", category: "photo" },
  { id: "p12", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1O9PsoCEuKypnIoqdh7AHWcypWcHBhk-2/view?usp=share_link", category: "photo" },
  { id: "p13", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1hYG5D4I9yuyGMXpvUOLgM73wBivmSPM1/view?usp=share_link", category: "photo" },
]

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>("film")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [modalVideoIndex, setModalVideoIndex] = useState(0)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isCursorVisible, setIsCursorVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Modal video player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const modalPlayerRef = useRef<Player | null>(null)
  const modalIframeRef = useRef<HTMLIFrameElement>(null)

  const reelIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPausedRef = useRef(false)
  const videoAreaRef = useRef<HTMLDivElement>(null)

  // Filter projects by category
  const filteredProjects = projects.filter(p => p.category === activeCategory)

  // Calculate active index early so it can be used in callbacks
  const activeIndex = hoveredIndex !== null ? hoveredIndex : currentIndex
  const currentProject = filteredProjects[activeIndex]
  const modalProject = filteredProjects[modalVideoIndex]
  const modalPhoto = filteredProjects[modalPhotoIndex]

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0)
    setHoveredIndex(null)
  }, [activeCategory])

  // Initialize Vimeo player for modal
  useEffect(() => {
    if (isVideoModalOpen && modalIframeRef.current) {
      modalPlayerRef.current = new Player(modalIframeRef.current)

      modalPlayerRef.current.on('timeupdate', (data: { seconds: number; duration: number }) => {
        setProgress(data.seconds)
        setDuration(data.duration)
      })

      modalPlayerRef.current.on('play', () => setIsPlaying(true))
      modalPlayerRef.current.on('pause', () => setIsPlaying(false))

      // Start playing and unmute
      modalPlayerRef.current.play()
      modalPlayerRef.current.setVolume(1)
      setIsPlaying(true)
      setIsMuted(false)
    }

    return () => {
      if (modalPlayerRef.current) {
        modalPlayerRef.current.off('timeupdate')
        modalPlayerRef.current.off('play')
        modalPlayerRef.current.off('pause')
      }
    }
  }, [isVideoModalOpen, modalVideoIndex])

  // Custom cursor tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseEnterVideo = useCallback(() => {
    if (!isMobile) setIsCursorVisible(true)
  }, [isMobile])

  const handleMouseLeaveVideo = useCallback(() => {
    setIsCursorVisible(false)
  }, [])

  const handleVideoClick = useCallback(() => {
    if (activeCategory === "film") {
      setModalVideoIndex(activeIndex)
      setProgress(0)
      setIsMuted(false)
      setIsVideoModalOpen(true)
    } else if (activeCategory === "photo") {
      setModalPhotoIndex(activeIndex)
      setIsPhotoModalOpen(true)
    }
  }, [activeIndex, activeCategory])

  const handleCloseModal = useCallback(() => {
    setIsVideoModalOpen(false)
    setIsPlaying(false)
    setProgress(0)
  }, [])

  const handleModalPrev = useCallback(() => {
    setModalVideoIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length)
    setIsMuted(false)
    setProgress(0)
  }, [filteredProjects.length])

  const handleModalNext = useCallback(() => {
    setModalVideoIndex((prev) => (prev + 1) % filteredProjects.length)
    setIsMuted(false)
    setProgress(0)
  }, [filteredProjects.length])

  const handleClosePhotoModal = useCallback(() => {
    setIsPhotoModalOpen(false)
  }, [])

  const handlePhotoPrev = useCallback(() => {
    setModalPhotoIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length)
  }, [filteredProjects.length])

  const handlePhotoNext = useCallback(() => {
    setModalPhotoIndex((prev) => (prev + 1) % filteredProjects.length)
  }, [filteredProjects.length])

  const togglePlay = () => {
    if (modalPlayerRef.current) {
      if (isPlaying) {
        modalPlayerRef.current.pause()
      } else {
        modalPlayerRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    if (modalPlayerRef.current) {
      modalPlayerRef.current.setMuted(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modalPlayerRef.current || duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const seekTime = percentage * duration
    modalPlayerRef.current.setCurrentTime(seekTime)
    setProgress(seekTime)
  }

  // Keyboard navigation for video modal
  useEffect(() => {
    if (!isVideoModalOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handleModalPrev()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleModalNext()
      } else if (e.key === 'Escape') {
        handleCloseModal()
      } else if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVideoModalOpen, handleModalPrev, handleModalNext, handleCloseModal, togglePlay])

  // Keyboard navigation for photo modal
  useEffect(() => {
    if (!isPhotoModalOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePhotoPrev()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handlePhotoNext()
      } else if (e.key === 'Escape') {
        handleClosePhotoModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPhotoModalOpen, handlePhotoPrev, handlePhotoNext, handleClosePhotoModal])

  // Keyboard navigation for global page (when no modal is open)
  useEffect(() => {
    if (isVideoModalOpen || isPhotoModalOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length)
        setUserHasNavigated(true)
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentIndex((prev) => (prev + 1) % filteredProjects.length)
        setUserHasNavigated(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVideoModalOpen, isPhotoModalOpen, filteredProjects.length])



  // Track if user has manually navigated
  const [userHasNavigated, setUserHasNavigated] = useState(false)

  // Auto-rotating reel - every 7 seconds, stops once user navigates
  useEffect(() => {
    if (userHasNavigated) return // Don't auto-rotate if user has navigated

    const startInterval = () => {
      reelIntervalRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          setCurrentIndex((prev) => (prev + 1) % filteredProjects.length)
        }
      }, 7000)
    }

    startInterval()

    return () => {
      if (reelIntervalRef.current) {
        clearInterval(reelIntervalRef.current)
      }
    }
  }, [filteredProjects.length, userHasNavigated])

  const handleProjectHover = (index: number | null) => {
    setHoveredIndex(index)
    isPausedRef.current = index !== null
  }

  const handleProjectClick = (index: number) => {
    setCurrentIndex(index)
    setUserHasNavigated(true)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Fullscreen Background - Video or Photo */}
      <div className="fixed inset-0 w-full h-full z-0 bg-black">
        <div className="absolute inset-0 bg-black" style={{ overflow: 'hidden' }}>
          {activeCategory === "film" ? (
            // Video backgrounds for film - always load first video, plus active and adjacent
            filteredProjects.map((project, index) => {
              if (!project.vimeoId) return null

              const isActive = activeIndex === index
              const isFirst = index === 0
              const totalProjects = filteredProjects.length
              const prevIndex = (activeIndex - 1 + totalProjects) % totalProjects
              const nextIndex = (activeIndex + 1) % totalProjects
              const nextIndex2 = (activeIndex + 2) % totalProjects

              // Always render first video (for instant load), plus active and adjacent videos
              const shouldRender = isFirst || isActive || index === prevIndex || index === nextIndex || index === nextIndex2
              if (!shouldRender) return null

              // Use vertical video ID on mobile if available
              const useVertical = isMobile && project.verticalVimeoId
              const videoId = useVertical ? project.verticalVimeoId : project.vimeoId

              // Use 9:16 sizing for vertical videos on mobile, otherwise use appropriate aspect ratio
              let videoWidth: string
              let videoHeight: string

              if (useVertical) {
                // 9:16 vertical video sizing
                videoWidth = 'max(56.25vh, 100vw)'
                videoHeight = 'max(100vh, 177.78vw)'
              } else {
                // Use 16:9 sizing for 16:9 videos, cinemascope for the rest
                const is16by9 = project.aspectRatio === "16:9"
                videoWidth = is16by9 ? 'max(177.78vh, 100vw)' : 'max(239.78vh, 100vw)'
                videoHeight = is16by9 ? 'max(100vh, 56.25vw)' : 'max(100vh, 41.84vw)'
              }

              return (
                <iframe
                  key={`${project.id}-${activeCategory}-${isMobile ? 'mobile' : 'desktop'}`}
                  src={`https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&sidedock=0&playsinline=1&dnt=1&quality=auto`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 pointer-events-none"
                  loading={isFirst || isActive ? "eager" : "lazy"}
                  style={{
                    opacity: isActive ? 1 : 0,
                    border: 'none',
                    width: videoWidth,
                    height: videoHeight,
                    backgroundColor: '#000',
                  }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  title={project.title || project.client}
                />
              )
            })
          ) : (
            // Photo backgrounds
            filteredProjects.map((project, index) => {
              if (!project.imageUrl) return null
              const isActive = activeIndex === index
              const imageUrl = convertGoogleDriveUrl(project.imageUrl)

              return (
                <div
                  key={`${project.id}-${activeCategory}`}
                  className="absolute inset-0 transition-opacity duration-300 flex items-center justify-center bg-background"
                  style={{ opacity: isActive ? 1 : 0 }}
                >
                  <img
                    src={imageUrl}
                    alt={project.title || project.client || "Photo"}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Clickable overlay for video - captures clicks except nav area on right */}
      <div
        ref={videoAreaRef}
        className="fixed top-0 left-0 bottom-0 z-10 cursor-none md:cursor-none"
        style={{ cursor: isMobile ? 'pointer' : 'none', right: '80px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnterVideo}
        onMouseLeave={handleMouseLeaveVideo}
        onClick={handleVideoClick}
        onTouchEnd={(e) => {
          e.preventDefault()
          handleVideoClick()
        }}
      />

      {/* Custom Cursor - TAP FOR SOUND */}
      <div
        className="fixed pointer-events-none z-[9999] transition-opacity duration-300"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -50%)',
          opacity: isCursorVisible && !isVideoModalOpen && !isPhotoModalOpen && !isMobile && activeCategory === "film" ? 1 : 0
        }}
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-foreground font-light whitespace-nowrap">
          Click to Play
        </span>
      </div>

      {/* Header */}
      <div className="relative z-50">
        <Header
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Project Navigation - Right side with horizontal dashes */}
      <ProjectNav
        projects={filteredProjects}
        currentIndex={currentIndex}
        hoveredIndex={hoveredIndex}
        onHover={handleProjectHover}
        onClick={handleProjectClick}
      />

      {/* Footer */}
      <div className="relative z-50">
        <Footer onInfoClick={() => setIsInfoOpen(true)} />
      </div>

      {/* Info Panel */}
      <InfoPanel isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* Video Modal with Custom Controls */}
      {isVideoModalOpen && modalProject?.vimeoId && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleCloseModal(); }}
            className="absolute top-5 right-5 md:top-8 md:right-8 text-foreground/60 hover:text-foreground transition-colors duration-300 z-[150] p-2 -m-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left side - Previous video */}
          <div
            className="absolute left-0 top-0 bottom-24 w-1/3 cursor-pointer z-0"
            onClick={handleModalPrev}
          />

          {/* Right side - Next video */}
          <div
            className="absolute right-0 top-0 bottom-24 w-1/3 cursor-pointer z-0"
            onClick={handleModalNext}
          />

          {/* Center area - Play/Pause */}
          <div
            className="absolute left-1/3 right-1/3 top-0 bottom-24 cursor-pointer z-0"
            onClick={togglePlay}
          />

          {/* Video player */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10 pointer-events-none">
            <div className="video-modal-container relative w-full max-w-[95vw] max-h-[80vh] bg-black" style={{ aspectRatio: '2.39/1', backgroundColor: '#000' }}>
              <iframe
                ref={modalIframeRef}
                src={`https://player.vimeo.com/video/${modalProject.vimeoId}?autoplay=1&loop=0&muted=0&controls=0&title=0&byline=0&portrait=0&playsinline=1&transparent=0`}
                className="absolute inset-0 w-full h-full bg-black"
                style={{ border: 'none', backgroundColor: '#000', objectFit: 'contain' }}
                allow="autoplay; fullscreen; picture-in-picture"
                title={modalProject.title || modalProject.client}
              />
            </div>
          </div>

          {/* Custom Controls - Bottom */}
          <div className="px-6 md:px-10 pb-6 md:pb-8 relative z-20">
            {/* Progress Bar - Clickable/Draggable */}
            <div
              className="w-full h-4 relative mb-4 cursor-pointer group flex items-center"
              onClick={handleSeek}
              onMouseDown={(e) => {
                handleSeek(e)
                const onMouseMove = (moveEvent: MouseEvent) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width))
                  const percentage = x / rect.width
                  const seekTime = percentage * duration
                  if (modalPlayerRef.current && duration > 0) {
                    modalPlayerRef.current.setCurrentTime(seekTime)
                    setProgress(seekTime)
                  }
                }
                const onMouseUp = () => {
                  document.removeEventListener('mousemove', onMouseMove)
                  document.removeEventListener('mouseup', onMouseUp)
                }
                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)
              }}
            >
              <div className="w-full h-px bg-foreground/20 relative">
                <div
                  className="absolute left-0 top-0 h-px bg-foreground/70"
                  style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : '0%' }}
                />
                {/* Seek handle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: duration > 0 ? `calc(${(progress / duration) * 100}% - 4px)` : '0' }}
                />
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              {/* Left: Play/Pause, Volume, Time */}
              <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="text-foreground/70 hover:text-foreground transition-colors duration-300"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>

                {/* Mute/Unmute Button */}
                <button
                  onClick={toggleMute}
                  className="text-foreground/70 hover:text-foreground transition-colors duration-300"
                >
                  {isMuted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>

                {/* Time Display */}
                <span className="text-xs text-foreground/50 font-light tracking-wider">
                  {formatTime(progress)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right: Project Info */}
              <div className="text-right">
                <h2 className="text-sm md:text-base font-light uppercase tracking-[0.1em] text-foreground">
                  {modalProject.title}
                </h2>
                <p className="text-[10px] md:text-xs text-foreground/50 font-light uppercase tracking-[0.15em]">
                  {modalProject.client}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows - Modal */}
          <button
            onClick={(e) => { e.stopPropagation(); handleModalPrev(); }}
            className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-30 text-foreground/50 hover:text-foreground transition-colors duration-300 pointer-events-auto"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleModalNext(); }}
            className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 text-foreground/50 hover:text-foreground transition-colors duration-300 pointer-events-auto"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Mobile tap indicator */}
      {isMobile && !isVideoModalOpen && activeCategory === "film" && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/60">
            Tap for sound
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {isPhotoModalOpen && modalPhoto?.imageUrl && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={handleClosePhotoModal}
            className="absolute top-5 right-5 md:top-8 md:right-8 text-foreground/60 hover:text-foreground transition-colors duration-300 z-[150]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Full photo */}
          <div className="relative w-[90vw] h-[90vh] flex items-center justify-center">
            <img
              src={convertGoogleDriveUrl(modalPhoto.imageUrl)}
              alt={modalPhoto.title || modalPhoto.client || "Photo"}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Photo info */}
          {(modalPhoto.title || modalPhoto.client) && (
            <div className="absolute bottom-8 left-8">
              {modalPhoto.title && (
                <h3 className="text-sm font-light uppercase tracking-[0.15em] text-foreground mb-1">
                  {modalPhoto.title}
                </h3>
              )}
              {modalPhoto.client && (
                <p className="text-xs font-light uppercase tracking-[0.1em] text-foreground/50">
                  {modalPhoto.client}
                </p>
              )}
            </div>
          )}

          {/* Navigation arrows */}
          {filteredProjects.length > 1 && (
            <>
              <button
                onClick={handlePhotoPrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors duration-300"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handlePhotoNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors duration-300"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </main>
  )
}
