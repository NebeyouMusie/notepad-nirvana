
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { NoteProps } from "@/components/notes/NoteCard";
import { motion } from "framer-motion";

// Sample data for the initial UI
const sampleNotes: NoteProps[] = [
  {
    id: "1",
    title: "Meeting Notes - Q4 Planning",
    content: "Discussed quarterly goals and initiatives. Key points: 1. Increase user engagement by 15% 2. Launch new feature by November 3. Reduce customer churn",
    createdAt: "2023-10-15T12:00:00Z",
    tags: ["work", "planning"],
    color: "#C8E6C9",
  },
  {
    id: "2",
    title: "Grocery List",
    content: "- Milk\n- Eggs\n- Bread\n- Apples\n- Chicken\n- Rice\n- Tomatoes",
    createdAt: "2023-10-16T14:30:00Z",
    tags: ["personal", "shopping"],
    color: "#FFF9C4",
  },
  {
    id: "3",
    title: "Book Recommendations",
    content: "1. Atomic Habits by James Clear\n2. Deep Work by Cal Newport\n3. The Psychology of Money by Morgan Housel",
    createdAt: "2023-10-14T09:15:00Z",
    isFavorite: true,
    tags: ["books", "personal"],
    color: "#BBDEFB",
  },
  {
    id: "4",
    title: "Project Ideas",
    content: "1. Mobile app for plant care reminders\n2. Recipe organization tool with shopping list integration\n3. Habit tracker with visual progress",
    createdAt: "2023-10-13T16:20:00Z",
    tags: ["ideas", "projects"],
    color: "#E1BEE7",
  },
  {
    id: "5",
    title: "Workout Routine",
    content: "Monday: Upper body\nTuesday: Lower body\nWednesday: Rest\nThursday: Full body\nFriday: HIIT\nSaturday: Yoga\nSunday: Rest",
    createdAt: "2023-10-12T08:00:00Z",
    tags: ["fitness", "health"],
    color: "#FFCCBC",
  },
  {
    id: "6",
    title: "Travel Plans - Japan 2024",
    content: "Places to visit:\n- Tokyo\n- Kyoto\n- Osaka\n- Hokkaido\n\nBest time to go: Spring (cherry blossoms) or Fall (autumn colors)",
    createdAt: "2023-10-11T11:45:00Z",
    isFavorite: true,
    tags: ["travel", "planning"],
    color: "#B3E5FC",
  },
];

export default function Index() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-semibold">All Notes</h1>
          <p className="text-muted-foreground">
            You have {sampleNotes.length} notes
          </p>
        </motion.div>
        
        <NoteGrid notes={sampleNotes} />
      </div>
    </AppLayout>
  );
}
