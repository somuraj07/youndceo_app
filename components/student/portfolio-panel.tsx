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
const mfFieldClass =
  "w-full rounded-full border border-teal/20 bg-teal/5 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-teal";

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

type PortfolioTab = "piggy" | "savings" | "mutual";

const portfolioTabs: { id: PortfolioTab; label: string }[] = [
  { id: "piggy", label: "Piggy" },
  { id: "savings", label: "Savings" },
  { id: "mutual", label: "Funds" },
];

export function PortfolioPanel({
  piggyBalance,
  savings,
  mutualFunds,
}: {
  piggyBalance: number;
  savings: SavingsItem[];
  mutualFunds: SavingsItem[];
}) {
  const [tab, setTab] = useState<PortfolioTab>("piggy");

  return (
    <div className="space-y-4">
      <header className="portfolio-nav fade-up">
        <div className="portfolio-nav-head">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Portfolio
          </h1>
          <p className="text-xs text-muted">Save & invest</p>
        </div>
        <nav className="portfolio-nav-tabs" aria-label="Portfolio sections">
          {portfolioTabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={
                tab === id ? "portfolio-nav-tab portfolio-nav-tab-active" : "portfolio-nav-tab"
              }
              aria-pressed={tab === id}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {tab === "piggy" ? <PiggyBank balance={piggyBalance} /> : null}
      {tab === "savings" ? (
        <SavingsSection accounts={savings} kind="SAVINGS" />
      ) : null}
      {tab === "mutual" ? (
        <MutualFundsSection accounts={mutualFunds} />
      ) : null}
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

function SavingsSection({
  accounts,
  kind,
}: {
  accounts: SavingsItem[];
  kind: "SAVINGS" | "MUTUAL_FUND";
}) {
  const [state, action, pending] = useActionState(
    createSavingsAccount,
    initial,
  );

  return (
    <section className="space-y-4">
      <form action={action} className="glass rounded-3xl p-4">
        <input type="hidden" name="kind" value={kind} />
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

function MutualFundsSection({ accounts }: { accounts: SavingsItem[] }) {
  const [state, action, pending] = useActionState(
    createSavingsAccount,
    initial,
  );

  return (
    <section className="space-y-4">
      <form
        action={action}
        className="rounded-3xl border border-teal/20 bg-gradient-to-br from-teal/10 via-transparent to-cyan/5 p-4"
      >
        <input type="hidden" name="kind" value="MUTUAL_FUND" />
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/20 text-lg">
            📈
          </span>
          <div>
            <h2 className="font-semibold text-foreground">
              Start a Mutual Fund Plan
            </h2>
            <p className="text-xs text-muted">
              Invest a lump sum and track projected growth.
            </p>
          </div>
        </div>
        <input
          name="name"
          required
          placeholder="Fund name (e.g. Nifty 50 Index)"
          className={`mt-4 ${mfFieldClass}`}
        />
        <div className="mt-2 grid grid-cols-3 gap-2">
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            min={1}
            step="0.01"
            required
            placeholder="₹ Invested"
            className={mfFieldClass}
          />
          <input
            name="rate"
            type="number"
            inputMode="decimal"
            min={0.1}
            max={100}
            step="0.1"
            required
            placeholder="Return %"
            className={mfFieldClass}
          />
          <input
            name="years"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            required
            placeholder="Years"
            className={mfFieldClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-3 w-full rounded-full bg-teal/90 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add Fund Plan"}
        </button>
        <div className="mt-3">
          <ActionMessage state={state} />
        </div>
      </form>

      {accounts.length === 0 ? (
        <div className="rounded-3xl border border-teal/15 bg-teal/5 p-6 text-center">
          <p className="text-3xl">📈</p>
          <p className="mt-2 text-sm text-muted">
            Add your first mutual fund plan to see long-term growth projections.
          </p>
        </div>
      ) : (
        accounts.map((account) => (
          <MutualFundCard key={account.id} account={account} />
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

function MutualFundCard({ account }: { account: SavingsItem }) {
  const projected =
    account.balance * Math.pow(1 + account.rate / 100, account.years);
  const gainPercent =
    account.balance > 0
      ? Math.round(((projected - account.balance) / account.balance) * 100)
      : 0;

  return (
    <article className="overflow-hidden rounded-3xl border border-teal/20 bg-gradient-to-br from-teal/10 to-transparent">
      <div className="border-b border-teal/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal/20 text-sm">
                📈
              </span>
              <p className="truncate font-semibold text-foreground">
                {account.name}
              </p>
            </div>
            <p className="mt-1 pl-10 text-xs text-teal">
              {account.rate}% expected return · {account.years} year
              {account.years === 1 ? "" : "s"}
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
      </div>

      <div className="grid grid-cols-2 divide-x divide-teal/10">
        <div className="p-4 text-center">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
            Invested
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {formatInr(account.balance)}
          </p>
        </div>
        <div className="p-4 text-center">
          <p className="text-[10px] font-semibold tracking-wide text-teal uppercase">
            Projected Value
          </p>
          <p className="mt-1 text-lg font-bold text-teal">
            {formatInr(projected)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-teal/10 bg-teal/5 px-4 py-2.5">
        <span className="text-xs text-muted">Total growth</span>
        <span className="text-sm font-bold text-green">+{gainPercent}%</span>
      </div>
    </article>
  );
}
