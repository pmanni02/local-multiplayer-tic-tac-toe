import { Socket } from "socket.io-client";
import { Square } from "./square";
import { Nullable } from "@repo/shared-types";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useState } from "react";

export function Board({
  squares,
  gameResult,
  connectionMessage,
  playerChar,
  currentPlayer,
  room,
  socket,
}: {
  squares: ("" | "X" | "O")[];
  gameResult: string;
  connectionMessage: string;
  playerChar: string;
  currentPlayer: string;
  room: string;
  socket: Nullable<Socket>;
}) {
  const [closedModal, setClosedModal] = useState(false);
  const isWrongTurn = currentPlayer !== playerChar;

  const click = (index: number): void => {
    if (
      squares[index] ||
      ["WINNER!", "TIE!", "LOSER!"].includes(gameResult) ||
      connectionMessage !== "Game Ready" ||
      isWrongTurn
    ) {
      return;
    } else {
      const squaresCopy: string[] = squares.slice();
      squaresCopy[index] = playerChar;

      // emit message
      if (socket) {
        socket.emit("gameEvent", {
          squares: squaresCopy,
          socketId: socket.id,
          currentPlayer: playerChar === "X" ? "O" : "X",
          room,
        });
      }
    }
  };

  return (
    <div className="flex flex-col">
      <Modal
        dismissible
        show={gameResult !== "" && !closedModal}
        size="lg"
        onClose={() => {
          setClosedModal(true)
        }}
        popup
      >
        <ModalHeader className="bg-transparent rounded-t-md"></ModalHeader>
        <ModalBody className="bg-transparent rounded-b-md">
          <div className="space-y-4 md:space-y-4 text-center">
            <h1 className="mb-6 font-large text-xl text-light-orange tracking-wider">
              {gameResult}
            </h1>
          </div>
        </ModalBody>
      </Modal>

      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square
          value={squares[0]!}
          onClickFn={() => click(0)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[1]!}
          onClickFn={() => click(1)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[2]!}
          onClickFn={() => click(2)}
          isWrongTurn={isWrongTurn}
        />
      </div>
      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square
          value={squares[3]!}
          onClickFn={() => click(3)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[4]!}
          onClickFn={() => click(4)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[5]!}
          onClickFn={() => click(5)}
          isWrongTurn={isWrongTurn}
        />
      </div>
      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square
          value={squares[6]!}
          onClickFn={() => click(6)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[7]!}
          onClickFn={() => click(7)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[8]!}
          onClickFn={() => click(8)}
          isWrongTurn={isWrongTurn}
        />
      </div>
    </div>
  );
}
