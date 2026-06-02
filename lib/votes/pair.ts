/** Canonical pair key: sorted model ids so A vs B === B vs A */
export function canonicalPair(modelAId: string, modelBId: string): [string, string] {
  return modelAId < modelBId ? [modelAId, modelBId] : [modelBId, modelAId]
}

export function winnerId(
  choice: 'A' | 'B',
  modelAId: string,
  modelBId: string
): string {
  return choice === 'A' ? modelAId : modelBId
}

export function isChoiceForCanonicalA(
  choice: 'A' | 'B',
  modelAId: string,
  modelBId: string
): boolean {
  const [low] = canonicalPair(modelAId, modelBId)
  const picked = winnerId(choice, modelAId, modelBId)
  return picked === low
}
