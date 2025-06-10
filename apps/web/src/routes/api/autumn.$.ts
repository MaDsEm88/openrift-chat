// routes/api/autumn.$.ts

import { createAPIFileRoute } from "@tanstack/react-start/api";
import { auth } from "~/lib/auth";
import { autumnHandler } from "autumn-js/tanstack";

const handler = autumnHandler({
  identify: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return {
      customerId: session?.user.id,
      customerData: {
        name: session?.user.name,
        email: session?.user.email,
      },
    };
  },
});

export const APIRoute = createAPIFileRoute("/api/autumn/$")(handler);