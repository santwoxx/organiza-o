export type Priority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'link' | 'file';
  fileSize?: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface Card {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description: string;
  priority: Priority;
  createdAt?: string; // ISO format for pending time calculation
  dueDate?: string; // ISO format
  subtasks: Subtask[];
  attachments?: Attachment[]; // Attached links or files
  comments?: Comment[]; // Comments from external link
  companyName: string; // The company it belongs to
  customBg?: string; // Tailwind color class or hex (e.g. 'bg-red-50' or #ffebe6)
  customBorder?: string; // Custom border style (e.g. 'border-2 border-indigo-400')
  order: number;
  completed: boolean;
  x?: number; // X position on Canva Flowchart mode
  y?: number; // Y position on Canva Flowchart mode
  connectedTo?: string; // ID of the target card in flowchart
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
  width: number; // Width in pixels (resizable)
  borderRadius: 'rounded-none' | 'rounded-md' | 'rounded-xl' | 'rounded-3xl'; // Canva style formatting
  bgClass: string; // Tailwind background color
  headerBgClass: string; // Header background color
  borderClass: string; // Tailwind border styling
  textColor: string; // Text styling
  icon?: string; // Column header icon (lucide icon name)
  isCollapsed?: boolean;
}

export interface Board {
  id: string;
  name: string;
  companyName: string; // Associated company
  description?: string;
  color: string; // Primary brand color theme
}

export interface Company {
  id: string;
  name: string;
  color: string; // Theme color
  tagline: string;
}

export interface AppNotification {
  id: string;
  cardId: string;
  cardTitle: string;
  companyName: string;
  dueDate: string;
  type: 'overdue' | 'due_soon'; // Overdue or due in < 24h
  read: boolean;
}
