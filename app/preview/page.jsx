import UniversalPreviewPage from '@/components/shared/UniversalPreviewPage';

export default function PreviewPage() {
  return (
    <UniversalPreviewPage
      type="product"
      backUrl="/create"
      storageKey="previewData"
      title="Template Preview"
      helpText="Keep the creation tab open to view uploaded images in this preview."
    />
  );
}