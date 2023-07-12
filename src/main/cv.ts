import cv, {Mat} from "opencv-ts";

export interface ImageData {
  width: number
  height: number
  data: Uint8Array
}


export function cvMatFromImage (img: ImageData) {
  const mat = new cv.Mat(img.height, img.width, cv.CV_8UC4)
  mat.data.set(img.data)

  return mat
}

export function ImageDataFromMat(mat: Mat){
   return new ImageData(
    new Uint8ClampedArray(mat.data),
    mat.cols,
    mat.rows
  );
}
