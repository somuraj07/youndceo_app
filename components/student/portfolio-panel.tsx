"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import {
  adjustCash,
  createSavingsAccount,
  deleteSavingsAccount,
  type FinanceActionState,
} from "@/app/actions/student-finance";

const initial: FinanceActionState = {};
const fieldClass =
  "w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-purple";

type SavingsItem = {
  id: string;
  name: string;
  balance: number;
  rate: number;
  years: number;
};

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ActionMessage({ state }: { state: FinanceActionState }) {
  if (state.error) {
    return <p className="text-xs text-red">{state.error}</p>;
  }

  if (state.success) {
    return <p className="text-xs text-green">{state.success}</p>;
  }

  return null;
}

export function PortfolioPanel({
  piggyBalance,
  savings,
}: {
  piggyBalance: number;
  savings: SavingsItem[];
}) {
  const [tab, setTab] = useState<"piggy" | "savings">("piggy");

  return (
    <div className="space-y-4">
      <div className="money-pad-toggle fade-up">
        <button
          type="button"
          onClick={() => setTab("piggy")}
          className={tab === "piggy" ? "money-pad-toggle-active" : ""}
          aria-pressed={tab === "piggy"}
        >
          🐷 Piggy Bank
        </button>
        <button
          type="button"
          onClick={() => setTab("savings")}
          className={tab === "savings" ? "money-pad-toggle-active" : ""}
          aria-pressed={tab === "savings"}
        >
          💎 Savings
        </button>
      </div>

      {tab === "piggy" ? <PiggyBank balance={piggyBalance} /> : null}
      {tab === "savings" ? <SavingsSection accounts={savings} /> : null}
    </div>
  );
}

function PiggyBank({ balance }: { balance: number }) {
  const [state, action, pending] = useActionState(adjustCash, initial);

  return (
    <section className="space-y-4">
      <div className="glass-strong fade-up rounded-3xl p-6 text-center">
        <Image
          src="/piggy-bank.png"
          alt="A happy piggy bank surrounded by coins and money"
          width={612}
          height={612}
          priority
          className="mx-auto w-full max-w-64 rounded-2xl"
        />
        <p className="mt-4 text-4xl font-bold tracking-tight text-foreground">
          {formatInr(balance)}
        </p>
        <p className="mt-1 text-sm font-medium text-purple-soft">
          Total in your piggy bank
        </p>
      </div>

      <form action={action} className="glass rounded-3xl p-4">
        <h2 className="font-semibold text-foreground">Move money</h2>
        <p className="mt-1 text-xs text-muted">
          Add pocket money or take out what you need.
        </p>
        <input
          name="amount"
          type="number"
          inputMode="decimal"
          min={1}
          step="0.01"
          required
          placeholder="Amount ₹"
          className={`mt-4 ${fieldClass}`}
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="submit"
            name="action"
            value="deposit"
            disabled={pending}
            className="money-pad-submit py-3 text-sm disabled:opacity-50"
          >
            {pending ? "Updating…" : "Deposit"}
          </button>
          <button
            type="submit"
            name="action"
            value="withdraw"
            disabled={pending}
            className="rounded-full border border-purple/40 bg-purple/10 px-4 py-3 text-sm font-semibold text-purple-soft disabled:opacity-50"
          >
            Withdraw
          </button>
        </div>
        <div className="mt-3">
          <ActionMessage state={state} />
        </div>
      </form>
    </section>
  );
}

function SavingsSection({ accounts }: { accounts: SavingsItem[] }) {
  const [state, action, pending] = useActionState(
    createSavingsAccount,
    initial,
  );

  return (
    <section className="space-y-4">
      <form action={action} className="glass rounded-3xl p-4">
        <h2 className="font-semibold text-foreground">
          Open a Savings Account
        </h2>
        <input
          name="name"
          required
          placeholder="Account name (e.g. Dadi ke Paise)"
          className={`mt-4 ${fieldClass}`}
        />
        <div className="mt-2 grid grid-cols-3 gap-2">
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            min={1}
            step="0.01"
            required
            placeholder="₹ Amount"
            className={fieldClass}
          />
          <input
            name="rate"
            type="number"
            inputMode="decimal"
            min={0.1}
            max={100}
            step="0.1"
            required
            placeholder="Rate %"
            className={fieldClass}
          />
          <input
            name="years"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            required
            placeholder="Years"
            className={fieldClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="money-pad-submit mt-3 w-full py-3 text-sm disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add Account"}
        </button>
        <div className="mt-3">
          <ActionMessage state={state} />
        </div>
      </form>

      {accounts.length === 0 ? (
        <div className="glass rounded-3xl p-6 text-center">
          <p className="text-3xl">💎</p>
          <p className="mt-2 text-sm text-muted">
            Create your first savings account to see how your money grows.
          </p>
        </div>
      ) : (
        accounts.map((account) => (
          <SavingsCard key={account.id} account={account} />
        ))
      )}
    </section>
  );
}

function SavingsCard({ account }: { account: SavingsItem }) {
  const maturity = account.balance * Math.pow(1 + account.rate / 100, account.years);
  const gainPercent =
    account.balance > 0
      ? Math.round(((maturity - account.balance) / account.balance) * 100)
      : 0;

  return (
    <article className="glass rounded-3xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            💎 {account.name}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {formatInr(account.balance)} · {account.rate}% p.a. · {account.years}
            yr
          </p>
        </div>
        <form action={deleteSavingsAccount.bind(null, account.id)}>
          <button
            type="submit"
            aria-label={`Delete ${account.name}`}
            className="text-muted hover:text-red"
          >
            🗑
          </button>
        </form>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="text-[10px] uppercase text-muted">Deposited</p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {formatInr(account.balance)}
          </p>
        </div>
        <div className="rounded-2xl bg-purple/10 p-3">
          <p className="text-[10px] uppercase text-purple-soft">Maturity</p>
          <p className="mt-1 text-sm font-bold text-purple-soft">
            {formatInr(maturity)}
          </p>
        </div>
        <div className="rounded-2xl bg-green/10 p-3">
          <p className="text-[10px] uppercase text-green">Interest</p>
          <p className="mt-1 text-sm font-bold text-green">+{gainPercent}%</p>
        </div>
      </div>
    </article>
  );
}
