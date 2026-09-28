import { 
  Music, Users, Disc, Folder, Heart, Clock, 
  ListMusic, Sliders, Activity, AudioWaveform, Zap 
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    {
      section: 'LIBRARY',
      items: [
        { id: 'songs', label: 'Songs', icon: Music },
        { id: 'artists', label: 'Artists', icon: Users },
        { id: 'albums', label: 'Albums', icon: Disc },
        { id: 'folders', label: 'Folders', icon: Folder },
      ]
    },
    {
      section: 'DISCOVER',
      items: [
        { id: 'favorites', label: 'Favorites', icon: Heart },
        { id: 'recent', label: 'Recently Played', icon: Clock },
      ]
    },
    {
      section: 'PLAYLISTS',
      items: [
        { id: 'playlists', label: 'All playlists', icon: ListMusic, hasAdd: true },
      ]
    },
    {
      section: 'TOOLS',
      items: [
        { id: 'equalizer', label: 'Equalizer', icon: Sliders },
        { id: 'dsp', label: 'DSP', icon: Activity },
        { id: 'visualizer', label: 'Visualizer', icon: AudioWaveform },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-ax-sidebar border-r border-ax-border flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-ax-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-ax-accent rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AudioX</h1>
            <p className="text-xs text-ax-muted">WEB</p>
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {menuItems.map((group) => (
          <div key={group.section}>
            <h3 className="text-[10px] font-bold text-ax-muted uppercase tracking-wider px-3 mb-2">
              {group.section}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onSectionChange(item.id)}
                    aria-label={`Navegar a ${item.label}`}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === item.id
                        ? 'bg-ax-accent/20 text-ax-accent'
                        : 'text-ax-text hover:bg-ax-card hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" aria-hidden="true" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {'hasAdd' in item && item.hasAdd && (
                      <span className="text-ax-muted hover:text-white" aria-label="Agregar nuevo">+</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Indicador de estado */}
      <div className="p-4 border-t border-ax-border">
        <div className="flex items-center gap-2 text-xs text-ax-muted">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true"></div>
          <span>Web Audio API ready</span>
        </div>
      </div>
    </aside>
  );
};