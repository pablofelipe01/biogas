import { Message } from '@/types/chat'
import { CustomAudioPlayer } from './CustomAudioPlayer'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-lg p-3 max-w-[70%] ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
        }`}
      >
        {/* Mensaje de texto */}
        {message.type === 'text' && (
          <p>{message.content}</p>
        )}

        {/* Mensaje de audio con reproductor personalizado */}
        {message.type === 'audio' && message.audioUrl && (
          <CustomAudioPlayer 
            src={message.audioUrl} 
            isUser={isUser} 
          />
        )}

        <div className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}