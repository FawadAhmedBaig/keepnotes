"use client";

import { useEffect, useRef } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import type { Channel } from "pusher-js";

interface UsePusherOptions {
  onNoteEvent?: (event: string, data: unknown) => void;
  onLabelEvent?: (event: string, data: unknown) => void;
}

export function usePusher(userId: string | undefined, options: UsePusherOptions = {}) {
  const channelRef = useRef<Channel | null>(null);
  const { onNoteEvent, onLabelEvent } = options;

  useEffect(() => {
    if (!userId) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`private-user-${userId}`);
    channelRef.current = channel;

    // Note events
    const noteEvents = ["note:created", "note:updated", "note:deleted"];
    noteEvents.forEach((event) => {
      channel.bind(event, (data: unknown) => {
        onNoteEvent?.(event, data);
      });
    });

    // Label events
    const labelEvents = ["label:created", "label:updated", "label:deleted"];
    labelEvents.forEach((event) => {
      channel.bind(event, (data: unknown) => {
        onLabelEvent?.(event, data);
      });
    });

    return () => {
      noteEvents.forEach((event) => channel.unbind(event));
      labelEvents.forEach((event) => channel.unbind(event));
      pusher.unsubscribe(`private-user-${userId}`);
      channelRef.current = null;
    };
  }, [userId, onNoteEvent, onLabelEvent]);

  return channelRef.current;
}
