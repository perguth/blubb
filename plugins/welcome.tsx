// plugins/welcome.tsx
import { Head } from '$fresh/runtime.ts'
import { Plugin } from '$fresh/server.ts'
import { JSX } from 'preact'
import { lazy } from 'preact/compat'

// Properly import ChatIsland as a component
const ChatIsland = lazy(() => import('../islands/ChatIsland.tsx'))

export default function (): Plugin {
  return {
    name: 'welcome',
    routes: [
      {
        path: '/',
        component: WelcomePage,
      },
    ],
  }
}

// Use Record<never, never> instead of empty interface
function WelcomePage(_props: Record<never, never>): JSX.Element {
  // Constants from runtime config
  const SIGNALHUB_SERVER = Deno.env.get('SIGNALHUB_SERVER') ||
    'https://signalhub-jmx.herokuapp.com'
  const SIGNALHUB_ROOM = Deno.env.get('SIGNALHUB_ROOM') || 'thingylabs-chat'
  const APP_NAME = Deno.env.get('APP_NAME') || 'perguth-saaskit'

  return (
    <>
      <Head>
        <title>thingylabs | Real-time Chat</title>
        <meta
          name='description'
          content='Connect with others in real-time using our integrated chat system'
        />
        <link
          rel='preload'
          href='/styles.css'
          as='style'
        />
        <link rel='stylesheet' href='/styles.css' />
      </Head>
      <div class='flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950'>
        <header class='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10'>
          <div class='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
            <div class='flex items-center space-x-3'>
              <img
                src='/logo.svg'
                class='w-8 h-8 dark:invert'
                alt='thingylabs Logo'
              />
              <h1 class='text-xl font-semibold text-gray-900 dark:text-white'>
                thingylabs{' '}
                <span class='text-indigo-600 dark:text-indigo-400'>chat</span>
              </h1>
            </div>
          </div>
        </header>
        <main class='flex-1 p-4 md:p-8 mx-auto max-w-5xl w-full'>
          <ChatIsland
            signalhubServer={SIGNALHUB_SERVER}
            signalhubRoom={SIGNALHUB_ROOM}
            appName={APP_NAME}
          />
        </main>
        <footer class='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700'>
          <div class='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center text-sm text-gray-500 dark:text-gray-400'>
            <p>
              Built with ♥ by{' '}
              <a
                href='https://thingylabs.io'
                class='text-indigo-600 dark:text-indigo-400 hover:underline'
              >
                thingylabs
              </a>{' '}
              •
              <a
                href='https://perguth.de'
                class='text-indigo-600 dark:text-indigo-400 hover:underline ml-1'
              >
                perguth.de
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
