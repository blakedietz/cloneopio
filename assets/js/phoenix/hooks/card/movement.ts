export type Position = {
  x: number,
  y: number
};

export type Displacement = {
  δx: number,
  δy: number
}

export const displacement = (start: Position, end: Position): Displacement => {
  return {
    δx: start.x - end.x,
    δy: start.y - end.y
  };
}

export const hasDisplacement = (displacement: Displacement): boolean => {
  return displacement.δx !== 0 || displacement.δy !== 0;
}

