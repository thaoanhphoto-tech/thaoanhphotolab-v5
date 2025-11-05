export interface BlogContent {
  type: 'heading' | 'paragraph';
  text: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  date: string;
  category: string;
  content: BlogContent[];
}
