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

export default function BenchmarksPage() {
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-5', 'claude-opus-5', 'gemini-3-pro'])
  const [activeChart, setActiveChart] = useState<'radar' | 'bar' | 'timeline'>('radar')
  const [selectedBenchmark, setSelectedBenchmark] = useState('arena_elo')

  const models = useMemo(() => {
    return mockModels.filter(m => selectedModels.includes(m.id))
  }, [selectedModels])

  const radarData = useMemo(() => {
    return benchmarks.map(b => {
      const row: Record<string, number | string> = { benchmark: b }
      models.forEach(m => {
        const key = b.toLowerCase().replace(' ', '_')
        row[m.name] = m.scores[key as keyof typeof m.scores] ?? 0
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
                  <PolarRadiusAxis tick={{ fill: '#52525b', fontSize: 10 }} />
                  {models.map((model, index) => (
                    <Radar
                      key={model.id}
                      name={model.name}
                      dataKey={model.name}
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.1}
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
                <LineChart data={[
                  { day: 'T-90', 'GPT-5': 1280, 'Claude Opus 5': 1300, 'Gemini 3 Pro': 1250 },
                  { day: 'T-60', 'GPT-5': 1300, 'Claude Opus 5': 1305, 'Gemini 3 Pro': 1265 },
                  { day: 'T-30', 'GPT-5': 1320, 'Claude Opus 5': 1310, 'Gemini 3 Pro': 1280 },
                  { day: 'T-14', 'GPT-5': 1330, 'Claude Opus 5': 1315, 'Gemini 3 Pro': 1290 },
                  { day: 'Now', 'GPT-5': 1342, 'Claude Opus 5': 1319, 'Gemini 3 Pro': 1298 },
                ]}>
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
