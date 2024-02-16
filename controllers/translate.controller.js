// import openai from 'openai';
// import fs from 'fs';

// // Initialize OpenAI client with your API key
// const openaiClient = new openai.OpenAI({ apiKey: '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' });

// export const textToSpeechFun = async (req, res, next) => {
//     try {
//         const { text } = req.body;

//         // Generate speech using the ChatGPT API
//         const response = await openaiClient.audio.speech.create({
//             model: 'tts-1',
//             voice: 'alloy',
//             input: 'Today is friday',
//         });

//         // Log the response to inspect its structure
//         console.log(response);

//         // Check if the response contains the audio content
//         if (!response.audio) {
//             throw new Error('Audio content not found in the response');
//         }

//         // Get the audio content from the response
//         const audioContent = response.audio;

//         // Save the audio to a file
//         const audioFilePath = './audio.mp3'; // Provide a valid path where the file can be created
//         fs.writeFileSync(audioFilePath, audioContent, 'base64');

//         console.log('Audio saved successfully:', audioFilePath);
//         res.json({ audioUrl: audioFilePath }); // Send back the URL of the saved audio file
//     } catch (error) {
//         console.error('Text-to-speech error:', error);
//         res.status(500).json({ error: 'An error occurred during text-to-speech conversion' });
//     }
// }




// import fs from "fs";
// import path from "path";
// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey:'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' });
// const speechFile = path.resolve("./speech.mp3");
// export const textToSpeechFun = async () => {
//     const mp3 = await openai.audio.speech.create({
//         model: "tts-1",
//         voice: "alloy",
//         input: "Today is a wonderful day to build something people love!",
//       });
//       console.log(speechFile);
//       const buffer = Buffer.from(await mp3.arrayBuffer());
//       await fs.promises.writeFile(speechFile, buffer);
// }



import OpenAI from "openai";
import { storage } from "../storage.js";
import dotenv from 'dotenv';
dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

export const textToSpeechFun = async (req, res, next) => {
    try {
        const { text } = req.body;

        // Generate speech using the ChatGPT API
        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'onyx',
            input: text,
        });

        console.log(mp3);

        // Check if the response contains the audio content
        if (!mp3) {
            throw new Error('Audio content not found in the response');
        }

        // Convert audio content to a Buffer
        // const audioBuffer = Buffer.from(response.audioContent, 'base64');
        const buffer = Buffer.from(await mp3.arrayBuffer());

        // Define the path to save the audio file in Firebase Storage
        const fileName = `${Date.now()}_speech.mp3`;
        const file = storage.file(fileName);

        // Upload the audio file to Firebase Storage
        await file.save(buffer, {
            metadata: {
                contentType: 'audio/mpeg',
            },
        });

        // Get the download URL of the uploaded audio file
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2500', // Optional expiration date for the URL
        });

        console.log('Audio file uploaded to Firebase Storage:', url);

        // Send the download URL back to the client
        res.json({ audioUrl: url });
    } catch (error) {
        console.error('Text-to-speech error:', error);
        res.status(500).json({ error: 'An error occurred during text-to-speech conversion' });
    }
};

  