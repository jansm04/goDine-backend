const openAI = require('openai');
require('dotenv').config();

const openAI_key = process.env.OPENAI_KEY;
console.log(openAI_key);

const openai = new openAI({ apiKey: openAI_key });


async function callAPI(type, mood) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                "role": "user", 
                "content": `Return one line of text consisting of the 5 best ${mood} ${type} restaurants in Toronto. 
                            Include names only, each separated by a '#'.`,
            }]
          });
          // create array of restaurant names
          const text = response.choices[0].message.content;
          const words = text.split('#');

          for (let i = 0; i < words.length; i++) {
            console.log(`${i+1}. ${words[i]}`);
          }

        return words;
    } catch (error) {
        console.log("An error occurred fetching the OpenAI response.");
        return error;
    }    
}

module.exports = { callAPI };
