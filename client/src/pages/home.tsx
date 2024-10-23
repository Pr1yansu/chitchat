import { MessageCircle, Users, Send, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white text-center p-4 w-full">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-orange-600 dark:text-orange-800 opacity-20">
          <MessageSquare size={64} />
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-emerald-600 dark:text-emerald-800 opacity-20">
          <MessageCircle size={64} />
        </div>
        <div className="absolute top-2/3 left-1/2 text-purple-500 dark:text-purple-700 opacity-20">
          <Users size={64} />
        </div>
        <div className="absolute top-1/3 right-1/3 text-red-500 dark:text-red-700 opacity-20">
          <Send size={64} />
        </div>
      </div>

      <main className="z-10 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
          Welcome to Our Chat Community!
        </h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          Connect, communicate, and collaborate with people from around the
          world. Join our vibrant community today!
        </p>
      </main>
    </div>
  );
}
