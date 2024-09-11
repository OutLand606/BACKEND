import axios from 'axios';


export async function parseWithOllama(
  domChunks: string[],
  parseDescription: string,
): Promise<string> {
  const template = `You are tasked with extracting specific information from the following text content: {dom_content}.
    Please follow these instructions carefully:
    1. **Extract Information:** Only extract the information that directly matches the provided description: {parse_description}.
    2. **No Extra Content:** Do not include any additional text, comments, or explanations in your response.
    3. **Empty Response:** If no information matches the description, return an empty string ('').
    4. **Direct Data Only:** Your output should contain only the data that is explicitly requested, with no other text.
    5. **No duplicate data:** The output should not contain duplicate data.
    `;

  const apiUrl = 'http://127.0.0.1:11434/api/generate';
  const parsedResults: string[] = [];
  for (const [i, chunk] of domChunks.entries()) {
    const prompt = template
      .replace('{dom_content}', chunk)
      .replace('{parse_description}', parseDescription);
    try {
      const response = await axios.post(apiUrl, {
        model: 'llama3.1',
        prompt: prompt,
      });
      const jsonArray = response?.data
        .trim()
        .split('\n')
        .map((item) => JSON.parse(item));
      const combinedResponse = jsonArray.map((item) => item.response).join('');
      parsedResults.push(combinedResponse);
    } catch (error) {
      console.error(`Error parsing batch ${i + 1}:`, error);
    }
  }
  return parsedResults.join('\n');
}
