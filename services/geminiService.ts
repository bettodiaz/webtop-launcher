
import { Application } from "../types";

/**
 * scrapeLinuxServerRepos
 * - Safe to import on the client: it will return an empty array when executed in the browser
 *   or when no API key is configured. The real Gemini client is dynamically imported and
 *   only used when running in a Node environment and an API key is present.
 */
export const scrapeLinuxServerRepos = async (): Promise<Partial<Application>[]> => {
  // Don't try to run Gemini in the browser — that would expose API keys and most
  // importantly many server-side SDKs will throw when bundled for the browser.
  if (typeof window !== 'undefined') {
    console.warn('scrapeLinuxServerRepos called in browser — skipping Gemini call.');
    return [];
  }

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No Gemini API key configured; scrapeLinuxServerRepos will return empty result.');
    return [];
  }

  try {
    // Dynamically import the SDK to avoid bundling it into the frontend.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GoogleGenAI, Type } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Act as a GitHub repository scraper. Your task is to find all repositories in the 'linuxserver' GitHub organization that are based on Selkies.
      These repositories can be identified by searching for the phrase "Options in all Selkies-based GUI containers" in their README.md file.

      For each matching repository, you must extract the following information:
      1.  'name': The name of the application. This should be a human-friendly version of the repository name (e.g., 'docker-bambustudio' becomes 'Bambu Studio').
      2.  'repositoryUrl': The full URL to the GitHub repository.
      3.  'logoUrl': The raw content URL for the application's logo. The logo is typically a .svg or .png file in the root of the repository with a name matching the application (e.g., 'bambustudio-logo.svg').
      4.  'dockerCompose': The complete content of the 'docker-compose.yml' file from the repository.

      Return the result as a JSON array of objects, where each object represents an application and has the keys 'name', 'repositoryUrl', 'logoUrl', and 'dockerCompose'.
      Do not include any repositories that do not meet the Selkies criteria.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              repositoryUrl: { type: Type.STRING },
              logoUrl: { type: Type.STRING },
              dockerCompose: { type: Type.STRING }
            },
            required: ['name', 'repositoryUrl', 'logoUrl', 'dockerCompose']
          }
        }
      }
    });

    const resultText = response.text.trim();
    const scrapedData = JSON.parse(resultText);
    return scrapedData as Partial<Application>[];
  } catch (err) {
    console.error('Gemini scrape failed:', err);
    return [];
  }
};
