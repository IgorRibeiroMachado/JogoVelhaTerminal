import chalk from 'chalk';
import readline from 'readline';
import { stdin, stdout } from 'node:process';

const BOARD_LINES_QUANTITY = 3;
const BOARD_COLUMNS_QUANTITY = 3;
const WIN_MATCH_QUANTITY = 3;

const EMPTY_OPTION = ' ';
const X_OPTION = 'X';
const O_OPTION = 'O';

function createBoard(linesQuantity: number, columnsQuantity: number) {
  const board: string[][] = [];

  for (let line = 0; line < linesQuantity; line++) {
    const row: string[] = [];

    for (let column = 0; column < columnsQuantity; column++) {
      row.push(EMPTY_OPTION);
    }

    board.push(row);
  }

  return [...board];
}

function showBoard(board: string[][]) {
  console.clear();
  console.log('\n-----------------');
  console.log('| JOGO DA VELHA |');
  console.log('-----------------\n');

  let headerLine = '';
  for (let index = 0; index < 3; index++) {
    headerLine += ` ${chalk.blue(index)} |`;
  }
  console.log(`  |${headerLine}`);
  for (let line = 0; line < board.length; line++) {
    console.log('- |---|---|---|');
    console.log(`${chalk.blue(line)} | ${board[line].join(' | ')} |`);
  }
  console.log('  |---|---|---|\n\n\n');
}

function insertBoardOption(
  board: string[][],
  line: number,
  column: number,
  option: string,
) {
  board[line][column] = option;
}

function validateCoordinate(board: string[][], line: number, column: number) {
  const isLineAllowed = line >= 0 && line < BOARD_LINES_QUANTITY;
  const isColumnAllowed = column >= 0 && column < BOARD_COLUMNS_QUANTITY;

  if (!isLineAllowed || !isColumnAllowed) return false;

  const isEmptyOption = board[line][column] === EMPTY_OPTION;
  const isValidCoordinate = isEmptyOption && isLineAllowed && isColumnAllowed;

  return isValidCoordinate;
}

function askFor(question: string) {
  return new Promise<string>((resolve, reject) => {
    const rl = readline.createInterface({ input: stdin, output: stdout });

    rl.question(question, (answer: string) => {
      resolve(answer);
      rl.close();
    });
  });
}

async function askForCoordinates(
  board: string[][],
  currentPlayer: string,
): Promise<{ currentLine: number; currentColumn: number }> {
  let isCoordinateValid: boolean = false;

  let currentLine: number = 0;
  let currentColumn: number = 0;

  while (!isCoordinateValid) {
    console.log(`\Player ${currentPlayer}`);
    currentLine = Number(await askFor('Line: '));
    currentColumn = Number(await askFor('Column: '));

    isCoordinateValid = validateCoordinate(board, currentLine, currentColumn);

    if (!isCoordinateValid)
      console.log('\nInvalid coordinate, please try again');
  }

  return { currentLine, currentColumn };
}

function verifyWinner(board: string[][]) {
  const hasWinnerOnLine = verifyLines(board);
  const hasWinnerOnColumns = verifyColumns(board);
  const hasWinnerOnDiagonals = verifyDiagonals(board);

  const hasWinner =
    hasWinnerOnLine || hasWinnerOnColumns || hasWinnerOnDiagonals;

  return hasWinner;
}

function verifyLines(board: string[][]) {
  let hasWinner: boolean = false;
  let lineQuantityMatch = 1;

  for (let line = 0; line < BOARD_LINES_QUANTITY; line++) {
    const firstLineOption = board[line][0];
    const secondColumn = 1;

    for (let column = secondColumn; column < BOARD_COLUMNS_QUANTITY; column++) {
      const emptyOption = board[line][column] === EMPTY_OPTION;
      const optionMatch =
        firstLineOption === board[line][column] && !emptyOption;

      if (optionMatch) lineQuantityMatch++;
    }

    if (lineQuantityMatch === WIN_MATCH_QUANTITY) {
      hasWinner = true;
      break;
    }

    lineQuantityMatch = 1;
  }

  return hasWinner;
}

function verifyColumns(board: string[][]) {
  let hasWinner: boolean = false;
  let columnQuantityMatch = 0;

  for (let column = 0; column < BOARD_COLUMNS_QUANTITY; column++) {
    const firstColumnOption = board[0][column];
    const secondLine = 1;

    for (let line = secondLine; line < BOARD_LINES_QUANTITY; line++) {
      const emptyOption = board[line][column] === EMPTY_OPTION;
      const optionMatch =
        firstColumnOption === board[line][column] && !emptyOption;

      if (optionMatch) columnQuantityMatch++;
    }

    if (columnQuantityMatch === WIN_MATCH_QUANTITY) {
      hasWinner = true;
      break;
    }

    columnQuantityMatch = 0;
  }

  return hasWinner;
}

function verifyDiagonals(board: string[][]) {
  const hasDiagonalPrincipalWinner = verifyDiagonalPrincipal(board);
  const hasSecondaryDiagonalWinner = verifyDiagonalSecundary(board);

  const hasWinner = hasDiagonalPrincipalWinner || hasSecondaryDiagonalWinner;

  return hasWinner;
}

function verifyDiagonalPrincipal(board: string[][]) {
  const firstDiagonalOption = board[0][0];
  const secondDiagonalOption = board[1][1];
  const thirdDiagonalOption = board[2][2];

  const hasWinner: boolean =
    firstDiagonalOption === secondDiagonalOption &&
    secondDiagonalOption === thirdDiagonalOption &&
    thirdDiagonalOption !== EMPTY_OPTION;

  return hasWinner;
}

function verifyDiagonalSecundary(board: string[][]) {
  const firstDiagonalOption = board[0][2];
  const secondDiagonalOption = board[1][1];
  const thirdDiagonalOption = board[2][0];

  const hasWinner: boolean =
    firstDiagonalOption === secondDiagonalOption &&
    secondDiagonalOption === thirdDiagonalOption &&
    thirdDiagonalOption !== EMPTY_OPTION;

  return hasWinner;
}

function verifyDraw(board: string[][], hasWinner: boolean) {
  const totalOptions = BOARD_COLUMNS_QUANTITY * BOARD_LINES_QUANTITY;
  let optionFilled = 0;

  board.forEach((line) => {
    line.forEach((option) => {
      if (option !== EMPTY_OPTION) optionFilled++;
    });
  });

  const hasDraw = !hasWinner && optionFilled === totalOptions;

  return hasDraw;
}

async function main() {
  const board = createBoard(BOARD_LINES_QUANTITY, BOARD_COLUMNS_QUANTITY);
  showBoard(board);

  let playerX = X_OPTION;
  let playerO = O_OPTION;

  let firstPlayer = playerX;

  let currentPlayer = firstPlayer;

  while (true) {
    const { currentLine, currentColumn } = await askForCoordinates(
      board,
      currentPlayer,
    );

    insertBoardOption(board, currentLine, currentColumn, currentPlayer);
    showBoard(board);

    const hasWinner = verifyWinner(board);
    const hasDraw = verifyDraw(board, hasWinner);

    if (hasWinner) {
      console.log('\n', chalk.green(`The player ${currentPlayer} wins!`));
      break;
    }

    if (hasDraw) {
      console.log(`\nThe game tied!`);
      break;
    }

    currentPlayer = currentPlayer === playerX ? playerO : playerX;
  }
}

main();
