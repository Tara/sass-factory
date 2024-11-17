'use client';

interface ErrorMessageProps {
  message: string;
  hint?: string;
  details?: string;
}

export function ErrorMessage({ message, hint, details }: ErrorMessageProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>Error: {message}</p>
      {hint && <p>Hint: {hint}</p>}
      {process.env.NODE_ENV === 'development' && details && 
        <p className="mt-2 text-sm">Details: {details}</p>
      }
    </div>
  );
}