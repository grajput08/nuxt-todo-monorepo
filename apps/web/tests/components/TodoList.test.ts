import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TodoItem from '../../components/TodoItem.vue';
import TodoList from '../../components/TodoList.vue';
import { useTodosStore } from '../../stores/todos';

vi.mock('vue-draggable-plus', () => ({
  VueDraggable: defineComponent({
    name: 'VueDraggable',
    props: {
      modelValue: { type: Array, required: true },
    },
    emits: ['update:modelValue'],
    setup(props, { slots, emit }) {
      return () =>
        h(
          'ul',
          {
            'data-testid': 'todo-list',
            onClick: () => {
              const list = [...(props.modelValue as { id: string }[])];
              if (list.length >= 2) {
                emit('update:modelValue', [list[1], list[0], ...list.slice(2)]);
              }
            },
          },
          slots.default?.(),
        );
    },
  }),
}));

describe('TodoList', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useTodosStore().hydrate();
  });

  it('calls store reorder when draggable list order changes', async () => {
    const store = useTodosStore();
    store.addTodo('A');
    store.addTodo('B');

    const wrapper = mount(TodoList, {
      global: {
        components: { TodoItem },
        stubs: { ClientOnly: { template: '<div><slot /></div>' } },
      },
    });

    await wrapper.get('[data-testid="todo-list"]').trigger('click');

    expect(store.sortedTodos.map((t) => t.title)).toEqual(['B', 'A']);
  });
});
