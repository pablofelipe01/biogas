'use client'

import { useState, useEffect } from 'react'
import { Message, WebhookResponse } from '@/types/chat'
import { ChatMessage } from '@/components/ChatMessage'
import { ChatInput } from '@/components/ChatInput'

const N8N_WEBHOOK_URL = 'https://primary-production-41b1.up.railway.app/webhook/b3f16682-4a31-47a5-81ae-043ca8b29e53'

// Componente de formulario de login
function LoginForm({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 3) {
      setError('Por favor, introduce un nombre válido')
      return
    }
    onLogin(name.trim())
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-blue-500 text-white p-3 flex items-center">
        <h1 className="text-xl font-bold">BioGas Agentic</h1>
      </div>

      <div className="flex-1 flex justify-center items-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl mb-6 text-center font-bold text-gray-800">Bienvenido al chat</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-800 font-medium mb-2">Nombre:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-lg text-gray-800"
                placeholder="Ingresa tu nombre"
                required
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
            >
              Comenzar chat
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const savedName = localStorage.getItem('userName')
    if (savedName) {
      setUserName(savedName)
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (name: string) => {
    setUserName(name)
    localStorage.setItem('userName', name)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('userName')
    setUserName('')
    setIsLoggedIn(false)
    setMessages([])
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    setIsLoading(true)

    const newUserMessage: Message = {
      type: 'text',
      sender: 'user',
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newUserMessage])

    try {
      const bodyToSend = {
        body: {
          messages: [
            {
              type: 'text',
              text,
              from: userName
            }
          ],
          contacts: [
            {
              wa_id: userName
            }
          ]
        }
      }

      console.log('Enviando a webhook:', JSON.stringify(bodyToSend, null, 2))

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(bodyToSend)
      })

      const responseText = await response.text()
      console.log('Respuesta del servidor:', responseText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`)
      }

      const data: WebhookResponse = JSON.parse(responseText)
      if (data.success && data.response) {
        const botMessage: Message = {
          type: 'text',
          sender: 'bot',
          content: data.response,
          timestamp: new Date(data.metadata.timestamp)
        }
        setMessages(prev => [...prev, botMessage])
      }

    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      const errorMessage: Message = {
        type: 'text',
        sender: 'bot',
        content: 'Lo siento, ocurrió un error al procesar tu mensaje.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-blue-500 text-white p-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">BioGas Agent</h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
        >
          Cerrar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>¡Bienvenido {userName}! Escribe un mensaje para comenzar la conversación.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))
        )}
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}