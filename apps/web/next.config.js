/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
const nextConfig = {
  turbopack: {
    root: path.join(__dirname, '../..')
  }
};

export default withFlowbiteReact(nextConfig);