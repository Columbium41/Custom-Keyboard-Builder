interface ButtonProps {
    text: string;
    className?: string;
    onClick?: () => void;
}

export default function Button({ text, className, onClick }: ButtonProps) {
    return (
        <button className={`border px-4 py-2 rounded-md font-semibold border-none ${className}`} onClick={onClick}>
            { text }
        </button>
    )
}
