
import { GoogleGenAI, Type } from "@google/genai";
import { Application } from "../types";

// Fix: Initialize the GoogleGenAI client. We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


/**
 * Uses Gemini to scrape linuxserver.io GitHub repositories for Selkies-based images.
 */
export const scrapeLinuxServerRepos = async (): Promise<Partial<Application>[]> => {
  console.log("Initiating scrape with Gemini...");

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
  
  console.log("--- PROMPT FOR GEMINI ---");
  console.log(prompt);
  console.log("-------------------------");

  // Fix: Replaced mock implementation with a real call to the Gemini API.
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    repositoryUrl: { type: Type.STRING },
                    logoUrl: { type: Type.STRING },
                    dockerCompose: { type: Type.STRING },
                },
                required: ["name", "repositoryUrl", "logoUrl", "dockerCompose"]
            }
        }
      },
    });

    const resultText = response.text.trim();
    const scrapedData = JSON.parse(resultText);
    return scrapedData as Partial<Application>[];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to scrape repositories using Gemini.");
  }
};
