import { describe, expect, it, vi } from 'vitest';
import type { Value } from 'platejs';

vi.mock('platejs/react', () => ({
  createPlateEditor: () => ({
    getApi: () => ({
      markdown: {
        deserialize: () => [],
        serialize: () => '',
      },
    }),
  }),
}));

vi.mock('@/components/editor/editor-kit', () => ({
  EditorKit: [],
}));

import {
  extractH1Text,
  sanitizeTitleForFileName,
} from '../markdown-document';

describe('extractH1Text', () => {
  it('从第一个 H1 元素中提取文本', () => {
    const value: Value = [
      { type: 'h1', children: [{ text: '我的标题' }] } as never,
      { type: 'p', children: [{ text: '正文' }] } as never,
    ];

    expect(extractH1Text(value)).toBe('我的标题');
  });

  it('没有 H1 元素时返回 null', () => {
    const value: Value = [
      { type: 'p', children: [{ text: '正文' }] } as never,
    ];

    expect(extractH1Text(value)).toBeNull();
  });

  it('从嵌套子元素中提取文本（如加粗文本）', () => {
    const value: Value = [
      {
        type: 'h1',
        children: [
          { text: 'Hello ', bold: true } as never,
          { text: 'World' } as never,
        ],
      } as never,
    ];

    expect(extractH1Text(value)).toBe('Hello World');
  });

  it('H1 无文本内容时返回 null', () => {
    const value: Value = [
      { type: 'h1', children: [{ text: '' }] } as never,
    ];

    expect(extractH1Text(value)).toBeNull();
  });

  it('H1 仅空白时返回 null', () => {
    const value: Value = [
      { type: 'h1', children: [{ text: '   ' }] } as never,
    ];

    expect(extractH1Text(value)).toBeNull();
  });
});

describe('sanitizeTitleForFileName', () => {
  it('无特殊字符时原样返回', () => {
    expect(sanitizeTitleForFileName('我的文档')).toBe('我的文档');
  });

  it('将特殊字符替换为短横线', () => {
    expect(sanitizeTitleForFileName('a/b:c*d')).toBe('a-b-c-d');
  });

  it('去除首尾的点号', () => {
    expect(sanitizeTitleForFileName('..test..')).toBe('test');
  });

  it('空字符串返回未命名文档', () => {
    expect(sanitizeTitleForFileName('')).toBe('未命名文档');
  });

  it('仅空白字符返回未命名文档', () => {
    expect(sanitizeTitleForFileName('   ')).toBe('未命名文档');
  });

  it('仅点号返回未命名文档', () => {
    expect(sanitizeTitleForFileName('...')).toBe('未命名文档');
  });
});
