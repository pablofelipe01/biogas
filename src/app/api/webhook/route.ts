import { NextRequest, NextResponse } from 'next/server'
import { sendMessageToWebhook } from '@/lib/api'

interface Message {
  type: string;
  text: string;
  from: string;
}

interface Contact {
  wa_id: string;
}

interface WebhookRequest {
  body: {
    messages?: Message[];
    contacts?: Contact[];
  };
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: WebhookRequest = await req.json()

    // Verificar que el mensaje tiene el formato correcto
    if (!Array.isArray(body.body?.messages) || body.body.messages.length === 0) {
      return NextResponse.json({ success: false, message: 'Mensaje inválido' }, { status: 400 })
    }

    // Convertir el mensaje al formato esperado por sendMessageToWebhook
    const { type, text, from } = body.body.messages[0]
    const formattedMessage = {
      type,
      message: text, // Renombrar text a message
      userId: from   // Renombrar from a userId
    }

    const response: ApiResponse = await sendMessageToWebhook(formattedMessage)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error en el webhook:', error)
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 })
  }
}
