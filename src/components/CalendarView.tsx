"use client";

import { useState, useEffect } from "react";

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  color?: string;
}

// 仮のイベントデータ（後でGoogle Calendar APIと連携）
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    summary: "インクロム 定例MTG",
    start: "2026-02-21T10:00:00",
    end: "2026-02-21T11:00:00",
    color: "cyan",
  },
  {
    id: "2",
    summary: "まんてんR 定例MTG",
    start: "2026-02-27T14:00:00",
    end: "2026-02-27T15:00:00",
    color: "green",
  },
  {
    id: "3",
    summary: "神戸天空 社長1on1",
    start: "2026-03-06T10:00:00",
    end: "2026-03-06T11:00:00",
    color: "amber",
  },
];

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 月の最初の日と最後の日
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 月の最初の日の曜日（0 = 日曜日）
  const startDayOfWeek = firstDay.getDay();

  // 月の日数
  const daysInMonth = lastDay.getDate();

  // カレンダーグリッドを生成
  const calendarDays: (number | null)[] = [];

  // 月曜始まりにするため調整（0 = 月曜）
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  for (let i = 0; i < adjustedStartDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const weekDays = ["月", "火", "水", "木", "金", "土", "日"];
  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月",
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.start.startsWith(dateStr));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm text-cyan tracking-[4px] uppercase [text-shadow:0_0_10px_var(--cyan)]">
            Calendar
          </h2>
          <p className="text-[10px] text-text-muted mt-1">
            スケジュールを確認する
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* カレンダー */}
        <div className="col-span-2 bg-panel/90 border border-border-glow rounded backdrop-blur-sm">
          {/* ヘッダー */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="px-2 py-1 text-text-dim hover:text-cyan transition-colors"
            >
              ←
            </button>
            <span className="text-[11px] tracking-[3px] uppercase text-cyan">
              {year}年 {monthNames[month]}
            </span>
            <button
              onClick={nextMonth}
              className="px-2 py-1 text-text-dim hover:text-cyan transition-colors"
            >
              →
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((day, i) => (
              <div
                key={day}
                className={`text-center py-2 text-[10px] tracking-wider ${
                  i >= 5 ? "text-text-muted" : "text-text-dim"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const today = day ? isToday(day) : false;

              return (
                <div
                  key={i}
                  className={`min-h-[80px] p-1 border-b border-r border-border ${
                    day ? "" : "bg-bg/30"
                  } ${today ? "bg-cyan/5" : ""}`}
                >
                  {day && (
                    <>
                      <div
                        className={`text-[10px] mb-1 ${
                          today
                            ? "text-cyan font-bold"
                            : i % 7 >= 5
                              ? "text-text-muted"
                              : "text-text-dim"
                        }`}
                      >
                        {day}
                      </div>
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-[9px] px-1 py-0.5 mb-0.5 rounded truncate bg-${event.color || "cyan"}/20 text-${event.color || "cyan"} border-l-2 border-${event.color || "cyan"}`}
                        >
                          {formatTime(event.start)} {event.summary}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-text-muted px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 今日の予定 */}
        <div className="bg-panel/90 border border-border-glow rounded backdrop-blur-sm">
          <div className="px-4 py-3 border-b border-border">
            <span className="text-[10px] tracking-[3px] uppercase text-cyan">
              Today&apos;s Schedule
            </span>
          </div>

          <div className="p-3 space-y-2">
            {events
              .filter((e) => {
                const today = new Date();
                const eventDate = new Date(e.start);
                return (
                  eventDate.getFullYear() === today.getFullYear() &&
                  eventDate.getMonth() === today.getMonth() &&
                  eventDate.getDate() === today.getDate()
                );
              })
              .map((event) => (
                <div
                  key={event.id}
                  className="bg-[#0a1520cc] border border-border rounded p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] text-${event.color || "cyan"}`}>
                      {formatTime(event.start)}
                    </span>
                    <span className="text-[10px] text-text-muted">-</span>
                    <span className={`text-[10px] text-${event.color || "cyan"}`}>
                      {formatTime(event.end)}
                    </span>
                  </div>
                  <div className="text-[12px] text-text">{event.summary}</div>
                  {event.location && (
                    <div className="text-[10px] text-text-muted mt-1">
                      📍 {event.location}
                    </div>
                  )}
                </div>
              ))}

            {events.filter((e) => {
              const today = new Date();
              const eventDate = new Date(e.start);
              return (
                eventDate.getFullYear() === today.getFullYear() &&
                eventDate.getMonth() === today.getMonth() &&
                eventDate.getDate() === today.getDate()
              );
            }).length === 0 && (
              <div className="text-center text-text-muted text-[11px] py-8">
                今日の予定はありません
              </div>
            )}
          </div>

          {/* 今週の予定 */}
          <div className="px-4 py-3 border-t border-border">
            <span className="text-[10px] tracking-[3px] uppercase text-text-dim">
              This Week
            </span>
          </div>

          <div className="p-3 space-y-2">
            {events
              .filter((e) => {
                const today = new Date();
                const eventDate = new Date(e.start);
                const weekFromNow = new Date(today);
                weekFromNow.setDate(today.getDate() + 7);
                return eventDate >= today && eventDate <= weekFromNow;
              })
              .slice(0, 5)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 text-[11px]"
                >
                  <span className="text-text-muted w-12">
                    {new Date(event.start).getMonth() + 1}/
                    {new Date(event.start).getDate()}
                  </span>
                  <span className={`text-${event.color || "cyan"}`}>●</span>
                  <span className="text-text-dim truncate">{event.summary}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Google Calendar連携の説明 */}
      <div className="mt-4 p-4 bg-panel/50 border border-border rounded">
        <div className="text-[10px] text-text-muted tracking-wider mb-2">
          ℹ️ Google Calendar連携
        </div>
        <div className="text-[11px] text-text-dim">
          現在はモックデータを表示しています。Google Calendar
          APIと連携することで、実際の予定を表示できます。
        </div>
      </div>
    </div>
  );
}
