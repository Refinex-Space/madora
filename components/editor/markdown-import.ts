import {
  markdownToPlateValue,
  parseMarkdownDocument,
} from '@/components/editor/markdown-document';

export { markdownToPlateValue };

export function extractMarkdownImportTitle(markdown: string, fileName: string) {
  return parseMarkdownDocument(markdown, fileName).metadata.title;
}
