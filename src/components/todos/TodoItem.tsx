'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Todo } from '@/types/todo';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface TodoItemProps {
    todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleToggle = async () => {
        setIsUpdating(true);
        try {
            const todoRef = doc(db, 'todos', todo.id);
            await updateDoc(todoRef, {
                completed: !todo.completed,
                updatedAt: new Date()
            });
            toast({
                title: 'Updated!',
                description: `Todo marked as ${!todo.completed ? 'completed' : 'incomplete'}`,
            })
        } catch (error) {
            console.error('Error updating todo: ', error);
            toast({
                title: 'Error',
                description: 'Failed to update todo',
                variant: 'destructive',
            })
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'todos', todo.id));
            toast({
                title: 'Deleted!',
                description: 'Todo removed successfully',
            });
        } catch (error) {
            console.error('Error deleting todo: ', error);
            toast({
                title: 'Error',
                description: 'Failed to delete todo',
                variant: 'destructive',
            });
        setIsDeleting(false); // Only reset if error , successful delete unmounts component
        } 
    };

    return (
        <div className="group flex items-center gap-3 p-4 border rounded-lg 
            hover:shadow-md transition-all duration-300 ease-in-out
            transform hover:scale-[1.02]
            animate-slide-in">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggle}
              disabled={isUpdating}
              className="h-5 w-5 rounded border-gray-300 
                transition-all duration-300 ease-in-out
                checked:bg-blue-500 checked:border-blue-500 
                hover:scale-110"
            />
            {isUpdating && (
                <Loader2 className='absolute top-0 left-0 h-5 w-5 animate-spin text-blue-500'/>
            )}

            <span className={`flex-1 text-lg transition-all duration-300 ease-in-out
              ${todo.completed ? 'line-through text-gray-500 scale-95' : ''}`}>
              {todo.title}
            </span>
            
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button
                      disabled={isDeleting}
                      className="opacity-0 group-hover:opacity-100 
                        transition-all duration-300 ease-in-out
                        px-3 py-1 text-red-500 hover:bg-red-50 rounded flex items-center gap-2
                        transform hover:scale-105 disabled:opacity-50"
                    >
                        {isDeleting && <Loader2 className='h-4 w-4 animate-spin'/>}
                      Delete
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your todo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className='bg-red-500 hover:bg-red-600'
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}