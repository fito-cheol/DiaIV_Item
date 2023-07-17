import item_dict from './data/item.json'
import { compareTwoStrings } from 'string-similarity';

class Item{
  equipment:string // 부위
  power_level:string // 신성 선조
  quality:string // 등급
  power:number // 위력
  options:Option[]
  required_level: number // 요구 레벨
  character_class:string // 직업
  texts:string[]

  constructor(texts:string[]){
    this.equipment = ""
    this.power_level = ""
    this.quality = ""
    this.power = 0
    this.options = []
    this.required_level = 0
    this.character_class = ""

    this.texts = texts
    this.set_equipment()
    this.set_power_level()
    this.set_quality()
    this.set_power()
    this.set_options()
    this.set_required_level()
    this.set_character_class()

  }
  toString():string {
    let repr_string = ""
    repr_string += `${this.power_level || '일반'} ${this.quality || ''} ${this.equipment || ''} \n`
    repr_string += `위력: ${this.power} \n`

    this.options.forEach(option => {
      repr_string += option.toString() + '\n'
    })

    repr_string += `레벨 제한: ${this.required_level} \n`
    repr_string += `직업 제한: ${this.character_class} \n`

    return repr_string
  }
  set_equipment(){
    this.texts.forEach(text => {
      text = text.trim()
      item_dict['equipment'].forEach(search_key => {
        if (text.includes(search_key)){
          this.equipment = search_key
          return
        }
      })
    })
  }
  set_power_level(){
    this.texts.forEach(text => {
      text = text.trim()
      item_dict['power_level'].forEach(search_key => {
        if (text.includes(search_key)){
          this.power_level = search_key
          return
        }
      })
    })
  }
  set_quality(){
    this.texts.forEach(text => {
      text = text.trim()
      item_dict['quality'].forEach(search_key => {
        if (text.includes(search_key)){
          this.quality = search_key
          return
        }
      })
    })
  }
  set_options(){
    this.texts.forEach((text,index)=>{
      text = text.trim()
      item_dict['option'].forEach(search_key => {
        const front_key = search_key.slice(0,19)
        const ratio:number = compareTwoStrings(text.slice(0, front_key.length+1), front_key)
        if (ratio < 0.93) {
          return // == continue
        }
        const next_line = this.texts[index+1].trim()
        const use_two_line = next_line.includes(']') && !text.includes(']')
        let option_text = text
        if (use_two_line){
          option_text += next_line
        }
        this.options.push(new Option(option_text, search_key))
      })
    })
  }
  set_power(){
    this.texts.forEach(text => {
      text = text.trim()
      item_dict['power'].forEach(search_key => {
        if (text.includes(search_key)){
          this.power = Number(get_numbers_from_string(text)[0])
          return
        }
      })
    })
  }

  set_required_level(){
    this.texts.forEach(text => {
      text = text.trim()
      item_dict['required_level'].forEach(search_key => {
        if (text.includes(search_key)){
          this.required_level = Number(get_numbers_from_string(text)[0])
          return
        }
      })
    })
  }
  set_character_class(){
    this.texts.forEach(text => {
      text = text.trim()
      item_dict['character_class'].forEach(search_key => {
        if (text.includes(search_key)){
          this.character_class = search_key
          return
        }
      })
    })
  }
}

interface ItemCriteriaObject{
  equipment:string // 부위
  power:number // 위력
  options:{
    text: string,
    search_key:string
  }[]
  required_level: number // 요구 레벨
  character_class:string // 직업
}

class ItemCriteria{
  equipment:string // 부위
  power:number // 위력
  options:Option[]
  required_level: number // 요구 레벨
  character_class:string // 직업
  min_matching_option_count:number

  constructor(json_data:ItemCriteriaObject, min_matching_option_count=3){
    this.equipment = json_data.equipment;
    this.power = json_data.power;
    this.options = json_data.options.map(option=> new Option(option.text, option.search_key));
    this.required_level = json_data.required_level;
    this.character_class = json_data.character_class;

    this.min_matching_option_count = min_matching_option_count
  }
  compare_with(item:Item){
    if (this.equipment){
      const matched_equipment = this.equipment == item.equipment
      if (!matched_equipment){
        return false
      }
    }

    if (this.required_level){
      const matched_required_level = this.required_level == item.required_level
      if (!matched_required_level){
        return false
      }
    }
    if (this.power){
      const matched_power = this.power == item.power
      if (!matched_power){
        return false
      }
    }
    if (this.character_class){
      const matched_character_class = this.character_class == item.character_class
      if (!matched_character_class){
        return false
      }
    }
    const matched_options = []
    this.options.forEach(option_criteria => {
      item.options.forEach(option_item => {
        if (option_item.isGreateEqualThanOther(option_criteria)){
          matched_options.push(option_criteria)
        }

      })
    })
    if (matched_options.length < this.min_matching_option_count){
      return false
    }

    return true
  }
}

type Grade= 1 | 0 | -1

class Option{
  grade:Grade
  text:string
  search_key:string
  constructor(text:string ,search_key:string){
    this.text = text
    this.search_key=search_key
    this.grade = 0
    this.set_grade()
  }

  set_grade(){
    const noLeftBraket = !(this.text.includes("["))
    const noRightBraket = !(this.text.includes("]"))
    if (noLeftBraket && noRightBraket){
      return
    }

    const numbers = get_numbers_from_string(this.text)

    if ( numbers.length == 2){
      this.grade = 1
    }else if (numbers.length == 3){
      const [value, min, max] = numbers.map(number => Number(number))
      const good_criteria =  min + (max - min) * 0.8
      const average = (min + max) /2
      if (value >= good_criteria){
        this.grade = 1
      }else if (value >= average){
        this.grade = 0
      }else{
        this.grade = -1
      }
    }else{
      return;
    }
  }

  isGreateEqualThanOther(other:Option){
    const isSameKey = this.search_key == other.search_key
    const ge_grade = this.grade > other.grade
    return isSameKey && ge_grade
  }
  toString(){
    if (this.grade){
      return this.search_key + `, 등급: {this.grade}`
    }
    return this.text
  }

  is_good(){
    return this.grade == 1
  }

  is_bad(){
    return this.grade == -1
  }
}
function get_numbers_from_string(text:string):string[]{
  const regex = /\d+\.\d+|\d+/g;
  const numbers = text.match(regex);
  if (numbers == null){
    return []
  }
  return numbers
}



export default Item
