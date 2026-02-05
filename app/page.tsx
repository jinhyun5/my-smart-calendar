"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const STORAGE_KEY = "calendar-todos";

type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

function loadTodosForDate(date: Date): TodoItem[] {
  if (typeof window === "undefined") return [];
  const key = format(date, "yyyy-MM-dd");
  const stored = localStorage.getItem(STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};
  return data[key] || [];
}

function saveTodosForDate(date: Date, todos: TodoItem[]) {
  if (typeof window === "undefined") return;
  const key = format(date, "yyyy-MM-dd");
  const stored = localStorage.getItem(STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};
  data[key] = todos;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setTodos(loadTodosForDate(selectedDate));
  }, [selectedDate, mounted]);

  const saveAndSetTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    saveTodosForDate(selectedDate, newTodos);
  };

  const handleAddTodo = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: trimmed,
      done: false,
    };
    saveAndSetTodos([...todos, newTodo]);
    setInputText("");
  };

  const handleToggleTodo = (id: string) => {
    saveAndSetTodos(
      todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    saveAndSetTodos(todos.filter((t) => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddTodo();
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      {/* 왼쪽: 달력 */}
      <section className="flex w-1/2 flex-col border-r border-gray-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label="이전 달"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </h2>
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label="다음 달"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((d) => (
            <div
              key={d}
              className="py-2 text-xs font-medium text-gray-500"
            >
              {d}
            </div>
          ))}
          {days.map((d) => {
            const isCurrentMonth = isSameMonth(d, currentMonth);
            const isSelected = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, new Date());
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => {
                  setSelectedDate(d);
                  setCurrentMonth(d);
                }}
                className={`
                  flex h-10 items-center justify-center rounded-xl text-sm transition-all
                  ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                  ${isSelected ? "bg-[#0071e3] text-white shadow-md" : ""}
                  ${!isSelected && isCurrentMonth && isToday ? "bg-gray-200 font-medium" : ""}
                  ${!isSelected && isCurrentMonth && !isToday ? "hover:bg-gray-100" : ""}
                `}
              >
                {format(d, "d")}
              </button>
            );
          })}
        </div>
      </section>

      {/* 오른쪽: 할 일 목록 */}
      <section className="flex w-1/2 flex-col bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-gray-800">
          {format(selectedDate, "M월 d일의 일정", { locale: ko })}
        </h1>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="할 일을 입력하세요"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[#0071e3] focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20"
          />
          <button
            type="button"
            onClick={handleAddTodo}
            className="flex items-center gap-2 rounded-xl bg-[#0071e3] px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0077ed]"
          >
            <Plus className="h-4 w-4" />
            추가
          </button>
        </div>

        <ul className="flex flex-col gap-2 overflow-auto">
          {todos.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              이 날의 일정이 없습니다.
            </p>
          )}
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 shadow-sm"
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => handleToggleTodo(todo.id)}
                className="h-4 w-4 rounded border-gray-300 text-[#0071e3] focus:ring-[#0071e3]"
              />
              <span
                className={`flex-1 text-sm ${todo.done ? "text-gray-400 line-through" : "text-gray-800"}`}
              >
                {todo.text}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteTodo(todo.id)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="삭제"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
