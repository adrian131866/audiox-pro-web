// src/features/profiles/ProfileManager.tsx
import { useState, useEffect } from 'react';
import { profileDB, type AudioProfile } from '../../core/database/ProfileDB';

interface ProfileManagerProps {
  currentEqGains: number[];
  currentBassIntensity: number;
  currentVolume: number;
  onApplyProfile: (profile: AudioProfile) => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  currentEqGains,
  currentBassIntensity,
  currentVolume,
  onApplyProfile
}) => {
  const [profiles, setProfiles] = useState<AudioProfile[]>([]);
  const [profileName, setProfileName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await profileDB.getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileName.trim()) return alert('Por favor, ingresa un nombre para el perfil.');
    
    try {
      await profileDB.saveProfile({
        name: profileName,
        eqGains: currentEqGains,
        bassIntensity: currentBassIntensity,
        masterVolume: currentVolume
      });
      setProfileName('');
      await loadProfiles();
    } catch (error) {
      console.error('Error al guardar perfil:', error);
    }
  };

  const handleLoad = async (id: number) => {
    try {
      const profile = await profileDB.loadProfile(id);
      if (profile) {
        onApplyProfile(profile);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este perfil?')) return;
    try {
      await profileDB.deleteProfile(id);
      await loadProfiles();
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
    }
  };

  return (
    <div className="bg-ax-panel p-6 rounded-xl border border-slate-700 shadow-2xl w-full max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-yellow-400">💾</span> Gestor de Perfiles (IndexedDB)
      </h2>

      {/* Formulario para guardar */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="Nombre del perfil (ej: Rock, Auto, Voz)"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-ax-accent"
        />
        <button
          onClick={handleSave}
          className="bg-ax-accent text-ax-dark font-bold px-6 py-2 rounded-lg hover:bg-sky-400 transition-colors"
        >
          Guardar
        </button>
      </div>

      {/* Lista de perfiles */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {loading ? (
          <p className="text-slate-500 text-center py-4">Cargando perfiles...</p>
        ) : profiles.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No hay perfiles guardados.</p>
        ) : (
          profiles.map((profile) => (
            <div 
              key={profile.id} 
              className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div>
                <p className="font-medium text-white">{profile.name}</p>
                <p className="text-xs text-slate-500">
                  Creado: {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => profile.id && handleLoad(profile.id)}
                  className="px-3 py-1 text-xs bg-green-600/20 text-green-400 border border-green-600/30 rounded hover:bg-green-600/30 transition-colors"
                >
                  Cargar
                </button>
                <button
                  onClick={() => profile.id && handleDelete(profile.id)}
                  className="px-3 py-1 text-xs bg-red-600/20 text-red-400 border border-red-600/30 rounded hover:bg-red-600/30 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};