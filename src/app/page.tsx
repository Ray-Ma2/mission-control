"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { TaskBoard } from "@/components/TaskBoard";
import { CalendarView } from "@/components/CalendarView";

export default function Home() {
  const [activeView, setActiveView] = useState("tasks");

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none z-0" />

      <Header />

      <div className="flex-1 flex relative z-10">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        <main className="flex-1 p-6 overflow-auto">
          {activeView === "tasks" && <TaskBoard />}
          {activeView === "calendar" && <CalendarView />}
        </main>
      </div>
    </div>
  );
}
