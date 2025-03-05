import { useState, useRef, useEffect } from 'react'

interface AudioPlayerProps {
  src: string
  isUser: boolean
}

export function CustomAudioPlayer({ src, isUser }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState<number>(0) // Duración total del audio
  const [currentTime, setCurrentTime] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Cargar metadatos del audio (duración)
    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    // Cuando el audio está listo para reproducirse
    const handleCanPlay = () => {
      setIsReady(true)
      setError(false)
    }

    // Actualizar tiempo actual durante la reproducción
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    // Evento cuando finaliza la reproducción
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    // Manejar errores
    const handleError = (e: Event) => {
      console.error('Error al cargar o reproducir el audio:', e)
      setError(true)
      setIsReady(false)
      setIsPlaying(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    audio.load() // Cargar el audio

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [src])

  // Toggle reproducción
  const togglePlay = () => {
    if (!audioRef.current || !isReady) return

    const playPromise = isPlaying ? audioRef.current.pause() : audioRef.current.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(!isPlaying)
        })
        .catch(error => {
          console.error('Error al reproducir:', error)
          setIsPlaying(false)
        })
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  // Formatear tiempo en MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // Determinar el tipo MIME
  const getMimeType = () => {
    if (src.startsWith('blob:')) {
      return 'audio/webm'
    }
    const extension = src.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'mp3': return 'audio/mpeg'
      case 'm4a': return 'audio/mp4'
      case 'ogg': return 'audio/ogg'
      case 'wav': return 'audio/wav'
      default: return 'audio/webm'
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full my-1">
      <audio ref={audioRef} preload="metadata">
        <source src={src} type={getMimeType()} />
        Tu navegador no soporta la reproducción de audio.
      </audio>

      <div 
        className="flex items-center gap-2 w-full"
        style={{ 
          minHeight: '36px',
          backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
          borderRadius: '12px',
          padding: '4px 8px'
        }}
      >
        <button 
          onClick={togglePlay}
          disabled={!isReady || error}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
            ${(!isReady || error) ? 'opacity-50' : 'opacity-100'}`}
          style={{ backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}
        >
          {error ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 4L22 20H2L12 4Z" fill={isUser ? "white" : "black"} />
              <rect x="11" y="10" width="2" height="6" fill={isUser ? "black" : "white"} />
              <rect x="11" y="18" width="2" height="2" fill={isUser ? "black" : "white"} />
            </svg>
          ) : isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="4" width="4" height="16" fill={isUser ? "white" : "black"} />
              <rect x="14" y="4" width="4" height="16" fill={isUser ? "white" : "black"} />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 3L19 12L5 21V3Z" fill={isUser ? "white" : "black"} />
            </svg>
          )}
        </button>

        <div className="w-full bg-gray-300 h-1 rounded-md overflow-hidden">
          <div
            className="bg-blue-500 h-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="text-xs opacity-80 min-w-[42px] text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  )
}