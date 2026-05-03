'use client'

import { useState, useMemo } from 'react'
import { mockModels } from '@/lib/mock-data'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Legend,
} from 'recharts'

const benchmarks = ['MMLU', 'HumanEval', 'MATH', 'GPQA', 'Arena ELO', 'Speed TPS']

const COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ec4899', '#8b5cf6']

// Bornes réalistes pour normaliser chaque métrique sur 0-100
const BENCHMARK_BOUNDS: Record<string, { min: number; max: number; key: string }> = {
  'MMLU':      { min: 50,   max: 100,  key: 'mmlu'       },
  'HumanEval': { min: 40,   max: 100,  key: 'humaneval'  },
  'MATH':      { min: 20,   max: 100,  key: 'math'       },
  'GPQA':      { min: 25,   max: 90,   key: 'gpqa'       },
  'Arena ELO': { min: 1050, max: 1450, key: 'arena_elo'  },
  'Speed TPS': { min: 0,    max: 250,  key: 'speed_tps'  },
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0
  return Math.round(Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)))
}

export default function BenchmarksPage() {
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4o', 'claude-3-5-sonnet', 'gemini-1-5-pro'])
  const [activeChart, setActiveChart] = useState<'radar' | 'bar' | 'timeline'>('radar')
  const [selectedBenchmark, setSelectedBenchmark] = useState('arena_elo')

  const models = useMemo(() => {
    return mockModels.filter(m => selectedModels.includes(m.id))
  }, [selectedModels])

  const radarData = useMemo(() => {
    return benchmarks.map(b => {
      const bounds = BENCHMARK_BOUNDS[b]
      const row: Record<string, number | string> = { benchmark: b }
      models.forEach(m => {
        const raw = m.scores[bounds.key as keyof typeof m.scores] ?? 0
        row[m.name] = normalize(raw as number, bounds.min, bounds.max)
      })
      return row
    })
  }, [models])

  const barData = useMemo(() => {
    return mockModels
      .filter(m => m.scores[selectedBenchmark as keyof typeof m.scores] !== null)
      .sort((a, b) => {
        const aVal = a.scores[selectedBenchmark as keyof typeof a.scores] ?? 0
        const bVal = b.scores[selectedBenchmark as keyof typeof b.scores] ?? 0
        return bVal - aVal
      })
      .slice(0, 15)
      .map(m => ({
        name: m.name,
        score: m.scores[selectedBenchmark as keyof typeof m.scores] ?? 0,
        provider: m.provider,
      }))
  }, [selectedBenchmark])

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId)
      }
      if (prev.length >= 5) {
        return [...prev.slice(1), modelId]
      }
      return [...prev, modelId]
    })
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Benchmarks</h1>
          <div className="flex bg-surface-2 rounded p-1">
            {(['radar', 'bar', 'timeline'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveChart(type)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activeChart === type
                    ? 'bg-surface text-text'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {type === 'radar' ? 'Radar' : type === 'bar' ? 'Bar Chart' : 'Timeline'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-text-muted mb-3">
            Sélectionner des modèles (max 5)
          </h3>
          <div className="flex flex-wrap gap-2">
            {mockModels.map((model) => (
              <button
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  selectedModels.includes(model.id)
                    ? 'bg-primary-dim text-primary border border-primary'
                    : 'bg-surface-2 text-text-muted hover:text-text border border-transparent'
                }`}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>

        {activeChart === 'radar' && (
          <div className="bg-surface-2 rounded p-6">
            <h3 className="text-sm font-medium mb-4">Comparaison multi-benchmarks</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis dataKey="benchmark" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tickCount={5}
                    tick={{ fill: '#52525b', fontSize: 10 }}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '4px', fontSize: 12 }}
                    formatter={(value: number, name: string, props) => {
                      const b = props.payload?.benchmark as string
                      const bounds = BENCHMARK_BOUNDS[b]
                      if (!bounds) return [`${value}`, name]
                      const real = Math.round(bounds.min + (value / 100) * (bounds.max - bounds.min))
                      return [`${real} (score normalisé : ${value}/100)`, name]
                    }}
                  />
                  {models.map((model, index) => (
                    <Radar
                      key={model.id}
                      name={model.name}
                      dataKey={model.name}
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeChart === 'bar' && (
          <div className="bg-surface-2 rounded p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Classement des benchmarks</h3>
              <select
                value={selectedBenchmark}
                onChange={(e) => setSelectedBenchmark(e.target.value)}
                className="bg-surface border border-border rounded px-3 py-1.5 text-sm text-text"
              >
                <option value="arena_elo">Arena ELO</option>
                <option value="mmlu">MMLU</option>
                <option value="humaneval">HumanEval</option>
                <option value="math">MATH</option>
                <option value="gpqa">GPQA</option>
                <option value="speed_tps">Speed TPS</option>
              </select>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: '#e4e4e7', fontSize: 12 }}
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #3f3f46',
                      borderRadius: '4px'
                    }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeChart === 'timeline' && (
          <div className="bg-surface-2 rounded p-6">
            <h3 className="text-sm font-medium mb-4">Évolution ELO (90 jours simulés)</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(() => {
                  const top3 = models.slice(0, 3)
                  const base = top3.map(m => m.scores.arena_elo ?? 1200)
                  return [
                    { day: 'T-90', ...Object.fromEntries(top3.map((m,i) => [m.name, Math.round(base[i] * 0.96)])) },
                    { day: 'T-60', ...Object.fromEntries(top3.map((m,i) => [m.name, Math.round(base[i] * 0.97)])) },
                    { day: 'T-30', ...Object.fromEntries(top3.map((m,i) => [m.name, Math.round(base[i] * 0.985)])) },
                    { day: 'T-14', ...Object.fromEntries(top3.map((m,i) => [m.name, Math.round(base[i] * 0.993)])) },
                    { day: 'Now',  ...Object.fromEntries(top3.map((m,i) => [m.name, base[i]])) },
                  ]
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis dataKey="day" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} domain={['dataMin - 50', 'dataMax + 20']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #3f3f46',
                      borderRadius: '4px'
                    }}
                  />
                  <Legend />
                  {models.slice(0, 3).map((model, index) => (
                    <Line
                      key={model.id}
                      type="monotone"
                      dataKey={model.name}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {benchmarks.map((b) => (
            <div key={b} className="bg-surface-2 rounded p-4">
              <div className="text-2xs text-text-muted uppercase mb-1">{b}</div>
              <div className="text-sm text-text-muted">
                {b === 'MMLU' && 'Massive Multitask Language Understanding'}
                {b === 'HumanEval' && 'Code generation benchmark'}
                {b === 'MATH' && 'Mathematical reasoning'}
                {b === 'GPQA' && 'Graduate-level reasoning'}
                {b === 'Arena ELO' && 'LMSYS Chatbot Arena ranking'}
                {b === 'Speed TPS' && 'Tokens per second throughput'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
