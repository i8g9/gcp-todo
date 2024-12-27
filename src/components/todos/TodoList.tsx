'use client';

import { useEffect, useState } from "react";
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot} from 'firebase/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import { Todo } from "@/types/todo";
import TodoItem from "./TodoItem";

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setTodos([]);
            setLoading(false);
            return;
        } 

        // Create query for current user's todos
        const q = query(
            collection(db, 'todos'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        // Set up real time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const todoList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Todo[];

            setTodos(todoList);
            setLoading(false);
        });

        // Cleanup subscription
        return() => unsubscribe();
    }, [user]); 

    if (loading) return <div>Loading todos . . .</div>;
    if (!user) return <div>Please sign in to see todos</div>;
    if (todos.length === 0) return <div>No todos yet</div>;

    return (
        <ul className="space-y-2">
            {todos.map((todo) => (
                <div key={todo.id} className="animate-fade-in">
                    <TodoItem key={todo.id} todo={todo} />
                </div>
            ))}
        </ul>
    );
}