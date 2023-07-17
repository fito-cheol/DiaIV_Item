import vision, { v1 } from '@google-cloud/vision'
import fs from "fs";
// GOOGLE VISION API KEY MANAGE https://cloud.google.com/vision/docs/setup?hl=ko#windows

const client = new vision.ImageAnnotatorClient()

async function runOCR (fileName= 'output/output.png'): Promise<string> {
  const [result] = await client.textDetection(fileName);
  const detections: any = result.textAnnotations;
  console.log('Text:');
  detections.forEach((text: any) => console.log(text));
  return detections[0].description
}

function save_text(texts:string, filePath:string){
  fs.writeFileSync(filePath, texts)
}
function read_text(filePath:string):string[]{
  const fileData = fs.readFileSync(filePath, 'utf-8')
  const lines = fileData.split('\n');
  return lines
}
export { runOCR, save_text, read_text }

// runOCR()
// npx ts-node ./src/main/CloudVision.ts

// Text:
// {
//   locations: [],
//   properties: [],
//   mid: '',
//   locale: '',
//   description: '뭉치',
//   score: 0,
//   confidence: 0,
//   topicality: 0,
//   boundingPoly: {
//     vertices: [ [Object], [Object], [Object], [Object] ],
//     normalizedVertices: []
//   }
// }
// {
//   locations: [],
//   properties: [],
//   mid: '',
//   locale: '',
//   description: '되돌리기',
//   score: 0,
//   confidence: 0,
//   topicality: 0,
//   boundingPoly: {
//     vertices: [ [Object], [Object], [Object], [Object] ],
//     normalizedVertices: []
//   }
// }
