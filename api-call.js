const openAI = require('openai');
require('dotenv').config();

const openAI_key = process.env.OPENAI_KEY;
console.log(openAI_key);

const openai = new openAI({ apiKey: openAI_key });

async function callAPI(type) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                "role": "user", 
                "content": `List the 5 best ${type} restaurants in Toronto. Include names only.`,
            }]
          });
        return response.choices[0].message.content;
    } catch (error) {
        console.log("An error occurred fetching the OpenAI response.");
        return error;
    }    
}

module.exports = { callAPI };
