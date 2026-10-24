export interface LegalFrontmatter {
  title: string;
  updated: string;
  intro: string;
  /** "decimal" → 01, 02…; "paragraph" → § 1, § 2… */
  numbering: 'decimal' | 'paragraph';
  calloutTitle: string;
  calloutEmail: string;
  calloutNote: string;
}
