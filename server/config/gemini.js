import axios from "axios";

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const ai = {
  models: {
    generateContent: async function ({ model, contents, config }) {
      let promptText = "";
      
      if (typeof contents === "string") {
        promptText = contents;
      } else if (Array.isArray(contents)) {
        promptText = contents.map(item => {
          if (typeof item === "string") return item;
          if (item.text) return item.text;
          if (item.parts) {
            return item.parts.map(p => p.text || "").join("\n");
          }
          return JSON.stringify(item);
        }).join("\n");
      } else if (contents && contents.text) {
        promptText = contents.text;
      } else {
        promptText = JSON.stringify(contents || "");
      }

      console.log(`[Groq Adapter] Routing generation to Groq API using model: ${GROQ_MODEL}`);

      try {
        const payload = {
          model: GROQ_MODEL,
          messages: [
            {
              role: "user",
              content: promptText,
            }
          ],
          temperature: 0.7,
        };

        if (config && config.responseMimeType === "application/json") {
          payload.response_format = { type: "json_object" };
        }

        const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", payload, {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          }
        });

        const responseText = res.data.choices[0].message.content;
        return {
          text: responseText,
        };
      } catch (err) {
        console.error("Groq API Request Failed:", err.response?.data || err.message);
        throw new Error(err.response?.data?.error?.message || "Failed to communicate with Groq API.");
      }
    },

    generateContentStream: async function ({ model, contents, config }) {
      console.log(`[Groq Adapter] Initiating stream simulation using model: ${GROQ_MODEL}`);
      
      // Get the full response first using the generateContent helper
      const fullRes = await this.generateContent({ model, contents, config });
      const text = fullRes.text;

      // Yield the text in chunks of 5 words to simulate real-time streaming
      const words = text.split(" ");
      
      async function* streamGenerator() {
        for (let i = 0; i < words.length; i += 5) {
          const chunkText = words.slice(i, i + 5).join(" ") + (i + 5 < words.length ? " " : "");
          yield { text: chunkText };
          // Yield chunk every 30ms to make it smooth
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }

      return streamGenerator();
    }
  }
};

export default ai;