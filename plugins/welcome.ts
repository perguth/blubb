// plugins/welcome.tsx
import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { asset } from "$fresh/runtime.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";
import ChatIsland from "../islands/ChatIsland.tsx";

// Get config from environment
const SIGNALHUB_SERVER = Deno.env.get("SIGNALHUB_SERVER") || "https://signalhub.example.com";
const SIGNALHUB_ROOM = Deno.env.get("SIGNALHUB_ROOM") || "saaskit-welcome";
const APP_NAME = Deno.env.get("APP_NAME") || "deno-saaskit";

export default function Welcome(props: PageProps) {
  return (
    <div class="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Head>
        <title>Welcome | Deno SaaSKit</title>
        {IS_BROWSER && (
          <script dangerouslySetInnerHTML={{
            __html: `
              globalThis.SIGNALHUB_SERVER = "${SIGNALHUB_SERVER}";
              globalThis.SIGNALHUB_ROOM = "${SIGNALHUB_ROOM}";
              globalThis.APP_NAME = "${APP_NAME}";
            `
          }} />
        )}
      </Head>

      <main class="flex-1 p-4 md:px-8 mx-auto max-w-7xl w-full">
        <div class="flex flex-col items-center justify-center py-8">
          <img src={asset("/logo.svg")} class="w-32 h-32 mb-6 dark:invert" alt="Logo" />
          <h1 class="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Welcome to Deno SaaSKit
          </h1>
          <p class="text-lg text-center text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
            Connect with others in real-time using our integrated chat system
          </p>

          <ChatIsland />
        </div>
      </main>
    </div>
  );
}
