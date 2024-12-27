'use client';

import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { handleError } from '@/lib/error-handler';

const MAX_TODO_LENGTH = 100;
const MIN_TODO_LENGTH = 3;
const RATE_LIMIT_MS = 1000; // 1 second between submissions

export default function TodoInput() {
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [user] = useAuthState(auth);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSubmission, setLastSubmission] = useState(0);

    const validateTodo = async (title: string) => {
        // Check Length
        if (title.length < MIN_TODO_LENGTH) {
            throw new Error(`Todo must be at least ${MIN_TODO_LENGTH} characters`);
        }
        if (title.length > MAX_TODO_LENGTH) {
            throw new Error(`Todo must be less than ${MAX_TODO_LENGTH} characters`);
        }

        // Rate Limiting
        const now = Date.now();
        if (now - lastSubmission < RATE_LIMIT_MS) {
            throw new Error(`Please wait a moment before adding another todo`);
        }

        // Check for Duplicates
        if (user) {
            const q = query(
                collection(db, 'todos'),
                where('userId', '==', user.uid),
                where('title', '==', title.trim()),
                where('completed', '==', false) // only check unfinished todos
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                throw new Error('You already have an active todo with this title!')
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !title.trim()) return;

        setIsLoading(true);
        try {
            await validateTodo(title);

            await addDoc(collection(db, 'todos'), {
                userId: user.uid,
                title: title.trim(),
                completed: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            setTitle(''); // Clear input after success
            setLastSubmission(Date.now()); // Set the last submission to current timestamp for rate limiting feature
            toast({
                title: 'Success!',
                description: 'Todo added successfully',
            })
        } catch (error) {
            handleError(error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : "Failed to add todo",
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input 
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='Add a new todo. . .'
                    maxLength={MAX_TODO_LENGTH}
                    className='flex-1 px-4 py-2 border rounded'
                    disabled={!user || isLoading}
                />
                <button
                    type='submit'
                    disabled={!user || isLoading || !title.trim() || title.length < MIN_TODO_LENGTH}
                    className='px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300'
                >
                    {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
                    {isLoading ? 'Adding . . .' : 'Add Todo'}
                </button>
            </form>
            <div className='text-sm'>
                {title.length > 0 && (
                    <span className={`
                        ${title.length >= MAX_TODO_LENGTH ? 'text-red-500' : 
                        title.length >= MAX_TODO_LENGTH * 0.8 ? 'text-orange-500' :
                        'text-gray-500'}`}>
                        {title.length}/{MAX_TODO_LENGTH} characters
                    </span>
                )}
            </div>
        </div>
    );
}