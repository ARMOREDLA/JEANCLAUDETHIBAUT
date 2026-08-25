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
  videoUrl?: string // Vercel Blob video URL (full length for modal)
  horizontalPreviewUrl?: string // Short horizontal preview for desktop slideshow
  verticalVideoUrl?: string // Vercel Blob vertical video URL (full length for modal)
  verticalPreviewUrl?: string // Short trailer for mobile slideshow preview
  imageUrl?: string
  canvaUrl?: string
  dp?: string // Director of Photography credit, shown in the video modal
  category: "film" | "photo"
  aspectRatio?: "cinemascope" | "16:9" // defaults to cinemascope
}

// Jean Claude Thibaut's projects
const projects: Project[] = [
  // Film projects - using Vercel Blob URLs
  { id: "1", title: "THE INVITATION", client: "S9 HUAWEI", videoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/JEANCLAUDETHIBAUT_s9.mp4", verticalPreviewUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/VERTICALS/S9_short%20vertical%2025.mp4", category: "film" },
  { id: "2", title: "INTUITION - DWAYNE WADE", client: "ARAMIS", videoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/ARAMIS%20THIBAUT_ARMORED.mp4", verticalVideoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/ARAMIS_HERO_30_2160x3840_webmix_Super_global_Compressed_1.mp4", category: "film" },
  { id: "3", title: "OLD FASHIONED - LUCIEN LAVISCOUNT", client: "KILIAN PARIS", videoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/KILIANPARIS_OLD%20FASHIONED_JEANCLAUDETHIBAUT_ARMORED.mp4", verticalPreviewUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/VERTICALS/Old_short%20vertical%2025.mp4", dp: "Erik Messerschmidt, ASC", category: "film", aspectRatio: "16:9" },
  { id: "4", title: "RE-Nutriv DIAMOND LIPS - ANA DE ARMAS", client: "ESTÉE LAUDER", videoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/RN_DiamondLips.mp4", verticalPreviewUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/VERTICALS/ANA_short_vertical%2025.mp4", category: "film" },
  { id: "5", title: "DARE - IMAAN HAMMAM, GRACE ELIZABETH", client: "ESTÉE LAUDER", videoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/EL_PURECOLOR_DARE_THIBAUT.mov-.mp4", verticalPreviewUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/VERTICALS/PURE_short_%20VERTICAL.mp4", category: "film" },
  { id: "7", title: "BLUE SERUM - LIU WEN", client: "CHANEL", videoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/CHANEL_BLUE%20SERUM_UK_LIUWEN_THIBAUT-.mp4", category: "film" },
  { id: "8", title: "THE ONE AND ONLY", client: "BLENDER'S PRIDE", videoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/BP-ONLY_JeanClaudeThibaut.mp4", verticalPreviewUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/VERTICALS/blender_short_%20vertical%2025.mp4", category: "film", aspectRatio: "16:9" },
  { id: "9", title: "AT LARGE", client: "MAGAZINE", videoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/ATLARGE_IAM_JEANCLAUDETHIBAUT_3840x2160_1.mp4", verticalVideoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/ATLARGE_IAM_JEANCLAUDETHIBAUT_2169x3840_1.mp4", verticalPreviewUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/VERTICALS/AT_LARGE_VERTICAL_short_1.mp4",  category: "film" },
  { id: "10", title: "WHEN LA IS A MAN", client: "LOUIS VUITTON", videoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/vuitton_-_la_is_a_man_v1%20%281080p%29.mp4", verticalPreviewUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/VERTICALS/LV_short%20vertical%2025.mp4", category: "film" },
  // Photo projects - keeping Google Drive images
  { id: "p1", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1p2rjTkcWrtRinbOEGpUeziNZhANVZK7E/view?usp=sharing", category: "photo" },
  { id: "p2", title: "", client: "AT LARGE Magazine", imageUrl: "https://drive.google.com/file/d/1mqUKGNTViuVZyupQg7cwxE8wJ8Z7-Lpy/view?usp=share_link", category: "photo" },
  { id: "p3", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1lHVls4Z5YVC9utIsi2C1l-Oml6KAq5lO/view?usp=share_link", category: "photo" },
  { id: "p4", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1j1ag9ga5RFul5aHDieeeuV5Lq8X0HM8c/view?usp=share_link", category: "photo" },
  { id: "p5", title: "INTUITION", client: "ARAMIS", imageUrl: "https://drive.google.com/file/d/15OQJfRWsY0bIOX6UejBSm-ZkkF0vD8uQ/view?usp=share_link", category: "photo" },
  { id: "p6", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1Ws9d3HNIht2dn0UVMkwUEu0HJqefmjL9/view?usp=share_link", category: "photo" },
  { id: "p7", title: "", client: "ESTÉE LAUDER", imageUrl: "https://drive.google.com/file/d/1iz2RKVJGWxVMxHn7ZZp-XTp7mlAG5hK9/view?usp=share_link", category: "photo" },
  { id: "p8", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1dSTXYWxDqSkRniRdg_7MJhhsdiMKKeWp/view?usp=share_link", category: "photo" },
  { id: "p9", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1mCbhZh-wlS7Z2QtzmEyivl3s4-QndL9Y/view?usp=share_link", category: "photo" },
  { id: "p10", title: "", client: "", imageUrl: "https://drive.google.com/file/d/1-Rc5VbDz9Sc0h5Mdmz5sLPgcQXuE0bpe/view?usp=share_link", category: "photo" },
  { id: "p11", title: "", client: "", imageUrl: "https://drive.google.com/file/d/12p0-Ykp337COjRfcdD8lrNc6FGSSpUWc/view?usp=share_link", category: "photo" },
  { id: "p12", title: "", client: "ESTÉE LAUDER", imageUrl: "https://drive.google.com/file/d/1ux8X7Kz1s5F7bV4OwOABC1zCAY7CuY6x/view?usp=share_link", category: "photo" },
  { id: "p13", title: "", client: "", videoUrl: "https://uzvtibhpi3h7z7yz.public.blob.vercel-storage.com/jeanclaudethibaut_heather_strongarm_louisvuitton_v1.mov", category: "photo" },
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
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [touchEndY, setTouchEndY] = useState<number | null>(null)
  const [modalVideoIndex, setModalVideoIndex] = useState(0)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isCursorVisible, setIsCursorVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [userHasNavigated, setUserHasNavigated] = useState(false)

  // Modal video player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  
  const modalPlayerRef = useRef<Player | null>(null)
  const modalIframeRef = useRef<HTMLIFrameElement>(null)
  const modalVideoRef = useRef<HTMLVideoElement>(null)

  // Photo modal video player state
  const [photoVideoPlaying, setPhotoVideoPlaying] = useState(true)
  const photoModalPlayerRef = useRef<Player | null>(null)
  const photoModalIframeRef = useRef<HTMLIFrameElement>(null)

  const reelIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPausedRef = useRef(false)
  const videoAreaRef = useRef<HTMLDivElement>(null)

  // Filter projects by category
  const filteredProjects = projects.filter(p => p.category === activeCategory)

  // activeIndex: hovering over navigation shows the corresponding content for both film and photo
  const activeIndex = hoveredIndex !== null ? hoveredIndex : currentIndex
  const currentProject = filteredProjects[activeIndex]
  const modalProject = filteredProjects[modalVideoIndex]
  const modalPhoto = filteredProjects[modalPhotoIndex]

// Check if mobile device and orientation
  useEffect(() => {
    const checkMobileAndOrientation = () => {
      // Check for touch capability OR small screen (to work in preview and real devices)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 768
      // Use touch device check OR small screen check (for preview compatibility)
      setIsMobile(isTouchDevice || isSmallScreen)
      // Check landscape orientation
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    checkMobileAndOrientation()
    window.addEventListener('resize', checkMobileAndOrientation)
    return () => window.removeEventListener('resize', checkMobileAndOrientation)
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

  // Initialize photo modal video player
  useEffect(() => {
    if (isPhotoModalOpen && modalPhoto?.vimeoId && photoModalIframeRef.current) {
      photoModalPlayerRef.current = new Player(photoModalIframeRef.current)
      photoModalPlayerRef.current.play()
      setPhotoVideoPlaying(true)
    }

    return () => {
      photoModalPlayerRef.current = null
    }
  }, [isPhotoModalOpen, modalPhotoIndex, modalPhoto?.vimeoId])

  const togglePhotoVideo = () => {
    if (photoModalPlayerRef.current) {
      if (photoVideoPlaying) {
        photoModalPlayerRef.current.pause()
        setPhotoVideoPlaying(false)
      } else {
        photoModalPlayerRef.current.play()
        setPhotoVideoPlaying(true)
      }
    }
  }

  // URL hash support for direct video links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove the #
      if (!hash) return

      const [category, indexStr] = hash.split('-')
      const index = parseInt(indexStr, 10)

      if (category === 'film' && !isNaN(index)) {
        const filmProjects = projects.filter(p => p.category === 'film')
        if (index >= 0 && index < filmProjects.length) {
          setActiveCategory('film')
          setCurrentIndex(index)
          setModalVideoIndex(index)
          setProgress(0)
          setIsMuted(false)
          setIsVideoModalOpen(true)
        }
      } else if (category === 'photo' && !isNaN(index)) {
        const photoProjects = projects.filter(p => p.category === 'photo')
        if (index >= 0 && index < photoProjects.length) {
          setActiveCategory('photo')
          setCurrentIndex(index)
          setModalPhotoIndex(index)
          setIsPhotoModalOpen(true)
        }
      }
    }

    // Check hash on initial load
    if (window.location.hash) {
      handleHashChange()
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

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
      // Update URL hash for direct linking
      window.history.replaceState(null, '', `#film-${currentIndex}`)
    } else if (activeCategory === "photo") {
      // All photo items open in photo modal (including those with vimeoId)
      setModalPhotoIndex(currentIndex)
      setIsPhotoModalOpen(true)
      // Update URL hash for direct linking
      window.history.replaceState(null, '', `#photo-${currentIndex}`)
    }
  }

  const handleCloseModal = useCallback(() => {
    setIsVideoModalOpen(false)
    setIsPlaying(false)
    setProgress(0)
    // Clear URL hash
    window.history.replaceState(null, '', window.location.pathname)
  }, [])

  const handleModalPrev = useCallback(() => {
    // Find previous project with vimeoId or videoUrl
    setModalVideoIndex((prev) => {
      let newIndex = (prev - 1 + filteredProjects.length) % filteredProjects.length
      let attempts = 0
      while (!filteredProjects[newIndex]?.vimeoId && !filteredProjects[newIndex]?.videoUrl && attempts < filteredProjects.length) {
        newIndex = (newIndex - 1 + filteredProjects.length) % filteredProjects.length
        attempts++
      }
      return newIndex
    })
    setIsMuted(false)
    setProgress(0)
  }, [filteredProjects])

  const handleModalNext = useCallback(() => {
    // Find next project with vimeoId or videoUrl
    setModalVideoIndex((prev) => {
      let newIndex = (prev + 1) % filteredProjects.length
      let attempts = 0
      while (!filteredProjects[newIndex]?.vimeoId && !filteredProjects[newIndex]?.videoUrl && attempts < filteredProjects.length) {
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
    // Clear URL hash
    window.history.replaceState(null, '', window.location.pathname)
  }, [])

  // Handle category change - reset index to 0 with transition
  const handleCategoryChange = useCallback((category: WorkCategory) => {
    if (category === activeCategory) return
    setIsTransitioning(true)
    // Brief delay to fade to black before switching
    setTimeout(() => {
      setActiveCategory(category)
      setCurrentIndex(0)
      setUserHasNavigated(false)
      // Allow new content to fade in
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 150)
  }, [activeCategory])

  // Update URL hash when navigating between videos in modal
  useEffect(() => {
    if (isVideoModalOpen) {
      window.history.replaceState(null, '', `#film-${modalVideoIndex}`)
    }
  }, [isVideoModalOpen, modalVideoIndex])

  useEffect(() => {
    if (isPhotoModalOpen) {
      window.history.replaceState(null, '', `#photo-${modalPhotoIndex}`)
    }
  }, [isPhotoModalOpen, modalPhotoIndex])

  const handlePhotoPrev = useCallback(() => {
    setModalPhotoIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length)
  }, [filteredProjects.length])

  const handlePhotoNext = useCallback(() => {
    setModalPhotoIndex((prev) => (prev + 1) % filteredProjects.length)
  }, [filteredProjects.length])

  const togglePlay = () => {
    // HTML5 video (Blob)
    if (modalVideoRef.current) {
      if (isPlaying) {
        modalVideoRef.current.pause()
      } else {
        modalVideoRef.current.play()
      }
      return
    }
    // Vimeo player
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

  // Fullscreen toggle for mobile video
  const modalContainerRef = useRef<HTMLDivElement>(null)
  
  const toggleFullscreen = async () => {
    try {
      const videoEl = modalVideoRef.current
      if (!videoEl) return
      
      // iOS Safari uses webkitEnterFullscreen on video element
      if ((videoEl as any).webkitEnterFullscreen) {
        (videoEl as any).webkitEnterFullscreen()
        setIsFullscreen(true)
        return
      }
      
      // Standard fullscreen API for other browsers
      const container = modalContainerRef.current
      if (!container) return
      
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          await container.requestFullscreen()
          setIsFullscreen(true)
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
          setIsFullscreen(false)
        }
      }
    } catch (err) {
      // Silently handle fullscreen errors
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Swipe gesture handlers using refs for immediate tracking (like armoredpictures.com)
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX
    touchStartYRef.current = e.targetTouches[0].clientY
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setTouchEndY(null)
    setTouchStartY(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
    setTouchEndY(e.targetTouches[0].clientY)
  }

  // Slideshow vertical swipe handler for mobile - ONLY handles swiping, not taps
  const handleSlideshowTouchEnd = (e: React.TouchEvent) => {
    const startY = touchStartYRef.current
    const endY = e.changedTouches[0].clientY
    
    if (startY === null) return
    
    const distanceY = startY - endY
    
    // Swipe threshold for vertical swiping - small threshold for easy swiping
    const swipeThreshold = 15
    const isUpSwipe = distanceY > swipeThreshold
    const isDownSwipe = distanceY < -swipeThreshold

    if (isUpSwipe) {
      // Swipe up = next project
      setUserHasNavigated(true)
      setCurrentIndex((prev) => (prev + 1) % filteredProjects.length)
    } else if (isDownSwipe) {
      // Swipe down = previous project
      setUserHasNavigated(true)
      setCurrentIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length)
    }
    // No tap handling here - tap is handled by the dedicated "Tap to play" button

    touchStartXRef.current = null
    touchStartYRef.current = null
    setTouchStartY(null)
    setTouchEndY(null)
    setTouchStart(null)
    setTouchEnd(null)
  }

  const handleVideoTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent iOS from exiting fullscreen on swipe
    
    const startX = touchStartXRef.current
    const startY = touchStartYRef.current
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    
    if (startX === null || startY === null) return
    
    const distanceX = startX - endX
    const distanceY = startY - endY
    
    // Lower swipe threshold for easier swiping (25px)
    const swipeThreshold = 25
    const isLeftSwipe = distanceX > swipeThreshold
    const isRightSwipe = distanceX < -swipeThreshold
    
    // Tap requires virtually no movement (< 5px) - be very strict
    const isTap = Math.abs(distanceX) < 5 && Math.abs(distanceY) < 5

    if (isLeftSwipe) {
      handleModalNext()
    } else if (isRightSwipe) {
      handleModalPrev()
    } else if (isTap) {
      // Tap detected - play/pause if in upper 85% of screen, ignore bottom 15%
      const screenHeight = window.innerHeight
      const isUpperArea = startY < screenHeight * 0.85
      
      if (isUpperArea) {
        togglePlay()
      }
    }

    touchStartXRef.current = null
    touchStartYRef.current = null
    setTouchStart(null)
    setTouchEnd(null)
    setTouchStartY(null)
    setTouchEndY(null)
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
    // HTML5 video (Blob)
    if (modalVideoRef.current) {
      const newMutedState = !isMuted
      modalVideoRef.current.muted = newMutedState
      setIsMuted(newMutedState)
      return
    }
    // Vimeo player
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
    if (duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const seekTime = percentage * duration

    // HTML5 video (Blob)
    if (modalVideoRef.current) {
      modalVideoRef.current.currentTime = seekTime
      setProgress(seekTime)
      return
    }
    // Vimeo player
    if (modalPlayerRef.current) {
      modalPlayerRef.current.setCurrentTime(seekTime)
      setProgress(seekTime)
    }
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
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle when no modal is open
      if (isVideoModalOpen || isPhotoModalOpen) return
      
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

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVideoModalOpen, isPhotoModalOpen, filteredProjects.length])

  // Delay loading other videos until first video has time to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadComplete(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-rotating reel - every 8 seconds, stops once user navigates
  // On mobile with verticalPreviewUrl, video onEnded handles the rotation instead
  const activeProject = filteredProjects[currentIndex]
  const hasPreviewOnMobile = isMobile && !!activeProject?.verticalPreviewUrl
  
  useEffect(() => {
    if (userHasNavigated) return // Don't auto-rotate if user has navigated
    if (hasPreviewOnMobile) return // Let video onEnded handle rotation

    const startInterval = () => {
      reelIntervalRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          setCurrentIndex((prev) => (prev + 1) % filteredProjects.length)
        }
      }, 8000)
    }

    startInterval()

    return () => {
      if (reelIntervalRef.current) {
        clearInterval(reelIntervalRef.current)
      }
    }
  }, [filteredProjects.length, userHasNavigated, hasPreviewOnMobile])

  const handleProjectHover = (index: number | null) => {
    setHoveredIndex(index)
    // Pause auto-rotation when hovering but don't change the video
    isPausedRef.current = index !== null
  }

  const handleProjectClick = (index: number, fromTouch = false) => {
    // If clicking on a different project (from dashed nav), just navigate to it - don't open modal
    if (index !== currentIndex) {
      setCurrentIndex(index)
      setUserHasNavigated(true)
      return
    }
    
    // Clicking on current project - only open modal if fromTouch (lower 1/3 tap) or on desktop
    if (isMobile && !fromTouch) {
      return
    }
    
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
        setIsVideoLoading(true)
        setIsVideoModalOpen(true)
      } else if (clickedProject?.imageUrl || clickedProject?.canvaUrl) {
        // Open photo modal for images or Canva embeds
        setModalPhotoIndex(index)
        setIsPhotoModalOpen(true)
      }
    }
  }

  return (
    <main 
      className="relative h-screen h-[100dvh] overflow-hidden bg-background"
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleSlideshowTouchEnd : undefined}
    >
{/* Mobile tap to play button - this is the ONLY way to open video on mobile */}
      {/* Swipes pass through to main element, only true taps trigger open */}
      {isMobile && !isVideoModalOpen && !isPhotoModalOpen && (
        <div
          className="fixed bottom-16 left-0 right-0 h-32 z-50 flex items-center justify-center bg-transparent"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={(e) => {
            const startY = touchStartYRef.current
            const startX = touchStartXRef.current
            const endY = e.changedTouches[0].clientY
            const endX = e.changedTouches[0].clientX
            
            if (startY === null || startX === null) return
            
            const distanceY = Math.abs(startY - endY)
            const distanceX = Math.abs(startX - endX)
            
            // If it's a swipe (moved more than 8px), pass to slideshow handler
            if (distanceY > 8 || distanceX > 8) {
              handleSlideshowTouchEnd(e)
            } else {
              // It's a tap - open the video
              handleProjectClick(currentIndex, true)
            }
            
            touchStartXRef.current = null
            touchStartYRef.current = null
          }}
        >
          <span className="text-white/40 text-xs tracking-widest uppercase animate-pulse">Tap to play</span>
        </div>
      )}
      
      {/* Mobile swipe overlay - covers entire screen for swipe detection */}
      {isMobile && !isVideoModalOpen && !isPhotoModalOpen && (
        <div 
          className="fixed inset-0 z-30"
          style={{ touchAction: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleSlideshowTouchEnd}
        />
      )}
      
      {/* Fullscreen Background - Video or Photo */}
      <div className="fixed inset-0 w-full h-full z-0 bg-black">
        {/* Transition overlay to prevent flash */}
        <div
          className="absolute inset-0 bg-black z-10 pointer-events-none transition-opacity duration-150"
          style={{ opacity: isTransitioning ? 1 : 0 }}
        />
        <div className="absolute inset-0 bg-black" style={{ overflow: 'hidden' }}>
          {activeCategory === "film" ? (
            // Video backgrounds for film - always load first video, plus active and adjacent
            filteredProjects.map((project, index) => {
              // Skip if no video source (either Blob or Vimeo)
              if (!project.videoUrl && !project.vimeoId) return null

              const isActive = activeIndex === index
              const isFirst = index === 0
              const totalProjects = filteredProjects.length
              const prevIndex = (activeIndex - 1 + totalProjects) % totalProjects
              const nextIndex = (activeIndex + 1) % totalProjects

              // Only render active video, hovered video, and adjacent ones for performance
              const isAdjacent = index === prevIndex || index === nextIndex
              const isHovered = hoveredIndex === index
              const shouldRender = isFirst || (initialLoadComplete && (isActive || isAdjacent || isHovered))
              if (!shouldRender) return null

              // Use vertical preview on mobile if available, otherwise fall back to verticalVideoUrl or videoUrl
              // On desktop, use horizontalPreviewUrl if available, otherwise fall back to videoUrl
              const useVertical = isMobile && (project.verticalPreviewUrl || project.verticalVideoUrl || project.verticalVimeoId)
              const isPreviewMode = isMobile ? !!project.verticalPreviewUrl : !!project.horizontalPreviewUrl
              const videoUrl = useVertical 
                ? (project.verticalPreviewUrl || project.verticalVideoUrl || null) 
                : (project.horizontalPreviewUrl || project.videoUrl)
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

              // Use Vercel Blob video if available, otherwise fall back to Vimeo
              if (videoUrl) {
                return (
                  <video
                    key={`${project.id}-${activeCategory}-${isMobile ? 'mobile' : 'desktop'}`}
                    src={videoUrl}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    autoPlay={isActive}
                    loop={!isPreviewMode}
                    muted
                    playsInline
                    preload="metadata"
                    ref={(el) => {
                      // Play/pause based on active state
                      if (el) {
                        if (isActive) {
                          el.play().catch(() => {})
                        } else {
                          el.pause()
                        }
                      }
                    }}
                    onEnded={isPreviewMode && isActive ? () => {
                      setCurrentIndex((prev) => (prev + 1) % filteredProjects.length)
                    } : undefined}
                    style={{
                      opacity: isActive ? 1 : 0,
                      transition: 'opacity 0.5s',
                      width: videoWidth,
                      height: videoHeight,
                      objectFit: 'cover',
                      backgroundColor: '#000',
                    }}
                  />
                )
              }

              // Fall back to Vimeo iframe
              return (
                <iframe
                  key={`${project.id}-${activeCategory}-${isMobile ? 'mobile' : 'desktop'}`}
                  src={`https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&sidedock=0&playsinline=1&dnt=1&quality=1080p&autopause=0`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 pointer-events-none"
                  loading={(isFirst || isMobile) ? "eager" : "lazy"}
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

              // If project has vimeoId, show as video - contained with black bars
              if (project.vimeoId) {
                return (
                  <div
                    key={`${project.id}-${activeCategory}`}
                    className="absolute inset-0 transition-opacity duration-300 flex items-center justify-center bg-black"
                    style={{ opacity: isActive ? 1 : 0 }}
                  >
                    <iframe
                      src={`https://player.vimeo.com/video/${project.vimeoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&sidedock=0&playsinline=1&dnt=1&quality=4k&keyboard=0&autopause=0`}
                      className="pointer-events-none"
                      style={{
                        border: 'none',
                        width: 'min(100vw, 177.78vh)',
                        height: 'min(100vh, 56.25vw)',
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                      loading="eager"
                      allow="autoplay; fullscreen; picture-in-picture"
                      title={project.title || project.client || "Motion"}
                    />
                  </div>
                )
              }

              // If project has videoUrl (Blob), show as HTML5 video
              if (project.videoUrl) {
                return (
                  <div
                    key={`${project.id}-${activeCategory}`}
                    className="absolute inset-0 transition-opacity duration-500 flex items-center justify-center bg-black"
                    style={{ opacity: isActive ? 1 : 0 }}
                  >
                    <video
                      src={project.videoUrl}
                      className="max-w-full max-h-full object-contain pointer-events-none"
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                    />
                  </div>
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
                  className="absolute inset-0 transition-opacity duration-300 flex items-center justify-center bg-black"
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

      {/* Clickable overlay for video - covers most of screen except nav/info on right and footer at bottom */}
      <div
        ref={videoAreaRef}
        className="fixed top-0 left-0 z-[60]"
        style={{ cursor: isMobile ? 'pointer' : (activeCategory === 'film' ? 'none' : 'pointer'), right: isMobile ? '80px' : '120px', bottom: isMobile ? '80px' : '60px' }}
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
          onCategoryChange={handleCategoryChange}
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
      {isVideoModalOpen && modalProject && (modalProject.videoUrl || modalProject.vimeoId) && (
        <div
          ref={modalContainerRef}
          className="fixed inset-0 z-[100] bg-black flex flex-col"
          style={{ backgroundColor: '#000' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleVideoTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleCloseModal(); }}
            onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handleCloseModal(); }}
            className="absolute top-5 right-5 md:top-8 md:right-8 text-foreground/60 hover:text-foreground transition-colors duration-300 z-[150] p-2 -m-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Click/tap zones for navigation - work on both mobile and desktop */}
          {/* Left side - Previous video */}
          <div
            className="absolute left-0 top-0 bottom-20 w-1/4 md:w-20 cursor-pointer z-30"
            onClick={handleModalPrev}
          />

          {/* Right side - Next video */}
          <div
            className="absolute right-0 top-0 bottom-20 w-1/4 md:w-20 cursor-pointer z-30"
            onClick={handleModalNext}
          />

          {/* Center area - Play/Pause */}
          <div
            className="absolute left-1/4 right-1/4 md:left-20 md:right-20 top-0 bottom-20 cursor-pointer z-30"
            onClick={togglePlay}
          />

          {/* Video player - Maximum size on all devices */}
          <div className="flex-1 flex items-center justify-center px-0 relative z-0 pointer-events-none w-full h-full">
            <div className="video-modal-container relative w-full h-full max-w-[100vw] max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] bg-black" style={{ backgroundColor: '#000' }}>
              {/* Select video based on orientation - landscape uses horizontal, portrait uses vertical */}
              {(() => {
                // In landscape mode (even on mobile), use horizontal video
                // In portrait mode on mobile, use vertical video if available
                const useVerticalVideo = isMobile && !isLandscape && modalProject.verticalVideoUrl
                const modalVideoUrl = useVerticalVideo 
                  ? modalProject.verticalVideoUrl 
                  : modalProject.videoUrl
                
                return modalVideoUrl ? (
                  <video
                    key={`modal-video-blob-${modalProject.id}-${isLandscape ? 'h' : 'v'}`}
                    ref={modalVideoRef}
                    src={modalVideoUrl}
                    className="absolute inset-0 w-full h-full"
                    style={{ objectFit: 'contain' }}
                    autoPlay
                    playsInline
                    muted={isMuted}
                    onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => {
                      setDuration(e.currentTarget.duration)
                      setIsPlaying(true)
                      // Unmute after autoplay starts
                      if (e.currentTarget) {
                        e.currentTarget.muted = false
                        setIsMuted(false)
                      }
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                ) : (
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
                )
              })()}
            </div>
          </div>

          {/* Custom Controls - Bottom */}
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
                  if (duration > 0) {
                    // HTML5 video (Blob)
                    if (modalVideoRef.current) {
                      modalVideoRef.current.currentTime = seekTime
                      setProgress(seekTime)
                    } else if (modalPlayerRef.current) {
                      // Vimeo player
                      modalPlayerRef.current.setCurrentTime(seekTime)
                      setProgress(seekTime)
                    }
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

                {/* Fullscreen Button - show on all devices for Blob videos */}
                {modalProject.videoUrl && (
                  <button
                    onClick={toggleFullscreen}
                    className="text-foreground/70 hover:text-foreground transition-colors duration-300"
                  >
                    {isFullscreen ? (
                      <svg className="w-4 h-4 landscape:w-3 landscape:h-3 landscape:md:w-5 landscape:md:h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 landscape:w-3 landscape:h-3 landscape:md:w-5 landscape:md:h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                    )}
                  </button>
                )}

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
                {modalProject.dp && (
                  <p className="mt-1 landscape:mt-0.5 text-[7px] landscape:text-[6px] landscape:md:text-[10px] md:text-[10px] text-foreground/35 font-light uppercase tracking-[0.2em]">
                    <span className="text-foreground/25">DP</span> {modalProject.dp}
                  </p>
                )}
              </div>
            </div>
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
          <div className="relative w-[95vw] h-[95vh] flex items-center justify-center bg-black">
            {modalPhoto.vimeoId ? (
              <>
                <iframe
                  ref={photoModalIframeRef}
                  key={`photo-modal-video-${modalPhoto.vimeoId}`}
                  src={`https://player.vimeo.com/video/${modalPhoto.vimeoId}?autoplay=1&loop=1&muted=0&controls=0&title=0&byline=0&portrait=0&playsinline=1&quality=4k&transparent=0&background=0&keyboard=0`}
                  className="w-full h-full"
                  style={{ border: 'none', backgroundColor: '#000' }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  title={modalPhoto.title || modalPhoto.client || "Video"}
                />
                {/* Click overlay for play/pause */}
                <div
                  className="absolute inset-0 cursor-pointer z-10"
                  onClick={togglePhotoVideo}
                  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); togglePhotoVideo(); }}
                />
              </>
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
