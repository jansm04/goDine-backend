const openAI = require('openai');
require('dotenv').config();

const openAI_key = process.env.OPENAI_KEY;
const places_key = process.env.PLACES_KEY;

console.log(openAI_key);

const openai = new openAI({ apiKey: openAI_key });


async function callAPI(type, mood) {
    try {
        const ai_response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                "role": "user", 
                // PROMPT: asks for list of restaurant names ready to be parsed
                "content": `Return one line of text consisting of the 5 best ${mood} ${type} restaurants in Toronto. 
                            Include names only, each separated by a '#'.`,
            }]
          });
          // create array of restaurant names
          const text = ai_response.choices[0].message.content;
          const words = text.split('#');

          // map array to place objects using Google Places API
          for (let i = 0; i < words.length; i++) {
            const name = words[i];
            const places_response = await fetch("https://places.googleapis.com/v1/places:searchText", {
              method: "POST",
              body: JSON.stringify({
                textQuery: name,
                locationBias: {
                  circle: {
                    // search for locations exclusively in Toronto, ON
                    center: { latitude: 43.6532, longitude: -79.3832 },
                    radius: 20000.0
                  }
                },
                language_code: "en"
              }),
              headers: {
                "Content-type": "application/json; charset=UTF-8",
                "X-Goog-Api-Key": places_key,
                "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.priceLevel,places.location,places.websiteUri,places.id"
              }
            });
            if (places_response.ok) {
              const json = await places_response.json();
              if (json.places.length == 0) {
                console.log(`No place details found for ${name}.`);
                return;
              }
              words[i] = json.places[0]; // take first result
              console.log(json.places[0]); 
            } else {
              console.log(`An error occurred fetching place details for ${name}.`);
              return;
            } 
          }

        return words;
    } catch (error) {
        console.log("An error occurred fetching the OpenAI response.");
        return error;
    }    
}

module.exports = { callAPI };
