"use client";

import axios from "axios";
import { useOnClickOutside } from "@/hooks";
import { Command } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Prisma, Subreddit } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { Users } from "lucide-react";

import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";

const SearchBar = () => {
  const [input, setInput] = useState<string>("");
  const commandRef = useRef<HTMLDivElement>(null);
  const [debouncedInput, setDebouncedInput] = useState<string>("");

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedInput(input);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [input]);

  useEffect(() => {
    setInput("");
  }, [pathname]);

  const {
    data: queryResults,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!debouncedInput) return [];

      const { data } = await axios.get(`/api/search?q=${debouncedInput}`);

      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
    queryKey: ["search-query", debouncedInput],
    enabled: !!debouncedInput,
  });

  useOnClickOutside(commandRef, () => {
    setInput("");
  });

  return (
    <Command
      ref={commandRef}
      className="relative rounded-lg border max-w-[200px] md:max-w-[300px] xl:max-w-[500px] z-50 overflow-visible"
    >
      <CommandInput
        value={input}
        onValueChange={setInput}
        isLoading={isFetching}
        className="outline-none border-none focus:outline-none focus:border-none ring-0"
        placeholder="Search communities..."
      />

      {input.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}

          {(queryResults?.length ?? 0) > 0 && (
            <CommandGroup heading="Communities">
              {queryResults?.map((subreddit) => (
                <CommandItem
                  key={subreddit.id}
                  value={subreddit.name}
                  onSelect={(e) => {
                    router.push(`/r/${e}`);
                    router.refresh();
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
};

export default SearchBar;
