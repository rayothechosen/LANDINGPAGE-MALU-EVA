import VideoFeePopup from "./VideoFeePopup";

interface ShopeePaywallPopupProps {
  isOpen: boolean;
}

const ShopeePaywallPopup = ({ isOpen }: ShopeePaywallPopupProps) => {
  return <VideoFeePopup isOpen={isOpen} />;
};

export default ShopeePaywallPopup;
