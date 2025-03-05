// components/ChatInput.tsx
import { useState, FormEvent, useRef } from 'react'

interface ChatInputProps {
  onSendMessage: (text: string, audioBlob?: Blob) => void
  isLoading: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Iniciar o parar la grabación
  const handleToggleRecord = async () => {
    if (isRecording) {
      // Si ya estamos grabando, detenemos
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    } else {
      // Intentar acceder al micrófono
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)

        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        // Cada vez que hay datos disponibles, se agregan a audioChunksRef
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        // Iniciar grabación
        mediaRecorder.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Error al acceder al micrófono:', error)
      }
    }
  }

  // Enviar mensaje
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    // Si no hay texto y sí hay un audio grabado
    if (!input.trim() && audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      onSendMessage('', audioBlob)
      // Reset
      setInput('')
      audioChunksRef.current = []
      return
    }

    // Si hay texto
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput('')
      audioChunksRef.current = []
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-3 bg-gray-50">
      <div className="flex space-x-2">

        {/* Botón GRABAR/DETENER */}
        <button
          type="button"
          onClick={handleToggleRecord}
          className={`px-3 py-2 rounded-lg text-white ${
            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
          disabled={isLoading}
        >
          {isRecording ? 'Detener' : 'Grabar'}
        </button>

        {/* Input de texto */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg p-2 text-gray-800 bg-white"
          placeholder={
            isRecording 
              ? 'Grabando audio...'
              : 'Escribe un mensaje o graba audio...'
          }
          disabled={isLoading || isRecording}
        />

        {/* Botón ENVIAR */}
        <button
          type="submit"
          className={`px-4 py-2 rounded-lg text-white ${
            isLoading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </form>
  )
}
