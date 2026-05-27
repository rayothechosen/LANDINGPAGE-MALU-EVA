import { motion } from "framer-motion";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

const WizardProgress = ({ currentStep, totalSteps }: WizardProgressProps) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Passo {currentStep + 1} de {totalSteps}
        </span>
        <span className="text-xs font-bold text-primary">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
};

export default WizardProgress;