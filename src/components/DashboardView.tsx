import { useEffect, useState, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getMetrics } from '../services/mockDataService'
import type { DashboardMetrics } from '../types'

/** Ordinal fill ramp: gold → deep → navy → blue */
const COUNT_COLORS = ['#e48b53', '#ab683e', '#002a3a', '#004f71']
const RETENTION_COLORS = ['#002a3a', '#e48b53']
const CHART_MUTED = '#4a6470'
const CHART_GRID = '#ecd9cb'

function MetricShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface-elevated p-5">
      <h2 className="font-display text-xl font-light text-ink">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-ink-muted">{subtitle}</p>}
      <div className="mt-4 flex-1">{children}</div>
    </article>
  )
}

function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function DashboardView() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getMetrics().then((data) => {
      if (!cancelled) {
        setMetrics(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || !metrics) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 text-center text-ink-muted sm:px-6">
        Loading analytics…
      </section>
    )
  }

  const retentionData = [
    {
      cohort: 'Referred',
      months: Number(metrics.avgRetentionMonthsReferred.toFixed(1)),
    },
    {
      cohort: 'Non-referred',
      months: Number(metrics.avgRetentionMonthsNonReferred.toFixed(1)),
    },
  ]

  const conversionChartData = [
    { label: 'Conversion', rate: Number(metrics.conversionRate.toFixed(1)) },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-display text-3xl font-light text-ink sm:text-4xl">
          Analytics Dashboard
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricShell
          title="Share / participation rate"
          subtitle="% of all enrolled families who made ≥1 referral"
        >
          <p className="font-display text-4xl font-light text-navy">
            {formatPct(metrics.participationRate)}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            {metrics.familiesWhoReferred} of {metrics.totalFamilies} families referred
            someone
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-strong">
            <div
              className="h-full rounded-full bg-navy transition-all"
              style={{ width: `${Math.min(100, metrics.participationRate)}%` }}
            />
          </div>
        </MetricShell>

        <MetricShell
          title="Referral conversion rate"
          subtitle="% of referrals that reached enrolled status"
        >
          <p className="font-display text-4xl font-light text-navy">
            {formatPct(metrics.conversionRate)}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            {metrics.enrolledReferrals} enrolled of {metrics.totalReferrals} referrals
          </p>
          <div className="mt-3 h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={conversionChartData}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART_GRID} />
                <XAxis
                  type="number"
                  domain={[0, 50]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: CHART_MUTED, fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={72}
                  tick={{ fill: CHART_MUTED, fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Conversion']}
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: CHART_GRID,
                    background: '#ffffff',
                    fontSize: 12,
                    color: '#001117',
                  }}
                />
                <Bar dataKey="rate" fill="#002a3a" radius={[0, 6, 6, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MetricShell>

        <MetricShell
          title="Program cost per enrolled referral"
          subtitle="Reward spend ÷ enrolled referrals"
        >
          <p className="mb-3 text-xs text-ink-muted">
            Estimated staff time & resources to deliver rewards, not a cash payment to
            families.
          </p>
          <p className="font-display text-4xl font-light text-navy">
            {formatUsd(metrics.costPerEnrolledReferral)}
          </p>
          <p className="mt-2 text-sm text-ink-muted">per enrolled referral</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-line bg-surface-warm px-3 py-2">
              <dt className="text-xs text-ink-muted">Total reward cost</dt>
              <dd className="mt-0.5 font-sans font-semibold text-ink">
                {formatUsd(metrics.totalRewardCost)}
              </dd>
            </div>
            <div className="rounded-md border border-line bg-surface-warm px-3 py-2">
              <dt className="text-xs text-ink-muted">Successful enrollments</dt>
              <dd className="mt-0.5 font-sans font-semibold text-ink">
                {metrics.enrolledReferrals}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-ink-muted">
            Assumes Tier 1 = $50, Tier 2 = $125, Tier 3 = $250 reward cost per referrer.
          </p>
        </MetricShell>

        <MetricShell
          title="Referred family retention"
          subtitle="Avg enrollment duration (months) by cohort"
        >
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retentionData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID} />
                <XAxis dataKey="cohort" tick={{ fill: CHART_MUTED, fontSize: 12 }} />
                <YAxis
                  tick={{ fill: CHART_MUTED, fontSize: 11 }}
                  label={{
                    value: 'Months',
                    angle: -90,
                    position: 'insideLeft',
                    fill: CHART_MUTED,
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value} mo`, 'Avg tenure']}
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: CHART_GRID,
                    background: '#ffffff',
                    fontSize: 12,
                    color: '#001117',
                  }}
                />
                <Bar dataKey="months" radius={[6, 6, 0, 0]} barSize={48}>
                  {retentionData.map((_, i) => (
                    <Cell key={retentionData[i].cohort} fill={RETENTION_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Based on{' '}
            <code className="rounded-xs border border-line bg-surface-warm px-1 py-0.5 font-utility text-[11px]">
              is_referred
            </code>{' '}
            on the families table.
          </p>
        </MetricShell>

        <MetricShell
          title="Referral count distribution"
          subtitle="How many referrers made 1, 2, 3, or 4+ referrals"
        >
          <div className="flex w-full justify-center">
            <div className="flex w-full max-w-[300px] flex-col items-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.referralCountDistribution}
                    margin={{ top: 8, right: 16, left: 16, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID} />
                    <XAxis dataKey="label" tick={{ fill: CHART_MUTED, fontSize: 12 }} />
                    <YAxis
                      allowDecimals={false}
                      width={36}
                      tick={{ fill: CHART_MUTED, fontSize: 11 }}
                      label={{
                        value: 'Referrers',
                        angle: -90,
                        position: 'insideLeft',
                        fill: CHART_MUTED,
                        fontSize: 11,
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} referrers`, 'Count']}
                      labelFormatter={(label) =>
                        `${label} referral${label === '1' ? '' : 's'}`
                      }
                      contentStyle={{
                        borderRadius: 8,
                        borderColor: CHART_GRID,
                        background: '#ffffff',
                        fontSize: 12,
                        color: '#001117',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
                      {metrics.referralCountDistribution.map((entry, i) => (
                        <Cell
                          key={entry.label}
                          fill={COUNT_COLORS[i % COUNT_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-1 w-full text-center text-[11px] text-ink-muted">
                Referrals made
              </p>
            </div>
          </div>
          <ul className="mt-2 flex flex-wrap gap-3 text-xs text-ink-muted">
            {metrics.referralCountDistribution.map((bucket, i) => (
              <li key={bucket.label} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-xs"
                  style={{ background: COUNT_COLORS[i % COUNT_COLORS.length] }}
                  aria-hidden
                />
                <span className="font-sans font-semibold text-ink">{bucket.count}</span> with{' '}
                {bucket.label} referral{bucket.label === '1' ? '' : 's'}
              </li>
            ))}
          </ul>
        </MetricShell>
      </div>
    </section>
  )
}
