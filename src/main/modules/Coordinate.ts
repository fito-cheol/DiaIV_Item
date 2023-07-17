
class Coordinate{
  x:number
  y:number

  constructor(x:number, y:number){
    this.x = x
    this.y = y
  }

  add_x(x:number){
    this.x += x
  }
  add_y(y:number){
    this.y += y
  }
  sub(coor:Coordinate):Coordinate{
    const newX = this.x - coor.x
    const newY = this.y - coor.y
    return new Coordinate(newX, newY)
  }
  add(coor:Coordinate):Coordinate{
    const newX = this.x + coor.x
    const newY = this.y + coor.y
    return new Coordinate(newX, newY)
  }
}

class Rectangle{
  top:number
  bottom:number
  left:number
  right:number
  constructor(coordinate1:Coordinate, coordinate2:Coordinate, coordinate3:Coordinate, coordinate4:Coordinate){
    let coordinatesArray = [coordinate1, coordinate2, coordinate3, coordinate4]
    const firstIndices: number[] = coordinatesArray.map(coordinate => coordinate.x)
    const secondIndices: number[] = coordinatesArray.map(coordinate => coordinate.y)
    this.top = Math.min(...secondIndices)
    this.bottom = Math.max(...secondIndices)
    this.left = Math.min(...firstIndices)
    this.right = Math.max(...firstIndices)
  }

  get_left_top(){
    return new Coordinate(this.left, this.top)
  }
  get_right_bottom(){
    return new Coordinate(this.left, this.top)
  }
  get_width(){
    return this.right - this.left
  }
  get_height(){
    return this.bottom - this.top
  }

}

export {Coordinate, Rectangle}
