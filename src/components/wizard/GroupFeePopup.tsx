import VideoFeePopup from "./VideoFeePopup";

interface GroupFeePopupProps {
  isOpen: boolean;
}

const GroupFeePopup = ({ isOpen }: GroupFeePopupProps) => {
  return <VideoFeePopup isOpen={isOpen} />;
};

export default GroupFeePopup;
