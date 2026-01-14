
import { GoogleGenAI, Type } from "@google/genai";
import { DocCategory, ExtractedData } from "../types";

// Helper to create a new AI instance before each call to ensure latest API key is used
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function classifyDocument(base64Data: string, mimeType: string): Promise<DocCategory> {
  const ai = getAIClient();
  const prompt = `Analyze the content of this document and classify it into exactly one of these categories: 
  "Resume", "Transcript", "Certificate of Enrollment (COE)", "Language Test Result", or "Other". 
  Focus on the headers, structure, and keywords. Return only the category name.`;

  // Basic classification task uses gemini-3-flash-preview
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      temperature: 0.1,
    }
  });

  // Access .text property directly (not a method) as per guidelines
  const text = response.text;
  const category = text ? text.trim() : "";
  const validCategories = ["Resume", "Transcript", "Certificate of Enrollment (COE)", "Language Test Result"];
  
  if (validCategories.includes(category)) {
    return category as DocCategory;
  }
  return DocCategory.OTHER;
}

export async function extractDocumentData(
  category: DocCategory, 
  base64Data: string, 
  mimeType: string
): Promise<ExtractedData> {
  const ai = getAIClient();
  let extractionPrompt = '';
  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {},
  };

  const confidenceObjectSchema = {
    type: Type.OBJECT,
    properties: {
      value: { type: Type.STRING },
      confidence_score: { type: Type.INTEGER },
      confidence_label: { type: Type.STRING },
      bounding_box: {
        type: Type.OBJECT,
        properties: {
          page_number: { type: Type.INTEGER },
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER },
          width: { type: Type.NUMBER },
          height: { type: Type.NUMBER }
        }
      }
    }
  };

  if (category === DocCategory.RESUME) {
    extractionPrompt = `Extract Personal Information (first_name, last_name, email, phone_with_country_code, gender, address) and ALL Work Experiences (company, title, duration) listed in the document.`;
    responseSchema.properties = {
      first_name: confidenceObjectSchema,
      last_name: confidenceObjectSchema,
      email: confidenceObjectSchema,
      phone_with_country_code: confidenceObjectSchema,
      gender: confidenceObjectSchema,
      address: confidenceObjectSchema,
      work_experiences: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            company: confidenceObjectSchema,
            title: confidenceObjectSchema,
            duration: confidenceObjectSchema,
          }
        }
      }
    };
  } else if (category === DocCategory.TRANSCRIPT) {
    extractionPrompt = `Extract Educational Background (level_of_education, degree, course, institution, edu_duration, gpa_or_percentage, year_of_completion). Focus on the highest or most relevant degree.`;
    responseSchema.properties = {
      level_of_education: confidenceObjectSchema,
      degree: confidenceObjectSchema,
      course: confidenceObjectSchema,
      institution: confidenceObjectSchema,
      edu_duration: confidenceObjectSchema,
      gpa_or_percentage: confidenceObjectSchema,
      year_of_completion: confidenceObjectSchema,
    };
  } else if (category === DocCategory.COE) {
    extractionPrompt = `Extract Application Summary (course_start_date, course_end_date, initial_tuition_fee, total_tuition_fee).`;
    responseSchema.properties = {
      course_start_date: confidenceObjectSchema,
      course_end_date: confidenceObjectSchema,
      initial_tuition_fee: confidenceObjectSchema,
      total_tuition_fee: confidenceObjectSchema,
    };
  } else if (category === DocCategory.LANGUAGE_TEST) {
    extractionPrompt = `Extract Language Test Scores (test_type, listening_score, reading_score, writing_score, speaking_score, overall_score).`;
    responseSchema.properties = {
      test_type: confidenceObjectSchema,
      listening_score: confidenceObjectSchema,
      reading_score: confidenceObjectSchema,
      writing_score: confidenceObjectSchema,
      speaking_score: confidenceObjectSchema,
      overall_score: confidenceObjectSchema,
    };
  }

  const finalPrompt = `${extractionPrompt} 
  Rules:
  - Return JSON matching the provided schema.
  - All extracted data MUST come from documents.
  - Missing fields = null.
  - confidence_score: 0-100.
  - confidence_label: Green (>=80), Yellow (50-79), Red (<50).
  - bounding_box: provide the page number and coordinate details (x, y, width, height) as percentages (0-100) of the page.`;

  // Complex reasoning/extraction task uses gemini-3-pro-preview
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: finalPrompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1,
    }
  });

  const text = response.text;
  return JSON.parse(text || '{}');
}
