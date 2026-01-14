'use client';

import { useState, useEffect } from 'react';

export default function ImageCountBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/images');
        if (response.ok) {
          const images = await response.json();
          setCount(images.length);
        }
      } catch (error) {
        console.error('Error fetching image count:', error);
      }
    };

    fetchCount();
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {count}
    </span>
  );
}