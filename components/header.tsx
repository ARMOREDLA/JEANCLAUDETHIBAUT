"use client"

import Link from "next/link"
import Image from "next/image"
import { WorkMenu, WorkCategory } from "./work-menu"

interface HeaderProps {
  activeCategory: WorkCategory
  onCategoryChange: (category: WorkCategory) => void
}

export function Header({ activeCategory, onCategoryChange }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-5 py-5 md:px-8 md:py-6">
      <nav className="flex items-center justify-between">
        {/* Logo - Left */}
        <Link
          href="/"
          className="hover:opacity-70 transition-opacity duration-300"
        >
          <Image
            src="/images/jct-logo.png"
            alt="Jean Claude Thibaut"
            width={220}
            height={18}
            className="h-3 md:h-3.5 w-auto"
            priority
          />
        </Link>

        {/* Work Menu - Right */}
        <WorkMenu 
          activeCategory={activeCategory} 
          onCategoryChange={onCategoryChange} 
        />
      </nav>
    </header>
  )
}
