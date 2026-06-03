import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import TodoForm from '../../components/TodoForm.vue';
import TodoTagInput from '../../components/TodoTagInput.vue';
import { useTodosStore } from '../../stores/todos';

function mountTodoForm() {
  return mount(TodoForm, {
    global: {
      components: { TodoTagInput },
    },
  });
}

describe('TodoForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useTodosStore().hydrate();
  });

  it('adds a todo when clicking Add with a valid title', async () => {
    const wrapper = mountTodoForm();
    const input = wrapper.get('[data-testid="todo-title-input"]');

    await input.setValue('Buy milk');
    await wrapper.find('form').trigger('submit.prevent');

    const store = useTodosStore();
    expect(store.todos).toHaveLength(1);
    expect(store.todos[0]?.title).toBe('Buy milk');
  });

  it('adds a todo when pressing Enter in the title field', async () => {
    const wrapper = mountTodoForm();
    const input = wrapper.get('[data-testid="todo-title-input"]');

    await input.setValue('Walk dog');
    await input.trigger('keydown.enter');

    expect(useTodosStore().todos).toHaveLength(1);
  });

  it('adds a todo with tags', async () => {
    const wrapper = mountTodoForm();

    await wrapper.get('[data-testid="todo-title-input"]').setValue('Ship it');
    await wrapper.get('[data-testid="tag-input"]').setValue('work');
    await wrapper.get('[data-testid="tag-input"]').trigger('keydown.enter');
    await wrapper.find('form').trigger('submit.prevent');

    expect(useTodosStore().todos[0]?.tags).toEqual(['work']);
  });

  it('adds a todo with an optional due date', async () => {
    const wrapper = mountTodoForm();

    await wrapper.get('[data-testid="todo-title-input"]').setValue('Pay rent');
    await wrapper.get('[data-testid="todo-due-date-input"]').setValue('2026-06-15');
    await wrapper.find('form').trigger('submit.prevent');

    const store = useTodosStore();
    expect(store.todos[0]?.dueDate).toBe('2026-06-15');
  });

  it('shows an error for empty titles', async () => {
    const wrapper = mountTodoForm();

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.get('[data-testid="todo-form-error"]').text()).toContain('required');
    expect(useTodosStore().todos).toHaveLength(0);
  });
});
