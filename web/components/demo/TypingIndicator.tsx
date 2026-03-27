'use client';

export default function TypingIndicator({ align = 'left' }: { align?: 'left' | 'right' }) {
  const isRight = align === 'right';
  return (
    <div className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`inline-flex items-center gap-1 rounded-2xl px-4 py-3 ${
          isRight
            ? 'bg-[#43614a] text-white'
            : 'border border-gray-200 bg-white text-gray-400'
        }`}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-current"
            style={{
              animation: 'typing-dot 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes typing-dot {
            0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
            30% { opacity: 1; transform: translateY(-3px); }
          }
        `}</style>
      </div>
    </div>
  );
}
