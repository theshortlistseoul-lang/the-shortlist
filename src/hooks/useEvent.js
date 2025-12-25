'use client';

import { useState, useEffect } from 'react';
import { subscribeToEvent } from '@/lib/firestore';

export function useEvent(eventDate) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventDate) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToEvent(eventDate, (eventData) => {
      setEvent(eventData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventDate]);

  return { event, loading };
}
