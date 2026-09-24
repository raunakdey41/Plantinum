import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages, userQuestion } = await req.json();

    const apiKey = process.env.MISTRAL_API_KEY;

    // Botanical System Prompt for Dr. Flora
    const systemPrompt = `You are Dr. Flora, Plantinum's Senior Botanist and Master Plant Doctor.
You specialize in diagnosing houseplant health issues (yellow leaves, brown tips, pests, root rot, light deficiencies, watering schedules, and potting advice).
Respond in a warm, expert, luxurious, yet easy-to-understand tone.
Provide clear diagnostic steps:
1. Diagnosis / Likely Cause
2. Immediate Action Steps
3. Long-term Prevention & Plantinum Care Tip.

CRITICAL FORMATTING INSTRUCTION: Do NOT use any markdown characters, asterisks (* or **), bolding markers, italics markers, or hashtags in your response. Output clean plain text in normal case and normal sentence structure. Keep answers concise (under 180 words).`;

    let reply = "";

    // If Mistral API key is provided, call Mistral AI endpoint
    if (apiKey) {
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...(messages || []).map((m: { sender: string; text: string }) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        ...(userQuestion ? [{ role: 'user', content: userQuestion }] : []),
      ];

      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content || 'I have analyzed your plant question. Everything looks manageable!';
      }
    }

    if (!reply) {
      // Intelligent Botanical Expert Engine Fallback (when no API key or offline)
      const q = (userQuestion || '').toLowerCase();

      if (q.includes('yellow') || q.includes('yellowing')) {
        reply = `Diagnosis: Yellowing leaves are most commonly caused by overwatering or poor soil drainage, causing mild root suffocation.

Immediate Action Steps:
- Check moisture 2 inches down into the soil with your finger.
- If wet, hold off watering until the topsoil is completely dry.
- Ensure drainage holes in your planter are unblocked.

Plantinum Care Tip: Feed with our Organic Plant Food Spray once every 3 weeks during active growth!`;
      } else if (q.includes('water') || q.includes('how often')) {
        reply = `Diagnosis: Ideal watering depends on seasonal light and humidity levels.

Golden Rule for Indoor Plants:
- Monstera & Snake Plants: Allow soil to dry 75% between waterings.
- Peace Lily & Ferns: Keep soil consistently moist, but never soggy.
- Always perform the Finger Test before adding water!

Plantinum Care Tip: Use room-temperature filtered water to prevent leaf tip crisping from tap minerals.`;
      } else if (q.includes('bug') || q.includes('pest') || q.includes('white') || q.includes('spot')) {
        reply = `Diagnosis: White fuzzy spots or webbings indicate Mealybugs or Spider Mites.

Immediate Action Steps:
- Wipe affected leaves with a cotton pad soaked in diluted Neem Oil or mild soapy water.
- Isolate the plant from other indoor foliage to prevent spread.
- Mist leaves regularly to increase humidity.

Plantinum Care Tip: Apply Plantinum Botanical Shield Spray once weekly to prevent recurring pests.`;
      } else if (q.includes('brown') || q.includes('dry') || q.includes('tip')) {
        reply = `Diagnosis: Crispy brown leaf tips are usually caused by low ambient humidity or tap water fluoride build-up.

Immediate Action Steps:
- Trim crispy edges with sterile shears leaving a tiny brown margin.
- Group plants together or place a pebble tray filled with water beneath the pot.
- Avoid placing plants near air conditioner drafts or radiators.`;
      } else {
        reply = `Greetings from Dr. Flora! 🌿

Based on your botanical query, I recommend checking three core factors:
1. Light Balance: Bright indirect sunlight is optimal for 90% of indoor plants.
2. Watering Schedule: Water thoroughly until drainage occurs, then let topsoil dry out.
3. Nutrient Vitality: Repot with fresh organic soil mix annually.

Feel free to ask me about yellow leaves, brown tips, repotting, or pest treatment!`;
      }
    }

    // Strip any residual asterisks or markdown syntax to ensure plain normal text
    const cleanReply = reply.replace(/\*/g, '').replace(/#/g, '').replace(/`+/g, '').trim();

    return NextResponse.json({ reply: cleanReply });
  } catch (error) {
    console.error("Plant Doctor API Error:", error);
    return NextResponse.json({
      reply: "Dr. Flora is currently inspecting the greenhouse. Please try asking again in a moment! 🌿"
    });
  }
}
