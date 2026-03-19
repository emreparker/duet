"use client";

import { useEffect, useState, useCallback } from "react";
import { AuthorDot } from "@/components/ui/AuthorBadge";
import * as api from "@/lib/api";

export default function TodosPage() {
  const [todos, setTodos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [filter, setFilter] = useState<string>("all");

  const loadTodos = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filter !== "all") params.status = filter;
      const result = await api.todos.list(params);
      setTodos(result.todos);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to load todos:", err);
    }
  }, [filter]);

  useEffect(() => { loadTodos(); }, [loadTodos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.todos.create({ title: newTitle, priority: newPriority });
      setNewTitle("");
      loadTodos();
    } catch (err) {
      console.error("Failed to create todo:", err);
    }
  };

  const handleToggle = async (todo: any) => {
    const newStatus = todo.status === "done" ? "pending" : "done";
    await api.todos.update(todo.id, { status: newStatus });
    loadTodos();
  };

  const priorityColor: Record<string, string> = {
    low: "text-ink-faint",
    medium: "text-amber",
    high: "text-orange-500",
    urgent: "text-red-500",
  };

  return (
    <div className="h-screen overflow-y-auto bg-cream">
      <div className="max-w-[640px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Todos</h1>

        {/* Create form */}
        <form onSubmit={handleCreate} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-3 py-2.5 text-sm bg-cream-mid border border-border rounded-lg outline-none focus:border-amber focus:ring-2 focus:ring-amber-bg placeholder:text-ink-faint"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-cream-mid border border-border rounded-lg text-ink-muted"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-ink text-cream text-sm font-medium rounded-lg hover:bg-ink-light transition-colors"
          >
            Add
          </button>
        </form>

        {/* Filters */}
        <div className="flex gap-1 mb-4">
          {["all", "pending", "done"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                filter === status
                  ? "bg-cream-deep text-ink"
                  : "text-ink-faint hover:text-ink-muted"
              }`}
            >
              {status === "all" ? "All" : status === "pending" ? "To do" : "Done"}
            </button>
          ))}
          <span className="ml-auto text-xs text-ink-faint self-center">{total} total</span>
        </div>

        {/* Todo list */}
        <div className="space-y-1">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-3 px-4 py-3 bg-cream-mid/50 border border-border-light rounded-lg hover:bg-cream-mid transition-all group"
            >
              <button
                onClick={() => handleToggle(todo)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  todo.status === "done"
                    ? "bg-human border-human text-white"
                    : "border-cream-dark hover:border-ink-faint"
                }`}
              >
                {todo.status === "done" && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${todo.status === "done" ? "line-through text-ink-faint" : "text-ink"}`}>
                  {todo.title}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-ink-faint">
                  <AuthorDot type={todo.authorType as "human" | "agent"} />
                  <span>{todo.authorType}:{todo.authorName}</span>
                  <span className={`font-medium ${priorityColor[todo.priority] ?? ""}`}>{todo.priority}</span>
                  {todo.dueDate && (
                    <span>due {new Date(todo.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => api.todos.delete(todo.id).then(loadTodos)}
                className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-500 transition-all p-1"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          {todos.length === 0 && (
            <div className="text-center py-12 text-ink-faint text-sm">
              {filter === "all" ? "No todos yet" : `No ${filter.replace("_", " ")} todos`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
