import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import TodoForm from '../../components/TodoForm.vue';
import { useTodosStore } from '../../stores/todos';

describe('TodoForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useTodosStore().hydrate();
  });

  it('adds a todo when clicking Add with a valid title', async () => {
    const wrapper = mount(TodoForm);
    const input = wrapper.get('[data-testid="todo-title-input"]');

    await input.setValue('Buy milk');
    await wrapper.find('form').trigger('submit.prevent');

    const store = useTodosStore();
    expect(store.todos).toHaveLength(1);
    expect(store.todos[0]?.title).toBe('Buy milk');
  });

  it('adds a todo when pressing Enter in the title field', async () => {
    const wrapper = mount(TodoForm);
    const input = wrapper.get('[data-testid="todo-title-input"]');

    await input.setValue('Walk dog');
    await input.trigger('keydown.enter');

    expect(useTodosStore().todos).toHaveLength(1);
  });

  it('shows an error for empty titles', async () => {
    const wrapper = mount(TodoForm);

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.get('[data-testid="todo-form-error"]').text()).toContain('required');
    expect(useTodosStore().todos).toHaveLength(0);
  });
});
