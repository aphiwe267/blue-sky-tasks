import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Moon, Plus, Sun, Trash2, ListTodo, Briefcase, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drift — Calm task management" },
      { name: "description", content: "A calm, minimal task manager for focused work." },
    ],
  }),
  component: Index,
});

type Category = "personal" | "work" | "ideas";

interface Task {
  id: string;
  title: string;
  category: Category;
  done: boolean;
  createdAt: number;
}

const CATEGORIES: { id: Category | "all"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "All", icon: ListTodo },
  { id: "personal", label: "Personal", icon: User },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "ideas", label: "Ideas", icon: Sparkles },
];

const STORAGE_KEY = "drift.tasks.v1";
const THEME_KEY = "drift.theme";

function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("personal");
  const [filter, setFilter] = useState<Category | "all">("all");
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try { setTasks(JSON.parse(raw)); } catch { /* noop */ }
    }
    const t = typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(t ? t === "dark" : prefersDark);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark, mounted]);

  const filtered = useMemo(
    () => tasks.filter((t) => filter === "all" || t.category === filter),
    [tasks, filter]
  );
  const remaining = filtered.filter((t) => !t.done).length;

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    setTasks((prev) => [
      { id: crypto.randomUUID(), title: value, category, done: false, createdAt: Date.now() },
      ...prev,
    ]);
    setTitle("");
  };

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] opacity-60"
           style={{ background: "radial-gradient(60% 60% at 50% 0%, var(--primary-glow), transparent 70%)" }} />
      <div className="relative mx-auto max-w-2xl px-6 pt-16 pb-24">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]"
                 style={{ background: "var(--gradient-primary)" }}>
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold leading-none">Drift</h1>
              <p className="mt-1 text-xs text-muted-foreground">Calm task management</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
            className="rounded-full"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        <section className="mt-12">
          <p className="text-sm text-muted-foreground">
            {remaining === 0 ? "All clear. Enjoy the quiet." : `${remaining} task${remaining > 1 ? "s" : ""} to focus on`}
          </p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">What needs your attention?</h2>
        </section>

        <form onSubmit={addTask} className="mt-8 flex gap-2 rounded-2xl border bg-card p-2 shadow-[var(--shadow-soft)]">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task…"
            className="h-11 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="h-11 rounded-lg bg-secondary px-3 text-sm text-secondary-foreground outline-none"
          >
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="ideas">Ideas</option>
          </select>
          <Button type="submit" size="icon" className="h-11 w-11 rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Plus className="h-5 w-5" />
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-all",
                  active
                    ? "border-transparent bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        <ul className="mt-6 space-y-2">
          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed bg-card/50 p-10 text-center text-sm text-muted-foreground">
              Nothing here yet. Add your first task above.
            </li>
          )}
          {filtered.map((t) => (
            <li
              key={t.id}
              className="group flex items-center gap-3 rounded-xl border bg-card p-3 pl-4 shadow-[var(--shadow-soft)] transition-all hover:border-primary/30"
            >
              <button
                onClick={() => toggle(t.id)}
                aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all",
                  t.done
                    ? "border-transparent text-primary-foreground"
                    : "border-border hover:border-primary"
                )}
                style={t.done ? { background: "var(--gradient-primary)" } : undefined}
              >
                {t.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm", t.done && "text-muted-foreground line-through")}>
                  {t.title}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {t.category}
              </span>
              <button
                onClick={() => remove(t.id)}
                aria-label="Delete task"
                className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
