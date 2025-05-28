import { GoogleGenAI } from '@google/genai'

const client = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

export interface ExtendedNode{
    id: number;
    label: string;
    type: string;
    title?: string | null;
    content: string ;
    att_goal?: string | null;
    att_method?: string | null;
    att_background?: string | null;
    att_future?: string | null;
    att_gaps?: string | null;
    att_url?: string | null;
}

export const analyzeWithAI = async (text: String):Promise<ExtendedNode[]> => {
    const prompt = ` Berikut adalah isi artikel ilmiah : "${text}". Buat ringkasan artikel ilmiah berbentuk JSON dengan hanya tipe:  method, background, future, gaps, objective.
Tipe lain jangan dimasukkan.
Format JSON:
[
  {
    "label": "...",
    "type": "...",
    "content": "...",
    "att_goal": "...",
    "att_method": "...",
    "att_background": "...",
    "att_future": "...",
    "att_gaps": "...",
    "att_url": "..."
  }
]

    `;

    try {
        const result = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: prompt}]}],
        });

        const textOutput = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

        if(!textOutput){
            throw new Error ('Empty response from AI model');
        }

        const jsonMatch = textOutput.match(/```json\s*([\s\S]*?)\s*```|(\[.*\])/);
        const rawJson = jsonMatch?.[1] || jsonMatch?.[2];

        if (!rawJson) throw new Error('No Valid JSON found in AI response');

        const parsed: ExtendedNode[] = JSON.parse(rawJson);
        if (!Array.isArray(parsed) || parsed.length === 0){
            throw new Error('AI response is not a JSON Array');
        };

        parsed.forEach((node, idx) => {
            if (!node.label || !node.type || !node.content){
                throw new Error(`Node at index ${idx} is missing required fields`);
            };
        });

        return parsed;
    } catch (error: any) {
        console.error('Error parsing gemini output:', error.message || error);   
        return [];
    }
}