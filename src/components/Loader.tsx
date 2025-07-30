// A simple SVG loader component for better UX
export const Loader = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-spin text-primary" // Uses shadcn's primary color variable
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);