import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function clearTodos(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('todo-title-input').waitFor();
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByTestId('todo-title-input').waitFor();
}

export async function addTodo(
  page: Page,
  options: { title: string; dueDate?: string; tags?: string[] },
): Promise<void> {
  const form = page.getByTestId('todo-form');
  await form.getByTestId('todo-title-input').fill(options.title);
  if (options.dueDate) {
    await form.getByTestId('todo-due-date-input').fill(options.dueDate);
  }
  for (const tag of options.tags ?? []) {
    await form.getByTestId('tag-input').fill(tag);
    await form.getByTestId('tag-input').press('Enter');
  }
  await form.getByTestId('todo-add-button').click();
  await expect(page.getByTestId('todo-list')).toBeVisible();
}

export async function todoTitles(page: Page): Promise<string[]> {
  return page.getByTestId('todo-title').allTextContents();
}
