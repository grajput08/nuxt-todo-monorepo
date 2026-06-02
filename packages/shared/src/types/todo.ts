export type TodoId = string;

export interface Todo {
  id: TodoId;
  title: string;
  completed: boolean;
  createdAt: string;
  dueDate: string | null;
  tags: string[];
  order: number;
}

export type TodoFilter = 'all' | 'active' | 'completed';
