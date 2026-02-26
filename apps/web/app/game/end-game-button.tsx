"use client";
import { Socket } from "socket.io-client";
import { useSocket } from "../socketContext";
import Link from "next/link";
import { Nullable } from "@repo/shared-types";
import { Modal, ModalHeader, ModalBody } from "flowbite-react";
import { useState } from "react";

// TODO:
// - create modal to confirm if player wants to end the game (DONE)
// - send alert to opponent (if exists), that game is over, send 'events' msg to reset

const endGame = (socket: Nullable<Socket>) => {
  if (socket) {
    socket.emit("gameEnded");
  }
};

export function EndGameButton() {
  const { socket } = useSocket();
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      {/* Modal Toggle */}
      <button
        type="button"
        onClick={() => setOpenModal(true)}
        className="text-white bg-lipstick-red py-2 px-4 rounded shadow-md"
      >
        End
      </button>

      {/* Modal */}
      <Modal
        dismissible
        show={openModal}
        size="lg"
        onClose={() => setOpenModal(false)}
        popup
      >
        <ModalHeader className="bg-black rounded-t-md"></ModalHeader>
        <ModalBody className="bg-black rounded-b-md">
          <div className="space-y-4 md:space-y-4 text-center">
            <h3 className="mb-6 font-medium text-lg text-light-orange tracking-wider">
              Are you sure?
            </h3>
            <div className="flex items-center space-x-4 justify-center">
              <Link href={{ pathname: `/` }}>
                <button
                  type="button"
                  className="bg-light-green box-border border rounded shadow-md font-bold uppercase leading-5 rounded-base text-sm px-4 py-2.5"
                  onClick={() => {
                    setOpenModal(false);
                    endGame(socket);
                  }}
                >
                  Yes
                </button>
              </Link>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
