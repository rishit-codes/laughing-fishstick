import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createAiGatewayProvider } from "@/lib/ai-gateway";

const BodySchema = z.object({
  city: z.string(),
  country: z.string().optional(),
  date: z.string(),
  groupSize: z.number().int().positive(),
  budgetPerPersonUsd: z.number().positive(),
  vibe: z.string().optional(),
});

export const Route = createFileRoute("/api/suggest")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: z.infer<typeof BodySchema>;
        try {
          body = BodySchema.parse(await request.json());
        } catch {
          return new Response("Invalid input", { status: 400 });
        }

        const key = process.env.TRAVELOOP_AI_API_KEY;
        if (!key) return new Response("Missing TRAVELOOP_AI_API_KEY", { status: 500 });

        const gateway = createAiGatewayProvider(key);
        const modelId = process.env.TRAVELOOP_AI_MODEL ?? "gpt-4o-mini";
        const model = gateway(modelId);

        try {
          const { output } = await generateText({
            model,
            output: Output.object({
              schema: z.object({
                suggestions: z
                  .array(
                    z.object({
                      name: z.string().describe("Short activity name, max 6 words"),
                      category: z.enum(["food", "culture", "outdoor", "nightlife", "wellness"]),
                      durationHours: z.number(),
                      costPerPersonUsd: z.number(),
                      time: z.string().describe("HH:MM 24h suggested start time"),
                      why: z.string().describe("One sentence reason this fits the group"),
                    }),
                  )
                  .length(3),
              }),
            }),
            prompt: `Suggest 3 group-friendly activities for a travel group.
City: ${body.city}${body.country ? ", " + body.country : ""}
Date: ${body.date}
Group size: ${body.groupSize}
Per-person daily budget: $${body.budgetPerPersonUsd}
${body.vibe ? "Vibe: " + body.vibe : ""}
Mix categories. Keep names concrete and specific to this city. Times should make sense for one day.`,
          });
          return Response.json(output);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "AI request failed";
          const status = /402/.test(msg) ? 402 : /429/.test(msg) ? 429 : 500;
          return new Response(msg, { status });
        }
      },
    },
  },
});
