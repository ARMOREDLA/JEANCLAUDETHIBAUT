"use client"

interface FooterProps {
  onInfoClick?: () => void
}

export function Footer({ onInfoClick }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 px-5 py-5 md:px-8 md:py-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground/50 tracking-[0.2em] font-[family-name:var(--font-display)] font-light uppercase">
          Jean Claude Thibaut © {currentYear}
        </span>
        
        {onInfoClick && (
          <button 
            onClick={onInfoClick}
            className="text-foreground hover:opacity-70 transition-opacity duration-300 text-xs md:text-sm font-[family-name:var(--font-display)] font-light uppercase tracking-[0.15em]"
          >
            <span className="text-foreground/40">(</span>
            Information
            <span className="text-foreground/40">)</span>
          </button>
        )}
      </div>
    </footer>
  )
}
