import { expect, test } from '@playwright/test';
import { addTodo, clearTodos } from './helpers';

test.describe('Todo CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await clearTodos(page);
  });

  test('creates a todo with due date and tag that survives reload', async ({ page }) => {
    await addTodo(page, {
      title: 'Pay rent',
      dueDate: '2026-12-01',
      tags: ['finance'],
    });

    await expect(page.getByTestId('todo-title')).toHaveText('Pay rent');
    await expect(page.getByTestId('todo-due-date')).toContainText('2026-12-01');
    await expect(page.getByTestId('todo-tag-badge')).toHaveText('finance');

    await page.waitForTimeout(400);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('todo-list')).toBeVisible();
    await expect(page.getByTestId('todo-title')).toHaveText('Pay rent');
    await expect(page.getByTestId('todo-tag-badge')).toHaveText('finance');
  });

  test('hides completed todos when Active filter is selected', async ({ page }) => {
    await addTodo(page, { title: 'Stay active' });
    await addTodo(page, { title: 'Mark done' });

    const doneRow = page.locator('.list-group-item', {
      has: page.getByTestId('todo-title').filter({ hasText: 'Mark done' }),
    });
    await doneRow.getByTestId('todo-toggle').click();

    await page.getByTestId('filter-active').click();

    await expect(page.getByTestId('todo-title')).toHaveCount(1);
    await expect(page.getByTestId('todo-title')).toHaveText('Stay active');
  });

  test('edits title, due date, and tags via modal', async ({ page }) => {
    await addTodo(page, {
      title: 'Draft',
      dueDate: '2026-06-01',
      tags: ['work'],
    });

    await page.getByTestId('todo-edit').click();
    await expect(page.getByTestId('todo-edit-modal')).toBeVisible();

    const editForm = page.getByTestId('todo-edit-form');
    await editForm.getByTestId('edit-title-input').fill('Published');
    await editForm.getByTestId('edit-due-date-input').fill('2026-07-15');
    await editForm.getByTestId('tag-input').fill('done');
    await editForm.getByTestId('tag-input').press('Enter');
    await editForm.getByTestId('remove-tag-work').click();
    await editForm.getByTestId('edit-save').click();

    await expect(page.locator('.modal.show')).toHaveCount(0);
    await expect(page.getByTestId('todo-title')).toHaveText('Published');
    await expect(page.getByTestId('todo-due-date')).toContainText('2026-07-15');
    await expect(page.getByTestId('todo-tag-badge')).toHaveText('done');
  });
});
