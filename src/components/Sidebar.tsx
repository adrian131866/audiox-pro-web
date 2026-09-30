import { useState } from 'react';
import {
  Music, Users, Disc, Folder, Heart, Clock,
  ListMusic, Sliders, Activity, Waves, Zap,
  Menu, X
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  type MenuItem = {
    id: string;
    label: string;
    icon: typeof Music;
    hasAdd?: boolean;
  };

  type MenuGroup = {
    section: string;
    items: MenuItem[];
  };

  const menuItems: MenuGroup[] = [
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
        { id: 'visualizer', label: 'Visualizer', icon: Waves },
      ]
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón hamburguesa - solo visible en móvil */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-ax-panel rounded-lg border border-ax-border lg:hidden"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Overlay oscuro para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-ax-sidebar border-r border-ax-border flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header con logo y botón cerrar */}
        <div className="p-6 border-b border-ax-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ax-accent rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AudioX</h1>
              <p className="text-xs text-ax-muted">WEB</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-ax-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
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
                      onClick={() => handleSectionClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === item.id
                        ? 'bg-ax-accent/20 text-ax-accent'
                        : 'text-ax-text hover:bg-ax-card hover:text-white'
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.hasAdd && (
                        <span className="text-ax-muted hover:text-white">+</span>
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
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Web Audio API ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};