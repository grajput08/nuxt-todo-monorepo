import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import TodoFilters from '../../components/TodoFilters.vue';
import { useTodosStore } from '../../stores/todos';

describe('TodoFilters', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const store = useTodosStore();
    store.hydrate();
    store.addTodo('Active');
    store.addTodo('Done');
    store.toggleTodo(store.todos.find((t) => t.title === 'Done')!.id);
  });

  it('shows counts on filter buttons', () => {
    const wrapper = mount(TodoFilters);

    expect(wrapper.get('[data-testid="filter-all"]').text()).toContain('(2)');
    expect(wrapper.get('[data-testid="filter-active"]').text()).toContain('(1)');
    expect(wrapper.get('[data-testid="filter-completed"]').text()).toContain('(1)');
  });

  it('sets the store filter when Active is clicked', async () => {
    const wrapper = mount(TodoFilters);
    const store = useTodosStore();

    await wrapper.get('[data-testid="filter-active"]').trigger('click');

    expect(store.filter).toBe('active');
    expect(store.filteredTodos).toHaveLength(1);
  });

  it('clears completed todos when Clear completed is clicked', async () => {
    const wrapper = mount(TodoFilters);

    await wrapper.get('[data-testid="clear-completed"]').trigger('click');

    expect(useTodosStore().todos.map((t) => t.title)).toEqual(['Active']);
  });
});
