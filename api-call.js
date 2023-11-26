const openAI = require('openai');
require('dotenv').config();
const locations = require('./locations');

const openAI_key = process.env.OPENAI_KEY;
const places_key = process.env.PLACES_KEY;

console.log(openAI_key);

const openai = new openAI({ apiKey: openAI_key });

async function callAPI(city, type, mood) {
    try {
        const ai_response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                "role": "user", 
                // PROMPT: asks for list of restaurant names ready to be parsed
                "content": `Return one line of text consisting of the 4 best ${mood} ${type} restaurants in ${city}, Canada. 
                            Include names ONLY, each separated by a '#' symbol.`,
            }]
          });
          // create array of restaurant names
          const text = ai_response.choices[0].message.content;
          console.log("AI Response: " + text);
          const words = text.split('#');
          console.log(words);

          // map array to place objects using Google Places API
          for (let i = 0; i < words.length; i++) {
            const name = words[i];
            const places_response = await fetch("https://places.googleapis.com/v1/places:searchText", {
              method: "POST",
              body: JSON.stringify({
                textQuery: name,
                locationBias: {
                  circle: {
                    center: locations.get(city),
                    radius: 50000.0
                  }
                },
                language_code: "en"
              }),
              headers: {
                "Content-type": "application/json; charset=UTF-8",
                "X-Goog-Api-Key": places_key,
                "X-Goog-FieldMask": 
                  "places.displayName,places.formattedAddress,places.priceLevel," + 
                  "places.location,places.websiteUri,places.id,places.rating"
              }
            });
            if (places_response.ok) {
              const json = await places_response.json();
              // filter out results not in Toronto, ON
              if (!json) {
                console.log(`No json object found for ${name}.`);
                words.splice(i--, 1);
                continue;
              }
              if (json.places.length == 0) {
                console.log(`No place details found for ${name}.`);
                words.splice(i--, 1);
                continue;
              }
              words[i] = json.places[0]; // take first result
              console.log(json.places[0]); 
            } else {
              console.log(`An error occurred fetching the place details.`);
              words.splice(i--, 1);
            } 
          }
        if (words.length > 0) return words;
        else {
          return [{
            id: 'error',
            displayName: { text: 'Could not find any results this time. Please try again.', languageCode: 'en' }
          }];
        }
    } catch (error) {
        console.log(error);
        return [{
          id: 'error',
          displayName: { text: 'A problem occurred while fetching the response. Please try again.', languageCode: 'en' }
        }];
    }    
}

module.exports = { callAPI };
