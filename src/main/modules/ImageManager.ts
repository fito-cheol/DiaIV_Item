import cv, {Mat} from "opencv-ts";
import { PNG } from 'pngjs';
import fs from "fs";
import { Rectangle } from "./Coordinate";

class ImageManager{
  image: Mat
  constructor(image: Mat){
    if (!image){
      throw Error('이미지가 없습니다')
    }

    this.image = image;

  }

  get_image(){
    return this.image
  }

  show_shape(){
    return {width:this.image.rows, height: this.image.cols}
  }

  save_image(path:string){
    fs.writeFileSync(path, this.image.data)
  }
  // show_contour
  // show_image
  make_gray_image(){
    let src = this.image
    let dst = new cv.Mat();
    cv.cvtColor(src, dst, cv.COLOR_BGR2GRAY)
    return new ImageManager(dst)
  }

  make_canny_image(min=80, max=150){
    let src = this.image
    let dstGray = new cv.Mat();
    let dstCanny = new cv.Mat();

    cv.cvtColor(src, dstGray, cv.COLOR_BGR2GRAY)

    cv.Canny(src, dstCanny, min, max)
    return new ImageManager(dstCanny)
  }
  draw_rect(rectangle: Rectangle){
    const new_image = this.image.clone()

    const pt1 = new cv.Point(rectangle.get_left_top().x, rectangle.get_left_top().y)
    const pt2 = new cv.Point(rectangle.get_right_bottom().x, rectangle.get_right_bottom().y)

    cv.rectangle(new_image, pt1, pt2, new cv.Scalar(0, 255, 100), 2)

    return new ImageManager(new_image)
  }
  crop_image(rectangle: Rectangle){
    const top_left = rectangle.get_left_top()
    const bottom_right = rectangle.get_right_bottom()

    const crop_img = this.image.colRange(top_left.y, bottom_right.y + 1)
                        .rowRange(top_left.x, bottom_right.x + 1);
    return new ImageManager(crop_img)
  }

  image_finder(img_to_find:ImageManager, method=cv.TM_SQDIFF_NORMED){
    const image = this.image.clone()
    const image_draw = this.image.clone()
    const template = img_to_find.get_image()
    const template_width = img_to_find.show_shape().width
    const template_height =  img_to_find.show_shape().height


    // 템플릿 매칭   ---①
    const result = new cv.Mat()
    cv.matchTemplate(image, template, result, method)
    // 최솟값, 최댓값과 그 좌표 구하기 ---②
    const {minVal, maxVal, minLoc, maxLoc} = cv.minMaxLoc(result)

    let top_left = maxLoc
    let match_val = maxVal
    // TM_SQDIFF의 경우 최솟값이 좋은 매칭, 나머지는 그 반대 ---③
    if (method in [cv.TM_SQDIFF, cv.TM_SQDIFF_NORMED]){
      top_left = minLoc
      match_val = 1 - minVal
    }

    // 매칭 좌표 구해서 사각형 표시   ---④
    const bottom_right = new cv.Point(top_left.x + template_width, top_left.y + template_height)
    cv.rectangle(image_draw, top_left, bottom_right, new cv.Scalar(0, 0, 255), 2)

    // 매칭 포인트 표시 ---⑤
    cv.putText(image_draw, match_val.toString(), top_left, cv.FONT_HERSHEY_PLAIN, 2, new cv.Scalar(0, 255, 0), 1, cv.LINE_AA)

    return {
      image: new ImageManager(image_draw),
      "topLeft": top_left,
      height: template_height,
      width: template_width
    }
  }
  //method_checker
  static newByPath(path:string, width:number, height:number){

    const buffer = fs.readFileSync(path)
    const uint8 = new Uint8Array(buffer)
    console.log(path, width, height)

    let newMat = new cv.Mat(width, height, cv.CV_8U);
    newMat.data.set(uint8)
    return new ImageManager(newMat)
  }
}


export default ImageManager
