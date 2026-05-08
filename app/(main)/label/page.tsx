import { Lightbulb, Archive, Trash2, Tag } from "lucide-react"; // Add 'Tag' here
export default function LabelIndex() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
      <Tag className="w-12 h-12 text-muted-foreground mb-4" />
      <h1 className="text-xl font-bold">Your Labels</h1>
      <p className="text-sm text-muted-foreground">Select a label from the sidebar to view specific notes.</p>
    </div>
  );
}