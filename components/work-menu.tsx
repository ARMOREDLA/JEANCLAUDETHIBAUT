"use client"

export type WorkCategory = "film" | "photo"

interface WorkMenuProps {
  activeCategory: WorkCategory
  onCategoryChange: (category: WorkCategory) => void
}

const categories: { value: WorkCategory; label: string }[] = [
  { value: "film", label: "Film" },
  { value: "photo", label: "Photo" },
]

export function WorkMenu({ activeCategory, onCategoryChange }: WorkMenuProps) {
  return (
    <div className="flex items-center gap-6 md:gap-8">
      {categories.map(({ value, label }) => {
        const isActive = activeCategory === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => onCategoryChange(value)}
            aria-pressed={isActive}
            className={`group relative text-[11px] md:text-xs font-light uppercase tracking-[0.2em] transition-colors duration-300 ${
              isActive ? "text-foreground" : "text-foreground/40 hover:text-foreground"
            }`}
          >
            {label}
            <span
              className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                isActive ? "w-full" : "w-0 group-hover:w-full"
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
