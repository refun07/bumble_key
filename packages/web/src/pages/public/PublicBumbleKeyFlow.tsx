import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapSearchStep from './MapSearchStep';
import PlanSelectStep from './PlanSelectStep';
import { useAuth } from '../../store/auth';

type Step = 'map' | 'plan';

const PublicBumbleKeyFlow = () => {
  const [step, setStep] = useState<Step>('map');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleHiveSelected = (hive: any) => {
    localStorage.setItem(
      'public_bumblekey_selection',
      JSON.stringify(hive)
    );
    setStep('plan');
  };

  const handlePlanContinue = () => {
    if (!isAuthenticated) {
      navigate('/register');
    } else {
      navigate('/host/keys/new');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 py-6">
      {step === 'map' && (
        <MapSearchStep onSelectHive={handleHiveSelected} />
      )}

      {step === 'plan' && (
        <PlanSelectStep onContinue={handlePlanContinue} />
      )}
    </div>
  );
};

export default PublicBumbleKeyFlow;
