"use client";

import { Header } from "@/components/Header";
import { TaskBoard } from "@/components/TaskBoard";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none z-0" />

      <Header />

      <main className="flex-1 relative z-10 p-6 overflow-auto">
        <TaskBoard />
      </main>
    </div>
  );
}
