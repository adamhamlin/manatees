import {
  blackCardInputSchema,
  blackCardSchema,
  customDeckInputSchema,
  customDeckWithCardsSchema,
  customDeckUpdateSchema,
  deckWithCardsSchema,
  deckSearchHitSchema,
  cardTextDecksQuerySchema,
  whiteCardInputSchema,
  whiteCardSchema,
} from '@manatees/shared/types';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { FastifyInstance } from 'super-simple-fastify-server';
import { z } from 'zod';

import { getZodResponseSchema, zodSuccessResponseSchema } from '@common/utils/utils';

import { CardsService } from './cards.service';

const cardsService = new CardsService(); // TODO: Dependency injection?
const deckIdParamsSchema = z.strictObject({ deckId: z.coerce.number().int().positive() });
const cardParamsSchema = deckIdParamsSchema.extend({ cardId: z.coerce.number().int().positive() });

export async function cardsRoutes(app: FastifyInstance): Promise<void> {
  // Set up auth for these routes
  app.requireAuthentication(app);

  /**
   * Get all available decks
   */
  app.withTypeProvider<ZodTypeProvider>().get(
    '/cards/decks',
    {
      schema: {
        response: getZodResponseSchema(
          z.strictObject({
            decks: z.array(deckSearchHitSchema),
          })
        ),
      },
    },
    async (_request, _reply) => {
      return { decks: await cardsService.getDecks() };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    '/cards/decks/mine',
    {
      schema: { response: getZodResponseSchema(z.strictObject({ decks: z.array(deckSearchHitSchema) })) },
    },
    async (request) => ({ decks: await cardsService.getOwnedDecks(request.auth.userId) })
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    '/cards/card-text-decks',
    {
      schema: {
        querystring: cardTextDecksQuerySchema,
        response: getZodResponseSchema(z.strictObject({ deckNames: z.array(z.string()) })),
      },
    },
    async (request) => ({
      deckNames: await cardsService.getDecksContainingCardText(
        request.query.type,
        request.query.content,
        request.query.excludeDeckId
      ),
    })
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    '/cards/decks',
    {
      schema: {
        body: customDeckInputSchema,
        response: getZodResponseSchema(customDeckWithCardsSchema),
      },
    },
    async (request) => cardsService.createDeck(request.auth.userId, request.body)
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    '/cards/decks/:deckId',
    {
      schema: {
        params: deckIdParamsSchema,
        response: getZodResponseSchema(deckWithCardsSchema),
      },
    },
    async (request) => cardsService.getDeckById(request.params.deckId)
  );

  app.withTypeProvider<ZodTypeProvider>().patch(
    '/cards/decks/:deckId',
    {
      schema: {
        params: deckIdParamsSchema,
        body: customDeckUpdateSchema,
        response: getZodResponseSchema(customDeckWithCardsSchema),
      },
    },
    async (request) => cardsService.updateDeck(request.params.deckId, request.auth.userId, request.body)
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    '/cards/decks/:deckId',
    {
      schema: { params: deckIdParamsSchema, response: zodSuccessResponseSchema },
    },
    async (request) => {
      await cardsService.deleteDeck(request.params.deckId, request.auth.userId);
      return { success: true };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    '/cards/decks/:deckId/white-cards',
    {
      schema: {
        params: deckIdParamsSchema,
        body: whiteCardInputSchema,
        response: getZodResponseSchema(whiteCardSchema),
      },
    },
    async (request) => cardsService.createWhiteCard(request.params.deckId, request.auth.userId, request.body.content)
  );

  app.withTypeProvider<ZodTypeProvider>().patch(
    '/cards/decks/:deckId/white-cards/:cardId',
    {
      schema: {
        params: cardParamsSchema,
        body: whiteCardInputSchema,
        response: zodSuccessResponseSchema,
      },
    },
    async (request) => {
      await cardsService.updateWhiteCard(
        request.params.deckId,
        request.params.cardId,
        request.auth.userId,
        request.body.content
      );
      return { success: true };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    '/cards/decks/:deckId/white-cards/:cardId',
    {
      schema: { params: cardParamsSchema, response: zodSuccessResponseSchema },
    },
    async (request) => {
      await cardsService.deleteWhiteCard(request.params.deckId, request.params.cardId, request.auth.userId);
      return { success: true };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    '/cards/decks/:deckId/black-cards',
    {
      schema: {
        params: deckIdParamsSchema,
        body: blackCardInputSchema,
        response: getZodResponseSchema(blackCardSchema),
      },
    },
    async (request) =>
      cardsService.createBlackCard(
        request.params.deckId,
        request.auth.userId,
        request.body.content,
        request.body.pickCount
      )
  );

  app.withTypeProvider<ZodTypeProvider>().patch(
    '/cards/decks/:deckId/black-cards/:cardId',
    {
      schema: {
        params: cardParamsSchema,
        body: blackCardInputSchema,
        response: zodSuccessResponseSchema,
      },
    },
    async (request) => {
      await cardsService.updateBlackCard(
        request.params.deckId,
        request.params.cardId,
        request.auth.userId,
        request.body.content,
        request.body.pickCount
      );
      return { success: true };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    '/cards/decks/:deckId/black-cards/:cardId',
    {
      schema: { params: cardParamsSchema, response: zodSuccessResponseSchema },
    },
    async (request) => {
      await cardsService.deleteBlackCard(request.params.deckId, request.params.cardId, request.auth.userId);
      return { success: true };
    }
  );
}
