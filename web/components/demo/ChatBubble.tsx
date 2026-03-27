'use client';

import { useEffect, useState } from 'react';

interface ChatBubbleProps {
  text: string;
  align: 'left' | 'right';
  label?: string;
  animate?: boolean;
}

export default function ChatBubble({ text, align, label, animate = true }: ChatBubbleProps) {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    }
  }, [animate]);

  const isRight = align === 'right';

  return (
    <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
      {label && (
        <span className="mb-1 px-1 text-xs font-medium text-gray-400">{label}</span>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all duration-400 ${
          isRight
            ? 'bg-[#43614a] text-white'
            : 'border border-gray-200 bg-white text-gray-700'
        } ${visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
      >
        {text}
      </div>
    </div>
  );
}
