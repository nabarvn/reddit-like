"use client";

import dynamic from "next/dynamic";
import { EditorSkeleton } from "@/components";

import {
  CustomCodeRenderer,
  CustomImageRenderer,
} from "@/components/renderers";

interface EditorOutputProps {
  content: any;
}

const Output = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  { ssr: false, loading: () => <EditorSkeleton /> }
);

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
};

const style = {
  paragraph: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    marginTop: "2rem",
  },
};

const EditorOutput = ({ content }: EditorOutputProps) => {
  return (
    <Output
      data={content}
      renderers={renderers}
      style={style}
      className="text-sm"
    />
  );
};

export default EditorOutput;
