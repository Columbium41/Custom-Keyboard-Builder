'use client';

export default function FormError({ message }: { message?: string; }) {
    return (
        <div className="bg-red-500 mb-4 rounded-md w-full px-4 py-1 font-semibold" style={{ whiteSpace: 'pre-line' }}>
            {message}
        </div>
    )
}
