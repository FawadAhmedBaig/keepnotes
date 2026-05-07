import Pusher from "pusher";

let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher | null {
  // Return null if env vars are not set (allows app to work without Pusher)
  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.PUSHER_KEY ||
    !process.env.PUSHER_SECRET ||
    !process.env.PUSHER_CLUSTER
  ) {
    return null;
  }

  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });
  }

  return pusherInstance;
}

export type PusherEventType =
  | "note:created"
  | "note:updated"
  | "note:deleted"
  | "label:created"
  | "label:updated"
  | "label:deleted";

export async function triggerPusherEvent(
  userId: string,
  event: PusherEventType,
  data: Record<string, unknown>
) {
  const pusher = getPusher();
  if (!pusher) return;

  try {
    await pusher.trigger(`private-user-${userId}`, event, data);
  } catch (error) {
    console.error("Pusher trigger error:", error);
  }
}
