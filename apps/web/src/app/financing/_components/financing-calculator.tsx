'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function calcMonthlyPayment(price: number, down: number, ratePercent: number, termMonths: number): number {
  const principal = price - down;
  if (principal <= 0) return 0;
  const r = ratePercent / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

function Field({
  label, id, value, onChange, min, max, prefix, suffix,
}: {
  label: string; id: string; value: number; onChange: (v: number) => void;
  min: number; max: number; prefix?: string; suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className={prefix ? 'pl-7' : suffix ? 'pr-10' : ''}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
        aria-hidden="true" tabIndex={-1}
      />
    </div>
  );
}

export function FinancingCalculator() {
  const [price, setPrice] = useState(5_000_000);
  const [down, setDown] = useState(1_000_000);
  const [rate, setRate] = useState(12);
  const [term, setTerm] = useState(36);

  const monthly = calcMonthlyPayment(price, down, rate, term);
  const totalRepayable = monthly * term;
  const totalInterest = totalRepayable - (price - down);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
        <Field label="Vehicle Price" id="price" value={price} onChange={setPrice} min={500_000} max={200_000_000} prefix="₦" />
        <Field label="Down Payment / Deposit" id="down" value={down} onChange={(v) => setDown(Math.min(v, price - 1))} min={0} max={price - 1} prefix="₦" />
        <Field label="Annual Interest Rate" id="rate" value={rate} onChange={setRate} min={1} max={40} suffix="%" />
        <Field label="Loan Term" id="term" value={term} onChange={setTerm} min={6} max={84} suffix="mo" />
      </div>

      {/* Result */}
      <div className="rounded-xl border bg-primary/5 p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Estimated Monthly Payment</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-primary">{fmt(monthly)}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Loan Amount</p>
            <p className="font-semibold text-foreground text-sm">{fmt(price - down)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Interest</p>
            <p className="font-semibold text-foreground text-sm">{fmt(Math.max(0, totalInterest))}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Repayable</p>
            <p className="font-semibold text-foreground text-sm">{fmt(totalRepayable)}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          This is an estimate only. Actual rates and terms depend on your lender and credit profile.
        </p>
      </div>

      <div className="flex gap-3">
        <Button asChild className="flex-1">
          <Link href="/vehicles">Browse Inventory</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/vehicles">
            <Calculator className="h-4 w-4" aria-hidden="true" />
            Enquire About Finance
          </Link>
        </Button>
      </div>
    </div>
  );
}
