import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TodoTagInput from '../../components/TodoTagInput.vue';

describe('TodoTagInput', () => {
  it('adds normalized tags on Enter', async () => {
    const wrapper = mount(TodoTagInput, {
      props: { modelValue: [] },
    });

    const input = wrapper.get('[data-testid="tag-input"]');
    await input.setValue('  Work  ');
    await input.trigger('keydown.enter');

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['work']]);
  });

  it('rejects duplicate tags', async () => {
    const wrapper = mount(TodoTagInput, {
      props: { modelValue: ['work'] },
    });

    await wrapper.get('[data-testid="tag-input"]').setValue('work');
    await wrapper.get('[data-testid="tag-input"]').trigger('keydown.enter');

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('removes a tag when badge close is clicked', async () => {
    const wrapper = mount(TodoTagInput, {
      props: { modelValue: ['work', 'home'] },
    });

    await wrapper.get('[data-testid="remove-tag-work"]').trigger('click');

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['home']]);
  });
});
