import type { Metadata } from 'next';
import { FinancingCalculator } from './_components/financing-calculator';

export const metadata: Metadata = {
  title: 'Financing Calculator',
  description: 'Estimate your monthly car payments based on price, deposit, interest rate, and loan term.',
};

export default function FinancingPage() {
  return (
    <div className="container py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Financing Calculator
          </h1>
          <p className="mt-3 text-muted-foreground">
            Estimate your monthly payments. Adjust the sliders to match your budget.
          </p>
        </div>
        <FinancingCalculator />
      </div>
    </div>
  );
}
