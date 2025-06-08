"use client";

import axios from "axios";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { PostCreationRequest, PostValidator } from "@/lib/validators/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";

interface EditorProps {
  subredditId: string;
}

const Editor = ({ subredditId }: EditorProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const editorRef = useRef<EditorJS>();
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const [isMounted, setisMounted] = useState<boolean>(false);

  const { startUpload } = useUploadThing("imageUploader");
  const uploadFuncRef = useRef(startUpload);

  useEffect(() => {
    uploadFuncRef.current = startUpload;
  }, [startUpload]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostCreationRequest>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      subredditId,
      title: "",
      content: null,
    },
  });

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    // if `editorRef.current` does not exist, that means Editor is not initialized yet
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          editorRef.current = editor;
        },
        placeholder: "Write here...",
        inlineToolbar: true,
        data: {
          blocks: [],
        },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/link",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const res = await uploadFuncRef.current([file]);

                  if (!res) {
                    return {
                      success: 0,
                    };
                  }

                  return {
                    success: 1,
                    file: {
                      url: (res[0] as unknown as { url: string }).url,
                    },
                  };
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      });
    }
  }, []);

  useEffect(() => {
    // window object will only be defined on the client side
    if (typeof window !== "undefined") {
      setisMounted(true);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_, value] of Object.entries(errors)) {
        toast({
          title: "Something went wrong",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();

      setTimeout(() => {
        // set focus back to title
        titleRef.current?.focus();
      }, 0);
    };

    if (isMounted) {
      init();

      // cleanup process
      return () => {
        // uninitialize the editor
        editorRef.current?.destroy();
        editorRef.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  const { mutate: createPost } = useMutation({
    mutationFn: async ({
      subredditId,
      title,
      content,
    }: PostCreationRequest) => {
      const payload: PostCreationRequest = {
        subredditId,
        title,
        content,
      };

      const { data } = await axios.post("/api/subreddit/post/create", payload);

      return data;
    },
    onError: () => {
      return toast({
        title: "Something went wrong",
        description: "Your post was not published, please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // r/{subredditName}/submit -> r/{subredditName}
      const newPathname = pathname.split("/").slice(0, -1).join("/");
      router.push(newPathname);

      // since nextjs works on cache mechanism
      router.refresh();

      return toast({
        title: "Yayy! 🎊",
        description: "Post has been published successfully.",
      });
    },
  });

  async function onPostSubmit(data: PostCreationRequest) {
    const blocks = await editorRef.current?.save();

    const payload: PostCreationRequest = {
      subredditId,
      title: data.title,
      content: blocks,
    };

    // call the mutate fn
    createPost(payload);
  }

  if (!isMounted) {
    return null;
  }

  // destructure `ref` from the register method in order to use a custom reference variable
  // this approach makes it possible to pass `ref` and {...rest} separately in TextareaAutosize
  const { ref: destructuredTitleRef, ...rest } = register("title");

  return (
    <div className="w-full bg-zinc-50 rounded-lg border border-zinc-200 p-4">
      <form
        id="subreddit-post-form"
        className="w-fit"
        onSubmit={handleSubmit(onPostSubmit)}
      >
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            ref={(e) => {
              // assign ref to react hook form
              destructuredTitleRef(e);

              // use `if` block to make sure that `e` is assigned to `current` only when it exists
              // TS throws an error when value is assigned directly
              if (e) {
                titleRef.current = e;
              }
            }}
            {...rest}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />

          {/* match div id with the editor holder name */}
          <div id="editor" className="min-h-[500px]" />
        </div>
      </form>
    </div>
  );
};

export default Editor;
