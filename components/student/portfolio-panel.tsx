"use client";

import { useActionState, useMemo, useState } from "react";
import {
  adjustSavings,
  createSavingsAccount,
  createSipPlan,
  deleteSavingsAccount,
  deleteSipPlan,
  updateSavingsAccount,
  updateSipPlan,
  type FinanceActionState,
} from "@/app/actions/student-finance";
import { AreaSpark } from "@/components/ui/charts";

const initial: FinanceActionState = {};

const fieldClass =
  "w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-purple";

type SavingsItem = { id: string; name: string; balance: number };
type FundItem = { id: string; name: string; symbol: string; price: number | null };
type SipItem = {
  id: string;
  name: string;
  monthlyAmount: number;
  expectedRate: number;
  years: number;
  fundSymbol: string | null;
};

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function sipMaturity(monthly: number, rate: number, years: number) {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  if (monthlyRate === 0) return monthly * months;
  return (
    monthly *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate)
  );
}

export function PortfolioPanel({
  savings,
  funds,
  sips,
}: {
  savings: SavingsItem[];
  funds: FundItem[];
  sips: SipItem[];
}) {
  const [tab, setTab] = useState<"savings" | "mf">("mf");

  return (
    <div className="space-y-6">
      <section className="glass-strong fade-up overflow-hidden rounded-3xl">
        <div className="flex border-b border-white/10">
          {(
            [
              { id: "mf", label: "SIP / Funds" },
              { id: "savings", label: "Savings" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex-1 px-3 py-3 text-sm font-semibold transition ${
                tab === item.id
                  ? "border-b-2 border-purple text-purple-soft"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          {tab === "mf" ? <SipFundsSection funds={funds} sips={sips} /> : null}
          {tab === "savings" ? <SavingsSection accounts={savings} /> : null}
        </div>
      </section>
    </div>
  );
}

function SavingsSection({ accounts }: { accounts: SavingsItem[] }) {
  const [createState, createAction, createPending] = useActionState(
    createSavingsAccount,
    initial,
  );

  return (
    <div className="space-y-4">
      <form action={createAction} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-foreground">New savings account</p>
        <input
          name="name"
          required
          placeholder="e.g. Emergency fund"
          className={fieldClass}
        />
        {createState.error ? (
          <p className="text-xs text-red">{createState.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={createPending}
          className="money-pad-submit w-full py-2.5 text-sm disabled:opacity-50"
        >
          {createPending ? "Adding…" : "Add account"}
        </button>
      </form>

      {accounts.length === 0 ? (
        <p className="text-sm text-muted">Create a named savings account to start.</p>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <SavingsCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}

function SavingsCard({ account }: { account: SavingsItem }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(adjustSavings, initial);
  const [renameState, renameAction, renamePending] = useActionState(
    updateSavingsAccount,
    initial,
  );

  return (
    <article className="glass rounded-2xl p-4">
      {editing ? (
        <form action={renameAction} className="mb-3 flex gap-2">
          <input type="hidden" name="accountId" value={account.id} />
          <input
            name="name"
            defaultValue={account.name}
            required
            className={fieldClass}
          />
          <button
            type="submit"
            disabled={renamePending}
            className="money-pad-submit shrink-0 rounded-xl px-3 py-2 text-xs"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs text-muted"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-foreground">{account.name}</p>
            <p className="text-lg font-bold text-purple-soft">
              {formatInr(account.balance)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-[11px] text-purple-soft"
            >
              Edit
            </button>
            <form action={deleteSavingsAccount.bind(null, account.id)}>
              <button type="submit" className="text-[11px] text-red">
                Delete
              </button>
            </form>
          </div>
        </div>
      )}

      <form action={action} className="mt-3 flex gap-2">
        <input type="hidden" name="accountId" value={account.id} />
        <input
          name="amount"
          type="number"
          min={1}
          required
          placeholder="Amount"
          className={fieldClass}
        />
        <button
          type="submit"
          name="action"
          value="deposit"
          disabled={pending}
          className="rounded-xl bg-purple/20 px-3 py-2 text-xs font-semibold text-purple-soft"
        >
          +
        </button>
        <button
          type="submit"
          name="action"
          value="withdraw"
          disabled={pending}
          className="rounded-xl bg-red/15 px-3 py-2 text-xs font-semibold text-red"
        >
          −
        </button>
      </form>
      {state.error || renameState.error ? (
        <p className="mt-2 text-xs text-red">{state.error || renameState.error}</p>
      ) : null}
    </article>
  );
}

function SipFundsSection({
  funds,
  sips,
}: {
  funds: FundItem[];
  sips: SipItem[];
}) {
  const [createState, createAction, createPending] = useActionState(
    createSipPlan,
    initial,
  );
  const [mode, setMode] = useState<"sip" | "lumpsum">("sip");
  const [amount, setAmount] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    if (mode === "lumpsum") {
      const maturity = amount * Math.pow(1 + rate / 100, years);
      return { invested: amount, maturity, gains: maturity - amount };
    }
    const maturity = sipMaturity(amount, rate, years);
    const invested = amount * years * 12;
    return { invested, maturity, gains: maturity - invested };
  }, [amount, rate, years, mode]);

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="money-pad-toggle">
          <button
            type="button"
            className={mode === "sip" ? "money-pad-toggle-active" : ""}
            onClick={() => setMode("sip")}
          >
            SIP
          </button>
          <button
            type="button"
            className={mode === "lumpsum" ? "money-pad-toggle-active" : ""}
            onClick={() => setMode("lumpsum")}
          >
            Lump sum
          </button>
        </div>

        <label className="block text-xs text-muted">
          {mode === "sip" ? "Monthly amount" : "Investment amount"}
          <input
            type="number"
            min={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className={`mt-1 ${fieldClass}`}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs text-muted">
            Expected return %
            <input
              type="number"
              min={1}
              max={30}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value) || 0)}
              className={`mt-1 ${fieldClass}`}
            />
          </label>
          <label className="block text-xs text-muted">
            Years
            <input
              type="number"
              min={1}
              max={40}
              value={years}
              onChange={(e) => setYears(Number(e.target.value) || 0)}
              className={`mt-1 ${fieldClass}`}
            />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
          <div>
            <p className="text-[10px] text-muted">Invested</p>
            <p className="text-sm font-bold text-foreground">
              ₹{Math.round(result.invested).toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted">Gains</p>
            <p className="text-sm font-bold text-green">
              ₹{Math.round(result.gains).toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted">Maturity</p>
            <p className="text-sm font-bold text-purple-soft">
              ₹{Math.round(result.maturity).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <AreaSpark
          values={[10, 18, 16, 28, 35, 42, 55, 70]}
          color="#8b5cf6"
          height={52}
          className="h-14"
        />
      </div>

      <form action={createAction} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-foreground">Save SIP plan</p>
        <input
          name="name"
          required
          placeholder="e.g. College SIP"
          className={fieldClass}
        />
        <input
          name="monthlyAmount"
          type="number"
          required
          min={100}
          placeholder="Monthly amount"
          className={fieldClass}
        />
        {funds.length > 0 ? (
          <select name="fundSymbol" defaultValue="" className={fieldClass}>
            <option value="" className="bg-[#1a1028]">
              Optional — pick a fund
            </option>
            {funds.map((fund) => (
              <option key={fund.id} value={fund.symbol} className="bg-[#1a1028]">
                {fund.name} ({fund.symbol})
              </option>
            ))}
          </select>
        ) : (
          <input
            name="fundSymbol"
            placeholder="Fund code e.g. NIFTY"
            className={fieldClass}
          />
        )}
        <div className="grid grid-cols-2 gap-2">
          <input
            name="expectedRate"
            type="number"
            defaultValue={12}
            placeholder="Return %"
            className={fieldClass}
          />
          <input
            name="years"
            type="number"
            defaultValue={10}
            placeholder="Years"
            className={fieldClass}
          />
        </div>
        {createState.error ? (
          <p className="text-xs text-red">{createState.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={createPending}
          className="money-pad-submit w-full py-2.5 text-sm disabled:opacity-50"
        >
          {createPending ? "Saving…" : "Add SIP plan"}
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">Your SIP plans</h2>
        {sips.length === 0 ? (
          <p className="text-sm text-muted">No saved SIP plans yet.</p>
        ) : (
          sips.map((sip) => <SipCard key={sip.id} sip={sip} funds={funds} />)
        )}
      </div>

      {funds.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-foreground">Fund catalog</h2>
          {funds.map((fund) => (
            <div
              key={fund.id}
              className="glass flex items-center justify-between rounded-2xl px-4 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{fund.name}</p>
                <p className="text-xs text-muted">{fund.symbol}</p>
              </div>
              {fund.price != null ? (
                <p className="text-sm text-purple-soft">
                  ₹{fund.price.toLocaleString("en-IN")}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SipCard({ sip, funds }: { sip: SipItem; funds: FundItem[] }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateSipPlan, initial);
  const maturity = sipMaturity(sip.monthlyAmount, sip.expectedRate, sip.years);
  const fundLabel =
    funds.find((f) => f.symbol === sip.fundSymbol)?.name ?? sip.fundSymbol;

  if (editing) {
    return (
      <form action={action} className="glass space-y-2 rounded-2xl p-4">
        <input type="hidden" name="sipId" value={sip.id} />
        <input
          name="name"
          defaultValue={sip.name}
          required
          className={fieldClass}
        />
        <input
          name="monthlyAmount"
          type="number"
          defaultValue={sip.monthlyAmount}
          required
          className={fieldClass}
        />
        {funds.length > 0 ? (
          <select
            name="fundSymbol"
            defaultValue={sip.fundSymbol ?? ""}
            className={fieldClass}
          >
            <option value="" className="bg-[#1a1028]">
              Optional — pick a fund
            </option>
            {funds.map((fund) => (
              <option key={fund.id} value={fund.symbol} className="bg-[#1a1028]">
                {fund.name} ({fund.symbol})
              </option>
            ))}
          </select>
        ) : (
          <input
            name="fundSymbol"
            defaultValue={sip.fundSymbol ?? ""}
            placeholder="e.g. NIFTY"
            className={fieldClass}
          />
        )}
        <div className="grid grid-cols-2 gap-2">
          <input
            name="expectedRate"
            type="number"
            defaultValue={sip.expectedRate}
            className={fieldClass}
          />
          <input
            name="years"
            type="number"
            defaultValue={sip.years}
            className={fieldClass}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="money-pad-submit flex-1 py-2 text-xs"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-xl bg-white/10 px-3 text-xs text-muted"
          >
            Cancel
          </button>
        </div>
        {state.error ? <p className="text-xs text-red">{state.error}</p> : null}
      </form>
    );
  }

  return (
    <article className="glass rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">{sip.name}</p>
          <p className="text-xs text-muted">
            ₹{sip.monthlyAmount.toLocaleString("en-IN")}/mo · {sip.expectedRate}% ·{" "}
            {sip.years}y
            {fundLabel ? ` · ${fundLabel}` : ""}
          </p>
          <p className="mt-1 text-sm font-semibold text-purple-soft">
            Est. {formatInr(Math.round(maturity))}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[11px] text-purple-soft"
          >
            Edit
          </button>
          <form action={deleteSipPlan.bind(null, sip.id)}>
            <button type="submit" className="text-[11px] text-red">
              Delete
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
