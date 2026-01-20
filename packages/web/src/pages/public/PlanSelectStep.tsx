import { useState } from 'react';
import Button from '../../components/common/Button';

const PRICING_PLANS = [
  { id: 1, key: 'pay_as_you_go_price', price: 5, label: 'Pay as you go' },
  { id: 2, key: 'monthly_price', price: 29, label: 'Monthly' },
  { id: 3, key: 'yearly_price', price: 290, label: 'Yearly' },
];

const PlanSelectStep = ({ onContinue }: { onContinue: () => void }) => {
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">
        Subscribe to a plan
      </h2>

      <div className="space-y-4">
        {PRICING_PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelected(plan)}
            className={`w-full p-5 rounded-2xl border text-left ${
              selected?.id === plan.id
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="font-bold">{plan.label}</div>
            <div className="text-sm">${plan.price}</div>
          </button>
        ))}
      </div>

      <Button
        variant="bumble"
        className="mt-8 w-full py-4"
        disabled={!selected}
        onClick={() => {
          localStorage.setItem(
            'public_bumblekey_plan',
            JSON.stringify(selected)
          );
          onContinue();
        }}
      >
        Continue
      </Button>
    </div>
  );
};

export default PlanSelectStep;
