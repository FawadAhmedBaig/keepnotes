import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  // Define a route for images
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await auth();

      // FIXED: Check for both session AND user to satisfy TypeScript
      if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized: No user session found");
      }

      // Now TypeScript knows session.user.id definitely exists
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      return { uploadedBy: metadata.userId, url: file.url, key: file.key };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;