"use client"

interface Project {
  id: string
  title: string
  client?: string
}

interface ProjectNavProps {
  projects: Project[]
  currentIndex: number
  hoveredIndex: number | null
  onHover: (index: number | null) => void
  onClick: (index: number) => void
}

export function ProjectNav({ 
  projects, 
  currentIndex, 
  hoveredIndex, 
  onHover, 
  onClick 
}: ProjectNavProps) {
  return (
    <div className="fixed right-5 md:right-8 top-1/2 -translate-y-1/2 z-50">
      <nav className="flex flex-col items-end gap-6">
        {projects.map((project, index) => {
          const isActive = hoveredIndex !== null 
            ? hoveredIndex === index 
            : currentIndex === index
          const isHovered = hoveredIndex === index
          
          const displayName = project.title || project.client
          
          return (
            <button
              key={project.id || `project-${index}`}
              className="group flex items-center justify-end gap-4 transition-all duration-300 min-h-[24px] min-w-[60px] py-1 cursor-pointer"
              onMouseEnter={() => {
                console.log("[v0] Mouse enter on index:", index)
                onHover(index)
              }}
              onMouseLeave={() => {
                console.log("[v0] Mouse leave")
                onHover(null)
              }}
              onClick={(e) => {
                e.stopPropagation()
                console.log("[v0] Click on index:", index)
                onClick(index)
              }}
              aria-label={displayName || `Project ${index + 1}`}
            >
              {/* Project title - appears on hover, only if there's a name */}
              {displayName && (
                <span 
                  className={`text-[11px] font-light uppercase tracking-[0.2em] text-right whitespace-nowrap transition-all duration-300 ${
                    isHovered 
                      ? "opacity-100 translate-x-0" 
                      : "opacity-0 translate-x-4 pointer-events-none"
                  }`}
                >
                  {displayName}
                </span>
              )}
              
              {/* Horizontal dash line */}
              <div 
                className={`h-[1px] transition-all duration-300 ${
                  isActive 
                    ? "w-10 bg-white" 
                    : "w-6 bg-white/50 group-hover:bg-white/80 group-hover:w-8"
                }`}
              />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
