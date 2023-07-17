import ImageManager from './ImageManager'
import {Coordinate, Rectangle} from './Coordinate'
import { runOCR, save_text, read_text } from './CloudVision'
import Item from './Item'

async function handle_image(file_path:string, width:number, height:number){
  console.time('Execution Time: handle_image');
  const item_box = mark_top_bottom(file_path, width, height, true)
  if (item_box == null){
    console.log('404: Item Box Not Found')
    console.timeEnd('Execution Time: handle_image');
    return;
  }
  const save_image_path = 'item_only.png'
  item_box.save_image(save_image_path)

  const texts = await runOCR(save_image_path)

  const save_text_path = 'item_texts.txt'
  save_text(texts, save_text_path)
  const text_parsed = read_text(save_text_path)
  const item_instance = new Item(text_parsed)
  console.log(item_instance.toString())

  console.timeEnd('Execution Time: handle_image');
}
function mark_top_bottom(image_path:string, width:number, height:number, debug:boolean=false): ImageManager | null{
  const UP_BORDER = ImageManager.newByPath("ref_image/legend_boundary_up.png", 524, 45)
  const DOWN_BORDER = ImageManager.newByPath("ref_image/legend_boundary_down.png", 522, 31)

  const origin_image_manager= ImageManager.newByPath(image_path, width, height)
  const upFound = origin_image_manager.image_finder(UP_BORDER)

  const coordinate1 = new Coordinate(upFound.topLeft.x, upFound.topLeft.y)
  const coordinate2 = new Coordinate(upFound.topLeft.x + upFound.width, upFound.topLeft.y)

  const downFound = origin_image_manager.image_finder(DOWN_BORDER)

  const coordinate3 = new Coordinate(downFound.topLeft.x, downFound.topLeft.y)
  const coordinate4 = new Coordinate(downFound.topLeft.x + downFound.width, downFound.topLeft.y)

  const rectangle = new Rectangle(coordinate1, coordinate2, coordinate3, coordinate4)
  if (debug){
    upFound.image.save_image('output/debug_upFound_norm.png')
    upFound.image.draw_rect(rectangle).save_image('output/debug_upFound_Rect.png')
  }
  if (!check_in_shape([rectangle.get_height(), rectangle.get_width()])){
    console.log("Not in Shape", rectangle.get_height(), rectangle.get_width())
    return null
  }

  const item_box = origin_image_manager.crop_image(rectangle)

  if (debug){
    item_box.save_image('output/debug_itemBox.png')
  }
  return item_box

}

function check_in_shape(shape:number[]){
  const min_height = 330
  const max_height = 900

  const width = 524
  const min_width = 0.9 * width
  const max_width = 1.1 * width

  const is_height_in_range = min_height <= shape[0] && shape[0] <= max_height
  const is_width_in_range = min_width <= shape[1] && shape[1] <= max_width
  return is_height_in_range && is_width_in_range
}


export {handle_image}
