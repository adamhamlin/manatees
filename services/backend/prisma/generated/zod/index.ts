import type { Prisma } from '@prisma/client';
import { z } from 'zod';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum([
  'ReadUncommitted',
  'ReadCommitted',
  'RepeatableRead',
  'Serializable',
]);

export const DeckScalarFieldEnumSchema = z.enum(['id', 'name', 'watermark', 'type', 'createdBy']);

export const BlackCardScalarFieldEnumSchema = z.enum(['id', 'content', 'pickCount', 'deckId']);

export const WhiteCardScalarFieldEnumSchema = z.enum(['id', 'content', 'deckId']);

export const UserScalarFieldEnumSchema = z.enum([
  'id',
  'googleSub',
  'email',
  'name',
  'displayName',
  'createdAt',
  'updatedAt',
]);

export const InvalidatedSessionScalarFieldEnumSchema = z.enum(['tokenHash', 'createdAt']);

export const SortOrderSchema = z.enum(['asc', 'desc']);

export const QueryModeSchema = z.enum(['default', 'insensitive']);

export const NullsOrderSchema = z.enum(['first', 'last']);

export const DeckTypeSchema = z.enum(['official', 'custom']);

export type DeckTypeType = `${z.infer<typeof DeckTypeSchema>}`;

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// DECK SCHEMA
/////////////////////////////////////////

export const DeckSchema = z.object({
  type: DeckTypeSchema,
  id: z.number().int(),
  name: z.string(),
  watermark: z.string(),
  createdBy: z.string().nullable(),
});

export type Deck = z.infer<typeof DeckSchema>;

/////////////////////////////////////////
// BLACK CARD SCHEMA
/////////////////////////////////////////

export const BlackCardSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  pickCount: z.number().int(),
  deckId: z.number().int(),
});

export type BlackCard = z.infer<typeof BlackCardSchema>;

/////////////////////////////////////////
// WHITE CARD SCHEMA
/////////////////////////////////////////

export const WhiteCardSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  deckId: z.number().int(),
});

export type WhiteCard = z.infer<typeof WhiteCardSchema>;

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string(),
  googleSub: z.string(),
  email: z.string(),
  name: z.string(),
  displayName: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

/////////////////////////////////////////
// INVALIDATED SESSION SCHEMA
/////////////////////////////////////////

export const InvalidatedSessionSchema = z.object({
  tokenHash: z.string(),
  createdAt: z.coerce.date(),
});

export type InvalidatedSession = z.infer<typeof InvalidatedSessionSchema>;

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// DECK
//------------------------------------------------------

export const DeckIncludeSchema: z.ZodType<Prisma.DeckInclude> = z
  .object({
    creator: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    blackCards: z.union([z.boolean(), z.lazy(() => BlackCardFindManyArgsSchema)]).optional(),
    whiteCards: z.union([z.boolean(), z.lazy(() => WhiteCardFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => DeckCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const DeckArgsSchema: z.ZodType<Prisma.DeckDefaultArgs> = z
  .object({
    select: z.lazy(() => DeckSelectSchema).optional(),
    include: z.lazy(() => DeckIncludeSchema).optional(),
  })
  .strict();

export const DeckCountOutputTypeArgsSchema: z.ZodType<Prisma.DeckCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => DeckCountOutputTypeSelectSchema).nullish(),
  })
  .strict();

export const DeckCountOutputTypeSelectSchema: z.ZodType<Prisma.DeckCountOutputTypeSelect> = z
  .object({
    blackCards: z.boolean().optional(),
    whiteCards: z.boolean().optional(),
  })
  .strict();

export const DeckSelectSchema: z.ZodType<Prisma.DeckSelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    watermark: z.boolean().optional(),
    type: z.boolean().optional(),
    createdBy: z.boolean().optional(),
    creator: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    blackCards: z.union([z.boolean(), z.lazy(() => BlackCardFindManyArgsSchema)]).optional(),
    whiteCards: z.union([z.boolean(), z.lazy(() => WhiteCardFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => DeckCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

// BLACK CARD
//------------------------------------------------------

export const BlackCardIncludeSchema: z.ZodType<Prisma.BlackCardInclude> = z
  .object({
    deck: z.union([z.boolean(), z.lazy(() => DeckArgsSchema)]).optional(),
  })
  .strict();

export const BlackCardArgsSchema: z.ZodType<Prisma.BlackCardDefaultArgs> = z
  .object({
    select: z.lazy(() => BlackCardSelectSchema).optional(),
    include: z.lazy(() => BlackCardIncludeSchema).optional(),
  })
  .strict();

export const BlackCardSelectSchema: z.ZodType<Prisma.BlackCardSelect> = z
  .object({
    id: z.boolean().optional(),
    content: z.boolean().optional(),
    pickCount: z.boolean().optional(),
    deckId: z.boolean().optional(),
    deck: z.union([z.boolean(), z.lazy(() => DeckArgsSchema)]).optional(),
  })
  .strict();

// WHITE CARD
//------------------------------------------------------

export const WhiteCardIncludeSchema: z.ZodType<Prisma.WhiteCardInclude> = z
  .object({
    deck: z.union([z.boolean(), z.lazy(() => DeckArgsSchema)]).optional(),
  })
  .strict();

export const WhiteCardArgsSchema: z.ZodType<Prisma.WhiteCardDefaultArgs> = z
  .object({
    select: z.lazy(() => WhiteCardSelectSchema).optional(),
    include: z.lazy(() => WhiteCardIncludeSchema).optional(),
  })
  .strict();

export const WhiteCardSelectSchema: z.ZodType<Prisma.WhiteCardSelect> = z
  .object({
    id: z.boolean().optional(),
    content: z.boolean().optional(),
    deckId: z.boolean().optional(),
    deck: z.union([z.boolean(), z.lazy(() => DeckArgsSchema)]).optional(),
  })
  .strict();

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z
  .object({
    createdDecks: z.union([z.boolean(), z.lazy(() => DeckFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z
  .object({
    select: z.lazy(() => UserSelectSchema).optional(),
    include: z.lazy(() => UserIncludeSchema).optional(),
  })
  .strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
  })
  .strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z
  .object({
    createdDecks: z.boolean().optional(),
  })
  .strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z
  .object({
    id: z.boolean().optional(),
    googleSub: z.boolean().optional(),
    email: z.boolean().optional(),
    name: z.boolean().optional(),
    displayName: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    createdDecks: z.union([z.boolean(), z.lazy(() => DeckFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

// INVALIDATED SESSION
//------------------------------------------------------

export const InvalidatedSessionSelectSchema: z.ZodType<Prisma.InvalidatedSessionSelect> = z
  .object({
    tokenHash: z.boolean().optional(),
    createdAt: z.boolean().optional(),
  })
  .strict();

/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const DeckWhereInputSchema: z.ZodType<Prisma.DeckWhereInput> = z.strictObject({
  AND: z.union([z.lazy(() => DeckWhereInputSchema), z.lazy(() => DeckWhereInputSchema).array()]).optional(),
  OR: z
    .lazy(() => DeckWhereInputSchema)
    .array()
    .optional(),
  NOT: z.union([z.lazy(() => DeckWhereInputSchema), z.lazy(() => DeckWhereInputSchema).array()]).optional(),
  id: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  watermark: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  type: z.union([z.lazy(() => EnumDeckTypeFilterSchema), z.lazy(() => DeckTypeSchema)]).optional(),
  createdBy: z
    .union([z.lazy(() => UuidNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  creator: z
    .union([z.lazy(() => UserNullableScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
    .optional()
    .nullable(),
  blackCards: z.lazy(() => BlackCardListRelationFilterSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardListRelationFilterSchema).optional(),
});

export const DeckOrderByWithRelationInputSchema: z.ZodType<Prisma.DeckOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  watermark: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
  creator: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  blackCards: z.lazy(() => BlackCardOrderByRelationAggregateInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardOrderByRelationAggregateInputSchema).optional(),
});

export const DeckWhereUniqueInputSchema: z.ZodType<Prisma.DeckWhereUniqueInput> = z
  .union([
    z.object({
      id: z.number().int(),
      name: z.string(),
      watermark: z.string(),
    }),
    z.object({
      id: z.number().int(),
      name: z.string(),
    }),
    z.object({
      id: z.number().int(),
      watermark: z.string(),
    }),
    z.object({
      id: z.number().int(),
    }),
    z.object({
      name: z.string(),
      watermark: z.string(),
    }),
    z.object({
      name: z.string(),
    }),
    z.object({
      watermark: z.string(),
    }),
  ])
  .and(
    z.strictObject({
      id: z.number().int().optional(),
      name: z.string().optional(),
      watermark: z.string().optional(),
      AND: z.union([z.lazy(() => DeckWhereInputSchema), z.lazy(() => DeckWhereInputSchema).array()]).optional(),
      OR: z
        .lazy(() => DeckWhereInputSchema)
        .array()
        .optional(),
      NOT: z.union([z.lazy(() => DeckWhereInputSchema), z.lazy(() => DeckWhereInputSchema).array()]).optional(),
      type: z.union([z.lazy(() => EnumDeckTypeFilterSchema), z.lazy(() => DeckTypeSchema)]).optional(),
      createdBy: z
        .union([z.lazy(() => UuidNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      creator: z
        .union([z.lazy(() => UserNullableScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
        .optional()
        .nullable(),
      blackCards: z.lazy(() => BlackCardListRelationFilterSchema).optional(),
      whiteCards: z.lazy(() => WhiteCardListRelationFilterSchema).optional(),
    })
  );

export const DeckOrderByWithAggregationInputSchema: z.ZodType<Prisma.DeckOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  watermark: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
  _count: z.lazy(() => DeckCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => DeckAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => DeckMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => DeckMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => DeckSumOrderByAggregateInputSchema).optional(),
});

export const DeckScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.DeckScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => DeckScalarWhereWithAggregatesInputSchema),
        z.lazy(() => DeckScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => DeckScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => DeckScalarWhereWithAggregatesInputSchema),
        z.lazy(() => DeckScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
    name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    watermark: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    type: z.union([z.lazy(() => EnumDeckTypeWithAggregatesFilterSchema), z.lazy(() => DeckTypeSchema)]).optional(),
    createdBy: z
      .union([z.lazy(() => UuidNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
  });

export const BlackCardWhereInputSchema: z.ZodType<Prisma.BlackCardWhereInput> = z.strictObject({
  AND: z.union([z.lazy(() => BlackCardWhereInputSchema), z.lazy(() => BlackCardWhereInputSchema).array()]).optional(),
  OR: z
    .lazy(() => BlackCardWhereInputSchema)
    .array()
    .optional(),
  NOT: z.union([z.lazy(() => BlackCardWhereInputSchema), z.lazy(() => BlackCardWhereInputSchema).array()]).optional(),
  id: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  content: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  pickCount: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  deckId: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  deck: z.union([z.lazy(() => DeckScalarRelationFilterSchema), z.lazy(() => DeckWhereInputSchema)]).optional(),
});

export const BlackCardOrderByWithRelationInputSchema: z.ZodType<Prisma.BlackCardOrderByWithRelationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    content: z.lazy(() => SortOrderSchema).optional(),
    pickCount: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
    deck: z.lazy(() => DeckOrderByWithRelationInputSchema).optional(),
  });

export const BlackCardWhereUniqueInputSchema: z.ZodType<Prisma.BlackCardWhereUniqueInput> = z
  .union([
    z.object({
      id: z.number().int(),
      deckId_content: z.lazy(() => BlackCardDeckIdContentCompoundUniqueInputSchema),
    }),
    z.object({
      id: z.number().int(),
    }),
    z.object({
      deckId_content: z.lazy(() => BlackCardDeckIdContentCompoundUniqueInputSchema),
    }),
  ])
  .and(
    z.strictObject({
      id: z.number().int().optional(),
      deckId_content: z.lazy(() => BlackCardDeckIdContentCompoundUniqueInputSchema).optional(),
      AND: z
        .union([z.lazy(() => BlackCardWhereInputSchema), z.lazy(() => BlackCardWhereInputSchema).array()])
        .optional(),
      OR: z
        .lazy(() => BlackCardWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([z.lazy(() => BlackCardWhereInputSchema), z.lazy(() => BlackCardWhereInputSchema).array()])
        .optional(),
      content: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      pickCount: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
      deckId: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
      deck: z.union([z.lazy(() => DeckScalarRelationFilterSchema), z.lazy(() => DeckWhereInputSchema)]).optional(),
    })
  );

export const BlackCardOrderByWithAggregationInputSchema: z.ZodType<Prisma.BlackCardOrderByWithAggregationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    content: z.lazy(() => SortOrderSchema).optional(),
    pickCount: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
    _count: z.lazy(() => BlackCardCountOrderByAggregateInputSchema).optional(),
    _avg: z.lazy(() => BlackCardAvgOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => BlackCardMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => BlackCardMinOrderByAggregateInputSchema).optional(),
    _sum: z.lazy(() => BlackCardSumOrderByAggregateInputSchema).optional(),
  });

export const BlackCardScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BlackCardScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => BlackCardScalarWhereWithAggregatesInputSchema),
        z.lazy(() => BlackCardScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => BlackCardScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => BlackCardScalarWhereWithAggregatesInputSchema),
        z.lazy(() => BlackCardScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
    content: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    pickCount: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
    deckId: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
  });

export const WhiteCardWhereInputSchema: z.ZodType<Prisma.WhiteCardWhereInput> = z.strictObject({
  AND: z.union([z.lazy(() => WhiteCardWhereInputSchema), z.lazy(() => WhiteCardWhereInputSchema).array()]).optional(),
  OR: z
    .lazy(() => WhiteCardWhereInputSchema)
    .array()
    .optional(),
  NOT: z.union([z.lazy(() => WhiteCardWhereInputSchema), z.lazy(() => WhiteCardWhereInputSchema).array()]).optional(),
  id: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  content: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  deckId: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  deck: z.union([z.lazy(() => DeckScalarRelationFilterSchema), z.lazy(() => DeckWhereInputSchema)]).optional(),
});

export const WhiteCardOrderByWithRelationInputSchema: z.ZodType<Prisma.WhiteCardOrderByWithRelationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    content: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
    deck: z.lazy(() => DeckOrderByWithRelationInputSchema).optional(),
  });

export const WhiteCardWhereUniqueInputSchema: z.ZodType<Prisma.WhiteCardWhereUniqueInput> = z
  .union([
    z.object({
      id: z.number().int(),
      deckId_content: z.lazy(() => WhiteCardDeckIdContentCompoundUniqueInputSchema),
    }),
    z.object({
      id: z.number().int(),
    }),
    z.object({
      deckId_content: z.lazy(() => WhiteCardDeckIdContentCompoundUniqueInputSchema),
    }),
  ])
  .and(
    z.strictObject({
      id: z.number().int().optional(),
      deckId_content: z.lazy(() => WhiteCardDeckIdContentCompoundUniqueInputSchema).optional(),
      AND: z
        .union([z.lazy(() => WhiteCardWhereInputSchema), z.lazy(() => WhiteCardWhereInputSchema).array()])
        .optional(),
      OR: z
        .lazy(() => WhiteCardWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([z.lazy(() => WhiteCardWhereInputSchema), z.lazy(() => WhiteCardWhereInputSchema).array()])
        .optional(),
      content: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      deckId: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
      deck: z.union([z.lazy(() => DeckScalarRelationFilterSchema), z.lazy(() => DeckWhereInputSchema)]).optional(),
    })
  );

export const WhiteCardOrderByWithAggregationInputSchema: z.ZodType<Prisma.WhiteCardOrderByWithAggregationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    content: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
    _count: z.lazy(() => WhiteCardCountOrderByAggregateInputSchema).optional(),
    _avg: z.lazy(() => WhiteCardAvgOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => WhiteCardMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => WhiteCardMinOrderByAggregateInputSchema).optional(),
    _sum: z.lazy(() => WhiteCardSumOrderByAggregateInputSchema).optional(),
  });

export const WhiteCardScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.WhiteCardScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => WhiteCardScalarWhereWithAggregatesInputSchema),
        z.lazy(() => WhiteCardScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => WhiteCardScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => WhiteCardScalarWhereWithAggregatesInputSchema),
        z.lazy(() => WhiteCardScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
    content: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    deckId: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
  });

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.strictObject({
  AND: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
  OR: z
    .lazy(() => UserWhereInputSchema)
    .array()
    .optional(),
  NOT: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
  id: z.union([z.lazy(() => UuidFilterSchema), z.string()]).optional(),
  googleSub: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  email: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  displayName: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  createdDecks: z.lazy(() => DeckListRelationFilterSchema).optional(),
});

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  googleSub: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  displayName: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  createdDecks: z.lazy(() => DeckOrderByRelationAggregateInputSchema).optional(),
});

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string(),
      googleSub: z.string(),
      displayName: z.string(),
    }),
    z.object({
      id: z.string(),
      googleSub: z.string(),
    }),
    z.object({
      id: z.string(),
      displayName: z.string(),
    }),
    z.object({
      id: z.string(),
    }),
    z.object({
      googleSub: z.string(),
      displayName: z.string(),
    }),
    z.object({
      googleSub: z.string(),
    }),
    z.object({
      displayName: z.string(),
    }),
  ])
  .and(
    z.strictObject({
      id: z.string().optional(),
      googleSub: z.string().optional(),
      displayName: z.string().optional(),
      AND: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
      OR: z
        .lazy(() => UserWhereInputSchema)
        .array()
        .optional(),
      NOT: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
      email: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      createdDecks: z.lazy(() => DeckListRelationFilterSchema).optional(),
    })
  );

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  googleSub: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  displayName: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
});

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => UserScalarWhereWithAggregatesInputSchema),
        z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => UserScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => UserScalarWhereWithAggregatesInputSchema),
        z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => UuidWithAggregatesFilterSchema), z.string()]).optional(),
    googleSub: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    email: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    displayName: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
  });

export const InvalidatedSessionWhereInputSchema: z.ZodType<Prisma.InvalidatedSessionWhereInput> = z.strictObject({
  AND: z
    .union([z.lazy(() => InvalidatedSessionWhereInputSchema), z.lazy(() => InvalidatedSessionWhereInputSchema).array()])
    .optional(),
  OR: z
    .lazy(() => InvalidatedSessionWhereInputSchema)
    .array()
    .optional(),
  NOT: z
    .union([z.lazy(() => InvalidatedSessionWhereInputSchema), z.lazy(() => InvalidatedSessionWhereInputSchema).array()])
    .optional(),
  tokenHash: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
});

export const InvalidatedSessionOrderByWithRelationInputSchema: z.ZodType<Prisma.InvalidatedSessionOrderByWithRelationInput> =
  z.strictObject({
    tokenHash: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const InvalidatedSessionWhereUniqueInputSchema: z.ZodType<Prisma.InvalidatedSessionWhereUniqueInput> = z
  .object({
    tokenHash: z.string(),
  })
  .and(
    z.strictObject({
      tokenHash: z.string().optional(),
      AND: z
        .union([
          z.lazy(() => InvalidatedSessionWhereInputSchema),
          z.lazy(() => InvalidatedSessionWhereInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => InvalidatedSessionWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => InvalidatedSessionWhereInputSchema),
          z.lazy(() => InvalidatedSessionWhereInputSchema).array(),
        ])
        .optional(),
      createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    })
  );

export const InvalidatedSessionOrderByWithAggregationInputSchema: z.ZodType<Prisma.InvalidatedSessionOrderByWithAggregationInput> =
  z.strictObject({
    tokenHash: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    _count: z.lazy(() => InvalidatedSessionCountOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => InvalidatedSessionMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => InvalidatedSessionMinOrderByAggregateInputSchema).optional(),
  });

export const InvalidatedSessionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.InvalidatedSessionScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => InvalidatedSessionScalarWhereWithAggregatesInputSchema),
        z.lazy(() => InvalidatedSessionScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => InvalidatedSessionScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => InvalidatedSessionScalarWhereWithAggregatesInputSchema),
        z.lazy(() => InvalidatedSessionScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    tokenHash: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
  });

export const DeckCreateInputSchema: z.ZodType<Prisma.DeckCreateInput> = z.strictObject({
  name: z.string(),
  watermark: z.string(),
  type: z.lazy(() => DeckTypeSchema),
  creator: z.lazy(() => UserCreateNestedOneWithoutCreatedDecksInputSchema).optional(),
  blackCards: z.lazy(() => BlackCardCreateNestedManyWithoutDeckInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardCreateNestedManyWithoutDeckInputSchema).optional(),
});

export const DeckUncheckedCreateInputSchema: z.ZodType<Prisma.DeckUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  watermark: z.string(),
  type: z.lazy(() => DeckTypeSchema),
  createdBy: z.string().optional().nullable(),
  blackCards: z.lazy(() => BlackCardUncheckedCreateNestedManyWithoutDeckInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardUncheckedCreateNestedManyWithoutDeckInputSchema).optional(),
});

export const DeckUpdateInputSchema: z.ZodType<Prisma.DeckUpdateInput> = z.strictObject({
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  watermark: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  type: z.union([z.lazy(() => DeckTypeSchema), z.lazy(() => EnumDeckTypeFieldUpdateOperationsInputSchema)]).optional(),
  creator: z.lazy(() => UserUpdateOneWithoutCreatedDecksNestedInputSchema).optional(),
  blackCards: z.lazy(() => BlackCardUpdateManyWithoutDeckNestedInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardUpdateManyWithoutDeckNestedInputSchema).optional(),
});

export const DeckUncheckedUpdateInputSchema: z.ZodType<Prisma.DeckUncheckedUpdateInput> = z.strictObject({
  id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  watermark: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  type: z.union([z.lazy(() => DeckTypeSchema), z.lazy(() => EnumDeckTypeFieldUpdateOperationsInputSchema)]).optional(),
  createdBy: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  blackCards: z.lazy(() => BlackCardUncheckedUpdateManyWithoutDeckNestedInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardUncheckedUpdateManyWithoutDeckNestedInputSchema).optional(),
});

export const DeckCreateManyInputSchema: z.ZodType<Prisma.DeckCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  watermark: z.string(),
  type: z.lazy(() => DeckTypeSchema),
  createdBy: z.string().optional().nullable(),
});

export const DeckUpdateManyMutationInputSchema: z.ZodType<Prisma.DeckUpdateManyMutationInput> = z.strictObject({
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  watermark: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  type: z.union([z.lazy(() => DeckTypeSchema), z.lazy(() => EnumDeckTypeFieldUpdateOperationsInputSchema)]).optional(),
});

export const DeckUncheckedUpdateManyInputSchema: z.ZodType<Prisma.DeckUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  watermark: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  type: z.union([z.lazy(() => DeckTypeSchema), z.lazy(() => EnumDeckTypeFieldUpdateOperationsInputSchema)]).optional(),
  createdBy: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
});

export const BlackCardCreateInputSchema: z.ZodType<Prisma.BlackCardCreateInput> = z.strictObject({
  content: z.string(),
  pickCount: z.number().int(),
  deck: z.lazy(() => DeckCreateNestedOneWithoutBlackCardsInputSchema),
});

export const BlackCardUncheckedCreateInputSchema: z.ZodType<Prisma.BlackCardUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  pickCount: z.number().int(),
  deckId: z.number().int(),
});

export const BlackCardUpdateInputSchema: z.ZodType<Prisma.BlackCardUpdateInput> = z.strictObject({
  content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  pickCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
  deck: z.lazy(() => DeckUpdateOneRequiredWithoutBlackCardsNestedInputSchema).optional(),
});

export const BlackCardUncheckedUpdateInputSchema: z.ZodType<Prisma.BlackCardUncheckedUpdateInput> = z.strictObject({
  id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
  content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  pickCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
  deckId: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
});

export const BlackCardCreateManyInputSchema: z.ZodType<Prisma.BlackCardCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  pickCount: z.number().int(),
  deckId: z.number().int(),
});

export const BlackCardUpdateManyMutationInputSchema: z.ZodType<Prisma.BlackCardUpdateManyMutationInput> =
  z.strictObject({
    content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    pickCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
  });

export const BlackCardUncheckedUpdateManyInputSchema: z.ZodType<Prisma.BlackCardUncheckedUpdateManyInput> =
  z.strictObject({
    id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
    content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    pickCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
    deckId: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
  });

export const WhiteCardCreateInputSchema: z.ZodType<Prisma.WhiteCardCreateInput> = z.strictObject({
  content: z.string(),
  deck: z.lazy(() => DeckCreateNestedOneWithoutWhiteCardsInputSchema),
});

export const WhiteCardUncheckedCreateInputSchema: z.ZodType<Prisma.WhiteCardUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  deckId: z.number().int(),
});

export const WhiteCardUpdateInputSchema: z.ZodType<Prisma.WhiteCardUpdateInput> = z.strictObject({
  content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  deck: z.lazy(() => DeckUpdateOneRequiredWithoutWhiteCardsNestedInputSchema).optional(),
});

export const WhiteCardUncheckedUpdateInputSchema: z.ZodType<Prisma.WhiteCardUncheckedUpdateInput> = z.strictObject({
  id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
  content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  deckId: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
});

export const WhiteCardCreateManyInputSchema: z.ZodType<Prisma.WhiteCardCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  deckId: z.number().int(),
});

export const WhiteCardUpdateManyMutationInputSchema: z.ZodType<Prisma.WhiteCardUpdateManyMutationInput> =
  z.strictObject({
    content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  });

export const WhiteCardUncheckedUpdateManyInputSchema: z.ZodType<Prisma.WhiteCardUncheckedUpdateManyInput> =
  z.strictObject({
    id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
    content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    deckId: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
  });

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.strictObject({
  id: z.string(),
  googleSub: z.string(),
  email: z.string(),
  name: z.string(),
  displayName: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  createdDecks: z.lazy(() => DeckCreateNestedManyWithoutCreatorInputSchema).optional(),
});

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.strictObject({
  id: z.string(),
  googleSub: z.string(),
  email: z.string(),
  name: z.string(),
  displayName: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  createdDecks: z.lazy(() => DeckUncheckedCreateNestedManyWithoutCreatorInputSchema).optional(),
});

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.strictObject({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  googleSub: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  displayName: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
  createdDecks: z.lazy(() => DeckUpdateManyWithoutCreatorNestedInputSchema).optional(),
});

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.strictObject({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  googleSub: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  displayName: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
  createdDecks: z.lazy(() => DeckUncheckedUpdateManyWithoutCreatorNestedInputSchema).optional(),
});

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.strictObject({
  id: z.string(),
  googleSub: z.string(),
  email: z.string(),
  name: z.string(),
  displayName: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.strictObject({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  googleSub: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  displayName: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  googleSub: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  displayName: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});

export const InvalidatedSessionCreateInputSchema: z.ZodType<Prisma.InvalidatedSessionCreateInput> = z.strictObject({
  tokenHash: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const InvalidatedSessionUncheckedCreateInputSchema: z.ZodType<Prisma.InvalidatedSessionUncheckedCreateInput> =
  z.strictObject({
    tokenHash: z.string(),
    createdAt: z.coerce.date().optional(),
  });

export const InvalidatedSessionUpdateInputSchema: z.ZodType<Prisma.InvalidatedSessionUpdateInput> = z.strictObject({
  tokenHash: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
});

export const InvalidatedSessionUncheckedUpdateInputSchema: z.ZodType<Prisma.InvalidatedSessionUncheckedUpdateInput> =
  z.strictObject({
    tokenHash: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
  });

export const InvalidatedSessionCreateManyInputSchema: z.ZodType<Prisma.InvalidatedSessionCreateManyInput> =
  z.strictObject({
    tokenHash: z.string(),
    createdAt: z.coerce.date().optional(),
  });

export const InvalidatedSessionUpdateManyMutationInputSchema: z.ZodType<Prisma.InvalidatedSessionUpdateManyMutationInput> =
  z.strictObject({
    tokenHash: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
  });

export const InvalidatedSessionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.InvalidatedSessionUncheckedUpdateManyInput> =
  z.strictObject({
    tokenHash: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
  });

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
});

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
});

export const EnumDeckTypeFilterSchema: z.ZodType<Prisma.EnumDeckTypeFilter> = z.strictObject({
  equals: z.lazy(() => DeckTypeSchema).optional(),
  in: z
    .lazy(() => DeckTypeSchema)
    .array()
    .optional(),
  notIn: z
    .lazy(() => DeckTypeSchema)
    .array()
    .optional(),
  not: z.union([z.lazy(() => DeckTypeSchema), z.lazy(() => NestedEnumDeckTypeFilterSchema)]).optional(),
});

export const UuidNullableFilterSchema: z.ZodType<Prisma.UuidNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z
    .union([z.string(), z.lazy(() => NestedUuidNullableFilterSchema)])
    .optional()
    .nullable(),
});

export const UserNullableScalarRelationFilterSchema: z.ZodType<Prisma.UserNullableScalarRelationFilter> =
  z.strictObject({
    is: z
      .lazy(() => UserWhereInputSchema)
      .optional()
      .nullable(),
    isNot: z
      .lazy(() => UserWhereInputSchema)
      .optional()
      .nullable(),
  });

export const BlackCardListRelationFilterSchema: z.ZodType<Prisma.BlackCardListRelationFilter> = z.strictObject({
  every: z.lazy(() => BlackCardWhereInputSchema).optional(),
  some: z.lazy(() => BlackCardWhereInputSchema).optional(),
  none: z.lazy(() => BlackCardWhereInputSchema).optional(),
});

export const WhiteCardListRelationFilterSchema: z.ZodType<Prisma.WhiteCardListRelationFilter> = z.strictObject({
  every: z.lazy(() => WhiteCardWhereInputSchema).optional(),
  some: z.lazy(() => WhiteCardWhereInputSchema).optional(),
  none: z.lazy(() => WhiteCardWhereInputSchema).optional(),
});

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.strictObject({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional(),
});

export const BlackCardOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BlackCardOrderByRelationAggregateInput> =
  z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
  });

export const WhiteCardOrderByRelationAggregateInputSchema: z.ZodType<Prisma.WhiteCardOrderByRelationAggregateInput> =
  z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
  });

export const DeckCountOrderByAggregateInputSchema: z.ZodType<Prisma.DeckCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  watermark: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional(),
});

export const DeckAvgOrderByAggregateInputSchema: z.ZodType<Prisma.DeckAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const DeckMaxOrderByAggregateInputSchema: z.ZodType<Prisma.DeckMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  watermark: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional(),
});

export const DeckMinOrderByAggregateInputSchema: z.ZodType<Prisma.DeckMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  watermark: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional(),
});

export const DeckSumOrderByAggregateInputSchema: z.ZodType<Prisma.DeckSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedIntWithAggregatesFilterSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const EnumDeckTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumDeckTypeWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => DeckTypeSchema).optional(),
    in: z
      .lazy(() => DeckTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => DeckTypeSchema)
      .array()
      .optional(),
    not: z.union([z.lazy(() => DeckTypeSchema), z.lazy(() => NestedEnumDeckTypeWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumDeckTypeFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumDeckTypeFilterSchema).optional(),
  });

export const UuidNullableWithAggregatesFilterSchema: z.ZodType<Prisma.UuidNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    mode: z.lazy(() => QueryModeSchema).optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedUuidNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  });

export const DeckScalarRelationFilterSchema: z.ZodType<Prisma.DeckScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => DeckWhereInputSchema).optional(),
  isNot: z.lazy(() => DeckWhereInputSchema).optional(),
});

export const BlackCardDeckIdContentCompoundUniqueInputSchema: z.ZodType<Prisma.BlackCardDeckIdContentCompoundUniqueInput> =
  z.strictObject({
    deckId: z.number(),
    content: z.string(),
  });

export const BlackCardCountOrderByAggregateInputSchema: z.ZodType<Prisma.BlackCardCountOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    content: z.lazy(() => SortOrderSchema).optional(),
    pickCount: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
  });

export const BlackCardAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BlackCardAvgOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    pickCount: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
  });

export const BlackCardMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BlackCardMaxOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    content: z.lazy(() => SortOrderSchema).optional(),
    pickCount: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
  });

export const BlackCardMinOrderByAggregateInputSchema: z.ZodType<Prisma.BlackCardMinOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    content: z.lazy(() => SortOrderSchema).optional(),
    pickCount: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
  });

export const BlackCardSumOrderByAggregateInputSchema: z.ZodType<Prisma.BlackCardSumOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    pickCount: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
  });

export const WhiteCardDeckIdContentCompoundUniqueInputSchema: z.ZodType<Prisma.WhiteCardDeckIdContentCompoundUniqueInput> =
  z.strictObject({
    deckId: z.number(),
    content: z.string(),
  });

export const WhiteCardCountOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteCardCountOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    content: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
  });

export const WhiteCardAvgOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteCardAvgOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
  });

export const WhiteCardMaxOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteCardMaxOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    content: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
  });

export const WhiteCardMinOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteCardMinOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    content: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
  });

export const WhiteCardSumOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteCardSumOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    deckId: z.lazy(() => SortOrderSchema).optional(),
  });

export const UuidFilterSchema: z.ZodType<Prisma.UuidFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([z.string(), z.lazy(() => NestedUuidFilterSchema)]).optional(),
});

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z
    .union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
    .optional()
    .nullable(),
});

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
});

export const DeckListRelationFilterSchema: z.ZodType<Prisma.DeckListRelationFilter> = z.strictObject({
  every: z.lazy(() => DeckWhereInputSchema).optional(),
  some: z.lazy(() => DeckWhereInputSchema).optional(),
  none: z.lazy(() => DeckWhereInputSchema).optional(),
});

export const DeckOrderByRelationAggregateInputSchema: z.ZodType<Prisma.DeckOrderByRelationAggregateInput> =
  z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
  });

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  googleSub: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  displayName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  googleSub: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  displayName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  googleSub: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  displayName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const UuidWithAggregatesFilterSchema: z.ZodType<Prisma.UuidWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([z.string(), z.lazy(() => NestedUuidWithAggregatesFilterSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    mode: z.lazy(() => QueryModeSchema).optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  });

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});

export const InvalidatedSessionCountOrderByAggregateInputSchema: z.ZodType<Prisma.InvalidatedSessionCountOrderByAggregateInput> =
  z.strictObject({
    tokenHash: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const InvalidatedSessionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.InvalidatedSessionMaxOrderByAggregateInput> =
  z.strictObject({
    tokenHash: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const InvalidatedSessionMinOrderByAggregateInputSchema: z.ZodType<Prisma.InvalidatedSessionMinOrderByAggregateInput> =
  z.strictObject({
    tokenHash: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const UserCreateNestedOneWithoutCreatedDecksInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutCreatedDecksInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserCreateWithoutCreatedDecksInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutCreatedDecksInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCreatedDecksInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  });

export const BlackCardCreateNestedManyWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardCreateNestedManyWithoutDeckInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => BlackCardCreateWithoutDeckInputSchema),
        z.lazy(() => BlackCardCreateWithoutDeckInputSchema).array(),
        z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema),
        z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema),
        z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => BlackCardCreateManyDeckInputEnvelopeSchema).optional(),
    connect: z
      .union([z.lazy(() => BlackCardWhereUniqueInputSchema), z.lazy(() => BlackCardWhereUniqueInputSchema).array()])
      .optional(),
  });

export const WhiteCardCreateNestedManyWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardCreateNestedManyWithoutDeckInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),
        z.lazy(() => WhiteCardCreateWithoutDeckInputSchema).array(),
        z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema),
        z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema),
        z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => WhiteCardCreateManyDeckInputEnvelopeSchema).optional(),
    connect: z
      .union([z.lazy(() => WhiteCardWhereUniqueInputSchema), z.lazy(() => WhiteCardWhereUniqueInputSchema).array()])
      .optional(),
  });

export const BlackCardUncheckedCreateNestedManyWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUncheckedCreateNestedManyWithoutDeckInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => BlackCardCreateWithoutDeckInputSchema),
        z.lazy(() => BlackCardCreateWithoutDeckInputSchema).array(),
        z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema),
        z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema),
        z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => BlackCardCreateManyDeckInputEnvelopeSchema).optional(),
    connect: z
      .union([z.lazy(() => BlackCardWhereUniqueInputSchema), z.lazy(() => BlackCardWhereUniqueInputSchema).array()])
      .optional(),
  });

export const WhiteCardUncheckedCreateNestedManyWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUncheckedCreateNestedManyWithoutDeckInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),
        z.lazy(() => WhiteCardCreateWithoutDeckInputSchema).array(),
        z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema),
        z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema),
        z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => WhiteCardCreateManyDeckInputEnvelopeSchema).optional(),
    connect: z
      .union([z.lazy(() => WhiteCardWhereUniqueInputSchema), z.lazy(() => WhiteCardWhereUniqueInputSchema).array()])
      .optional(),
  });

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.string().optional(),
  });

export const EnumDeckTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumDeckTypeFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.lazy(() => DeckTypeSchema).optional(),
  });

export const UserUpdateOneWithoutCreatedDecksNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutCreatedDecksNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserCreateWithoutCreatedDecksInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutCreatedDecksInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCreatedDecksInputSchema).optional(),
    upsert: z.lazy(() => UserUpsertWithoutCreatedDecksInputSchema).optional(),
    disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
    delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => UserUpdateToOneWithWhereWithoutCreatedDecksInputSchema),
        z.lazy(() => UserUpdateWithoutCreatedDecksInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutCreatedDecksInputSchema),
      ])
      .optional(),
  });

export const BlackCardUpdateManyWithoutDeckNestedInputSchema: z.ZodType<Prisma.BlackCardUpdateManyWithoutDeckNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => BlackCardCreateWithoutDeckInputSchema),
        z.lazy(() => BlackCardCreateWithoutDeckInputSchema).array(),
        z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema),
        z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema),
        z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => BlackCardUpsertWithWhereUniqueWithoutDeckInputSchema),
        z.lazy(() => BlackCardUpsertWithWhereUniqueWithoutDeckInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => BlackCardCreateManyDeckInputEnvelopeSchema).optional(),
    set: z
      .union([z.lazy(() => BlackCardWhereUniqueInputSchema), z.lazy(() => BlackCardWhereUniqueInputSchema).array()])
      .optional(),
    disconnect: z
      .union([z.lazy(() => BlackCardWhereUniqueInputSchema), z.lazy(() => BlackCardWhereUniqueInputSchema).array()])
      .optional(),
    delete: z
      .union([z.lazy(() => BlackCardWhereUniqueInputSchema), z.lazy(() => BlackCardWhereUniqueInputSchema).array()])
      .optional(),
    connect: z
      .union([z.lazy(() => BlackCardWhereUniqueInputSchema), z.lazy(() => BlackCardWhereUniqueInputSchema).array()])
      .optional(),
    update: z
      .union([
        z.lazy(() => BlackCardUpdateWithWhereUniqueWithoutDeckInputSchema),
        z.lazy(() => BlackCardUpdateWithWhereUniqueWithoutDeckInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => BlackCardUpdateManyWithWhereWithoutDeckInputSchema),
        z.lazy(() => BlackCardUpdateManyWithWhereWithoutDeckInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([z.lazy(() => BlackCardScalarWhereInputSchema), z.lazy(() => BlackCardScalarWhereInputSchema).array()])
      .optional(),
  });

export const WhiteCardUpdateManyWithoutDeckNestedInputSchema: z.ZodType<Prisma.WhiteCardUpdateManyWithoutDeckNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),
        z.lazy(() => WhiteCardCreateWithoutDeckInputSchema).array(),
        z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema),
        z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema),
        z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => WhiteCardUpsertWithWhereUniqueWithoutDeckInputSchema),
        z.lazy(() => WhiteCardUpsertWithWhereUniqueWithoutDeckInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => WhiteCardCreateManyDeckInputEnvelopeSchema).optional(),
    set: z
      .union([z.lazy(() => WhiteCardWhereUniqueInputSchema), z.lazy(() => WhiteCardWhereUniqueInputSchema).array()])
      .optional(),
    disconnect: z
      .union([z.lazy(() => WhiteCardWhereUniqueInputSchema), z.lazy(() => WhiteCardWhereUniqueInputSchema).array()])
      .optional(),
    delete: z
      .union([z.lazy(() => WhiteCardWhereUniqueInputSchema), z.lazy(() => WhiteCardWhereUniqueInputSchema).array()])
      .optional(),
    connect: z
      .union([z.lazy(() => WhiteCardWhereUniqueInputSchema), z.lazy(() => WhiteCardWhereUniqueInputSchema).array()])
      .optional(),
    update: z
      .union([
        z.lazy(() => WhiteCardUpdateWithWhereUniqueWithoutDeckInputSchema),
        z.lazy(() => WhiteCardUpdateWithWhereUniqueWithoutDeckInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => WhiteCardUpdateManyWithWhereWithoutDeckInputSchema),
        z.lazy(() => WhiteCardUpdateManyWithWhereWithoutDeckInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([z.lazy(() => WhiteCardScalarWhereInputSchema), z.lazy(() => WhiteCardScalarWhereInputSchema).array()])
      .optional(),
  });

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.string().optional().nullable(),
  });

export const BlackCardUncheckedUpdateManyWithoutDeckNestedInputSchema: z.ZodType<Prisma.BlackCardUncheckedUpdateManyWithoutDeckNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => BlackCardCreateWithoutDeckInputSchema),
        z.lazy(() => BlackCardCreateWithoutDeckInputSchema).array(),
        z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema),
        z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema),
        z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => BlackCardUpsertWithWhereUniqueWithoutDeckInputSchema),
        z.lazy(() => BlackCardUpsertWithWhereUniqueWithoutDeckInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => BlackCardCreateManyDeckInputEnvelopeSchema).optional(),
    set: z
      .union([z.lazy(() => BlackCardWhereUniqueInputSchema), z.lazy(() => BlackCardWhereUniqueInputSchema).array()])
      .optional(),
    disconnect: z
      .union([z.lazy(() => BlackCardWhereUniqueInputSchema), z.lazy(() => BlackCardWhereUniqueInputSchema).array()])
      .optional(),
    delete: z
      .union([z.lazy(() => BlackCardWhereUniqueInputSchema), z.lazy(() => BlackCardWhereUniqueInputSchema).array()])
      .optional(),
    connect: z
      .union([z.lazy(() => BlackCardWhereUniqueInputSchema), z.lazy(() => BlackCardWhereUniqueInputSchema).array()])
      .optional(),
    update: z
      .union([
        z.lazy(() => BlackCardUpdateWithWhereUniqueWithoutDeckInputSchema),
        z.lazy(() => BlackCardUpdateWithWhereUniqueWithoutDeckInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => BlackCardUpdateManyWithWhereWithoutDeckInputSchema),
        z.lazy(() => BlackCardUpdateManyWithWhereWithoutDeckInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([z.lazy(() => BlackCardScalarWhereInputSchema), z.lazy(() => BlackCardScalarWhereInputSchema).array()])
      .optional(),
  });

export const WhiteCardUncheckedUpdateManyWithoutDeckNestedInputSchema: z.ZodType<Prisma.WhiteCardUncheckedUpdateManyWithoutDeckNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),
        z.lazy(() => WhiteCardCreateWithoutDeckInputSchema).array(),
        z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema),
        z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema),
        z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => WhiteCardUpsertWithWhereUniqueWithoutDeckInputSchema),
        z.lazy(() => WhiteCardUpsertWithWhereUniqueWithoutDeckInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => WhiteCardCreateManyDeckInputEnvelopeSchema).optional(),
    set: z
      .union([z.lazy(() => WhiteCardWhereUniqueInputSchema), z.lazy(() => WhiteCardWhereUniqueInputSchema).array()])
      .optional(),
    disconnect: z
      .union([z.lazy(() => WhiteCardWhereUniqueInputSchema), z.lazy(() => WhiteCardWhereUniqueInputSchema).array()])
      .optional(),
    delete: z
      .union([z.lazy(() => WhiteCardWhereUniqueInputSchema), z.lazy(() => WhiteCardWhereUniqueInputSchema).array()])
      .optional(),
    connect: z
      .union([z.lazy(() => WhiteCardWhereUniqueInputSchema), z.lazy(() => WhiteCardWhereUniqueInputSchema).array()])
      .optional(),
    update: z
      .union([
        z.lazy(() => WhiteCardUpdateWithWhereUniqueWithoutDeckInputSchema),
        z.lazy(() => WhiteCardUpdateWithWhereUniqueWithoutDeckInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => WhiteCardUpdateManyWithWhereWithoutDeckInputSchema),
        z.lazy(() => WhiteCardUpdateManyWithWhereWithoutDeckInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([z.lazy(() => WhiteCardScalarWhereInputSchema), z.lazy(() => WhiteCardScalarWhereInputSchema).array()])
      .optional(),
  });

export const DeckCreateNestedOneWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckCreateNestedOneWithoutBlackCardsInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => DeckCreateWithoutBlackCardsInputSchema),
        z.lazy(() => DeckUncheckedCreateWithoutBlackCardsInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => DeckCreateOrConnectWithoutBlackCardsInputSchema).optional(),
    connect: z.lazy(() => DeckWhereUniqueInputSchema).optional(),
  });

export const DeckUpdateOneRequiredWithoutBlackCardsNestedInputSchema: z.ZodType<Prisma.DeckUpdateOneRequiredWithoutBlackCardsNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => DeckCreateWithoutBlackCardsInputSchema),
        z.lazy(() => DeckUncheckedCreateWithoutBlackCardsInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => DeckCreateOrConnectWithoutBlackCardsInputSchema).optional(),
    upsert: z.lazy(() => DeckUpsertWithoutBlackCardsInputSchema).optional(),
    connect: z.lazy(() => DeckWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => DeckUpdateToOneWithWhereWithoutBlackCardsInputSchema),
        z.lazy(() => DeckUpdateWithoutBlackCardsInputSchema),
        z.lazy(() => DeckUncheckedUpdateWithoutBlackCardsInputSchema),
      ])
      .optional(),
  });

export const DeckCreateNestedOneWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckCreateNestedOneWithoutWhiteCardsInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => DeckCreateWithoutWhiteCardsInputSchema),
        z.lazy(() => DeckUncheckedCreateWithoutWhiteCardsInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => DeckCreateOrConnectWithoutWhiteCardsInputSchema).optional(),
    connect: z.lazy(() => DeckWhereUniqueInputSchema).optional(),
  });

export const DeckUpdateOneRequiredWithoutWhiteCardsNestedInputSchema: z.ZodType<Prisma.DeckUpdateOneRequiredWithoutWhiteCardsNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => DeckCreateWithoutWhiteCardsInputSchema),
        z.lazy(() => DeckUncheckedCreateWithoutWhiteCardsInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => DeckCreateOrConnectWithoutWhiteCardsInputSchema).optional(),
    upsert: z.lazy(() => DeckUpsertWithoutWhiteCardsInputSchema).optional(),
    connect: z.lazy(() => DeckWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => DeckUpdateToOneWithWhereWithoutWhiteCardsInputSchema),
        z.lazy(() => DeckUpdateWithoutWhiteCardsInputSchema),
        z.lazy(() => DeckUncheckedUpdateWithoutWhiteCardsInputSchema),
      ])
      .optional(),
  });

export const DeckCreateNestedManyWithoutCreatorInputSchema: z.ZodType<Prisma.DeckCreateNestedManyWithoutCreatorInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => DeckCreateWithoutCreatorInputSchema),
        z.lazy(() => DeckCreateWithoutCreatorInputSchema).array(),
        z.lazy(() => DeckUncheckedCreateWithoutCreatorInputSchema),
        z.lazy(() => DeckUncheckedCreateWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => DeckCreateOrConnectWithoutCreatorInputSchema),
        z.lazy(() => DeckCreateOrConnectWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => DeckCreateManyCreatorInputEnvelopeSchema).optional(),
    connect: z
      .union([z.lazy(() => DeckWhereUniqueInputSchema), z.lazy(() => DeckWhereUniqueInputSchema).array()])
      .optional(),
  });

export const DeckUncheckedCreateNestedManyWithoutCreatorInputSchema: z.ZodType<Prisma.DeckUncheckedCreateNestedManyWithoutCreatorInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => DeckCreateWithoutCreatorInputSchema),
        z.lazy(() => DeckCreateWithoutCreatorInputSchema).array(),
        z.lazy(() => DeckUncheckedCreateWithoutCreatorInputSchema),
        z.lazy(() => DeckUncheckedCreateWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => DeckCreateOrConnectWithoutCreatorInputSchema),
        z.lazy(() => DeckCreateOrConnectWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => DeckCreateManyCreatorInputEnvelopeSchema).optional(),
    connect: z
      .union([z.lazy(() => DeckWhereUniqueInputSchema), z.lazy(() => DeckWhereUniqueInputSchema).array()])
      .optional(),
  });

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.coerce.date().optional(),
  });

export const DeckUpdateManyWithoutCreatorNestedInputSchema: z.ZodType<Prisma.DeckUpdateManyWithoutCreatorNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => DeckCreateWithoutCreatorInputSchema),
        z.lazy(() => DeckCreateWithoutCreatorInputSchema).array(),
        z.lazy(() => DeckUncheckedCreateWithoutCreatorInputSchema),
        z.lazy(() => DeckUncheckedCreateWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => DeckCreateOrConnectWithoutCreatorInputSchema),
        z.lazy(() => DeckCreateOrConnectWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => DeckUpsertWithWhereUniqueWithoutCreatorInputSchema),
        z.lazy(() => DeckUpsertWithWhereUniqueWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => DeckCreateManyCreatorInputEnvelopeSchema).optional(),
    set: z
      .union([z.lazy(() => DeckWhereUniqueInputSchema), z.lazy(() => DeckWhereUniqueInputSchema).array()])
      .optional(),
    disconnect: z
      .union([z.lazy(() => DeckWhereUniqueInputSchema), z.lazy(() => DeckWhereUniqueInputSchema).array()])
      .optional(),
    delete: z
      .union([z.lazy(() => DeckWhereUniqueInputSchema), z.lazy(() => DeckWhereUniqueInputSchema).array()])
      .optional(),
    connect: z
      .union([z.lazy(() => DeckWhereUniqueInputSchema), z.lazy(() => DeckWhereUniqueInputSchema).array()])
      .optional(),
    update: z
      .union([
        z.lazy(() => DeckUpdateWithWhereUniqueWithoutCreatorInputSchema),
        z.lazy(() => DeckUpdateWithWhereUniqueWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => DeckUpdateManyWithWhereWithoutCreatorInputSchema),
        z.lazy(() => DeckUpdateManyWithWhereWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([z.lazy(() => DeckScalarWhereInputSchema), z.lazy(() => DeckScalarWhereInputSchema).array()])
      .optional(),
  });

export const DeckUncheckedUpdateManyWithoutCreatorNestedInputSchema: z.ZodType<Prisma.DeckUncheckedUpdateManyWithoutCreatorNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => DeckCreateWithoutCreatorInputSchema),
        z.lazy(() => DeckCreateWithoutCreatorInputSchema).array(),
        z.lazy(() => DeckUncheckedCreateWithoutCreatorInputSchema),
        z.lazy(() => DeckUncheckedCreateWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => DeckCreateOrConnectWithoutCreatorInputSchema),
        z.lazy(() => DeckCreateOrConnectWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => DeckUpsertWithWhereUniqueWithoutCreatorInputSchema),
        z.lazy(() => DeckUpsertWithWhereUniqueWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => DeckCreateManyCreatorInputEnvelopeSchema).optional(),
    set: z
      .union([z.lazy(() => DeckWhereUniqueInputSchema), z.lazy(() => DeckWhereUniqueInputSchema).array()])
      .optional(),
    disconnect: z
      .union([z.lazy(() => DeckWhereUniqueInputSchema), z.lazy(() => DeckWhereUniqueInputSchema).array()])
      .optional(),
    delete: z
      .union([z.lazy(() => DeckWhereUniqueInputSchema), z.lazy(() => DeckWhereUniqueInputSchema).array()])
      .optional(),
    connect: z
      .union([z.lazy(() => DeckWhereUniqueInputSchema), z.lazy(() => DeckWhereUniqueInputSchema).array()])
      .optional(),
    update: z
      .union([
        z.lazy(() => DeckUpdateWithWhereUniqueWithoutCreatorInputSchema),
        z.lazy(() => DeckUpdateWithWhereUniqueWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => DeckUpdateManyWithWhereWithoutCreatorInputSchema),
        z.lazy(() => DeckUpdateManyWithWhereWithoutCreatorInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([z.lazy(() => DeckScalarWhereInputSchema), z.lazy(() => DeckScalarWhereInputSchema).array()])
      .optional(),
  });

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
});

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
});

export const NestedEnumDeckTypeFilterSchema: z.ZodType<Prisma.NestedEnumDeckTypeFilter> = z.strictObject({
  equals: z.lazy(() => DeckTypeSchema).optional(),
  in: z
    .lazy(() => DeckTypeSchema)
    .array()
    .optional(),
  notIn: z
    .lazy(() => DeckTypeSchema)
    .array()
    .optional(),
  not: z.union([z.lazy(() => DeckTypeSchema), z.lazy(() => NestedEnumDeckTypeFilterSchema)]).optional(),
});

export const NestedUuidNullableFilterSchema: z.ZodType<Prisma.NestedUuidNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z
    .union([z.string(), z.lazy(() => NestedUuidNullableFilterSchema)])
    .optional()
    .nullable(),
});

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedIntWithAggregatesFilterSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatFilterSchema)]).optional(),
});

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional(),
    in: z.string().array().optional(),
    notIn: z.string().array().optional(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedStringFilterSchema).optional(),
    _max: z.lazy(() => NestedStringFilterSchema).optional(),
  });

export const NestedEnumDeckTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumDeckTypeWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => DeckTypeSchema).optional(),
    in: z
      .lazy(() => DeckTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => DeckTypeSchema)
      .array()
      .optional(),
    not: z.union([z.lazy(() => DeckTypeSchema), z.lazy(() => NestedEnumDeckTypeWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumDeckTypeFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumDeckTypeFilterSchema).optional(),
  });

export const NestedUuidNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedUuidNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedUuidNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  });

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z
    .union([z.number(), z.lazy(() => NestedIntNullableFilterSchema)])
    .optional()
    .nullable(),
});

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z
    .union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
    .optional()
    .nullable(),
});

export const NestedUuidFilterSchema: z.ZodType<Prisma.NestedUuidFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([z.string(), z.lazy(() => NestedUuidFilterSchema)]).optional(),
});

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
});

export const NestedUuidWithAggregatesFilterSchema: z.ZodType<Prisma.NestedUuidWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([z.string(), z.lazy(() => NestedUuidWithAggregatesFilterSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  });

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> =
  z.strictObject({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  });

export const UserCreateWithoutCreatedDecksInputSchema: z.ZodType<Prisma.UserCreateWithoutCreatedDecksInput> =
  z.strictObject({
    id: z.string(),
    googleSub: z.string(),
    email: z.string(),
    name: z.string(),
    displayName: z.string().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  });

export const UserUncheckedCreateWithoutCreatedDecksInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutCreatedDecksInput> =
  z.strictObject({
    id: z.string(),
    googleSub: z.string(),
    email: z.string(),
    name: z.string(),
    displayName: z.string().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  });

export const UserCreateOrConnectWithoutCreatedDecksInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutCreatedDecksInput> =
  z.strictObject({
    where: z.lazy(() => UserWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => UserCreateWithoutCreatedDecksInputSchema),
      z.lazy(() => UserUncheckedCreateWithoutCreatedDecksInputSchema),
    ]),
  });

export const BlackCardCreateWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardCreateWithoutDeckInput> = z.strictObject({
  content: z.string(),
  pickCount: z.number().int(),
});

export const BlackCardUncheckedCreateWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUncheckedCreateWithoutDeckInput> =
  z.strictObject({
    id: z.number().int().optional(),
    content: z.string(),
    pickCount: z.number().int(),
  });

export const BlackCardCreateOrConnectWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardCreateOrConnectWithoutDeckInput> =
  z.strictObject({
    where: z.lazy(() => BlackCardWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => BlackCardCreateWithoutDeckInputSchema),
      z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema),
    ]),
  });

export const BlackCardCreateManyDeckInputEnvelopeSchema: z.ZodType<Prisma.BlackCardCreateManyDeckInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => BlackCardCreateManyDeckInputSchema),
      z.lazy(() => BlackCardCreateManyDeckInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  });

export const WhiteCardCreateWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardCreateWithoutDeckInput> = z.strictObject({
  content: z.string(),
});

export const WhiteCardUncheckedCreateWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUncheckedCreateWithoutDeckInput> =
  z.strictObject({
    id: z.number().int().optional(),
    content: z.string(),
  });

export const WhiteCardCreateOrConnectWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardCreateOrConnectWithoutDeckInput> =
  z.strictObject({
    where: z.lazy(() => WhiteCardWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),
      z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema),
    ]),
  });

export const WhiteCardCreateManyDeckInputEnvelopeSchema: z.ZodType<Prisma.WhiteCardCreateManyDeckInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => WhiteCardCreateManyDeckInputSchema),
      z.lazy(() => WhiteCardCreateManyDeckInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  });

export const UserUpsertWithoutCreatedDecksInputSchema: z.ZodType<Prisma.UserUpsertWithoutCreatedDecksInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => UserUpdateWithoutCreatedDecksInputSchema),
      z.lazy(() => UserUncheckedUpdateWithoutCreatedDecksInputSchema),
    ]),
    create: z.union([
      z.lazy(() => UserCreateWithoutCreatedDecksInputSchema),
      z.lazy(() => UserUncheckedCreateWithoutCreatedDecksInputSchema),
    ]),
    where: z.lazy(() => UserWhereInputSchema).optional(),
  });

export const UserUpdateToOneWithWhereWithoutCreatedDecksInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutCreatedDecksInput> =
  z.strictObject({
    where: z.lazy(() => UserWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => UserUpdateWithoutCreatedDecksInputSchema),
      z.lazy(() => UserUncheckedUpdateWithoutCreatedDecksInputSchema),
    ]),
  });

export const UserUpdateWithoutCreatedDecksInputSchema: z.ZodType<Prisma.UserUpdateWithoutCreatedDecksInput> =
  z.strictObject({
    id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    googleSub: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    displayName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
  });

export const UserUncheckedUpdateWithoutCreatedDecksInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutCreatedDecksInput> =
  z.strictObject({
    id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    googleSub: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    displayName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
    updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
  });

export const BlackCardUpsertWithWhereUniqueWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUpsertWithWhereUniqueWithoutDeckInput> =
  z.strictObject({
    where: z.lazy(() => BlackCardWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => BlackCardUpdateWithoutDeckInputSchema),
      z.lazy(() => BlackCardUncheckedUpdateWithoutDeckInputSchema),
    ]),
    create: z.union([
      z.lazy(() => BlackCardCreateWithoutDeckInputSchema),
      z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema),
    ]),
  });

export const BlackCardUpdateWithWhereUniqueWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUpdateWithWhereUniqueWithoutDeckInput> =
  z.strictObject({
    where: z.lazy(() => BlackCardWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => BlackCardUpdateWithoutDeckInputSchema),
      z.lazy(() => BlackCardUncheckedUpdateWithoutDeckInputSchema),
    ]),
  });

export const BlackCardUpdateManyWithWhereWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUpdateManyWithWhereWithoutDeckInput> =
  z.strictObject({
    where: z.lazy(() => BlackCardScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => BlackCardUpdateManyMutationInputSchema),
      z.lazy(() => BlackCardUncheckedUpdateManyWithoutDeckInputSchema),
    ]),
  });

export const BlackCardScalarWhereInputSchema: z.ZodType<Prisma.BlackCardScalarWhereInput> = z.strictObject({
  AND: z
    .union([z.lazy(() => BlackCardScalarWhereInputSchema), z.lazy(() => BlackCardScalarWhereInputSchema).array()])
    .optional(),
  OR: z
    .lazy(() => BlackCardScalarWhereInputSchema)
    .array()
    .optional(),
  NOT: z
    .union([z.lazy(() => BlackCardScalarWhereInputSchema), z.lazy(() => BlackCardScalarWhereInputSchema).array()])
    .optional(),
  id: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  content: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  pickCount: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  deckId: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
});

export const WhiteCardUpsertWithWhereUniqueWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUpsertWithWhereUniqueWithoutDeckInput> =
  z.strictObject({
    where: z.lazy(() => WhiteCardWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => WhiteCardUpdateWithoutDeckInputSchema),
      z.lazy(() => WhiteCardUncheckedUpdateWithoutDeckInputSchema),
    ]),
    create: z.union([
      z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),
      z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema),
    ]),
  });

export const WhiteCardUpdateWithWhereUniqueWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUpdateWithWhereUniqueWithoutDeckInput> =
  z.strictObject({
    where: z.lazy(() => WhiteCardWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => WhiteCardUpdateWithoutDeckInputSchema),
      z.lazy(() => WhiteCardUncheckedUpdateWithoutDeckInputSchema),
    ]),
  });

export const WhiteCardUpdateManyWithWhereWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUpdateManyWithWhereWithoutDeckInput> =
  z.strictObject({
    where: z.lazy(() => WhiteCardScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => WhiteCardUpdateManyMutationInputSchema),
      z.lazy(() => WhiteCardUncheckedUpdateManyWithoutDeckInputSchema),
    ]),
  });

export const WhiteCardScalarWhereInputSchema: z.ZodType<Prisma.WhiteCardScalarWhereInput> = z.strictObject({
  AND: z
    .union([z.lazy(() => WhiteCardScalarWhereInputSchema), z.lazy(() => WhiteCardScalarWhereInputSchema).array()])
    .optional(),
  OR: z
    .lazy(() => WhiteCardScalarWhereInputSchema)
    .array()
    .optional(),
  NOT: z
    .union([z.lazy(() => WhiteCardScalarWhereInputSchema), z.lazy(() => WhiteCardScalarWhereInputSchema).array()])
    .optional(),
  id: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  content: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  deckId: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
});

export const DeckCreateWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckCreateWithoutBlackCardsInput> =
  z.strictObject({
    name: z.string(),
    watermark: z.string(),
    type: z.lazy(() => DeckTypeSchema),
    creator: z.lazy(() => UserCreateNestedOneWithoutCreatedDecksInputSchema).optional(),
    whiteCards: z.lazy(() => WhiteCardCreateNestedManyWithoutDeckInputSchema).optional(),
  });

export const DeckUncheckedCreateWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckUncheckedCreateWithoutBlackCardsInput> =
  z.strictObject({
    id: z.number().int().optional(),
    name: z.string(),
    watermark: z.string(),
    type: z.lazy(() => DeckTypeSchema),
    createdBy: z.string().optional().nullable(),
    whiteCards: z.lazy(() => WhiteCardUncheckedCreateNestedManyWithoutDeckInputSchema).optional(),
  });

export const DeckCreateOrConnectWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckCreateOrConnectWithoutBlackCardsInput> =
  z.strictObject({
    where: z.lazy(() => DeckWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => DeckCreateWithoutBlackCardsInputSchema),
      z.lazy(() => DeckUncheckedCreateWithoutBlackCardsInputSchema),
    ]),
  });

export const DeckUpsertWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckUpsertWithoutBlackCardsInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => DeckUpdateWithoutBlackCardsInputSchema),
      z.lazy(() => DeckUncheckedUpdateWithoutBlackCardsInputSchema),
    ]),
    create: z.union([
      z.lazy(() => DeckCreateWithoutBlackCardsInputSchema),
      z.lazy(() => DeckUncheckedCreateWithoutBlackCardsInputSchema),
    ]),
    where: z.lazy(() => DeckWhereInputSchema).optional(),
  });

export const DeckUpdateToOneWithWhereWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckUpdateToOneWithWhereWithoutBlackCardsInput> =
  z.strictObject({
    where: z.lazy(() => DeckWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => DeckUpdateWithoutBlackCardsInputSchema),
      z.lazy(() => DeckUncheckedUpdateWithoutBlackCardsInputSchema),
    ]),
  });

export const DeckUpdateWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckUpdateWithoutBlackCardsInput> =
  z.strictObject({
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    watermark: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z
      .union([z.lazy(() => DeckTypeSchema), z.lazy(() => EnumDeckTypeFieldUpdateOperationsInputSchema)])
      .optional(),
    creator: z.lazy(() => UserUpdateOneWithoutCreatedDecksNestedInputSchema).optional(),
    whiteCards: z.lazy(() => WhiteCardUpdateManyWithoutDeckNestedInputSchema).optional(),
  });

export const DeckUncheckedUpdateWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckUncheckedUpdateWithoutBlackCardsInput> =
  z.strictObject({
    id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    watermark: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z
      .union([z.lazy(() => DeckTypeSchema), z.lazy(() => EnumDeckTypeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    whiteCards: z.lazy(() => WhiteCardUncheckedUpdateManyWithoutDeckNestedInputSchema).optional(),
  });

export const DeckCreateWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckCreateWithoutWhiteCardsInput> =
  z.strictObject({
    name: z.string(),
    watermark: z.string(),
    type: z.lazy(() => DeckTypeSchema),
    creator: z.lazy(() => UserCreateNestedOneWithoutCreatedDecksInputSchema).optional(),
    blackCards: z.lazy(() => BlackCardCreateNestedManyWithoutDeckInputSchema).optional(),
  });

export const DeckUncheckedCreateWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckUncheckedCreateWithoutWhiteCardsInput> =
  z.strictObject({
    id: z.number().int().optional(),
    name: z.string(),
    watermark: z.string(),
    type: z.lazy(() => DeckTypeSchema),
    createdBy: z.string().optional().nullable(),
    blackCards: z.lazy(() => BlackCardUncheckedCreateNestedManyWithoutDeckInputSchema).optional(),
  });

export const DeckCreateOrConnectWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckCreateOrConnectWithoutWhiteCardsInput> =
  z.strictObject({
    where: z.lazy(() => DeckWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => DeckCreateWithoutWhiteCardsInputSchema),
      z.lazy(() => DeckUncheckedCreateWithoutWhiteCardsInputSchema),
    ]),
  });

export const DeckUpsertWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckUpsertWithoutWhiteCardsInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => DeckUpdateWithoutWhiteCardsInputSchema),
      z.lazy(() => DeckUncheckedUpdateWithoutWhiteCardsInputSchema),
    ]),
    create: z.union([
      z.lazy(() => DeckCreateWithoutWhiteCardsInputSchema),
      z.lazy(() => DeckUncheckedCreateWithoutWhiteCardsInputSchema),
    ]),
    where: z.lazy(() => DeckWhereInputSchema).optional(),
  });

export const DeckUpdateToOneWithWhereWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckUpdateToOneWithWhereWithoutWhiteCardsInput> =
  z.strictObject({
    where: z.lazy(() => DeckWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => DeckUpdateWithoutWhiteCardsInputSchema),
      z.lazy(() => DeckUncheckedUpdateWithoutWhiteCardsInputSchema),
    ]),
  });

export const DeckUpdateWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckUpdateWithoutWhiteCardsInput> =
  z.strictObject({
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    watermark: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z
      .union([z.lazy(() => DeckTypeSchema), z.lazy(() => EnumDeckTypeFieldUpdateOperationsInputSchema)])
      .optional(),
    creator: z.lazy(() => UserUpdateOneWithoutCreatedDecksNestedInputSchema).optional(),
    blackCards: z.lazy(() => BlackCardUpdateManyWithoutDeckNestedInputSchema).optional(),
  });

export const DeckUncheckedUpdateWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckUncheckedUpdateWithoutWhiteCardsInput> =
  z.strictObject({
    id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    watermark: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z
      .union([z.lazy(() => DeckTypeSchema), z.lazy(() => EnumDeckTypeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    blackCards: z.lazy(() => BlackCardUncheckedUpdateManyWithoutDeckNestedInputSchema).optional(),
  });

export const DeckCreateWithoutCreatorInputSchema: z.ZodType<Prisma.DeckCreateWithoutCreatorInput> = z.strictObject({
  name: z.string(),
  watermark: z.string(),
  type: z.lazy(() => DeckTypeSchema),
  blackCards: z.lazy(() => BlackCardCreateNestedManyWithoutDeckInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardCreateNestedManyWithoutDeckInputSchema).optional(),
});

export const DeckUncheckedCreateWithoutCreatorInputSchema: z.ZodType<Prisma.DeckUncheckedCreateWithoutCreatorInput> =
  z.strictObject({
    id: z.number().int().optional(),
    name: z.string(),
    watermark: z.string(),
    type: z.lazy(() => DeckTypeSchema),
    blackCards: z.lazy(() => BlackCardUncheckedCreateNestedManyWithoutDeckInputSchema).optional(),
    whiteCards: z.lazy(() => WhiteCardUncheckedCreateNestedManyWithoutDeckInputSchema).optional(),
  });

export const DeckCreateOrConnectWithoutCreatorInputSchema: z.ZodType<Prisma.DeckCreateOrConnectWithoutCreatorInput> =
  z.strictObject({
    where: z.lazy(() => DeckWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => DeckCreateWithoutCreatorInputSchema),
      z.lazy(() => DeckUncheckedCreateWithoutCreatorInputSchema),
    ]),
  });

export const DeckCreateManyCreatorInputEnvelopeSchema: z.ZodType<Prisma.DeckCreateManyCreatorInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => DeckCreateManyCreatorInputSchema),
      z.lazy(() => DeckCreateManyCreatorInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  });

export const DeckUpsertWithWhereUniqueWithoutCreatorInputSchema: z.ZodType<Prisma.DeckUpsertWithWhereUniqueWithoutCreatorInput> =
  z.strictObject({
    where: z.lazy(() => DeckWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => DeckUpdateWithoutCreatorInputSchema),
      z.lazy(() => DeckUncheckedUpdateWithoutCreatorInputSchema),
    ]),
    create: z.union([
      z.lazy(() => DeckCreateWithoutCreatorInputSchema),
      z.lazy(() => DeckUncheckedCreateWithoutCreatorInputSchema),
    ]),
  });

export const DeckUpdateWithWhereUniqueWithoutCreatorInputSchema: z.ZodType<Prisma.DeckUpdateWithWhereUniqueWithoutCreatorInput> =
  z.strictObject({
    where: z.lazy(() => DeckWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => DeckUpdateWithoutCreatorInputSchema),
      z.lazy(() => DeckUncheckedUpdateWithoutCreatorInputSchema),
    ]),
  });

export const DeckUpdateManyWithWhereWithoutCreatorInputSchema: z.ZodType<Prisma.DeckUpdateManyWithWhereWithoutCreatorInput> =
  z.strictObject({
    where: z.lazy(() => DeckScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => DeckUpdateManyMutationInputSchema),
      z.lazy(() => DeckUncheckedUpdateManyWithoutCreatorInputSchema),
    ]),
  });

export const DeckScalarWhereInputSchema: z.ZodType<Prisma.DeckScalarWhereInput> = z.strictObject({
  AND: z.union([z.lazy(() => DeckScalarWhereInputSchema), z.lazy(() => DeckScalarWhereInputSchema).array()]).optional(),
  OR: z
    .lazy(() => DeckScalarWhereInputSchema)
    .array()
    .optional(),
  NOT: z.union([z.lazy(() => DeckScalarWhereInputSchema), z.lazy(() => DeckScalarWhereInputSchema).array()]).optional(),
  id: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  watermark: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  type: z.union([z.lazy(() => EnumDeckTypeFilterSchema), z.lazy(() => DeckTypeSchema)]).optional(),
  createdBy: z
    .union([z.lazy(() => UuidNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
});

export const BlackCardCreateManyDeckInputSchema: z.ZodType<Prisma.BlackCardCreateManyDeckInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  pickCount: z.number().int(),
});

export const WhiteCardCreateManyDeckInputSchema: z.ZodType<Prisma.WhiteCardCreateManyDeckInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
});

export const BlackCardUpdateWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUpdateWithoutDeckInput> = z.strictObject({
  content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  pickCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
});

export const BlackCardUncheckedUpdateWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUncheckedUpdateWithoutDeckInput> =
  z.strictObject({
    id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
    content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    pickCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
  });

export const BlackCardUncheckedUpdateManyWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUncheckedUpdateManyWithoutDeckInput> =
  z.strictObject({
    id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
    content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    pickCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
  });

export const WhiteCardUpdateWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUpdateWithoutDeckInput> = z.strictObject({
  content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
});

export const WhiteCardUncheckedUpdateWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUncheckedUpdateWithoutDeckInput> =
  z.strictObject({
    id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
    content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  });

export const WhiteCardUncheckedUpdateManyWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUncheckedUpdateManyWithoutDeckInput> =
  z.strictObject({
    id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
    content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  });

export const DeckCreateManyCreatorInputSchema: z.ZodType<Prisma.DeckCreateManyCreatorInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  watermark: z.string(),
  type: z.lazy(() => DeckTypeSchema),
});

export const DeckUpdateWithoutCreatorInputSchema: z.ZodType<Prisma.DeckUpdateWithoutCreatorInput> = z.strictObject({
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  watermark: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  type: z.union([z.lazy(() => DeckTypeSchema), z.lazy(() => EnumDeckTypeFieldUpdateOperationsInputSchema)]).optional(),
  blackCards: z.lazy(() => BlackCardUpdateManyWithoutDeckNestedInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardUpdateManyWithoutDeckNestedInputSchema).optional(),
});

export const DeckUncheckedUpdateWithoutCreatorInputSchema: z.ZodType<Prisma.DeckUncheckedUpdateWithoutCreatorInput> =
  z.strictObject({
    id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    watermark: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z
      .union([z.lazy(() => DeckTypeSchema), z.lazy(() => EnumDeckTypeFieldUpdateOperationsInputSchema)])
      .optional(),
    blackCards: z.lazy(() => BlackCardUncheckedUpdateManyWithoutDeckNestedInputSchema).optional(),
    whiteCards: z.lazy(() => WhiteCardUncheckedUpdateManyWithoutDeckNestedInputSchema).optional(),
  });

export const DeckUncheckedUpdateManyWithoutCreatorInputSchema: z.ZodType<Prisma.DeckUncheckedUpdateManyWithoutCreatorInput> =
  z.strictObject({
    id: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    watermark: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    type: z
      .union([z.lazy(() => DeckTypeSchema), z.lazy(() => EnumDeckTypeFieldUpdateOperationsInputSchema)])
      .optional(),
  });

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const DeckFindFirstArgsSchema: z.ZodType<Prisma.DeckFindFirstArgs> = z
  .object({
    select: DeckSelectSchema.optional(),
    include: DeckIncludeSchema.optional(),
    where: DeckWhereInputSchema.optional(),
    orderBy: z.union([DeckOrderByWithRelationInputSchema.array(), DeckOrderByWithRelationInputSchema]).optional(),
    cursor: DeckWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([DeckScalarFieldEnumSchema, DeckScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const DeckFindFirstOrThrowArgsSchema: z.ZodType<Prisma.DeckFindFirstOrThrowArgs> = z
  .object({
    select: DeckSelectSchema.optional(),
    include: DeckIncludeSchema.optional(),
    where: DeckWhereInputSchema.optional(),
    orderBy: z.union([DeckOrderByWithRelationInputSchema.array(), DeckOrderByWithRelationInputSchema]).optional(),
    cursor: DeckWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([DeckScalarFieldEnumSchema, DeckScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const DeckFindManyArgsSchema: z.ZodType<Prisma.DeckFindManyArgs> = z
  .object({
    select: DeckSelectSchema.optional(),
    include: DeckIncludeSchema.optional(),
    where: DeckWhereInputSchema.optional(),
    orderBy: z.union([DeckOrderByWithRelationInputSchema.array(), DeckOrderByWithRelationInputSchema]).optional(),
    cursor: DeckWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([DeckScalarFieldEnumSchema, DeckScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const DeckAggregateArgsSchema: z.ZodType<Prisma.DeckAggregateArgs> = z
  .object({
    where: DeckWhereInputSchema.optional(),
    orderBy: z.union([DeckOrderByWithRelationInputSchema.array(), DeckOrderByWithRelationInputSchema]).optional(),
    cursor: DeckWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const DeckGroupByArgsSchema: z.ZodType<Prisma.DeckGroupByArgs> = z
  .object({
    where: DeckWhereInputSchema.optional(),
    orderBy: z.union([DeckOrderByWithAggregationInputSchema.array(), DeckOrderByWithAggregationInputSchema]).optional(),
    by: DeckScalarFieldEnumSchema.array(),
    having: DeckScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const DeckFindUniqueArgsSchema: z.ZodType<Prisma.DeckFindUniqueArgs> = z
  .object({
    select: DeckSelectSchema.optional(),
    include: DeckIncludeSchema.optional(),
    where: DeckWhereUniqueInputSchema,
  })
  .strict();

export const DeckFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.DeckFindUniqueOrThrowArgs> = z
  .object({
    select: DeckSelectSchema.optional(),
    include: DeckIncludeSchema.optional(),
    where: DeckWhereUniqueInputSchema,
  })
  .strict();

export const BlackCardFindFirstArgsSchema: z.ZodType<Prisma.BlackCardFindFirstArgs> = z
  .object({
    select: BlackCardSelectSchema.optional(),
    include: BlackCardIncludeSchema.optional(),
    where: BlackCardWhereInputSchema.optional(),
    orderBy: z
      .union([BlackCardOrderByWithRelationInputSchema.array(), BlackCardOrderByWithRelationInputSchema])
      .optional(),
    cursor: BlackCardWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([BlackCardScalarFieldEnumSchema, BlackCardScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const BlackCardFindFirstOrThrowArgsSchema: z.ZodType<Prisma.BlackCardFindFirstOrThrowArgs> = z
  .object({
    select: BlackCardSelectSchema.optional(),
    include: BlackCardIncludeSchema.optional(),
    where: BlackCardWhereInputSchema.optional(),
    orderBy: z
      .union([BlackCardOrderByWithRelationInputSchema.array(), BlackCardOrderByWithRelationInputSchema])
      .optional(),
    cursor: BlackCardWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([BlackCardScalarFieldEnumSchema, BlackCardScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const BlackCardFindManyArgsSchema: z.ZodType<Prisma.BlackCardFindManyArgs> = z
  .object({
    select: BlackCardSelectSchema.optional(),
    include: BlackCardIncludeSchema.optional(),
    where: BlackCardWhereInputSchema.optional(),
    orderBy: z
      .union([BlackCardOrderByWithRelationInputSchema.array(), BlackCardOrderByWithRelationInputSchema])
      .optional(),
    cursor: BlackCardWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([BlackCardScalarFieldEnumSchema, BlackCardScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const BlackCardAggregateArgsSchema: z.ZodType<Prisma.BlackCardAggregateArgs> = z
  .object({
    where: BlackCardWhereInputSchema.optional(),
    orderBy: z
      .union([BlackCardOrderByWithRelationInputSchema.array(), BlackCardOrderByWithRelationInputSchema])
      .optional(),
    cursor: BlackCardWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const BlackCardGroupByArgsSchema: z.ZodType<Prisma.BlackCardGroupByArgs> = z
  .object({
    where: BlackCardWhereInputSchema.optional(),
    orderBy: z
      .union([BlackCardOrderByWithAggregationInputSchema.array(), BlackCardOrderByWithAggregationInputSchema])
      .optional(),
    by: BlackCardScalarFieldEnumSchema.array(),
    having: BlackCardScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const BlackCardFindUniqueArgsSchema: z.ZodType<Prisma.BlackCardFindUniqueArgs> = z
  .object({
    select: BlackCardSelectSchema.optional(),
    include: BlackCardIncludeSchema.optional(),
    where: BlackCardWhereUniqueInputSchema,
  })
  .strict();

export const BlackCardFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.BlackCardFindUniqueOrThrowArgs> = z
  .object({
    select: BlackCardSelectSchema.optional(),
    include: BlackCardIncludeSchema.optional(),
    where: BlackCardWhereUniqueInputSchema,
  })
  .strict();

export const WhiteCardFindFirstArgsSchema: z.ZodType<Prisma.WhiteCardFindFirstArgs> = z
  .object({
    select: WhiteCardSelectSchema.optional(),
    include: WhiteCardIncludeSchema.optional(),
    where: WhiteCardWhereInputSchema.optional(),
    orderBy: z
      .union([WhiteCardOrderByWithRelationInputSchema.array(), WhiteCardOrderByWithRelationInputSchema])
      .optional(),
    cursor: WhiteCardWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([WhiteCardScalarFieldEnumSchema, WhiteCardScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const WhiteCardFindFirstOrThrowArgsSchema: z.ZodType<Prisma.WhiteCardFindFirstOrThrowArgs> = z
  .object({
    select: WhiteCardSelectSchema.optional(),
    include: WhiteCardIncludeSchema.optional(),
    where: WhiteCardWhereInputSchema.optional(),
    orderBy: z
      .union([WhiteCardOrderByWithRelationInputSchema.array(), WhiteCardOrderByWithRelationInputSchema])
      .optional(),
    cursor: WhiteCardWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([WhiteCardScalarFieldEnumSchema, WhiteCardScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const WhiteCardFindManyArgsSchema: z.ZodType<Prisma.WhiteCardFindManyArgs> = z
  .object({
    select: WhiteCardSelectSchema.optional(),
    include: WhiteCardIncludeSchema.optional(),
    where: WhiteCardWhereInputSchema.optional(),
    orderBy: z
      .union([WhiteCardOrderByWithRelationInputSchema.array(), WhiteCardOrderByWithRelationInputSchema])
      .optional(),
    cursor: WhiteCardWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([WhiteCardScalarFieldEnumSchema, WhiteCardScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const WhiteCardAggregateArgsSchema: z.ZodType<Prisma.WhiteCardAggregateArgs> = z
  .object({
    where: WhiteCardWhereInputSchema.optional(),
    orderBy: z
      .union([WhiteCardOrderByWithRelationInputSchema.array(), WhiteCardOrderByWithRelationInputSchema])
      .optional(),
    cursor: WhiteCardWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const WhiteCardGroupByArgsSchema: z.ZodType<Prisma.WhiteCardGroupByArgs> = z
  .object({
    where: WhiteCardWhereInputSchema.optional(),
    orderBy: z
      .union([WhiteCardOrderByWithAggregationInputSchema.array(), WhiteCardOrderByWithAggregationInputSchema])
      .optional(),
    by: WhiteCardScalarFieldEnumSchema.array(),
    having: WhiteCardScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const WhiteCardFindUniqueArgsSchema: z.ZodType<Prisma.WhiteCardFindUniqueArgs> = z
  .object({
    select: WhiteCardSelectSchema.optional(),
    include: WhiteCardIncludeSchema.optional(),
    where: WhiteCardWhereUniqueInputSchema,
  })
  .strict();

export const WhiteCardFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.WhiteCardFindUniqueOrThrowArgs> = z
  .object({
    select: WhiteCardSelectSchema.optional(),
    include: WhiteCardIncludeSchema.optional(),
    where: WhiteCardWhereUniqueInputSchema,
  })
  .strict();

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereInputSchema.optional(),
    orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereInputSchema.optional(),
    orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereInputSchema.optional(),
    orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z
  .object({
    where: UserWhereInputSchema.optional(),
    orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z
  .object({
    where: UserWhereInputSchema.optional(),
    orderBy: z.union([UserOrderByWithAggregationInputSchema.array(), UserOrderByWithAggregationInputSchema]).optional(),
    by: UserScalarFieldEnumSchema.array(),
    having: UserScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
  })
  .strict();

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
  })
  .strict();

export const InvalidatedSessionFindFirstArgsSchema: z.ZodType<Prisma.InvalidatedSessionFindFirstArgs> = z
  .object({
    select: InvalidatedSessionSelectSchema.optional(),
    where: InvalidatedSessionWhereInputSchema.optional(),
    orderBy: z
      .union([
        InvalidatedSessionOrderByWithRelationInputSchema.array(),
        InvalidatedSessionOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: InvalidatedSessionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([InvalidatedSessionScalarFieldEnumSchema, InvalidatedSessionScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const InvalidatedSessionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.InvalidatedSessionFindFirstOrThrowArgs> = z
  .object({
    select: InvalidatedSessionSelectSchema.optional(),
    where: InvalidatedSessionWhereInputSchema.optional(),
    orderBy: z
      .union([
        InvalidatedSessionOrderByWithRelationInputSchema.array(),
        InvalidatedSessionOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: InvalidatedSessionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([InvalidatedSessionScalarFieldEnumSchema, InvalidatedSessionScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const InvalidatedSessionFindManyArgsSchema: z.ZodType<Prisma.InvalidatedSessionFindManyArgs> = z
  .object({
    select: InvalidatedSessionSelectSchema.optional(),
    where: InvalidatedSessionWhereInputSchema.optional(),
    orderBy: z
      .union([
        InvalidatedSessionOrderByWithRelationInputSchema.array(),
        InvalidatedSessionOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: InvalidatedSessionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([InvalidatedSessionScalarFieldEnumSchema, InvalidatedSessionScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const InvalidatedSessionAggregateArgsSchema: z.ZodType<Prisma.InvalidatedSessionAggregateArgs> = z
  .object({
    where: InvalidatedSessionWhereInputSchema.optional(),
    orderBy: z
      .union([
        InvalidatedSessionOrderByWithRelationInputSchema.array(),
        InvalidatedSessionOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: InvalidatedSessionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const InvalidatedSessionGroupByArgsSchema: z.ZodType<Prisma.InvalidatedSessionGroupByArgs> = z
  .object({
    where: InvalidatedSessionWhereInputSchema.optional(),
    orderBy: z
      .union([
        InvalidatedSessionOrderByWithAggregationInputSchema.array(),
        InvalidatedSessionOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: InvalidatedSessionScalarFieldEnumSchema.array(),
    having: InvalidatedSessionScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const InvalidatedSessionFindUniqueArgsSchema: z.ZodType<Prisma.InvalidatedSessionFindUniqueArgs> = z
  .object({
    select: InvalidatedSessionSelectSchema.optional(),
    where: InvalidatedSessionWhereUniqueInputSchema,
  })
  .strict();

export const InvalidatedSessionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.InvalidatedSessionFindUniqueOrThrowArgs> =
  z
    .object({
      select: InvalidatedSessionSelectSchema.optional(),
      where: InvalidatedSessionWhereUniqueInputSchema,
    })
    .strict();

export const DeckCreateArgsSchema: z.ZodType<Prisma.DeckCreateArgs> = z
  .object({
    select: DeckSelectSchema.optional(),
    include: DeckIncludeSchema.optional(),
    data: z.union([DeckCreateInputSchema, DeckUncheckedCreateInputSchema]),
  })
  .strict();

export const DeckUpsertArgsSchema: z.ZodType<Prisma.DeckUpsertArgs> = z
  .object({
    select: DeckSelectSchema.optional(),
    include: DeckIncludeSchema.optional(),
    where: DeckWhereUniqueInputSchema,
    create: z.union([DeckCreateInputSchema, DeckUncheckedCreateInputSchema]),
    update: z.union([DeckUpdateInputSchema, DeckUncheckedUpdateInputSchema]),
  })
  .strict();

export const DeckCreateManyArgsSchema: z.ZodType<Prisma.DeckCreateManyArgs> = z
  .object({
    data: z.union([DeckCreateManyInputSchema, DeckCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const DeckCreateManyAndReturnArgsSchema: z.ZodType<Prisma.DeckCreateManyAndReturnArgs> = z
  .object({
    data: z.union([DeckCreateManyInputSchema, DeckCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const DeckDeleteArgsSchema: z.ZodType<Prisma.DeckDeleteArgs> = z
  .object({
    select: DeckSelectSchema.optional(),
    include: DeckIncludeSchema.optional(),
    where: DeckWhereUniqueInputSchema,
  })
  .strict();

export const DeckUpdateArgsSchema: z.ZodType<Prisma.DeckUpdateArgs> = z
  .object({
    select: DeckSelectSchema.optional(),
    include: DeckIncludeSchema.optional(),
    data: z.union([DeckUpdateInputSchema, DeckUncheckedUpdateInputSchema]),
    where: DeckWhereUniqueInputSchema,
  })
  .strict();

export const DeckUpdateManyArgsSchema: z.ZodType<Prisma.DeckUpdateManyArgs> = z
  .object({
    data: z.union([DeckUpdateManyMutationInputSchema, DeckUncheckedUpdateManyInputSchema]),
    where: DeckWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const DeckUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.DeckUpdateManyAndReturnArgs> = z
  .object({
    data: z.union([DeckUpdateManyMutationInputSchema, DeckUncheckedUpdateManyInputSchema]),
    where: DeckWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const DeckDeleteManyArgsSchema: z.ZodType<Prisma.DeckDeleteManyArgs> = z
  .object({
    where: DeckWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const BlackCardCreateArgsSchema: z.ZodType<Prisma.BlackCardCreateArgs> = z
  .object({
    select: BlackCardSelectSchema.optional(),
    include: BlackCardIncludeSchema.optional(),
    data: z.union([BlackCardCreateInputSchema, BlackCardUncheckedCreateInputSchema]),
  })
  .strict();

export const BlackCardUpsertArgsSchema: z.ZodType<Prisma.BlackCardUpsertArgs> = z
  .object({
    select: BlackCardSelectSchema.optional(),
    include: BlackCardIncludeSchema.optional(),
    where: BlackCardWhereUniqueInputSchema,
    create: z.union([BlackCardCreateInputSchema, BlackCardUncheckedCreateInputSchema]),
    update: z.union([BlackCardUpdateInputSchema, BlackCardUncheckedUpdateInputSchema]),
  })
  .strict();

export const BlackCardCreateManyArgsSchema: z.ZodType<Prisma.BlackCardCreateManyArgs> = z
  .object({
    data: z.union([BlackCardCreateManyInputSchema, BlackCardCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const BlackCardCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BlackCardCreateManyAndReturnArgs> = z
  .object({
    data: z.union([BlackCardCreateManyInputSchema, BlackCardCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const BlackCardDeleteArgsSchema: z.ZodType<Prisma.BlackCardDeleteArgs> = z
  .object({
    select: BlackCardSelectSchema.optional(),
    include: BlackCardIncludeSchema.optional(),
    where: BlackCardWhereUniqueInputSchema,
  })
  .strict();

export const BlackCardUpdateArgsSchema: z.ZodType<Prisma.BlackCardUpdateArgs> = z
  .object({
    select: BlackCardSelectSchema.optional(),
    include: BlackCardIncludeSchema.optional(),
    data: z.union([BlackCardUpdateInputSchema, BlackCardUncheckedUpdateInputSchema]),
    where: BlackCardWhereUniqueInputSchema,
  })
  .strict();

export const BlackCardUpdateManyArgsSchema: z.ZodType<Prisma.BlackCardUpdateManyArgs> = z
  .object({
    data: z.union([BlackCardUpdateManyMutationInputSchema, BlackCardUncheckedUpdateManyInputSchema]),
    where: BlackCardWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const BlackCardUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.BlackCardUpdateManyAndReturnArgs> = z
  .object({
    data: z.union([BlackCardUpdateManyMutationInputSchema, BlackCardUncheckedUpdateManyInputSchema]),
    where: BlackCardWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const BlackCardDeleteManyArgsSchema: z.ZodType<Prisma.BlackCardDeleteManyArgs> = z
  .object({
    where: BlackCardWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const WhiteCardCreateArgsSchema: z.ZodType<Prisma.WhiteCardCreateArgs> = z
  .object({
    select: WhiteCardSelectSchema.optional(),
    include: WhiteCardIncludeSchema.optional(),
    data: z.union([WhiteCardCreateInputSchema, WhiteCardUncheckedCreateInputSchema]),
  })
  .strict();

export const WhiteCardUpsertArgsSchema: z.ZodType<Prisma.WhiteCardUpsertArgs> = z
  .object({
    select: WhiteCardSelectSchema.optional(),
    include: WhiteCardIncludeSchema.optional(),
    where: WhiteCardWhereUniqueInputSchema,
    create: z.union([WhiteCardCreateInputSchema, WhiteCardUncheckedCreateInputSchema]),
    update: z.union([WhiteCardUpdateInputSchema, WhiteCardUncheckedUpdateInputSchema]),
  })
  .strict();

export const WhiteCardCreateManyArgsSchema: z.ZodType<Prisma.WhiteCardCreateManyArgs> = z
  .object({
    data: z.union([WhiteCardCreateManyInputSchema, WhiteCardCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const WhiteCardCreateManyAndReturnArgsSchema: z.ZodType<Prisma.WhiteCardCreateManyAndReturnArgs> = z
  .object({
    data: z.union([WhiteCardCreateManyInputSchema, WhiteCardCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const WhiteCardDeleteArgsSchema: z.ZodType<Prisma.WhiteCardDeleteArgs> = z
  .object({
    select: WhiteCardSelectSchema.optional(),
    include: WhiteCardIncludeSchema.optional(),
    where: WhiteCardWhereUniqueInputSchema,
  })
  .strict();

export const WhiteCardUpdateArgsSchema: z.ZodType<Prisma.WhiteCardUpdateArgs> = z
  .object({
    select: WhiteCardSelectSchema.optional(),
    include: WhiteCardIncludeSchema.optional(),
    data: z.union([WhiteCardUpdateInputSchema, WhiteCardUncheckedUpdateInputSchema]),
    where: WhiteCardWhereUniqueInputSchema,
  })
  .strict();

export const WhiteCardUpdateManyArgsSchema: z.ZodType<Prisma.WhiteCardUpdateManyArgs> = z
  .object({
    data: z.union([WhiteCardUpdateManyMutationInputSchema, WhiteCardUncheckedUpdateManyInputSchema]),
    where: WhiteCardWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const WhiteCardUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.WhiteCardUpdateManyAndReturnArgs> = z
  .object({
    data: z.union([WhiteCardUpdateManyMutationInputSchema, WhiteCardUncheckedUpdateManyInputSchema]),
    where: WhiteCardWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const WhiteCardDeleteManyArgsSchema: z.ZodType<Prisma.WhiteCardDeleteManyArgs> = z
  .object({
    where: WhiteCardWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    data: z.union([UserCreateInputSchema, UserUncheckedCreateInputSchema]),
  })
  .strict();

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
    create: z.union([UserCreateInputSchema, UserUncheckedCreateInputSchema]),
    update: z.union([UserUpdateInputSchema, UserUncheckedUpdateInputSchema]),
  })
  .strict();

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z
  .object({
    data: z.union([UserCreateManyInputSchema, UserCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z
  .object({
    data: z.union([UserCreateManyInputSchema, UserCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
  })
  .strict();

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    data: z.union([UserUpdateInputSchema, UserUncheckedUpdateInputSchema]),
    where: UserWhereUniqueInputSchema,
  })
  .strict();

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z
  .object({
    data: z.union([UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema]),
    where: UserWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const UserUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserUpdateManyAndReturnArgs> = z
  .object({
    data: z.union([UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema]),
    where: UserWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z
  .object({
    where: UserWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const InvalidatedSessionCreateArgsSchema: z.ZodType<Prisma.InvalidatedSessionCreateArgs> = z
  .object({
    select: InvalidatedSessionSelectSchema.optional(),
    data: z.union([InvalidatedSessionCreateInputSchema, InvalidatedSessionUncheckedCreateInputSchema]),
  })
  .strict();

export const InvalidatedSessionUpsertArgsSchema: z.ZodType<Prisma.InvalidatedSessionUpsertArgs> = z
  .object({
    select: InvalidatedSessionSelectSchema.optional(),
    where: InvalidatedSessionWhereUniqueInputSchema,
    create: z.union([InvalidatedSessionCreateInputSchema, InvalidatedSessionUncheckedCreateInputSchema]),
    update: z.union([InvalidatedSessionUpdateInputSchema, InvalidatedSessionUncheckedUpdateInputSchema]),
  })
  .strict();

export const InvalidatedSessionCreateManyArgsSchema: z.ZodType<Prisma.InvalidatedSessionCreateManyArgs> = z
  .object({
    data: z.union([InvalidatedSessionCreateManyInputSchema, InvalidatedSessionCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const InvalidatedSessionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.InvalidatedSessionCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([InvalidatedSessionCreateManyInputSchema, InvalidatedSessionCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export const InvalidatedSessionDeleteArgsSchema: z.ZodType<Prisma.InvalidatedSessionDeleteArgs> = z
  .object({
    select: InvalidatedSessionSelectSchema.optional(),
    where: InvalidatedSessionWhereUniqueInputSchema,
  })
  .strict();

export const InvalidatedSessionUpdateArgsSchema: z.ZodType<Prisma.InvalidatedSessionUpdateArgs> = z
  .object({
    select: InvalidatedSessionSelectSchema.optional(),
    data: z.union([InvalidatedSessionUpdateInputSchema, InvalidatedSessionUncheckedUpdateInputSchema]),
    where: InvalidatedSessionWhereUniqueInputSchema,
  })
  .strict();

export const InvalidatedSessionUpdateManyArgsSchema: z.ZodType<Prisma.InvalidatedSessionUpdateManyArgs> = z
  .object({
    data: z.union([InvalidatedSessionUpdateManyMutationInputSchema, InvalidatedSessionUncheckedUpdateManyInputSchema]),
    where: InvalidatedSessionWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const InvalidatedSessionUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.InvalidatedSessionUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        InvalidatedSessionUpdateManyMutationInputSchema,
        InvalidatedSessionUncheckedUpdateManyInputSchema,
      ]),
      where: InvalidatedSessionWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export const InvalidatedSessionDeleteManyArgsSchema: z.ZodType<Prisma.InvalidatedSessionDeleteManyArgs> = z
  .object({
    where: InvalidatedSessionWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();
