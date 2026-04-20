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
  canvaUrl?: string
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
  { id: "5", title: "VIII", client: "DIOR", vimeoId: "794239674", category: "film", aspectRatio: "16:9" },
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
  { id: "p13", title: "", client: "", vimeoId: "1184968043", category: "photo" },
  { id: "p14", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1hYG5D4I9yuyGMXpvUOLgM73wBivmSPM1/view?usp=share_link", category: "photo" },
]

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>("film")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
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

  // activeIndex is only based on currentIndex - hovering doesn't change the background video
  const activeIndex = currentIndex
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

      // Start muted (accurate UI), then try to unmute after play
      setIsMuted(true)
      setIsPlaying(false)

      modalPlayerRef.current.ready().then(() => {
        if (modalPlayerRef.current) {
          // Play first
          modalPlayerRef.current.play().then(() => {
            setIsPlaying(true)
            // Then try to unmute
            if (modalPlayerRef.current) {
              modalPlayerRef.current.setVolume(1).then(() => {
                // Check actual volume to update UI accurately
                if (modalPlayerRef.current) {
                  modalPlayerRef.current.getVolume().then((vol: number) => {
                    setIsMuted(vol === 0)
                  })
                }
              }).catch(() => {
                // Volume setting failed, keep muted
                setIsMuted(true)
              })
            }
          }).catch(() => {
            // Play failed
            setIsPlaying(false)
          })
        }
      })
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

  const handleVideoClick = () => {
    if (activeCategory === "film") {
      setModalVideoIndex(currentIndex)
      setProgress(0)
      setIsMuted(false)
      setIsVideoModalOpen(true)
    } else if (activeCategory === "photo") {
      // All photo items open in photo modal (including those with vimeoId)
      setModalPhotoIndex(currentIndex)
      setIsPhotoModalOpen(true)
    }
  }

  const handleCloseModal = useCallback(() => {
    setIsVideoModalOpen(false)
    setIsPlaying(false)
    setProgress(0)
  }, [])

  const handleModalPrev = useCallback(() => {
    // Find previous project with vimeoId
    setModalVideoIndex((prev) => {
      let newIndex = (prev - 1 + filteredProjects.length) % filteredProjects.length
      let attempts = 0
      while (!filteredProjects[newIndex]?.vimeoId && attempts < filteredProjects.length) {
        newIndex = (newIndex - 1 + filteredProjects.length) % filteredProjects.length
        attempts++
      }
      return newIndex
    })
    setIsMuted(false)
    setProgress(0)
  }, [filteredProjects])

  const handleModalNext = useCallback(() => {
    // Find next project with vimeoId
    setModalVideoIndex((prev) => {
      let newIndex = (prev + 1) % filteredProjects.length
      let attempts = 0
      while (!filteredProjects[newIndex]?.vimeoId && attempts < filteredProjects.length) {
        newIndex = (newIndex + 1) % filteredProjects.length
        attempts++
      }
      return newIndex
    })
    setIsMuted(false)
    setProgress(0)
  }, [filteredProjects])

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
        setIsPlaying(false)
      } else {
        modalPlayerRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  // Swipe gesture handlers for mobile modal navigation
  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleVideoTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleModalNext()
    } else if (isRightSwipe) {
      handleModalPrev()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  const handlePhotoTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handlePhotoNext()
    } else if (isRightSwipe) {
      handlePhotoPrev()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  const toggleMute = () => {
    if (modalPlayerRef.current) {
      const newMutedState = !isMuted
      modalPlayerRef.current.setVolume(newMutedState ? 0 : 1).then(() => {
        setIsMuted(newMutedState)
      }).catch(() => {
        // Fallback if setVolume fails
        setIsMuted(newMutedState)
      })
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

  // Delay loading other videos until first video has time to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadComplete(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-rotating reel - every 5 seconds, stops once user navigates
  useEffect(() => {
    if (userHasNavigated) return // Don't auto-rotate if user has navigated

    const startInterval = () => {
      reelIntervalRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          setCurrentIndex((prev) => (prev + 1) % filteredProjects.length)
        }
      }, 5000)
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
    // Pause auto-rotation when hovering but don't change the video
    isPausedRef.current = index !== null
  }

  const handleProjectClick = (index: number) => {
    setCurrentIndex(index)
    setUserHasNavigated(true)

    const clickedProject = filteredProjects[index]

    // Open modal for the clicked project
    if (activeCategory === "film") {
      setModalVideoIndex(index)
      setProgress(0)
      setIsMuted(false)
      setIsVideoModalOpen(true)
    } else if (activeCategory === "photo") {
      // If photo has vimeoId, open video modal instead
      if (clickedProject?.vimeoId) {
        setModalVideoIndex(index)
        setProgress(0)
        setIsMuted(false)
        setIsVideoModalOpen(true)
      } else if (clickedProject?.imageUrl || clickedProject?.canvaUrl) {
        // Open photo modal for images or Canva embeds
        setModalPhotoIndex(index)
        setIsPhotoModalOpen(true)
      }
    }
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

              // Only render first video initially, then adjacent after initial load
              const isAdjacent = index === prevIndex || index === nextIndex
              const shouldRender = isFirst || (initialLoadComplete && (isActive || isAdjacent))
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
                  src={`https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&sidedock=0&playsinline=1&dnt=1&quality=1080p`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 pointer-events-none"
                  loading={isFirst ? "eager" : "lazy"}
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
            // Photo backgrounds (can be images, video, or Canva embeds)
            filteredProjects.map((project, index) => {
              const isActive = activeIndex === index

              // If project has vimeoId, show as video
              if (project.vimeoId) {
                return (
                  <iframe
                    key={`${project.id}-${activeCategory}`}
                    src={`https://player.vimeo.com/video/${project.vimeoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&sidedock=0&playsinline=1&dnt=1&quality=1080p`}
                    className="absolute inset-0 w-full h-full transition-opacity duration-500 pointer-events-none"
                    style={{
                      opacity: isActive ? 1 : 0,
                      border: 'none',
                      backgroundColor: '#000',
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    allow="autoplay; fullscreen; picture-in-picture"
                    title={project.title || project.client || "Motion"}
                  />
                )
              }

              // If project has canvaUrl, show as Canva embed
              if (project.canvaUrl) {
                return (
                  <div
                    key={`${project.id}-${activeCategory}`}
                    className="absolute inset-0 transition-opacity duration-500 flex items-center justify-center bg-black"
                    style={{ opacity: isActive ? 1 : 0 }}
                  >
                    <iframe
                      src={project.canvaUrl}
                      className="w-full h-full pointer-events-none"
                      style={{ border: 'none' }}
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      title={project.title || project.client || "Canva Design"}
                    />
                  </div>
                )
              }

              // Otherwise show as image
              if (!project.imageUrl) return null
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

      {/* Clickable overlay for video - covers most of screen except nav and info on right */}
      <div
        ref={videoAreaRef}
        className="fixed top-0 left-0 bottom-0 z-[60]"
        style={{ cursor: isMobile ? 'pointer' : (activeCategory === 'film' ? 'none' : 'pointer'), right: isMobile ? '80px' : '120px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnterVideo}
        onMouseLeave={handleMouseLeaveVideo}
        onClick={handleVideoClick}
        onTouchStart={(e) => {
          e.stopPropagation()
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          e.stopPropagation()
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
        <div
          className="fixed inset-0 z-[100] bg-black flex flex-col"
          style={{ backgroundColor: '#000' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleVideoTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleCloseModal(); }}
            className="absolute top-5 right-5 md:top-8 md:right-8 text-foreground/60 hover:text-foreground transition-colors duration-300 z-[150] p-2 -m-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation overlay zones - on top of video */}
          {/* Left side - Previous video */}
          <div
            className="absolute left-0 top-0 bottom-20 w-1/4 md:w-20 cursor-pointer z-30"
            onClick={handleModalPrev}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleModalPrev(); }}
          />

          {/* Right side - Next video */}
          <div
            className="absolute right-0 top-0 bottom-20 w-1/4 md:w-20 cursor-pointer z-30"
            onClick={handleModalNext}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleModalNext(); }}
          />

          {/* Center area - Play/Pause */}
          <div
            className="absolute left-1/4 right-1/4 md:left-20 md:right-20 top-0 bottom-20 cursor-pointer z-30"
            onClick={togglePlay}
            onTouchStart={(e) => { e.stopPropagation(); }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); togglePlay(); }}
          />

          {/* Video player - Maximum size on all devices */}
          <div className="flex-1 flex items-center justify-center px-0 relative z-0 pointer-events-none w-full h-full">
            <div className="video-modal-container relative w-full h-full max-w-[100vw] max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] bg-black" style={{ backgroundColor: '#000' }}>
              <iframe
                key={`modal-video-${modalProject.vimeoId}`}
                ref={modalIframeRef}
                src={`https://player.vimeo.com/video/${modalProject.vimeoId}?autoplay=1&loop=0&muted=0&controls=0&title=0&byline=0&portrait=0&playsinline=1&transparent=0&quality=1080p`}
                className="absolute inset-0 w-full h-full bg-black"
                style={{ border: 'none', backgroundColor: '#000', objectFit: 'cover' }}
                allow="autoplay; fullscreen; picture-in-picture"
                title={modalProject.title || modalProject.client}
                loading="eager"
              />
            </div>
          </div>

          {/* Custom Controls - Bottom - smaller in mobile landscape only */}
          <div className="px-4 landscape:px-3 landscape:md:px-10 md:px-10 pb-3 landscape:pb-2 landscape:md:pb-8 md:pb-8 relative z-20">
            {/* Progress Bar - Clickable/Draggable */}
            <div
              className="w-full h-3 landscape:h-2 landscape:md:h-3 relative mb-2 landscape:mb-1 landscape:md:mb-4 md:mb-4 cursor-pointer group flex items-center"
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
              {/* Left: Prev Arrow, Play/Pause, Volume, Time */}
              <div className="flex items-center gap-2 landscape:gap-1 landscape:md:gap-4 md:gap-4">
                {/* Previous Video */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleModalPrev(); }}
                  className="text-foreground/50 hover:text-foreground transition-colors duration-300"
                >
                  <svg className="w-4 h-4 landscape:w-3 landscape:h-3 landscape:md:w-5 landscape:md:h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="text-foreground/70 hover:text-foreground transition-colors duration-300"
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4 landscape:w-3 landscape:h-3 landscape:md:w-5 landscape:md:h-5 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 landscape:w-3 landscape:h-3 landscape:md:w-5 landscape:md:h-5 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>

                {/* Next Video */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleModalNext(); }}
                  className="text-foreground/50 hover:text-foreground transition-colors duration-300"
                >
                  <svg className="w-4 h-4 landscape:w-3 landscape:h-3 landscape:md:w-5 landscape:md:h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Mute/Unmute Button */}
                <button
                  onClick={toggleMute}
                  className="text-foreground/70 hover:text-foreground transition-colors duration-300"
                >
                  {isMuted ? (
                    <svg className="w-4 h-4 landscape:w-3 landscape:h-3 landscape:md:w-5 landscape:md:h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 landscape:w-3 landscape:h-3 landscape:md:w-5 landscape:md:h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>

                {/* Time Display */}
                <span className="text-[10px] landscape:text-[8px] landscape:md:text-xs md:text-xs text-foreground/50 font-light tracking-wider">
                  {formatTime(progress)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right: Project Info */}
              <div className="text-right">
                <h2 className="text-xs landscape:text-[10px] landscape:md:text-base md:text-base font-light uppercase tracking-[0.1em] text-foreground">
                  {modalProject.title}
                </h2>
                <p className="text-[8px] landscape:text-[7px] landscape:md:text-xs md:text-xs text-foreground/50 font-light uppercase tracking-[0.15em]">
                  {modalProject.client}
                </p>
              </div>
            </div>
          </div>
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
      {isPhotoModalOpen && (modalPhoto?.imageUrl || modalPhoto?.canvaUrl || modalPhoto?.vimeoId) && (
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handlePhotoTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={handleClosePhotoModal}
            className="absolute top-5 right-5 md:top-8 md:right-8 text-foreground/60 hover:text-foreground transition-colors duration-300 z-[150]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Full photo, Canva embed, or Vimeo video */}
          <div className="relative w-[90vw] h-[90vh] flex items-center justify-center">
            {modalPhoto.vimeoId ? (
              <iframe
                key={`photo-modal-video-${modalPhoto.vimeoId}`}
                src={`https://player.vimeo.com/video/${modalPhoto.vimeoId}?autoplay=1&loop=1&muted=0&controls=1&title=0&byline=0&portrait=0&playsinline=1&quality=1080p`}
                className="w-full h-full"
                style={{ border: 'none', backgroundColor: '#000' }}
                allow="autoplay; fullscreen; picture-in-picture"
                title={modalPhoto.title || modalPhoto.client || "Video"}
              />
            ) : modalPhoto.canvaUrl ? (
              <iframe
                src={modalPhoto.canvaUrl}
                className="w-full h-full"
                style={{ border: 'none' }}
                allow="autoplay; fullscreen"
                title={modalPhoto.title || modalPhoto.client || "Canva Design"}
              />
            ) : (
              <img
                src={convertGoogleDriveUrl(modalPhoto.imageUrl!)}
                alt={modalPhoto.title || modalPhoto.client || "Photo"}
                className="max-w-full max-h-full object-contain"
              />
            )}
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
