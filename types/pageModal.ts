export interface PageModelNode {
  id: string;
  type: string;
  props: {
    className?: string;
    style?: React.CSSProperties; // e.g., { position: 'relative', top: '10px', left: '20px', width: '300px', height: '200px' }
    [key: string]: any; // For other props like src, alt
  };
  children: (string | PageModelNode)[];
  metadata?: {
    template?: string;
    aiEditable?: boolean;
  };
}

export type PageModel = PageModelNode;