export class Player {
  name: string;
  colour: "white" | "black";

  constructor(name: string, colour: "white" | "black") {
    this.name = name;
    this.colour = colour;
  }
}
