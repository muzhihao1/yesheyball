import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TableBounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export async function analyzeTableBounds(imageUrl: string): Promise<TableBounds> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing billiard table images. Analyze the image and determine the exact pixel coordinates of the billiard table including its brown wooden frame. Return the coordinates as percentages of the total image dimensions."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this billiard table image and provide the exact bounds of the complete table (including brown wooden borders) as percentages. I need: top, left, right, bottom coordinates as percentages of image width/height. Respond in JSON format: {\"top\": number, \"left\": number, \"right\": number, \"bottom\": number, \"width\": number, \"height\": number}"
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      top: result.top || 15,
      left: result.left || 45,
      right: result.right || 95,
      bottom: result.bottom || 85,
      width: result.width || 50,
      height: result.height || 70
    };
  } catch (error) {
    console.error("Error analyzing table bounds:", error);
    // Return default values if analysis fails
    return {
      top: 15,
      left: 45,
      right: 95,
      bottom: 85,
      width: 50,
      height: 70
    };
  }
}