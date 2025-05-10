// islands/ChatIsland.tsx
import { useSignal, useComputed } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

export default function ChatIsland() {
  const messages = useSignal<Message[]>([]);
  const newMessage = useSignal("");
  const username = useSignal(`User-${Math.floor(Math.random() * 10000)}`);
  const connected = useSignal(false);
  const hubClient = useSignal<any>(null);
  const isLoading = useSignal(true);

  const sortedMessages = useComputed(() => 
    [...messages.value].sort((a, b) => a.timestamp - b.timestamp)
  );

  const canSendMessage = useComputed(() => 
    connected.value && newMessage.value.trim().length > 0
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    let subscription: any = null;

    const initSignalHub = async () => {
      try {
        const signalhub = await import("https://esm.sh/signalhub@4.0.0");
        const hub = signalhub.default(
          globalThis.APP_NAME, 
          [globalThis.SIGNALHUB_SERVER]
        );

        hubClient.value = hub;
        subscription = hub.subscribe(globalThis.SIGNALHUB_ROOM);

        subscription.on("data", (data: Message) => {
          messages.value = [...messages.value, data].slice(-50);
        });

        subscription.on("open", () => {
          connected.value = true;
          isLoading.value = false;
        });
      } catch (err) {
        console.error("SignalHub error:", err);
        isLoading.value = false;
      }
    };

    initSignalHub();

    return () => {
      if (subscription) subscription.destroy();
      if (hubClient.value) hubClient.value.close();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = document.getElementById("messages-container");
    if (container) container.scrollTop = container.scrollHeight;
  }, [sortedMessages.value]);

  const sendMessage = () => {
    if (!canSendMessage.value) return;

    const message: Message = {
      id: crypto.randomUUID(),
      text: newMessage.value,
      sender: username.value,
      timestamp: Date.now(),
    };

    hubClient.value.broadcast(globalThis.SIGNALHUB_ROOM, message);
    newMessage.value = "";
  };

  return (
    <div class="w-full max-w-2xl">
      <div class="w-full mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Your Display Name
        </label>
        <input
          type="text"
          value={username.value}
          onInput={(e) => username.value = (e.target as HTMLInputElement).value}
          class="w-full px-4 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800"
          placeholder="Enter your name"
        />
      </div>

      <div class="flex items-center mb-6">
        <div class={`w-3 h-3 rounded-full mr-2 ${
          isLoading.value ? "bg-yellow-500" : connected.value ? "bg-green-500" : "bg-red-500"
        }`}></div>
        <span class="text-sm text-gray-600 dark:text-gray-300">
          {isLoading.value ? "Connecting..." : connected.value ? "Connected" : "Connection failed"}
        </span>
      </div>

      <div class="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="h-96 overflow-y-auto p-4 space-y-4" id="messages-container">
          {sortedMessages.value.length === 0 ? (
            <div class="flex items-center justify-center h-full">
              <p class="text-gray-500 dark:text-gray-400 text-center">No messages yet</p>
            </div>
          ) : (
            sortedMessages.value.map((msg) => (
              <div 
                key={msg.id}
                class={`flex ${msg.sender === username.value ? "justify-end" : "justify-start"}`}
              >
                <div 
                  class={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    msg.sender === username.value 
                      ? "bg-indigo-500 text-white" 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                  }`}
                >
                  <div class="text-xs opacity-75 mb-1">
                    {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 p-4">
          <form 
            class="flex space-x-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={newMessage.value}
              onInput={(e) => newMessage.value = (e.target as HTMLInputElement).value}
              class="flex-1 px-4 py-2 border rounded-md"
              placeholder="Type your message..."
              disabled={!connected.value}
            />
            <button
              type="submit"
              disabled={!canSendMessage.value}
              class="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
