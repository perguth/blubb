// islands/ChatIsland.tsx
import { useComputed, useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'

// Type definitions
interface Message {
  id: string
  text: string
  sender: string
  timestamp: number
}

interface SignalHubSubscription {
  on(event: string, callback: (data: Message) => void): void
  destroy(): void
}

interface SignalHubClient {
  subscribe(room: string): SignalHubSubscription
  broadcast(room: string, message: Message): void
  close(): void
}

interface ChatIslandProps {
  signalhubServer: string
  signalhubRoom: string
  appName: string
}

export default function ChatIsland(
  { signalhubServer, signalhubRoom, appName }: ChatIslandProps,
) {
  const messages = useSignal<Message[]>([])
  const newMessage = useSignal('')
  const username = useSignal(`Guest-${Math.floor(Math.random() * 10000)}`)
  const connected = useSignal(false)
  const connecting = useSignal(true)
  const hubClient = useSignal<SignalHubClient | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Compute sorted messages
  const sortedMessages = useComputed(() =>
    [...messages.value].sort((a, b) => a.timestamp - b.timestamp)
  )

  // Compute if user can send a message
  const canSendMessage = useComputed(() =>
    connected.value && newMessage.value.trim().length > 0
  )

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!messagesContainerRef.current) return

    const container = messagesContainerRef.current
    // Smooth scroll to bottom
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [sortedMessages.value.length])

  // Initialize SignalHub connection
  useEffect(() => {
    let subscription: SignalHubSubscription | null = null

    const initSignalHub = async () => {
      try {
        const signalhub = await import('https://esm.sh/signalhub@4.0.0')
        const hub = signalhub.default(appName, [signalhubServer])
        hubClient.value = hub

        // Subscribe to messages
        subscription = hub.subscribe(signalhubRoom)

        if (subscription) {
          subscription.on('data', (data: Message) => {
            // Add new message to the list
            messages.value = [...messages.value, data].slice(-100)
          })

          subscription.on('open', () => {
            connected.value = true
            connecting.value = false
            console.log('Connected to SignalHub')
          })
        }
      } catch (err) {
        console.error('Failed to connect to SignalHub:', err)
        connecting.value = false
      }
    }

    initSignalHub()

    // Cleanup on unmount
    return () => {
      if (subscription) {
        subscription.destroy()
      }
      if (hubClient.value) {
        hubClient.value.close()
      }
    }
  }, [signalhubServer, signalhubRoom, appName])

  // Send message function
  const sendMessage = () => {
    if (!canSendMessage.value || !hubClient.value) return

    const message: Message = {
      id: crypto.randomUUID(),
      text: newMessage.value,
      sender: username.value,
      timestamp: Date.now(),
    }

    hubClient.value.broadcast(signalhubRoom, message)
    newMessage.value = ''
  }

  // Handle Enter key to send message
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div class='flex flex-col md:flex-row gap-6'>
      <div class='w-full md:w-3/4 flex flex-col'>
        {/* Chat container */}
        <div class='flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
          {/* Messages area */}
          <div
            ref={messagesContainerRef}
            class='h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600'
          >
            {sortedMessages.value.length === 0
              ? (
                <div class='flex flex-col items-center justify-center h-full'>
                  <img
                    src='/images/chat-empty.svg'
                    class='w-32 h-32 mb-4 opacity-50 dark:invert'
                    alt='Empty chat'
                  />
                  <p class='text-gray-500 dark:text-gray-400 text-center'>
                    No messages yet. Start the conversation!
                  </p>
                </div>
              )
              : (
                sortedMessages.value.map((msg) => (
                  <div
                    key={msg.id}
                    class={`flex ${
                      msg.sender === username.value
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      class={`max-w-xs md:max-w-md rounded-2xl px-4 py-3 shadow-sm ${
                        msg.sender === username.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                      }`}
                    >
                      <div
                        class={`text-xs mb-1 ${
                          msg.sender === username.value
                            ? 'text-indigo-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {msg.sender} •{' '}
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <p class='whitespace-pre-wrap break-words'>{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
          </div>

          {/* Message input */}
          <div class='border-t border-gray-200 dark:border-gray-700 p-4'>
            <form
              class='flex space-x-2'
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
            >
              <input
                type='text'
                value={newMessage.value}
                onInput={(e) =>
                  newMessage.value = (e.target as HTMLInputElement).value}
                onKeyDown={handleKeyDown}
                class='flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all'
                placeholder={connected.value
                  ? 'Type your message...'
                  : 'Connecting to chat...'}
                disabled={!connected.value}
              />
              <button
                type='submit'
                disabled={!canSendMessage.value}
                class='inline-flex items-center px-5 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class='w-full md:w-1/4'>
        {/* User profile */}
        <div class='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-200 dark:border-gray-700 mb-6'>
          <h3 class='text-lg font-medium text-gray-900 dark:text-white mb-3'>
            Your Profile
          </h3>
          <div class='mb-4'>
            <label class='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Display Name
            </label>
            <input
              type='text'
              value={username.value}
              onInput={(e) =>
                username.value = (e.target as HTMLInputElement).value}
              class='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='Enter your name'
            />
          </div>
          <div class='flex items-center text-sm text-gray-500 dark:text-gray-400'>
            <div
              class={`w-2.5 h-2.5 rounded-full mr-2 ${
                connecting.value
                  ? 'bg-yellow-400'
                  : connected.value
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            >
            </div>
            <span>
              {connecting.value
                ? 'Connecting...'
                : connected.value
                ? 'Online'
                : 'Offline'}
            </span>
          </div>
        </div>

        {/* Info card */}
        <div class='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-200 dark:border-gray-700'>
          <h3 class='text-lg font-medium text-gray-900 dark:text-white mb-2'>
            About This Chat
          </h3>
          <p class='text-sm text-gray-600 dark:text-gray-300 mb-4'>
            This real-time chat is powered by SignalHub. Messages are ephemeral
            and not stored permanently.
          </p>
          <div class='text-xs text-gray-500 dark:text-gray-400 space-y-1'>
            <p>Server: {signalhubServer.replace('https://', '')}</p>
            <p>Room: {signalhubRoom}</p>
            <p>App: {appName}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
