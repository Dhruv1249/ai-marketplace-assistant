import UniversalPreviewPage from '@/components/shared/UniversalPreviewPage';

export default function SellerInfoPreviewPage() {
  return (
    <UniversalPreviewPage
      type="seller-info"
      backUrl="/seller-info"
      storageKey="sellerInfoPreviewData"
      title="Seller Info Preview"
      helpText="Keep the seller info tab open to maintain your data."
    />
  );
}