import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Todo } from '@symb-abm/shared';
import TodoEditModal from '../../components/TodoEditModal.vue';
import TodoTagInput from '../../components/TodoTagInput.vue';

const modalDispose = vi.fn();
const modalShow = vi.fn();
const modalHide = vi.fn();

vi.mock('bootstrap', () => ({
  Modal: vi.fn().mockImplementation(() => ({
    show: modalShow,
    hide: modalHide,
    dispose: modalDispose,
  })),
}));

const todo: Todo = {
  id: 'todo-1',
  title: 'Original',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  dueDate: '2026-06-15',
  tags: ['work'],
  order: 0,
};

function mountModal(todoProp: Todo | null = todo) {
  return mount(TodoEditModal, {
    props: { todo: todoProp },
    global: {
      components: { TodoTagInput },
    },
    attachTo: document.body,
  });
}

describe('TodoEditModal', () => {
  beforeEach(() => {
    modalDispose.mockClear();
    modalShow.mockClear();
    modalHide.mockClear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('prefills fields and emits save with updated payload', async () => {
    const wrapper = mountModal();
    await nextTick();

    expect(wrapper.get('[data-testid="edit-title-input"]').element).toHaveProperty(
      'value',
      'Original',
    );
    expect(wrapper.get('[data-testid="edit-due-date-input"]').element).toHaveProperty(
      'value',
      '2026-06-15',
    );

    await wrapper.get('[data-testid="edit-title-input"]').setValue('Updated title');
    await wrapper.get('[data-testid="edit-due-date-input"]').setValue('2026-07-01');
    await wrapper.get('[data-testid="edit-save"]').trigger('click');

    expect(wrapper.emitted('save')?.[0]).toEqual([
      {
        id: 'todo-1',
        title: 'Updated title',
        dueDate: '2026-07-01',
        tags: ['work'],
      },
    ]);
    expect(modalHide).toHaveBeenCalled();
  });

  it('rejects empty titles without emitting save', async () => {
    const wrapper = mountModal();

    await wrapper.get('[data-testid="edit-title-input"]').setValue('   ');
    await wrapper.get('[data-testid="edit-save"]').trigger('click');

    expect(wrapper.emitted('save')).toBeUndefined();
    expect(wrapper.get('[data-testid="edit-form-error"]').text()).toContain('required');
  });

  it('disposes the bootstrap modal on unmount', () => {
    const wrapper = mountModal();
    wrapper.unmount();
    expect(modalDispose).toHaveBeenCalled();
  });
});
