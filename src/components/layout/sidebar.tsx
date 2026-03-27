import { Clock, ChevronRight, Headphones, Watch, Speaker, Keyboard, Monitor, Lamp, Zap, Layers } from "lucide-react"

const browsingHistory = [
  { name: "Wireless Headphones", time: "2m ago" },
  { name: "Smart Watch Pro", time: "15m ago" },
  { name: "Portable Speaker", time: "1h ago" },
  { name: "Mechanical Keyboard", time: "3h ago" },
]

const categories = [
  { name: "Audio", icon: Headphones, count: 128 },
  { name: "Wearables", icon: Watch, count: 64 },
  { name: "Speakers", icon: Speaker, count: 42 },
  { name: "Keyboards", icon: Keyboard, count: 89 },
  { name: "Displays", icon: Monitor, count: 35 },
  { name: "Lighting", icon: Lamp, count: 27 },
  { name: "Accessories", icon: Zap, count: 156 },
  { name: "Bundles", icon: Layers, count: 18 },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 flex flex-col gap-8">
        {/* Browsing History */}
        <div>
          <div className="flex items-center gap-2 px-1 pb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recently Viewed
            </h3>
          </div>
          <div className="flex flex-col gap-1">
            {browsingHistory.map((item) => (
              <button
                key={item.name}
                className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary"
              >
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="px-1 pb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </h3>
          <div className="flex flex-col gap-1">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.name}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{cat.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{cat.count}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
