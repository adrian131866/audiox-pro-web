import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { LibraryView } from './components/LibraryView';
import { ToolsView } from './components/ToolsView';
import { MiniVideoPlayer } from './components/MiniVideoPlayer';
import { VideoPlayer } from './features/video-player/VideoPlayer';
import { usePlayerStore } from './store/usePlayerStore';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { audioEngine } from './core/audio/AudioEngine';
import type { Track } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('songs');
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const { setCurrentTrack, addToQueue } = usePlayerStore();

  useAudioPlayer();

  useEffect(() => {
    const token = localStorage.getItem('audiox_token');
    if (token) {
      verifyToken(token);
    }
  }, []);

 const verifyToken = async (token: string) => {
  try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/verify`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: AbortSignal.timeout(3000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token válido, usuario autenticado:', data.user);
      setIsAuthenticated(true);
    } else {
      console.warn('⚠️ Token inválido, eliminando...');
      localStorage.removeItem('audiox_token');
    }
  } catch (error) {
    console.warn('️ Servidor no disponible, modo desarrollo activado');
    console.warn('Error:', error);
    setIsAuthenticated(true);
  }
};
  
const handleLoginSuccess = (token: string) => {
  localStorage.setItem('audiox_token', token);
  setIsAuthenticated(true);
};

  const handleStartEngine = async () => {
    try {
      await audioEngine.init();
      setIsEngineReady(true);
    } catch (error) {
      console.error('Error al inicializar el motor de audio:', error);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    const newTracks: Track[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file: file,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'audio',
    }));

    newTracks.forEach((track) => addToQueue(track));
    if (newTracks.length > 0 && !usePlayerStore.getState().currentTrack) {
      setCurrentTrack(newTracks[0]);
    }
  };

const renderMainContent = () => {
  if (['equalizer', 'dsp', 'visualizer'].includes(activeSection)) {
    return (
      <ToolsView
        activeTool={activeSection as 'equalizer' | 'dsp' | 'visualizer'}
      />
    );
  }

  if (['songs', 'artists', 'albums', 'folders', 'favorites', 'recent', 'playlists'].includes(activeSection)) {
    if (usePlayerStore.getState().isVideoMode && !isVideoMinimized) {
      return (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black">
            <VideoPlayer />
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="px-8 py-4 flex gap-2 border-b border-ax-border">
          {['Songs', 'Artists', 'Albums', 'Folders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab.toLowerCase())}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === tab.toLowerCase()
                  ? 'bg-ax-accent/20 text-ax-accent'
                  : 'text-ax-muted hover:text-white hover:bg-ax-card'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <LibraryView onFilesSelected={handleFilesSelected} />
      </>
    );
  }

  return null;
};


  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (!isEngineReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-ax-bg">
        <button
          onClick={handleStartEngine}
          className="px-8 py-4 bg-ax-accent hover:bg-ax-accentHover text-white font-bold rounded-lg transition-colors shadow-lg shadow-ax-accent/20"
        >
          🚀 Inicializar AudioX Pro
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-ax-bg overflow-hidden">
      {/* Sidebar izquierdo */}
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      {/* Área principal */}
      <main className="flex-1 flex flex-col overflow-y-auto border-r border-ax-border pb-24">
        <header className="px-8 py-6 border-b border-ax-border">
          <h2 className="text-2xl font-bold text-white">
            {activeSection === 'songs' && 'My Library'}
            {activeSection === 'artists' && 'Artists'}
            {activeSection === 'albums' && 'Albums'}
            {activeSection === 'folders' && 'Folders'}
            {activeSection === 'favorites' && 'Favorites'}
            {activeSection === 'recent' && 'Recently Played'}
            {activeSection === 'playlists' && 'Playlists'}
            {activeSection === 'equalizer' && 'Equalizer'}
            {activeSection === 'dsp' && 'DSP Processing'}
            {activeSection === 'visualizer' && 'Visualizer'}
          </h2>
        </header>

        {renderMainContent()}
      </main>

      {/* Mini Video Player flotante */}
      {isVideoMinimized && usePlayerStore.getState().isVideoMode && (
        <MiniVideoPlayer
          onExpand={() => setIsVideoMinimized(false)}
          onClose={() => {
            setIsVideoMinimized(false);
            usePlayerStore.getState().setCurrentTrack(null);
          }}
        />
      )}

      {/* Player bar inferior */}
      <div className="fixed bottom-0 left-64 right-0 z-50">
        <PlayerBar />
      </div>
    </div>
  );
}

export default App;