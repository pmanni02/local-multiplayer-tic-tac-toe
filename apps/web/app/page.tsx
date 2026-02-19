import Link from "next/link";

export default function Page() {
  return (
    <>
      <div>
        <h1 className="text-2xl">Tic Tac Toe</h1>

        <details className="dropdown w-40">
          <summary className="flex flex-row btn-primary m-1 list-none bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded">
            Game Type
            <svg className="w-4 h-4 ms-1.5 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/></svg>
          </summary>
          <ul className="menu dropdown-content rounded-box z-1 p-2 shadow-sm">
            <Link className="" href="/game"><li>Regular</li></Link>
          </ul>
        </details>
      </div>
    </>
  );
}