import AuthButton from "@/components/auth/AuthButton";
import TodoInput from "@/components/todos/TodoInput";
import TodoList from "@/components/todos/TodoList";

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <AuthButton />
      <div className="mt-8">
        <TodoInput />
        <TodoList />
      </div>
    </main>
  );
}