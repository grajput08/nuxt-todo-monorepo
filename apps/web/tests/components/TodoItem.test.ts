import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { Todo } from '@symb-abm/shared';
import TodoItem from '../../components/TodoItem.vue';

const todo: Todo = {
  id: 'todo-1',
  title: 'Sample task',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  dueDate: null,
  tags: [],
  order: 0,
};

describe('TodoItem', () => {
  it('emits toggle when the checkbox changes', async () => {
    const wrapper = mount(TodoItem, {
      props: { todo },
    });

    await wrapper.get('[data-testid="todo-toggle"]').trigger('change');

    expect(wrapper.emitted('toggle')).toEqual([['todo-1']]);
  });

  it('emits remove when Delete is clicked', async () => {
    const wrapper = mount(TodoItem, {
      props: { todo },
    });

    await wrapper.get('[data-testid="todo-delete"]').trigger('click');

    expect(wrapper.emitted('remove')).toEqual([['todo-1']]);
  });

  it('strikes through completed todo titles', () => {
    const wrapper = mount(TodoItem, {
      props: { todo: { ...todo, completed: true } },
    });

    expect(wrapper.get('[data-testid="todo-title"]').classes()).toContain(
      'text-decoration-line-through',
    );
  });
});
