import { expect, test } from '@playwright/test';
import { addTodo, clearTodos, todoTitles } from './helpers';

test.describe('Todo reorder', () => {
  test.beforeEach(async ({ page }) => {
    await clearTodos(page);
  });

  test('persists manual order after drag-and-drop and reload', async ({ page }) => {
    await addTodo(page, { title: 'First' });
    await addTodo(page, { title: 'Second' });

    await expect.poll(() => todoTitles(page)).toEqual(['First', 'Second']);

    const firstHandle = page.getByTestId('todo-drag-handle').nth(0);
    const secondHandle = page.getByTestId('todo-drag-handle').nth(1);
    await secondHandle.dragTo(firstHandle);

    await expect.poll(() => todoTitles(page)).toEqual(['Second', 'First']);

    await page.waitForTimeout(400);
    await page.reload();

    await expect.poll(() => todoTitles(page)).toEqual(['Second', 'First']);
  });
});
