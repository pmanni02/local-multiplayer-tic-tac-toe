// TODO: move to backend
export const gameTie = (squares: string[]): boolean => {
  const emptySquares = squares.filter((val) => val === "");
  if (emptySquares.length === 0) {
    return true;
  }
  return false;
};

export const gameWon = (squares: string[]): boolean => {
  // if values at 0,1,2 OR 3,4,5 OR 6,7,8 are all the same (rows)
  // if values at 0,3,6 OR 1,4,7 OR 2,5,8 are all the same (cols)
  // if values at 0,4,8 OR 2,4,6 are all the same (diagonals)
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let gameOver = false;
  winConditions.forEach((winCondition) => {
    const [x, y, z] = winCondition;
    const validWinCondition =
      squares[x!] !== "" &&
      squares[x!] === squares[y!] &&
      squares[y!] === squares[z!];
    if (validWinCondition) {
      gameOver = true;
      return;
    }
  });
  return gameOver;
};
