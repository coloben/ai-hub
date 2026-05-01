import { NextResponse } from 'next/server'
import { generateBriefing } from '@/lib/intelligence'

export const revalidate = 300

export async function GET() {
  return NextResponse.json(generateBriefing())
}
