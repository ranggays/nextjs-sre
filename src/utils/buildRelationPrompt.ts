interface Node {
  id: number;
  label: string;
  title: string | null;
  att_goal: string | null;
  att_method: string | null;
  att_background: string | null;
  att_future: string | null;
  att_gaps: string | null;
  att_url: string | null;
}

export function buildRelationPrompt(nodes: Node[]): string {
  let prompt = `You are an AI assistant tasked with analyzing relationships between scientific articles based on their content.\n`;
  prompt += `All content below is written in **Bahasa Indonesia**. Focus on semantic similarity, not literal word matching.\n`;
  prompt += `Each article has the following fields:\n- Title\n- Goal\n- Methodology\n- Background\n- Future Work\n- Research Gaps\n\n`;

  prompt += `Your task is to analyze the possible **semantic relationships** between articles. These include:\n`;
  prompt += `- same_background: articles have a similar background/context\n`;
  prompt += `- extended_method: article B extends or builds on article A's method\n`;
  prompt += `- shares_goal: articles aim at the same or complementary goals\n`;
  prompt += `- follows_future_work: article follows or fulfills a future direction from another\n`;
  prompt += `- addresses_same_gap: both try to resolve the same research gap\n\n`;

  nodes.forEach((node, idx) => {
    prompt += `Article ${idx + 1} (ID: ${node.id}):\n`;
    prompt += `- Title: ${node.title}\n`;
    prompt += `- Goal: ${node.att_goal}\n`;
    prompt += `- Methodology: ${node.att_method}\n`;
    prompt += `- Background: ${node.att_background}\n`;
    prompt += `- Future Work: ${node.att_future}\n`;
    prompt += `- Research Gaps: ${node.att_gaps}\n`;
    prompt += `- URL: ${node.att_url}\n\n`;
  });

  prompt += `Now return a JSON array of the inferred relationships ("edges") between these articles.\n`;
  prompt += `Each edge should follow this format:\n\n`;
  prompt += `[\n`;
  prompt += `  {\n`;
  prompt += `    "from": <source_article_id>,\n`;
  prompt += `    "to": <target_article_id>,\n`;
  prompt += `    "relation": "<type_of_relation>",\n`;
  prompt += `    "label": "<short_description_in_english_or_indonesian>"\n`;
  prompt += `  }\n`;
  prompt += `]\n\n`;
  prompt += `If there are no relationships, return an empty array [] only.\n`;
  prompt += `Enclose the JSON in a code block like this:\n\n`;
  prompt += "```json\n";
  prompt += "[ ... ]\n";
  prompt += "```\n";

  // Debug log (optional)
  console.log("🧠 Prompt being sent to AI:\n", prompt);

  return prompt;
}
