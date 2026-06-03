import { expect, test } from '@playwright/test';
import { addTodo, clearTodos } from './helpers';

test.describe('Todo tags', () => {
  test.beforeEach(async ({ page }) => {
    await clearTodos(page);
  });

  test('filters the list when a tag chip is selected', async ({ page }) => {
    await addTodo(page, { title: 'Work task', tags: ['work'] });
    await addTodo(page, { title: 'Home task', tags: ['home'] });

    await page.getByTestId('filter-tag-work').click();

    await expect(page.getByTestId('todo-title')).toHaveCount(1);
    await expect(page.getByTestId('todo-title')).toHaveText('Work task');
  });
});
