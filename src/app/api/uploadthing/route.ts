import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "@/app/api/uploadthing/core";

// export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
