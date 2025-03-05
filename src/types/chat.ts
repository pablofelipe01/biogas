export type MessageType = 'text' | 'audio'
export type MessageSender = 'user' | 'bot'

export interface Message {
  type: MessageType
  sender: MessageSender
  content: string           // Texto del mensaje
  audioUrl?: string         // URL (blob:) para reproducir audio
  timestamp: Date
}

export interface WebhookRequest {
  body: {
    messages: [{
      type: MessageType
      text?: string
      audio?: string        // base64 en caso de audio
      from: string
    }]
    contacts: [{
      wa_id: string
    }]
  }
}

export interface WebhookResponse {
  success: boolean
  response: string
  metadata: {
    timestamp: string
    sessionId: string
  }
}
