"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
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
  subMonths,
  parseISO
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Moon, 
  Sun, 
  CheckCircle2, 
  Circle,
  CalendarDays,
  ListTodo,
  RotateCcw,
  XCircle
} from "lucide-react";

// 데이터 타입 정의
interface Todo {
  id: number;
  content: string;
  completed: boolean;
  date: string;       
  end_date: string | null; 
  startTime: string;
  endTime: string;
  user_name: string;  
}

// 1. 사용자 분류 및 색상 설정
const USERS = [
  { 
    name: "진현", 
    color: "text-blue-800 dark:text-blue-200", 
    barColor: "bg-blue-500", 
    bgColor: "bg-blue-100 dark:bg-blue-900" 
  },
  { 
    name: "유진", 
    color: "text-pink-800 dark:text-pink-200", 
    barColor: "bg-pink-500", 
    bgColor: "bg-pink-100 dark:bg-pink-900" 
  },
];

export default function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // 입력 폼 상태
  const [inputContent, setInputContent] = useState("");
  const [startDate, setStartDate] = useState(""); // 초기값 비워둠 (hydration 오류 방지)
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedUser, setSelectedUser] = useState("진현");

  // 초기 로드
  useEffect(() => {
    // 클라이언트 사이드에서만 날짜 초기값 설정
    setStartDate(format(new Date(), "yyyy-MM-dd"));
    setEndDate(format(new Date(), "yyyy-MM-dd"));
    
    fetchTodos();
    if (typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true });

    if (error) console.error('불러오기 실패:', error);
    else setTodos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // 달력 계산
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    const dateStr = format(day, "yyyy-MM-dd");
    setStartDate(dateStr);
    setEndDate(dateStr);
  };

  const resetForm = () => {
    setInputContent("");
    setStartDate(""); 
    setEndDate("");
    setStartTime("");
    setEndTime("");
  };

  const addTodo = async () => {
    if (!inputContent.trim()) return;

    const finalStartDate = startDate || ""; 
    const finalEndDate = endDate || finalStartDate;

    const newTodo = {
      content: inputContent,
      date: finalStartDate,
      end_date: finalEndDate,
      startTime,
      endTime,
      user_name: selectedUser,
      completed: false,
    };

    const { data, error } = await supabase.from('todos').insert([newTodo]).select();

    if (error) {
      alert("저장 실패 ㅠㅠ");
    } else if (data) {
      setTodos([...todos, data[0]]);
      resetForm(); 
      setStartDate(format(selectedDate, "yyyy-MM-dd"));
      setEndDate(format(selectedDate, "yyyy-MM-dd"));
    }
  };

  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) setTodos(todos.filter((t) => t.id !== id));
  };

  const toggleTodo = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('todos').update({ completed: !currentStatus }).eq('id', id);
    if (!error) {
      setTodos(todos.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const selectedDateTodos = todos.filter((todo) => {
    if (!todo.date) return false;
    const target = format(selectedDate, "yyyy-MM-dd");
    if (todo.end_date) {
      return target >= todo.date && target <= todo.end_date;
    }
    return todo.date === target;
  });

  const floatingTodos = todos.filter((todo) => !todo.date || todo.date === "");

  const getUserStyle = (name: string) => USERS.find(u => u.name === name) || USERS[0];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto p-4 lg:p-6 h-screen flex flex-col">
        
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            My Cloud Calendar <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">v0.2.1</span>
          </h1>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
          
          {/* 달력 영역 */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{format(currentDate, "yyyy년 M월")}</h2>
              <div className="flex gap-2">
                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronLeft /></button>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronRight /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-0 mb-2 text-center text-sm font-medium text-gray-500">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => <div key={day}>{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-0 flex-1 auto-rows-fr bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              {calendarDays.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                const dayEvents = todos.filter(t => t.date && (t.end_date ? (dayStr >= t.date && dayStr <= t.end_date) : dayStr === t.date));

                return (
                  <button
                    key={day.toString()}
                    onClick={() => handleDateClick(day)}
                    className={`
                      relative flex flex-col items-center justify-start pt-1 text-sm transition border-r border-b border-gray-100 dark:border-gray-600
                      ${!isCurrentMonth ? "bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600" : "bg-white dark:bg-gray-800"}
                      ${isSelected ? "bg-blue-50 dark:bg-gray-700 inset-shadow" : "hover:bg-gray-50 dark:hover:bg-gray-700"}
                    `}
                  >
                    <span className={`z-10 mb-1 ${isSameDay(day, new Date()) ? "w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full font-bold" : ""}`}>
                      {format(day, "d")}
                    </span>
                    
                    {/* 연속 일정 막대 표시 */}
                    <div className="flex flex-col gap-1 w-full h-full px-0.5">
                      {dayEvents.slice(0, 3).map((todo) => {
                        const isStart = todo.date === dayStr;
                        const isEnd = todo.end_date === dayStr;
                        const userStyle = getUserStyle(todo.user_name);

                        return (
                          <div 
                            key={todo.id} 
                            className={`
                              h-1.5 w-full text-[0px]
                              ${userStyle.barColor}
                              ${isStart ? "rounded-l-md ml-0.5 w-[95%]" : ""} 
                              ${isEnd ? "rounded-r-md mr-0.5 w-[95%]" : ""}
                              ${!isStart && !isEnd ? "mx-0 w-[105%] -ml-[2.5%]" : ""} 
                            `}
                          />
                        );
                      })}
                      {dayEvents.length > 3 && <span className="text-[10px] text-gray-400 leading-none">...</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 입력 및 리스트 영역 */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg shrink-0">
              <div className="flex gap-2 mb-3">
                {USERS.map((user) => (
                  <button
                    key={user.name}
                    onClick={() => setSelectedUser(user.name)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition border-2 ${
                      selectedUser === user.name 
                        ? `${getUserStyle(user.name).bgColor} ${getUserStyle(user.name).color} border-current`
                        : "bg-gray-50 text-gray-500 border-transparent"
                    }`}
                  >
                    {user.name}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="할 일을 입력하세요"
                  className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                  onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                />
                
                <div className="flex items-center gap-2">
                  <div className={`flex-1 flex items-center border rounded-lg px-2 dark:border-gray-600 dark:bg-gray-700 ${!startDate ? "opacity-50" : ""}`}>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => {
                         setStartDate(e.target.value);
                         if(!endDate) setEndDate(e.target.value);
                      }} 
                      className="w-full p-2 bg-transparent text-sm focus:outline-none" 
                    />
                    {startDate && <button onClick={() => { setStartDate(""); setEndDate(""); }}><XCircle size={16} className="text-gray-400 hover:text-red-500"/></button>}
                  </div>
                  <span className="text-gray-400">~</span>
                  <div className={`flex-1 flex items-center border rounded-lg px-2 dark:border-gray-600 dark:bg-gray-700 ${!endDate ? "opacity-50" : ""}`}>
                     <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="w-full p-2 bg-transparent text-sm focus:outline-none" 
                    />
                  </div>
                </div>

                {startDate && (
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      step="300"
                      value={startTime} 
                      onChange={(e) => setStartTime(e.target.value)} 
                      className="flex-1 p-2 rounded border text-sm dark:bg-gray-700 dark:border-gray-600" 
                    />
                    <span className="text-gray-400">~</span>
                    <input 
                      type="time" 
                      step="300"
                      value={endTime} 
                      onChange={(e) => setEndTime(e.target.value)} 
                      className="flex-1 p-2 rounded border text-sm dark:bg-gray-700 dark:border-gray-600" 
                    />
                  </div>
                )}

                <div className="flex gap-2 mt-1">
                  <button onClick={resetForm} className="p-2.5 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300">
                    <RotateCcw size={20} />
                  </button>
                  <button onClick={addTodo} disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                    {loading ? "..." : (startDate ? "일정 추가" : "To-Do 추가")}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CalendarDays size={18} />
                  {format(selectedDate, "M월 d일")} 일정
                </h3>
                {selectedDateTodos.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">일정이 없습니다.</p>
                ) : (
                  selectedDateTodos.map((todo) => {
                    const style = getUserStyle(todo.user_name);
                    return (
                      <div key={todo.id} className={`flex items-center gap-2 p-2.5 mb-2 rounded-lg border ${style.bgColor} ${style.color} border-transparent ${todo.completed ? "opacity-50" : ""}`}>
                        <button onClick={() => toggleTodo(todo.id, todo.completed)}>
                          {todo.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs opacity-70 mb-0.5 flex gap-1 items-center">
                            <span className="font-bold">{todo.user_name}</span>
                            {todo.startTime && <span>| {todo.startTime}~{todo.endTime}</span>}
                            {todo.date !== todo.end_date && todo.end_date && (
                               <span className="text-[10px] border border-current px-1.5 rounded-full">
                                 ~ {format(parseISO(todo.end_date), "M/d")}까지
                               </span>
                            )}
                          </div>
                          <span className={`text-sm ${todo.completed ? "line-through" : ""}`}>{todo.content}</span>
                        </div>
                        <button onClick={() => deleteTodo(todo.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t pt-4 dark:border-gray-700 h-1/3 flex flex-col">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <ListTodo size={18} />
                  할 일 (To-Do)
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {floatingTodos.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2 text-center">등록된 할 일이 없습니다.</p>
                  ) : (
                    floatingTodos.map((todo) => {
                      const style = getUserStyle(todo.user_name);
                      return (
                        <div key={todo.id} className={`flex items-center gap-2 p-2 mb-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 ${todo.completed ? "opacity-50" : ""}`}>
                          <button onClick={() => toggleTodo(todo.id, todo.completed)} className="text-gray-400 hover:text-blue-500">
                            {todo.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                          </button>
                          <div className="flex-1 flex gap-2 items-center">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${style.bgColor} ${style.color}`}>
                              {todo.user_name}
                            </span>
                            <span className={`text-sm ${todo.completed ? "line-through text-gray-400" : ""}`}>{todo.content}</span>
                          </div>
                          <button onClick={() => deleteTodo(todo.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}