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
          content: "You are an expert at analyzing billiard table images. The goal is to identify the complete rectangular billiard table including the brown wooden frame/border around the green felt surface. The table should include both the green playing surface AND the brown wooden railings/borders."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this billiard table image and find the complete table boundaries. I need the FULL table including:\n1. Green felt playing surface\n2. Brown wooden rails/borders around the green area\n3. The entire rectangular table frame\n\nReturn coordinates as percentages where:\n- top: percentage from top of image to top of brown border\n- left: percentage from left of image to left of brown border  \n- right: percentage from left of image to right of brown border\n- bottom: percentage from top of image to bottom of brown border\n\nJSON format: {\"top\": number, \"left\": number, \"right\": number, \"bottom\": number, \"width\": number, \"height\": number}"
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