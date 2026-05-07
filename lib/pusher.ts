import Pusher from "pusher";

let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher | null {
  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.PUSHER_KEY ||
    !process.env.PUSHER_SECRET ||
    !process.env.PUSHER_CLUSTER
  ) {
    console.warn("Pusher environment variables are missing.");
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

/**
 * Main trigger function
 */
export async function triggerPusher(
  channel: string,
  event: PusherEventType,
  data: any
) {
  const pusher = getPusher();
  if (!pusher) return;

  try {
    await pusher.trigger(channel, event, data);
  } catch (error) {
    console.error("Pusher trigger error:", error);
  }
}

/**
 * ALIAS EXPORT: This fixes the "Export not found" error in your hooks
 * It maps the old name to the new function.
 */
export const triggerPusherEvent = async (
  userId: string,
  event: PusherEventType,
  data: any
) => {
  // Most of your app uses 'user-{id}' or 'private-user-{id}'
  // We'll use the common pattern here:
  return triggerPusher(`user-${userId}`, event, data);
};