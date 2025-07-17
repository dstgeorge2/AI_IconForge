export const STYLE_GUIDE = {
  CANVAS_SIZE: 24,
  LIVE_AREA: 20,
  PADDING: 2,
  STROKE_WIDTH: 2,
  STROKE_COLOR: '#000000',
  OUTER_CORNER_RADIUS: 2,
  INTERIOR_CORNER_STYLE: 'square',
  MAX_SPARKLES: 3,
  MAX_DOTS: 5,
  MAX_DOT_SIZE: 1.5,
  DEFAULT_FILL: 'none',
  ALLOWED_FILL: '#FFFFFF',
  MIN_CONTRAST_RATIO: 4.5
};

export interface ValidationRule {
  rule: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
}

export interface IconMetadata {
  primaryShape: string;
  decorations: Array<{
    type: string;
    count: number;
    placement: string;
  }>;
  strokeWidth: number;
  canvasSize: number;
  fillUsed: boolean;
  validated: boolean;
}

export const generateReactComponent = (svg: string, componentName: string = 'GeneratedIcon'): string => {
  const processedSvg = svg
    .replace(/stroke="#000000"/g, 'stroke="currentColor"')
    .replace(/fill="#000000"/g, 'fill="currentColor"')
    .replace(/className/g, 'className')
    .replace(/viewBox=/g, 'viewBox=');

  return `export const ${componentName} = ({ className, ...props }) => (
  ${processedSvg.replace('<svg', '<svg className={className} {...props}')}
);`;
};

export const downloadSvg = (svg: string, filename: string = 'icon.svg'): void => {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};
