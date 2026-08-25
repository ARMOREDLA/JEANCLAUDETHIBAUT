"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

interface InfoPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function InfoPanel({ isOpen, onClose }: InfoPanelProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-background/90 backdrop-blur-sm z-[200] transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[480px] lg:w-[520px] bg-background z-[200] transition-transform duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
          }`}
      >
        <div className="h-full overflow-y-auto px-8 py-8 md:px-12 md:py-10">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 md:top-6 md:right-8 text-foreground/50 hover:text-foreground transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="space-y-10 pt-12">
            <div>
              <h2 className="text-sm font-[family-name:var(--font-display)] font-light uppercase tracking-[0.2em] text-foreground/50 mb-5">
                About
              </h2>
              <p className="text-foreground/80 leading-relaxed text-sm">
                Jean Claude Thibaut is a director and photographer, known for his celebrity work.
                <br /><br />
                His work spans commercial, cinematic, and narrative projects.
                <br /><br />
                Select clients include Armani, Chanel, Dior, Estée Lauder, Fairmont Hotels and Louis Vuitton.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-[family-name:var(--font-display)] font-light uppercase tracking-[0.2em] text-foreground/50 mb-5">
                Contact
              </h3>
              <div className="space-y-4 text-foreground/80 text-sm">
                <div>
                  <span className="text-foreground/40 text-xs tracking-[0.15em] font-[family-name:var(--font-display)] font-light uppercase block mb-1">
                    General Inquiries
                  </span>
                  <a
                    href="mailto:contact@jeanclaudethibaut.com"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    contact@jeanclaudethibaut.com
                  </a>
                </div>
                <div>
                  <span className="text-foreground/40 text-xs tracking-[0.15em] font-[family-name:var(--font-display)] font-light uppercase block mb-1">
                    Representation
                  </span>
                  <a
                    href="mailto:k@armorednyc.com"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    k@armorednyc.com
                  </a>
                </div>
              </div>
            </div>


            <div>
              <h3 className="text-sm font-[family-name:var(--font-display)] font-light uppercase tracking-[0.2em] text-foreground/50 mb-5">
                Follow
              </h3>
              <div className="flex gap-6 text-foreground/80 text-sm">
                <a
                  href="https://www.instagram.com/jeanclaudethibaut/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors duration-300"
                >
                  Instagram
                </a>
                <a
                  href="https://www.linkedin.com/in/jean-claude-thibaut-2b90639/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors duration-300"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
