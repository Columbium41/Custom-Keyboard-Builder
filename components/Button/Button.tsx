export default function Button({ 
    text, 
    className 
}: Readonly<{ 
    text: string; 
    className?: string; 
}>) {
    return (
        <button className={`border px-4 py-2 rounded-md font-semibold border-none ${className}`}>
            { text }
        </button>
    )
}
