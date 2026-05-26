import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Parse raw script text into scenes using Claude
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { scriptText } = req.body

  if (!scriptText || typeof scriptText !== 'string') {
    return res.status(400).json({ error: 'scriptText is required' })
  }

  const systemPrompt = `You are a script parser. Given a screenplay or stage play script, extract structured scene data.
Return a JSON array of scenes. Each scene must have:
- id: sequential number starting from 1
- title: scene heading (e.g. "INT. COFFEE SHOP - DAY" or "씬 1" etc.)
- characters: array of character names who speak in this scene
- lines: array of { character: string, text: string } objects in order

Respond with ONLY valid JSON, no markdown fences.`

  try {
    const response = await client.messages.create({
      model: process.env.CLAUDE_MODEL ?? 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: scriptText }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return res.status(500).json({ error: 'Unexpected response type' })
    }

    const scenes = JSON.parse(content.text)
    return res.status(200).json({ scenes })
  } catch (err) {
    console.error('Parse script error:', err)
    return res.status(500).json({ error: 'Failed to parse script' })
  }
}
