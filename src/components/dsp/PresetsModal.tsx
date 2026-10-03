import { PRESETS, type AudioPreset } from '../../core/audio/presets';
import { X } from 'lucide-react';

interface PresetsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (preset: AudioPreset) => void;
    currentPresetId?: string;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentPresetId,
}) => {
    if (!isOpen) return null;

    const categories = [
        { id: 'custom', label: 'Personalizados', icon: '⚙️' },
        { id: 'bass', label: 'Bajos', icon: '🔊' },
        { id: 'voice', label: 'Voz', icon: '🎙️' },
        { id: 'genre', label: 'Géneros', icon: '🎵' },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-ax-panel border border-ax-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-ax-border">
                    <div>
                        <h2 className="text-xl font-bold text-white">Presets del Motor</h2>
                        <p className="text-xs text-ax-muted mt-1">Selecciona un perfil preconfigurado</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-ax-card rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-ax-muted" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto p-6">
                    {categories.map((category) => {
                        const presets: AudioPreset[] = PRESETS.filter((p: AudioPreset) => p.category === category.id);
                        if (presets.length === 0) return null;

                        return (
                            <div key={category.id} className="mb-6">
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <span>{category.icon}</span> {category.label}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {presets.map((preset: AudioPreset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => {
                                                onSelect(preset);
                                                onClose();
                                            }}
                                            className={`p-4 rounded-lg border text-left transition-all hover:scale-[1.02] ${currentPresetId === preset.id
                                                ? 'bg-ax-accent/20 border-ax-accent'
                                                : 'bg-slate-900/50 border-ax-border hover:border-ax-accent/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{preset.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-white truncate">
                                                        {preset.name}
                                                    </div>
                                                    <div className="text-xs text-ax-muted truncate">
                                                        {preset.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-ax-border flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-ax-card hover:bg-ax-panel text-white rounded-lg transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};