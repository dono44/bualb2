export function parseAudioFilename(fileName: string): { title: string; artist: string; album: string } {
  const cleanName = fileName.replace(/\.[^/.]+$/, '');

  if (cleanName.includes(' - ')) {
    const parts = cleanName.split(' - ');
    const artist = parts[0].trim();
    const title = parts.slice(1).join(' - ').trim();
    if (artist && title) {
      return { artist, title, album: 'Téléphone Android' };
    }
  }

  if (cleanName.includes('_')) {
    const parts = cleanName.split('_').filter(Boolean);
    if (parts.length >= 2) {
      const artist = parts[0].trim();
      const title = parts.slice(1).join(' ').trim();
      return { artist, title, album: 'Téléphone Android' };
    }
  }

  return {
    title: cleanName,
    artist: 'Musique du Téléphone',
    album: 'Stockage Local',
  };
}