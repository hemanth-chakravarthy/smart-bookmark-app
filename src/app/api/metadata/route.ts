import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import Groq from 'groq-sdk';

// Initialize Groq client
// High-speed text synthesis for summaries and tags
const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY }) 
  : null;

/**
 * Fallback keyword extractor for when the AI service is unavailable
 */
function extractLocalTags(title: string, content: string): string[] {
  const combined = `${title} ${content}`.toLowerCase();
  const keywords = [
    'ai', 'llm', 'coding', 'programming', 'typescript', 'javascript', 'react', 'nextjs',
    'design', 'ui', 'ux', 'product', 'startup', 'finance', 'crypto', 'blockchain',
    'science', 'nature', 'health', 'fitness', 'cooking', 'travel', 'history', 'news',
    'documentation', 'tutorial', 'blog', 'tool', 'resource', 'archive'
  ];
  
  return keywords.filter(kw => combined.includes(kw)).slice(0, 5);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Define a default response
  const defaultResponse = {
    title: url,
    description: '',
    tags: [],
    embedding: null
  };

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      },
      signal: AbortSignal.timeout(10000), 
    });

    if (!response.ok) {
      return NextResponse.json(defaultResponse);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract metadata from HTML
    const title = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  url;

    const metaDescription = $('meta[name="description"]').attr('content') || 
                             $('meta[property="og:description"]').attr('content') || 
                             '';

    // Extract body text while removing noise
    $('script, style, nav, footer, header, aside, .ad').remove();
    let bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 8000);

    let summary = metaDescription;
    let tags: string[] = [];

    // --- AI SYNTHESIS (PURE GROQ) ---
    if (groq) {
      try {
        const prompt = `
          Analyze this bookmark:
          URL: ${url}
          Title: ${title}
          Description: ${metaDescription}
          Content Snippet: ${bodyText.substring(0, 3000)}

          Return a JSON object:
          {
            "description": "A professional 2-sentence summary that highlights the value of this resource.",
            "tags": ["3-5 lowercase industry tags for categorization"]
          }
        `;

        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
        });

        const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
        if (parsed.description) summary = parsed.description;
        if (Array.isArray(parsed.tags)) tags = parsed.tags;
      } catch (e: any) {
        console.error('Groq synthesis failed:', {
          message: e.message,
          error: e.error || e,
          status: e.status
        });
        console.warn('Using local extraction fallback.');
      }
    }

    // Final Fallback: Local Keyword Extraction if AI failed or is missing
    if (tags.length === 0) {
      tags = extractLocalTags(title, bodyText);
    }

    return NextResponse.json({ 
      title, 
      description: summary, 
      tags,
      embedding: null // Embeddings removed as requested (requires Gemini/OpenAI)
    });
  } catch (error) {
    console.error('Metadata fetch error:', error);
    return NextResponse.json(defaultResponse);
  }
}
