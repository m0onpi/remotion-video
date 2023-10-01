/* eslint-disable camelcase */
import axios from 'axios';
import fs from 'fs';
import stream from 'stream';
import util from 'util';
import { createClient } from 'pexels';
import mp3DurationCallback from 'mp3-duration';
const pipeline = util.promisify(stream.pipeline);
import dotenv from 'dotenv';
dotenv.config()
const pexelsClient = createClient(process.env.PEXELS_API);
const query = 'chess'; // You can change this to 'trading' or 'chess' based on your requirement
import GoogleImages from 'google-images'
 
const client = new GoogleImages('608eee7ab09b3468c', 'AIzaSyBDoZTBa5HTt1uEZO4v2mV_1KbckfnfovA');
 
const chessQuotes = [
  'Napoleon  once said, "Chess is too difficult to be a game and not serious enough to be a science or an art.", this is correct and theres nothing we can do... . - Napoleon '

]


async function getTextToAudio(quote, i) {
  const url = 'https://api.elevenlabs.io/v1/text-to-speech/vfrlM9UWHpCx3WxeFikZ/stream';
  const headers = {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': process.env.ELEVEN_LABS
  };
  const quoteJson = { text: quote };

  const response = await axios.post(url, quoteJson, {
    headers: headers,
    responseType: 'stream'  
  });


  const audioFilePath = `public/output_0.mp3`;
  console.log(response.data)
  await pipeline(response.data, fs.createWriteStream(audioFilePath));
  return audioFilePath;
}

async function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    mp3DurationCallback(filePath, (err, duration) => {
      if (err) reject(err);
      else resolve(duration);
    });
  });
}

async function getVideoUrls(videoCount, query) {
  const videos = await pexelsClient.videos.search({
    query,
    orientation: 'portrait',
    size: 'large',
  });

  const videoUrls = [];

  for (let i = 0; i < videoCount; i++) {
    const randomIndex = Math.floor(Math.random() * videos.videos.length);
    const videoUrl = videos.videos[randomIndex].video_files[0].link;
    videoUrls.push(videoUrl);
  }

  return videoUrls;
}

async function processVideoUrls(videoUrls, audioFilePath, audioDuration, quote, logoName, person,personImage) {
  const data = {
    audioFilePath,
    audioFileLengthInSeconds: Math.round(audioDuration),
    videoUrls,
    text: quote,
    logo: logoName,
    person,
    personImage,
  };

  return data;
}

async function main() {
  const result = chessQuotes[0];

  const quote = result.split(' - ')[0];
  const person = result.split(' - ')[1];
  console.log(person)
  const audioFilePath = await getTextToAudio(quote);
  const audioDuration = await getAudioDuration(audioFilePath);

  // Determine the number of videos required based on the audio duration divided by 3 (rounded up)
  const videoCount = Math.ceil(audioDuration / 3) ;

  const videoUrls = await getVideoUrls(videoCount, query);
  const personImage = await client.search(person)
.then(images => { return images[0]})
  const data = await processVideoUrls(videoUrls, audioFilePath, audioDuration, quote, result.logoName, person,personImage);

  fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
}

main().catch((error) => {
  console.error(error);
});
