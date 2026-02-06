"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; // 방금 만든 연결 장치 가져오기
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Moon, 
  Sun, 
  CheckCircle2, 
  Circle 
} from "lucide-react";

// Supabase 데이터 타입 정의
interface Todo {
  id: number;
  content: string;
  completed: boolean;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Work: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Personal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Health: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Etc: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export default function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  // 입력 폼 상태
  const [inputContent, setInputContent] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("Work");

  // 1. 초기 로드: Supabase에서 데이터 가져오기
  useEffect(() => {
    fetchTodos();
    
    // 다크모드 확인
    if (typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
  }, []);

  // Supabase에서 할 일 목록 불러오기 함수
  const fetchTodos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true }); // 만든 순서대로 정렬

    if (error) {
      console.error('데이터 불러오기 실패:', error);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // 달력 계산
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // 2. 추가하기 (Insert)
  const addTodo = async () => {
    if (!inputContent.trim()) return;

    const newTodo = {
      content: inputContent,
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime,
      endTime,
      category,
      completed: false,
    };

    // Supabase에 저장
    const { data, error } = await supabase
      .from('todos')
      .insert([newTodo])
      .select();

    if (error) {
      console.error('저장 실패:', error);
      alert("저장에 실패했습니다 ㅠㅠ");
    } else if (data) {
      setTodos([...todos, data[0]]); // 화면에도 바로 반영
      setInputContent("");
      setStartTime("");
      setEndTime("");
    }
  };

  // 3. 삭제하기 (Delete)
  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('삭제 실패:', error);
    } else {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  // 4. 완료 체크 토글 (Update)
  const toggleTodo = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('수정 실패:', error);
    } else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    }
  };

  const selectedDateTodos = todos.filter(
    (todo) => todo.date === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto p-6 h-screen flex flex-col">
        
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Cloud Calendar ☁️</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
          
          {/* 달력 영역 */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {format(currentDate, "yyyy년 M월")}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronLeft /></button>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronRight /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-medium text-gray-500">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
              {calendarDays.map((day) => (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative rounded-xl flex flex-col items-center justify-start pt-2 text-sm transition
                    ${!isSameMonth(day, monthStart) ? "text-gray-300 dark:text-gray-600" : ""}
                    ${isSameDay(day, selectedDate) ? "bg-blue-500 text-white shadow-md" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
                    ${isSameDay(day, new Date()) && !isSameDay(day, selectedDate) ? "border-2 border-blue-500" : ""}
                  `}
                >
                  <span>{format(day, "d")}</span>
                  {todos.some(t => t.date === format(day, "yyyy-MM-dd")) && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSameDay(day, selectedDate) ? "bg-white" : "bg-blue-500"}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 투두 리스트 영역 */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              {format(selectedDate, "M월 d일")}의 일정
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({selectedDateTodos.length}개)
              </span>
            </h2>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-6 space-y-3">
              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="새로운 할 일을 입력하세요"
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              />
              <div className="flex gap-2">
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 text-sm"
                />
                <span className="self-center text-gray-400">~</span>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 text-sm"
                />
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 text-sm flex-1"
                >
                  <option value="Work">업무</option>
                  <option value="Personal">개인</option>
                  <option value="Health">운동</option>
                  <option value="Etc">기타</option>
                </select>
              </div>
              <button
                onClick={addTodo}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus size={18} /> {loading ? "로딩 중..." : "추가하기"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {loading ? (
                 <div className="text-center text-gray-500 py-10">데이터 불러오는 중... ⏳</div>
              ) : selectedDateTodos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p>등록된 일정이 없습니다.</p>
                </div>
              ) : (
                selectedDateTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`
                      group flex items-start gap-3 p-4 rounded-xl transition border border-transparent
                      ${todo.completed ? "bg-gray-50 dark:bg-gray-700/30 opacity-60" : "bg-gray-50 dark:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-800"}
                    `}
                  >
                    <button
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      className={`mt-1 flex-shrink-0 ${todo.completed ? "text-blue-500" : "text-gray-300 dark:text-gray-500 hover:text-blue-500"}`}
                    >
                      {todo.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 items-center mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[todo.category] || CATEGORY_COLORS.Etc}`}>
                          {todo.category === 'Work' && '업무'}
                          {todo.category === 'Personal' && '개인'}
                          {todo.category === 'Health' && '운동'}
                          {todo.category === 'Etc' && '기타'}
                          {!['Work', 'Personal', 'Health', 'Etc'].includes(todo.category) && todo.category}
                        </span>
                        {(todo.startTime || todo.endTime) && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {todo.startTime} {todo.endTime ? `- ${todo.endTime}` : ''}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm break-all ${todo.completed ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>
                        {todo.content}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}