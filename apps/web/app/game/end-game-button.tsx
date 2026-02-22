'use client'
import { Socket } from "socket.io-client";
import { useSocket } from "../socketContext";
import Link from "next/link";
import { Nullable } from "@repo/shared-types";
import { Modal, ModalHeader, ModalBody } from 'flowbite-react';
import { useState } from "react";

// TODO:
// - create modal to confirm if player wants to end the game (DONE)
// - send alert to opponent, that game is over, send 'events' msg to reset

const endGame = (socket: Nullable<Socket>) => {
  if (socket) {
    socket.emit("gameEnded");
  }
};

export function EndsGameButton() {
  const { socket } = useSocket();
  const [openModal, setOpenModal] = useState(false)

  return (
    <>
      {/* Modal Toggle */}
      <button type="button" onClick={() => setOpenModal(true)} className="text-white bg-red-500 hover:bg-red-700 py-2 px-4 rounded">Leave Game</button>

      <div className="flex flex-row p-[2px]">
        {/* Modal */}
        <Modal show={openModal} size="lg" className="rounded-md" onClose={() => setOpenModal(false)} popup>
          <ModalHeader>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setOpenModal(false)} className="hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-7 ms-auto inline-flex justify-center items-center">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" /></svg>
                {/* <span className="sr-only">Close modal</span> */}
              </button>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-4 md:space-y-4 text-center">
              <h3 className="mb-6">Are you sure you want to end this game?</h3>
              <div className="flex items-center space-x-4 justify-center">
                <Link href={{ pathname: `/` }}>
                  <button
                    type="button"
                    className="bg-red-500 box-border border border-default-medium rounded hover:bg-red-700 focus:ring-4 focus:ring-danger-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
                    onClick={() => {
                      setOpenModal(false);
                      endGame(socket)
                    }}
                  >Yes
                  </button>
                </Link>
                <button type="button" onClick={() => setOpenModal(false)} className="bg-gray-800 box-border border border-default-medium rounded hover:bg-gray-900 hover:text-heading focus:ring-4 shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Cancel</button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    </>
  );
}
