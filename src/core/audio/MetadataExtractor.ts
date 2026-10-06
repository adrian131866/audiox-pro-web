import * as mm from 'music-metadata-browser';
import { type Track } from '../../types';

export const extractMetadata = async (file: File): Promise<Partial<Track>> => {
    try {
        const metadata = await mm.parseBlob(file);

        const common = metadata.common;

        let coverArt: string | undefined;
        let coverArtMimeType: string | undefined;

        if (common.picture && common.picture.length > 0) {
            const picture = common.picture[0];
            const pictureArray = new Uint8Array(
                picture.data as ArrayBuffer | ArrayLike<number>
            );
            const pictureData = pictureArray.buffer.slice(
                pictureArray.byteOffset,
                pictureArray.byteOffset + pictureArray.byteLength
            );
            const blob = new Blob([pictureData], { type: picture.format });
            coverArt = URL.createObjectURL(blob);
            coverArtMimeType = picture.format;
        }

        return {
            name: common.title || file.name.replace(/\.[^/.]+$/, ''),
            artist: common.artist || 'Artista desconocido',
            album: common.album || 'Álbum desconocido',
            year: common.year,
            genre: common.genre ? common.genre[0] : undefined,
            coverArt,
            coverArtMimeType,
            duration: metadata.format.duration || 0,
        };
    } catch (error) {
        console.warn('⚠️ No se pudieron extraer metadatos de:', file.name, error);
        // Si falla, usar el nombre del archivo como fallback
        return {
            name: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Artista desconocido',
            album: 'Álbum desconocido',
            duration: 0,
        };
    }
};

export const getFileType = (file: File): 'audio' | 'video' => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return videoExtensions.includes(extension) ? 'video' : 'audio';
};