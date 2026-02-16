interface DashboardStatCardProps {
  title: string
  value: number
  unit: string
  label: string
  target?: number
  imageSrc: string
  themeColor: string
  iconName?: string
}

export function DashboardStatCard({
  title,
  value,
  unit,
  label,
  target,
  imageSrc,
  themeColor,
  iconName,
}: DashboardStatCardProps) {
  const progress = target ? Math.min((value / target) * 100, 100) : 100

  return (
    <div
      className="glass-panel rounded-2xl p-0 overflow-hidden relative group transition-colors duration-300"
      style={{ borderColor: `rgba(255, 255, 255, 0.08)` }}
    >
      <img
        src={imageSrc}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700 ease-out grayscale mix-blend-overlay"
      />
      <div
        className="absolute inset-0 z-0"
        style={{ background: `linear-gradient(to bottom right, ${themeColor}33, black 90%)` }}
      />
      <div className="relative z-10 p-6 flex flex-col h-full justify-between">
        <div className="flex items-center gap-2 mb-4 3xl:mb-8" style={{ color: themeColor }}>
          {iconName ? (
            <span className="material-symbols-outlined 3xl:text-4xl">{iconName}</span>
          ) : (
            <div
              className="w-2 h-2 3xl:w-4 3xl:h-4 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: themeColor }}
            />
          )}
          <span className="font-cyber text-sm 3xl:text-2xl tracking-widest uppercase">{title}</span>
        </div>
        <div>
          <div className="text-4xl 3xl:text-7xl font-bold text-white font-cyber tracking-tighter">
            {value}
            <span
              className="text-lg 3xl:text-3xl font-normal font-sans ml-1"
              style={{ color: `${themeColor}cc` }}
            >
              {unit}
            </span>
          </div>
          <p className="text-xs 3xl:text-xl text-white/40 mt-1 3xl:mt-3">{label}</p>
        </div>
        <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              backgroundColor: themeColor,
              width: `${progress}%`,
              boxShadow: `0 0 10px ${themeColor}`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
