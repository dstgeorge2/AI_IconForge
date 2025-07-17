import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy_key"
});

export interface IconConversionResult {
  svg: string;
  metadata: {
    primaryShape: string;
    decorations: Array<{
      type: string;
      count: number;
      placement: string;
    }>;
    strokeWidth: number;
    canvasSize: number;
    fillUsed: boolean;
    validated: boolean;
  };
  validationResults: Array<{
    rule: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    message: string;
  }>;
}

function generateFallbackIcon(fileName: string): IconConversionResult {
  // Generate a simple house icon as fallback
  const fallbackSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
    <path d="M3 12l9-9 9 9"/>
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>
    <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
  </svg>`;
  
  const validationResults = validateIcon(fallbackSvg);
  
  return {
    svg: fallbackSvg,
    metadata: {
      primaryShape: "house icon (fallback)",
      decorations: [],
      strokeWidth: 2,
      canvasSize: 24,
      fillUsed: false,
      validated: validationResults.every(r => r.status === 'PASS')
    },
    validationResults
  };
}

export async function convertImageToIcon(imageBuffer: Buffer, fileName: string): Promise<IconConversionResult> {
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy_key") {
    console.warn('OpenAI API key not available, using fallback icon generation');
    return generateFallbackIcon(fileName);
  }

  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // System prompt for icon conversion
    const systemPrompt = `You are an expert icon vectorization assistant. Convert the provided image into a geometric SVG icon following the Vectra Icon Style Guide.

STRICT REQUIREMENTS:
- Canvas: 24x24dp with 20x20dp live area (2dp padding)
- Stroke: 2dp width, black (#000000), solid only
- Corners: 2dp radius on outer shapes, square on interior joins
- Perspective: Flat orthographic view only (no 3D, shadows, gradients)
- Decorations: Max 3 sparkles (4-pointed), max 5 dots (≤1.5dp)
- Fill: Line icons only, fills allowed only if fully enclosed and clarifies metaphor
- Geometry: Use only rect, circle, line, path primitives
- Symmetry: Prefer centered, balanced layouts

OUTPUT FORMAT: Return a JSON object with these exact fields:
{
  "svg": "complete SVG code with viewBox='0 0 24 24'",
  "primaryShape": "description of main geometric form",
  "decorations": [{"type": "sparkle|dot", "count": number, "placement": "description"}],
  "strokeWidth": 2,
  "canvasSize": 24,
  "fillUsed": boolean,
  "conceptualPurpose": "why this metaphor fits the image"
}

Focus on clarity, recognizability, and geometric simplicity. The icon must be distinguishable at 16dp size.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Convert this image to a Vectra-style UI icon. Use SVG geometry with 2dp stroke, 24x24dp canvas, flat perspective only. Return the result as JSON."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate the generated icon
    const validationResults = validateIcon(result.svg);
    
    return {
      svg: result.svg,
      metadata: {
        primaryShape: result.primaryShape,
        decorations: result.decorations || [],
        strokeWidth: result.strokeWidth,
        canvasSize: result.canvasSize,
        fillUsed: result.fillUsed,
        validated: validationResults.every(r => r.status === 'PASS')
      },
      validationResults
    };

  } catch (error) {
    console.error('Icon conversion error:', error);
    console.warn('OpenAI API failed, using fallback icon generation');
    return generateFallbackIcon(fileName);
  }
}

function validateIcon(svg: string): Array<{rule: string; status: 'PASS' | 'FAIL' | 'WARNING'; message: string}> {
  const results = [];
  
  // Check stroke width
  if (svg.includes('stroke-width="2"')) {
    results.push({ rule: 'Stroke width: 2dp', status: 'PASS', message: 'Correct stroke width applied' });
  } else {
    results.push({ rule: 'Stroke width: 2dp', status: 'FAIL', message: 'Stroke width must be 2dp' });
  }
  
  // Check viewBox
  if (svg.includes('viewBox="0 0 24 24"')) {
    results.push({ rule: 'Canvas size: 24x24dp', status: 'PASS', message: 'Correct canvas dimensions' });
  } else {
    results.push({ rule: 'Canvas size: 24x24dp', status: 'FAIL', message: 'Canvas must be 24x24dp' });
  }
  
  // Check for gradients
  if (!svg.includes('gradient') && !svg.includes('fill="url(')) {
    results.push({ rule: 'No gradients used', status: 'PASS', message: 'No gradients detected' });
  } else {
    results.push({ rule: 'No gradients used', status: 'FAIL', message: 'Gradients are not allowed' });
  }
  
  // Check stroke color
  if (svg.includes('stroke="#000000"') || svg.includes('stroke="black"')) {
    results.push({ rule: 'Stroke color: black', status: 'PASS', message: 'Correct stroke color' });
  } else {
    results.push({ rule: 'Stroke color: black', status: 'WARNING', message: 'Stroke should be black' });
  }
  
  // Check for 3D effects
  if (!svg.includes('filter') && !svg.includes('shadow') && !svg.includes('transform="matrix"')) {
    results.push({ rule: 'Flat perspective only', status: 'PASS', message: 'No 3D effects detected' });
  } else {
    results.push({ rule: 'Flat perspective only', status: 'WARNING', message: 'Avoid 3D effects and shadows' });
  }
  
  return results;
}
