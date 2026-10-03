import React, { useState, useEffect, useRef } from 'react';
import {
  Subject,
  AcademicLevel,
  TutorTone,
  SolutionFormat,
  ChatMessage,
  QuestionRecord,
  StudyTask,
  ActiveTab,
  PomodoroMode,
} from './types';
import { SUBJECTS } from './data/subjects';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { QuestionSolver } from './components/QuestionSolver';
import { QuizView } from './components/QuizView';
import { FlashcardsView } from './components/FlashcardsView';
import { PomodoroRoom } from './components/PomodoroRoom';

export default function App() {
  // Active Subject & Academic level state
  const [currentSubject, setCurrentSubject] = useState<Subject>(() => {
    const saved = localStorage.getItem('scholarpulse_subject');
    if (saved) {
      const match = SUBJECTS.find((s) => s.id === saved);
      if (match) return match;
    }
    return SUBJECTS[0];
  });

  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(() => {
    return (
      (localStorage.getItem('scholarpulse_level') as AcademicLevel) ||
      'College / Undergraduate'
    );
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('scholarpulse_chat');
    return saved ? JSON.parse(saved) : [];
  });
  const [isStreamingChat, setIsStreamingChat] = useState(false);

  // Solved Questions history
  const [solvedHistory, setSolvedHistory] = useState<QuestionRecord[]>(() => {
    const saved = localStorage.getItem('scholarpulse_solved');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSolving, setIsSolving] = useState(false);
  const [initialSolverQuestion, setInitialSolverQuestion] = useState('');

  // Study tasks
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem('scholarpulse_tasks');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 't1',
        title: 'Review Calculus integration by parts & improper integrals',
        subjectId: 'math',
        dueDate: 'Today',
        completed: false,
        priority: 'high',
      },
      {
        id: 't2',
        title: 'Solve RC circuit differential equation problem',
        subjectId: 'physics',
        dueDate: 'Tomorrow',
        completed: true,
        priority: 'medium',
      },
      {
        id: 't3',
        title: 'Complete 5-question algorithms quiz',
        subjectId: 'cs',
        dueDate: 'Friday',
        completed: false,
        priority: 'low',
      },
    ];
  });

  // Saved Notes & Flashcards
  const [savedNotes, setSavedNotes] = useState<
    { id: string; title: string; content: string; timestamp: number }[]
  >(() => {
    const saved = localStorage.getItem('scholarpulse_notes');
    return saved ? JSON.parse(saved) : [];
  });

  // Study statistics
  const [studyMinutes, setStudyMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('scholarpulse_minutes');
    return saved ? Number(saved) : 45;
  });
  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem('scholarpulse_streak');
    return saved ? Number(saved) : 5;
  });

  // Pomodoro state
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('focus');
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // Persist important data
  useEffect(() => {
    localStorage.setItem('scholarpulse_subject', currentSubject.id);
  }, [currentSubject]);

  useEffect(() => {
    localStorage.setItem('scholarpulse_level', academicLevel);
  }, [academicLevel]);

  useEffect(() => {
    localStorage.setItem('scholarpulse_chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('scholarpulse_solved', JSON.stringify(solvedHistory));
  }, [solvedHistory]);

  useEffect(() => {
    localStorage.setItem('scholarpulse_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('scholarpulse_notes', JSON.stringify(savedNotes));
  }, [savedNotes]);

  useEffect(() => {
    localStorage.setItem('scholarpulse_minutes', String(studyMinutes));
  }, [studyMinutes]);

  // Pomodoro timer tick
  useEffect(() => {
    if (isPomodoroRunning) {
      timerIntervalRef.current = setInterval(() => {
        setPomodoroSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsPomodoroRunning(false);
            if (pomodoroMode === 'focus') {
              setStudyMinutes((m) => m + 25);
            }
            return 0;
          }
          // Increment study minute every 60 seconds of focus
          if (pomodoroMode === 'focus' && prev % 60 === 0) {
            setStudyMinutes((m) => m + 1);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPomodoroRunning, pomodoroMode]);

  const handleTogglePomodoro = () => {
    setIsPomodoroRunning((prev) => !prev);
  };

  const handleResetPomodoro = () => {
    setIsPomodoroRunning(false);
    if (pomodoroMode === 'focus') setPomodoroSeconds(25 * 60);
    else if (pomodoroMode === 'shortBreak') setPomodoroSeconds(5 * 60);
    else setPomodoroSeconds(15 * 60);
  };

  const handleChangePomodoroMode = (newMode: PomodoroMode) => {
    setIsPomodoroRunning(false);
    setPomodoroMode(newMode);
    if (newMode === 'focus') setPomodoroSeconds(25 * 60);
    else if (newMode === 'shortBreak') setPomodoroSeconds(5 * 60);
    else setPomodoroSeconds(15 * 60);
  };

  // Chat message sending with Server-Sent Events (SSE) streaming
  const handleSendMessage = async (text: string, tone: TutorTone) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      subjectId: currentSubject.id,
    };

    const assistantMsgId = `msg-${Date.now()}-a`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      subjectId: currentSubject.id,
      isStreaming: true,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, initialAssistantMsg]);
    setIsStreamingChat(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          subject: currentSubject.name,
          level: academicLevel,
          tone,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedText, isStreaming: true }
                      : msg
                  )
                );
              }
            } catch (err) {
              // Non-JSON SSE line, ignore
            }
          }
        }
      }

      // Finalize message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  msg.content ||
                  `Sorry, I encountered an issue: ${err.message}. Please try again!`,
                isStreaming: false,
                error: true,
              }
            : msg
        )
      );
    } finally {
      setIsStreamingChat(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  // Question solving execution
  const handleSolveQuestion = async (
    question: string,
    format: SolutionFormat,
    context?: string
  ): Promise<string | null> => {
    setIsSolving(true);
    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          subject: currentSubject.name,
          level: academicLevel,
          format,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to solve question');
      }

      const data = await response.json();
      const solution = data.solution;

      // Save to solved history
      const newRecord: QuestionRecord = {
        id: `solve-${Date.now()}`,
        question,
        subjectId: currentSubject.id,
        level: academicLevel,
        format,
        solution,
        timestamp: Date.now(),
        isFavorite: false,
      };

      setSolvedHistory((prev) => [newRecord, ...prev]);
      return solution;
    } catch (error: any) {
      console.error('Solve error:', error);
      return `### Error Solving Question\nUnable to complete solution: ${error.message}`;
    } finally {
      setIsSolving(false);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setSolvedHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  // Task actions
  const handleAddTask = (title: string, priority: 'high' | 'medium' | 'low') => {
    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      title,
      subjectId: currentSubject.id,
      dueDate: 'Today',
      completed: false,
      priority,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Save to Notes action
  const handleSaveToNotes = (content: string, title?: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      title: title || `${currentSubject.name} Study Note`,
      content,
      timestamp: Date.now(),
    };
    setSavedNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setSavedNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleStartQuestionFromDashboard = (q: string) => {
    setInitialSolverQuestion(q);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentSubject={currentSubject}
        onSelectSubject={setCurrentSubject}
        academicLevel={academicLevel}
        onChangeLevel={setAcademicLevel}
        streakDays={streakDays}
        pomodoroSeconds={pomodoroSeconds}
        isPomodoroRunning={isPomodoroRunning}
        onTogglePomodoro={handleTogglePomodoro}
        onOpenMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Content Area: Sidebar + Active View */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentSubject={currentSubject}
          solvedCount={solvedHistory.length}
          studyMinutes={studyMinutes}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic View Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              currentSubject={currentSubject}
              onSelectSubject={setCurrentSubject}
              setActiveTab={setActiveTab}
              onStartQuestion={handleStartQuestionFromDashboard}
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              solvedQuestions={solvedHistory}
              studyMinutes={studyMinutes}
              streakDays={streakDays}
            />
          )}

          {activeTab === 'chat' && (
            <Chatbot
              currentSubject={currentSubject}
              academicLevel={academicLevel}
              messages={messages}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              onSaveToNotes={handleSaveToNotes}
              onSendToSolver={(q) => {
                setInitialSolverQuestion(q);
                setActiveTab('solver');
              }}
              isStreaming={isStreamingChat}
            />
          )}

          {activeTab === 'solver' && (
            <QuestionSolver
              currentSubject={currentSubject}
              academicLevel={academicLevel}
              initialQuestion={initialSolverQuestion}
              onSolveQuestion={handleSolveQuestion}
              onSaveToNotes={handleSaveToNotes}
              solvedHistory={solvedHistory}
              onToggleFavorite={handleToggleFavorite}
              isSolving={isSolving}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView currentSubject={currentSubject} academicLevel={academicLevel} />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView
              currentSubject={currentSubject}
              savedNotes={savedNotes}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeTab === 'pomodoro' && (
            <PomodoroRoom
              currentSubject={currentSubject}
              studyMinutes={studyMinutes}
              onSessionComplete={(mins) => setStudyMinutes((m) => m + mins)}
              pomodoroSeconds={pomodoroSeconds}
              isPomodoroRunning={isPomodoroRunning}
              onTogglePomodoro={handleTogglePomodoro}
              onResetPomodoro={handleResetPomodoro}
              mode={pomodoroMode}
              onChangeMode={handleChangePomodoroMode}
            />
          )}
        </main>
      </div>
    </div>
  );
}
