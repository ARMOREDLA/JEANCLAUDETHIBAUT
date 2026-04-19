"use client"

import { useState, useRef } from "react"

export type WorkCategory = "film" | "photo"

interface WorkMenuProps {
  activeCategory: WorkCategory
  onCategoryChange: (category: WorkCategory) => void
}

export function WorkMenu({ activeCategory, onCategoryChange }: WorkMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className="group flex items-center gap-2 text-foreground transition-opacity duration-300 text-[11px] md:text-xs font-light uppercase tracking-[0.2em]"
      >
        <span className="relative">
          Work
          <span 
            className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
              isOpen ? "w-full" : "w-0"
            }`}
          />
        </span>
        <svg 
          className={`w-2 h-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 8 8" 
          fill="none"
        >
          <path 
            d="M1 2.5L4 5.5L7 2.5" 
            stroke="currentColor" 
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown */}
      <div 
        className={`absolute top-full right-0 mt-4 transition-all duration-300 ease-out ${
          isOpen 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="relative">
          {/* Subtle top line */}
          <div className="absolute -top-px left-0 right-0 h-px bg-foreground/20" />
          
          <div className="pt-4 pb-2 flex flex-col items-end gap-1">
            <button
              onClick={() => onCategoryChange("film")}
              className={`group relative px-0 py-1.5 transition-all duration-200 ${
                activeCategory === "film"
                  ? "text-foreground"
                  : "text-foreground/40 hover:text-foreground"
              }`}
            >
              <span className="text-[11px] font-light uppercase tracking-[0.2em]">Film</span>
              <span 
                className={`absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-px bg-foreground transition-opacity duration-200 ${
                  activeCategory === "film" ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
            
            <button
              onClick={() => onCategoryChange("photo")}
              className={`group relative px-0 py-1.5 transition-all duration-200 ${
                activeCategory === "photo"
                  ? "text-foreground"
                  : "text-foreground/40 hover:text-foreground"
              }`}
            >
              <span className="text-[11px] font-light uppercase tracking-[0.2em]">Photo</span>
              <span 
                className={`absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-px bg-foreground transition-opacity duration-200 ${
                  activeCategory === "photo" ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
