import VideoFeePopup from "./VideoFeePopup";

interface PaywallPopupProps {
  isOpen: boolean;
  onActivate: () => void;
  onDecline: () => void;
}

const PaywallPopup = ({ isOpen }: PaywallPopupProps) => {
  return <VideoFeePopup isOpen={isOpen} />;
};

export default PaywallPopup;
