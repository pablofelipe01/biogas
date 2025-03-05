// lib/api.ts

// Definir tipos de datos
interface ChatMessage {
  type: string;
  message: string;
  userId: string;
}

interface ApiResponse {
  success: boolean;
  data?: unknown; // Se reemplazó any por unknown para mejor seguridad de tipos
  error?: string;
}

export async function sendMessageToWebhook(message: ChatMessage): Promise<ApiResponse> {
  const response = await fetch('https://primary-production-41b1.up.railway.app/webhook/alma', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{
        type: message.type,
        text: message.message, // Se mantiene la conversión de nombre de propiedad
        from: message.userId,
      }],
      contacts: [{
        wa_id: message.userId
      }]
    })
  });

  if (!response.ok) {
    return {
      success: false,
      error: `HTTP error! status: ${response.status}`,
    };
  }

  const data: unknown = await response.json(); // Se tipa la respuesta como unknown
  return {
    success: true,
    data,
  };
}
