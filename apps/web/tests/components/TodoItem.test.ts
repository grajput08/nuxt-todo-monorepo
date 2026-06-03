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

  it('emits edit when Edit is clicked', async () => {
    const wrapper = mount(TodoItem, {
      props: { todo },
    });

    await wrapper.get('[data-testid="todo-edit"]').trigger('click');

    expect(wrapper.emitted('edit')).toEqual([['todo-1']]);
  });

  it('emits remove when Delete is clicked', async () => {
    const wrapper = mount(TodoItem, {
      props: { todo },
    });

    await wrapper.get('[data-testid="todo-delete"]').trigger('click');

    expect(wrapper.emitted('remove')).toEqual([['todo-1']]);
  });

  it('renders tag badges', () => {
    const wrapper = mount(TodoItem, {
      props: { todo: { ...todo, tags: ['work', 'home'] } },
    });

    const badges = wrapper.findAll('[data-testid="todo-tag-badge"]');
    expect(badges).toHaveLength(2);
    expect(badges.map((b) => b.text())).toEqual(['work', 'home']);
  });

  it('shows due date and overdue styling for past incomplete todos', () => {
    const wrapper = mount(TodoItem, {
      props: { todo: { ...todo, dueDate: '2020-01-01' } },
    });

    expect(wrapper.get('[data-testid="todo-due-date"]').text()).toContain('2020-01-01');
    expect(wrapper.get('[data-testid="todo-title"]').classes()).toContain('text-danger');
    expect(wrapper.get('[data-testid="todo-due-date"]').classes()).toContain('text-danger');
  });

  it('clears overdue styling when completed', () => {
    const wrapper = mount(TodoItem, {
      props: { todo: { ...todo, dueDate: '2020-01-01', completed: true } },
    });

    expect(wrapper.get('[data-testid="todo-title"]').classes()).not.toContain('text-danger');
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
