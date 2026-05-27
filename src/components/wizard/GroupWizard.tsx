import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WizardProgress from "./WizardProgress";
import NameStep from "./NameStep";
import StatusStep from "./StatusStep";
import NicheStep from "./NicheStep";
import FrequencyStep from "./FrequencyStep";
import VarietyStep from "./VarietyStep";
import ModeStep from "./ModeStep";
import ConfirmationStep from "./ConfirmationStep";
import SuccessPopup from "./SuccessPopup";
import PaywallPopup from "./PaywallPopup";
import gruposLogo from "@/assets/grupos-lucrativos-logo.png";

const GroupWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [wizardData, setWizardData] = useState({
    name: "",
    niche: null as string | null,
    frequency: null as string | null,
    variety: null as string | null,
    mode: null as string | null,
  });

  const totalSteps = 7;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleConnectWhatsApp = () => {
    setShowPaywall(true);
  };

  const handleActivate = () => {
    setShowSuccess(true);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <NameStep
            selectedName={wizardData.name}
            onNameChange={(name) => setWizardData({ ...wizardData, name })}
            onNext={nextStep}
          />
        );
      case 1:
        return <StatusStep onNext={nextStep} onConnectWhatsApp={handleConnectWhatsApp} />;
      case 2:
        return (
          <NicheStep
            selectedNiche={wizardData.niche}
            onSelect={(niche) => setWizardData({ ...wizardData, niche })}
            onNext={nextStep}
          />
        );
      case 3:
        return (
          <FrequencyStep
            selectedFrequency={wizardData.frequency}
            onSelect={(frequency) => setWizardData({ ...wizardData, frequency })}
            onNext={nextStep}
          />
        );
      case 4:
        return (
          <VarietyStep
            selectedVariety={wizardData.variety}
            onSelect={(variety) => setWizardData({ ...wizardData, variety })}
            onNext={nextStep}
          />
        );
      case 5:
        return (
          <ModeStep
            selectedMode={wizardData.mode}
            onSelect={(mode) => setWizardData({ ...wizardData, mode })}
            onNext={nextStep}
          />
        );
      case 6:
        return <ConfirmationStep onActivate={handleActivate} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div 
        className="floating-gradient" 
        style={{ 
          background: "hsl(14 100% 57%)", 
          top: "-200px", 
          right: "-200px",
          opacity: 0.08
        }} 
      />
      <div 
        className="floating-gradient" 
        style={{ 
          background: "hsl(152 69% 45%)", 
          bottom: "-300px", 
          left: "-200px",
          opacity: 0.06
        }} 
      />

      {/* Header */}
      <header className="relative z-10 pt-6 pb-4 px-5">
        <div className="flex items-center justify-center mb-5">
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src={gruposLogo} 
            alt="Grupos Lucrativos" 
            className="h-32 object-contain"
          />
        </div>
        <WizardProgress currentStep={currentStep} totalSteps={totalSteps} />
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col px-5 pb-8 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1 flex flex-col"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      <SuccessPopup isOpen={showSuccess} />
      <PaywallPopup 
        isOpen={showPaywall} 
        onActivate={() => setShowPaywall(false)} 
        onDecline={() => setShowPaywall(false)} 
      />
    </div>
  );
};

export default GroupWizard;