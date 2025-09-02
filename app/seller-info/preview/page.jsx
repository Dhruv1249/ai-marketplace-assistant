import UniversalPreviewPage from '@/components/shared/UniversalPreviewPage';

export default function ProductStoryPreviewPage() {
  return (
    <UniversalPreviewPage
      type="product-story"
      backUrl="/seller-info"
      storageKey="productStoryPreviewData"
      title="Product Story Preview"
      helpText="Keep the product story tab open to maintain your data."
    />
  );
}