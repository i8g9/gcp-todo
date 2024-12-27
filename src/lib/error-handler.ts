export const handleError = (error: unknown) => {
    // Always log to console for debugging
    console.error(error);

    // Only show error overlay in development
    if (process.env.NEXT_PUBLIC_SHOW_ERRORS !== 'true') {
        // Prevent error from reaching Next.js error boundary
        return new Error('An error occurred');
    }

    // In development, let the error propagate to show the overlay
    return error;
};