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
          content: "You are an expert at analyzing billiard table images. The goal is to identify the complete rectangular billiard table that looks exactly like this reference: a green rectangular playing surface completely surrounded by brown wooden rails/borders, with rounded corners, and pocket holes visible. The desired output should show the complete table from outer edge of brown border to outer edge of brown border."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Look at this reference image first to understand the desired output:"
            },
            {
              type: "image_url",
              image_url: {
                url: "https://replit.com/assets/image_1748971753201.png"
              }
            },
            {
              type: "text",
              text: "Now analyze the actual billiard table image below and find coordinates that will crop it to look exactly like the reference above. The target result should show ONLY the complete billiard table (brown border to brown border) with no white background.\n\nFind the rectangular boundary that includes:\n1. Brown wooden border/rail forming outer edge\n2. Green felt playing surface\n3. All pocket holes\n4. Complete table frame with rounded corners\n\nReturn coordinates as percentages:\n- top: percentage from image top to top edge of brown border\n- left: percentage from image left to left edge of brown border  \n- right: percentage from image left to right edge of brown border\n- bottom: percentage from image top to bottom edge of brown border\n\nJSON format: {\"top\": number, \"left\": number, \"right\": number, \"bottom\": number, \"width\": number, \"height\": number}"
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