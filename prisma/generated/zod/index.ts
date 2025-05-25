import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const DeckScalarFieldEnumSchema = z.enum(['id','name','watermark']);

export const BlackCardScalarFieldEnumSchema = z.enum(['id','content','pickCount','deckId']);

export const WhiteCardScalarFieldEnumSchema = z.enum(['id','content','deckId']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// DECK SCHEMA
/////////////////////////////////////////

export const DeckSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  watermark: z.string(),
})

export type Deck = z.infer<typeof DeckSchema>

/////////////////////////////////////////
// BLACK CARD SCHEMA
/////////////////////////////////////////

export const BlackCardSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  pickCount: z.number().int(),
  deckId: z.number().int(),
})

export type BlackCard = z.infer<typeof BlackCardSchema>

/////////////////////////////////////////
// WHITE CARD SCHEMA
/////////////////////////////////////////

export const WhiteCardSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  deckId: z.number().int(),
})

export type WhiteCard = z.infer<typeof WhiteCardSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// DECK
//------------------------------------------------------

export const DeckIncludeSchema: z.ZodType<Prisma.DeckInclude> = z.object({
  blackCards: z.union([z.boolean(),z.lazy(() => BlackCardFindManyArgsSchema)]).optional(),
  whiteCards: z.union([z.boolean(),z.lazy(() => WhiteCardFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => DeckCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const DeckArgsSchema: z.ZodType<Prisma.DeckDefaultArgs> = z.object({
  select: z.lazy(() => DeckSelectSchema).optional(),
  include: z.lazy(() => DeckIncludeSchema).optional(),
}).strict();

export const DeckCountOutputTypeArgsSchema: z.ZodType<Prisma.DeckCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => DeckCountOutputTypeSelectSchema).nullish(),
}).strict();

export const DeckCountOutputTypeSelectSchema: z.ZodType<Prisma.DeckCountOutputTypeSelect> = z.object({
  blackCards: z.boolean().optional(),
  whiteCards: z.boolean().optional(),
}).strict();

export const DeckSelectSchema: z.ZodType<Prisma.DeckSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  watermark: z.boolean().optional(),
  blackCards: z.union([z.boolean(),z.lazy(() => BlackCardFindManyArgsSchema)]).optional(),
  whiteCards: z.union([z.boolean(),z.lazy(() => WhiteCardFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => DeckCountOutputTypeArgsSchema)]).optional(),
}).strict()

// BLACK CARD
//------------------------------------------------------

export const BlackCardIncludeSchema: z.ZodType<Prisma.BlackCardInclude> = z.object({
  deck: z.union([z.boolean(),z.lazy(() => DeckArgsSchema)]).optional(),
}).strict()

export const BlackCardArgsSchema: z.ZodType<Prisma.BlackCardDefaultArgs> = z.object({
  select: z.lazy(() => BlackCardSelectSchema).optional(),
  include: z.lazy(() => BlackCardIncludeSchema).optional(),
}).strict();

export const BlackCardSelectSchema: z.ZodType<Prisma.BlackCardSelect> = z.object({
  id: z.boolean().optional(),
  content: z.boolean().optional(),
  pickCount: z.boolean().optional(),
  deckId: z.boolean().optional(),
  deck: z.union([z.boolean(),z.lazy(() => DeckArgsSchema)]).optional(),
}).strict()

// WHITE CARD
//------------------------------------------------------

export const WhiteCardIncludeSchema: z.ZodType<Prisma.WhiteCardInclude> = z.object({
  deck: z.union([z.boolean(),z.lazy(() => DeckArgsSchema)]).optional(),
}).strict()

export const WhiteCardArgsSchema: z.ZodType<Prisma.WhiteCardDefaultArgs> = z.object({
  select: z.lazy(() => WhiteCardSelectSchema).optional(),
  include: z.lazy(() => WhiteCardIncludeSchema).optional(),
}).strict();

export const WhiteCardSelectSchema: z.ZodType<Prisma.WhiteCardSelect> = z.object({
  id: z.boolean().optional(),
  content: z.boolean().optional(),
  deckId: z.boolean().optional(),
  deck: z.union([z.boolean(),z.lazy(() => DeckArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const DeckWhereInputSchema: z.ZodType<Prisma.DeckWhereInput> = z.object({
  AND: z.union([ z.lazy(() => DeckWhereInputSchema),z.lazy(() => DeckWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DeckWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DeckWhereInputSchema),z.lazy(() => DeckWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  watermark: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  blackCards: z.lazy(() => BlackCardListRelationFilterSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardListRelationFilterSchema).optional()
}).strict();

export const DeckOrderByWithRelationInputSchema: z.ZodType<Prisma.DeckOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  watermark: z.lazy(() => SortOrderSchema).optional(),
  blackCards: z.lazy(() => BlackCardOrderByRelationAggregateInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardOrderByRelationAggregateInputSchema).optional()
}).strict();

export const DeckWhereUniqueInputSchema: z.ZodType<Prisma.DeckWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    name: z.string()
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    name: z.string(),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  name: z.string().optional(),
  AND: z.union([ z.lazy(() => DeckWhereInputSchema),z.lazy(() => DeckWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DeckWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DeckWhereInputSchema),z.lazy(() => DeckWhereInputSchema).array() ]).optional(),
  watermark: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  blackCards: z.lazy(() => BlackCardListRelationFilterSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardListRelationFilterSchema).optional()
}).strict());

export const DeckOrderByWithAggregationInputSchema: z.ZodType<Prisma.DeckOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  watermark: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => DeckCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => DeckAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => DeckMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => DeckMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => DeckSumOrderByAggregateInputSchema).optional()
}).strict();

export const DeckScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.DeckScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => DeckScalarWhereWithAggregatesInputSchema),z.lazy(() => DeckScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => DeckScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DeckScalarWhereWithAggregatesInputSchema),z.lazy(() => DeckScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  watermark: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const BlackCardWhereInputSchema: z.ZodType<Prisma.BlackCardWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BlackCardWhereInputSchema),z.lazy(() => BlackCardWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlackCardWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlackCardWhereInputSchema),z.lazy(() => BlackCardWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  pickCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  deckId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  deck: z.union([ z.lazy(() => DeckScalarRelationFilterSchema),z.lazy(() => DeckWhereInputSchema) ]).optional(),
}).strict();

export const BlackCardOrderByWithRelationInputSchema: z.ZodType<Prisma.BlackCardOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  pickCount: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional(),
  deck: z.lazy(() => DeckOrderByWithRelationInputSchema).optional()
}).strict();

export const BlackCardWhereUniqueInputSchema: z.ZodType<Prisma.BlackCardWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    content: z.string()
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    content: z.string(),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  content: z.string().optional(),
  AND: z.union([ z.lazy(() => BlackCardWhereInputSchema),z.lazy(() => BlackCardWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlackCardWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlackCardWhereInputSchema),z.lazy(() => BlackCardWhereInputSchema).array() ]).optional(),
  pickCount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  deckId: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  deck: z.union([ z.lazy(() => DeckScalarRelationFilterSchema),z.lazy(() => DeckWhereInputSchema) ]).optional(),
}).strict());

export const BlackCardOrderByWithAggregationInputSchema: z.ZodType<Prisma.BlackCardOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  pickCount: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => BlackCardCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BlackCardAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BlackCardMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BlackCardMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BlackCardSumOrderByAggregateInputSchema).optional()
}).strict();

export const BlackCardScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BlackCardScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => BlackCardScalarWhereWithAggregatesInputSchema),z.lazy(() => BlackCardScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlackCardScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlackCardScalarWhereWithAggregatesInputSchema),z.lazy(() => BlackCardScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  content: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  pickCount: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  deckId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
}).strict();

export const WhiteCardWhereInputSchema: z.ZodType<Prisma.WhiteCardWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WhiteCardWhereInputSchema),z.lazy(() => WhiteCardWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WhiteCardWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WhiteCardWhereInputSchema),z.lazy(() => WhiteCardWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  deckId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  deck: z.union([ z.lazy(() => DeckScalarRelationFilterSchema),z.lazy(() => DeckWhereInputSchema) ]).optional(),
}).strict();

export const WhiteCardOrderByWithRelationInputSchema: z.ZodType<Prisma.WhiteCardOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional(),
  deck: z.lazy(() => DeckOrderByWithRelationInputSchema).optional()
}).strict();

export const WhiteCardWhereUniqueInputSchema: z.ZodType<Prisma.WhiteCardWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    content: z.string()
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    content: z.string(),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  content: z.string().optional(),
  AND: z.union([ z.lazy(() => WhiteCardWhereInputSchema),z.lazy(() => WhiteCardWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WhiteCardWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WhiteCardWhereInputSchema),z.lazy(() => WhiteCardWhereInputSchema).array() ]).optional(),
  deckId: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  deck: z.union([ z.lazy(() => DeckScalarRelationFilterSchema),z.lazy(() => DeckWhereInputSchema) ]).optional(),
}).strict());

export const WhiteCardOrderByWithAggregationInputSchema: z.ZodType<Prisma.WhiteCardOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => WhiteCardCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => WhiteCardAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => WhiteCardMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => WhiteCardMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => WhiteCardSumOrderByAggregateInputSchema).optional()
}).strict();

export const WhiteCardScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.WhiteCardScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => WhiteCardScalarWhereWithAggregatesInputSchema),z.lazy(() => WhiteCardScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => WhiteCardScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WhiteCardScalarWhereWithAggregatesInputSchema),z.lazy(() => WhiteCardScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  content: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  deckId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
}).strict();

export const DeckCreateInputSchema: z.ZodType<Prisma.DeckCreateInput> = z.object({
  name: z.string(),
  watermark: z.string(),
  blackCards: z.lazy(() => BlackCardCreateNestedManyWithoutDeckInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardCreateNestedManyWithoutDeckInputSchema).optional()
}).strict();

export const DeckUncheckedCreateInputSchema: z.ZodType<Prisma.DeckUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  watermark: z.string(),
  blackCards: z.lazy(() => BlackCardUncheckedCreateNestedManyWithoutDeckInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardUncheckedCreateNestedManyWithoutDeckInputSchema).optional()
}).strict();

export const DeckUpdateInputSchema: z.ZodType<Prisma.DeckUpdateInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  watermark: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  blackCards: z.lazy(() => BlackCardUpdateManyWithoutDeckNestedInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardUpdateManyWithoutDeckNestedInputSchema).optional()
}).strict();

export const DeckUncheckedUpdateInputSchema: z.ZodType<Prisma.DeckUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  watermark: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  blackCards: z.lazy(() => BlackCardUncheckedUpdateManyWithoutDeckNestedInputSchema).optional(),
  whiteCards: z.lazy(() => WhiteCardUncheckedUpdateManyWithoutDeckNestedInputSchema).optional()
}).strict();

export const DeckCreateManyInputSchema: z.ZodType<Prisma.DeckCreateManyInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  watermark: z.string()
}).strict();

export const DeckUpdateManyMutationInputSchema: z.ZodType<Prisma.DeckUpdateManyMutationInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  watermark: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const DeckUncheckedUpdateManyInputSchema: z.ZodType<Prisma.DeckUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  watermark: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlackCardCreateInputSchema: z.ZodType<Prisma.BlackCardCreateInput> = z.object({
  content: z.string(),
  pickCount: z.number().int(),
  deck: z.lazy(() => DeckCreateNestedOneWithoutBlackCardsInputSchema)
}).strict();

export const BlackCardUncheckedCreateInputSchema: z.ZodType<Prisma.BlackCardUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  content: z.string(),
  pickCount: z.number().int(),
  deckId: z.number().int()
}).strict();

export const BlackCardUpdateInputSchema: z.ZodType<Prisma.BlackCardUpdateInput> = z.object({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  pickCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deck: z.lazy(() => DeckUpdateOneRequiredWithoutBlackCardsNestedInputSchema).optional()
}).strict();

export const BlackCardUncheckedUpdateInputSchema: z.ZodType<Prisma.BlackCardUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  pickCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deckId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlackCardCreateManyInputSchema: z.ZodType<Prisma.BlackCardCreateManyInput> = z.object({
  id: z.number().int().optional(),
  content: z.string(),
  pickCount: z.number().int(),
  deckId: z.number().int()
}).strict();

export const BlackCardUpdateManyMutationInputSchema: z.ZodType<Prisma.BlackCardUpdateManyMutationInput> = z.object({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  pickCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlackCardUncheckedUpdateManyInputSchema: z.ZodType<Prisma.BlackCardUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  pickCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deckId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const WhiteCardCreateInputSchema: z.ZodType<Prisma.WhiteCardCreateInput> = z.object({
  content: z.string(),
  deck: z.lazy(() => DeckCreateNestedOneWithoutWhiteCardsInputSchema)
}).strict();

export const WhiteCardUncheckedCreateInputSchema: z.ZodType<Prisma.WhiteCardUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  content: z.string(),
  deckId: z.number().int()
}).strict();

export const WhiteCardUpdateInputSchema: z.ZodType<Prisma.WhiteCardUpdateInput> = z.object({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deck: z.lazy(() => DeckUpdateOneRequiredWithoutWhiteCardsNestedInputSchema).optional()
}).strict();

export const WhiteCardUncheckedUpdateInputSchema: z.ZodType<Prisma.WhiteCardUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deckId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const WhiteCardCreateManyInputSchema: z.ZodType<Prisma.WhiteCardCreateManyInput> = z.object({
  id: z.number().int().optional(),
  content: z.string(),
  deckId: z.number().int()
}).strict();

export const WhiteCardUpdateManyMutationInputSchema: z.ZodType<Prisma.WhiteCardUpdateManyMutationInput> = z.object({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const WhiteCardUncheckedUpdateManyInputSchema: z.ZodType<Prisma.WhiteCardUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deckId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const BlackCardListRelationFilterSchema: z.ZodType<Prisma.BlackCardListRelationFilter> = z.object({
  every: z.lazy(() => BlackCardWhereInputSchema).optional(),
  some: z.lazy(() => BlackCardWhereInputSchema).optional(),
  none: z.lazy(() => BlackCardWhereInputSchema).optional()
}).strict();

export const WhiteCardListRelationFilterSchema: z.ZodType<Prisma.WhiteCardListRelationFilter> = z.object({
  every: z.lazy(() => WhiteCardWhereInputSchema).optional(),
  some: z.lazy(() => WhiteCardWhereInputSchema).optional(),
  none: z.lazy(() => WhiteCardWhereInputSchema).optional()
}).strict();

export const BlackCardOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BlackCardOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const WhiteCardOrderByRelationAggregateInputSchema: z.ZodType<Prisma.WhiteCardOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DeckCountOrderByAggregateInputSchema: z.ZodType<Prisma.DeckCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  watermark: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DeckAvgOrderByAggregateInputSchema: z.ZodType<Prisma.DeckAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DeckMaxOrderByAggregateInputSchema: z.ZodType<Prisma.DeckMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  watermark: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DeckMinOrderByAggregateInputSchema: z.ZodType<Prisma.DeckMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  watermark: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DeckSumOrderByAggregateInputSchema: z.ZodType<Prisma.DeckSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const DeckScalarRelationFilterSchema: z.ZodType<Prisma.DeckScalarRelationFilter> = z.object({
  is: z.lazy(() => DeckWhereInputSchema).optional(),
  isNot: z.lazy(() => DeckWhereInputSchema).optional()
}).strict();

export const BlackCardCountOrderByAggregateInputSchema: z.ZodType<Prisma.BlackCardCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  pickCount: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlackCardAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BlackCardAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  pickCount: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlackCardMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BlackCardMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  pickCount: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlackCardMinOrderByAggregateInputSchema: z.ZodType<Prisma.BlackCardMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  pickCount: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlackCardSumOrderByAggregateInputSchema: z.ZodType<Prisma.BlackCardSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  pickCount: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const WhiteCardCountOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteCardCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const WhiteCardAvgOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteCardAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const WhiteCardMaxOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteCardMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const WhiteCardMinOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteCardMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const WhiteCardSumOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteCardSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  deckId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlackCardCreateNestedManyWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardCreateNestedManyWithoutDeckInput> = z.object({
  create: z.union([ z.lazy(() => BlackCardCreateWithoutDeckInputSchema),z.lazy(() => BlackCardCreateWithoutDeckInputSchema).array(),z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema),z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema),z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BlackCardCreateManyDeckInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BlackCardWhereUniqueInputSchema),z.lazy(() => BlackCardWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const WhiteCardCreateNestedManyWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardCreateNestedManyWithoutDeckInput> = z.object({
  create: z.union([ z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),z.lazy(() => WhiteCardCreateWithoutDeckInputSchema).array(),z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema),z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema),z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WhiteCardCreateManyDeckInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => WhiteCardWhereUniqueInputSchema),z.lazy(() => WhiteCardWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BlackCardUncheckedCreateNestedManyWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUncheckedCreateNestedManyWithoutDeckInput> = z.object({
  create: z.union([ z.lazy(() => BlackCardCreateWithoutDeckInputSchema),z.lazy(() => BlackCardCreateWithoutDeckInputSchema).array(),z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema),z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema),z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BlackCardCreateManyDeckInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BlackCardWhereUniqueInputSchema),z.lazy(() => BlackCardWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const WhiteCardUncheckedCreateNestedManyWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUncheckedCreateNestedManyWithoutDeckInput> = z.object({
  create: z.union([ z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),z.lazy(() => WhiteCardCreateWithoutDeckInputSchema).array(),z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema),z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema),z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WhiteCardCreateManyDeckInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => WhiteCardWhereUniqueInputSchema),z.lazy(() => WhiteCardWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const BlackCardUpdateManyWithoutDeckNestedInputSchema: z.ZodType<Prisma.BlackCardUpdateManyWithoutDeckNestedInput> = z.object({
  create: z.union([ z.lazy(() => BlackCardCreateWithoutDeckInputSchema),z.lazy(() => BlackCardCreateWithoutDeckInputSchema).array(),z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema),z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema),z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BlackCardUpsertWithWhereUniqueWithoutDeckInputSchema),z.lazy(() => BlackCardUpsertWithWhereUniqueWithoutDeckInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BlackCardCreateManyDeckInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BlackCardWhereUniqueInputSchema),z.lazy(() => BlackCardWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BlackCardWhereUniqueInputSchema),z.lazy(() => BlackCardWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BlackCardWhereUniqueInputSchema),z.lazy(() => BlackCardWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlackCardWhereUniqueInputSchema),z.lazy(() => BlackCardWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BlackCardUpdateWithWhereUniqueWithoutDeckInputSchema),z.lazy(() => BlackCardUpdateWithWhereUniqueWithoutDeckInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BlackCardUpdateManyWithWhereWithoutDeckInputSchema),z.lazy(() => BlackCardUpdateManyWithWhereWithoutDeckInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BlackCardScalarWhereInputSchema),z.lazy(() => BlackCardScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const WhiteCardUpdateManyWithoutDeckNestedInputSchema: z.ZodType<Prisma.WhiteCardUpdateManyWithoutDeckNestedInput> = z.object({
  create: z.union([ z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),z.lazy(() => WhiteCardCreateWithoutDeckInputSchema).array(),z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema),z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema),z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => WhiteCardUpsertWithWhereUniqueWithoutDeckInputSchema),z.lazy(() => WhiteCardUpsertWithWhereUniqueWithoutDeckInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WhiteCardCreateManyDeckInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => WhiteCardWhereUniqueInputSchema),z.lazy(() => WhiteCardWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => WhiteCardWhereUniqueInputSchema),z.lazy(() => WhiteCardWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => WhiteCardWhereUniqueInputSchema),z.lazy(() => WhiteCardWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => WhiteCardWhereUniqueInputSchema),z.lazy(() => WhiteCardWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => WhiteCardUpdateWithWhereUniqueWithoutDeckInputSchema),z.lazy(() => WhiteCardUpdateWithWhereUniqueWithoutDeckInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => WhiteCardUpdateManyWithWhereWithoutDeckInputSchema),z.lazy(() => WhiteCardUpdateManyWithWhereWithoutDeckInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => WhiteCardScalarWhereInputSchema),z.lazy(() => WhiteCardScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const BlackCardUncheckedUpdateManyWithoutDeckNestedInputSchema: z.ZodType<Prisma.BlackCardUncheckedUpdateManyWithoutDeckNestedInput> = z.object({
  create: z.union([ z.lazy(() => BlackCardCreateWithoutDeckInputSchema),z.lazy(() => BlackCardCreateWithoutDeckInputSchema).array(),z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema),z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema),z.lazy(() => BlackCardCreateOrConnectWithoutDeckInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BlackCardUpsertWithWhereUniqueWithoutDeckInputSchema),z.lazy(() => BlackCardUpsertWithWhereUniqueWithoutDeckInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BlackCardCreateManyDeckInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BlackCardWhereUniqueInputSchema),z.lazy(() => BlackCardWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BlackCardWhereUniqueInputSchema),z.lazy(() => BlackCardWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BlackCardWhereUniqueInputSchema),z.lazy(() => BlackCardWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlackCardWhereUniqueInputSchema),z.lazy(() => BlackCardWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BlackCardUpdateWithWhereUniqueWithoutDeckInputSchema),z.lazy(() => BlackCardUpdateWithWhereUniqueWithoutDeckInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BlackCardUpdateManyWithWhereWithoutDeckInputSchema),z.lazy(() => BlackCardUpdateManyWithWhereWithoutDeckInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BlackCardScalarWhereInputSchema),z.lazy(() => BlackCardScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const WhiteCardUncheckedUpdateManyWithoutDeckNestedInputSchema: z.ZodType<Prisma.WhiteCardUncheckedUpdateManyWithoutDeckNestedInput> = z.object({
  create: z.union([ z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),z.lazy(() => WhiteCardCreateWithoutDeckInputSchema).array(),z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema),z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema),z.lazy(() => WhiteCardCreateOrConnectWithoutDeckInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => WhiteCardUpsertWithWhereUniqueWithoutDeckInputSchema),z.lazy(() => WhiteCardUpsertWithWhereUniqueWithoutDeckInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WhiteCardCreateManyDeckInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => WhiteCardWhereUniqueInputSchema),z.lazy(() => WhiteCardWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => WhiteCardWhereUniqueInputSchema),z.lazy(() => WhiteCardWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => WhiteCardWhereUniqueInputSchema),z.lazy(() => WhiteCardWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => WhiteCardWhereUniqueInputSchema),z.lazy(() => WhiteCardWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => WhiteCardUpdateWithWhereUniqueWithoutDeckInputSchema),z.lazy(() => WhiteCardUpdateWithWhereUniqueWithoutDeckInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => WhiteCardUpdateManyWithWhereWithoutDeckInputSchema),z.lazy(() => WhiteCardUpdateManyWithWhereWithoutDeckInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => WhiteCardScalarWhereInputSchema),z.lazy(() => WhiteCardScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const DeckCreateNestedOneWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckCreateNestedOneWithoutBlackCardsInput> = z.object({
  create: z.union([ z.lazy(() => DeckCreateWithoutBlackCardsInputSchema),z.lazy(() => DeckUncheckedCreateWithoutBlackCardsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => DeckCreateOrConnectWithoutBlackCardsInputSchema).optional(),
  connect: z.lazy(() => DeckWhereUniqueInputSchema).optional()
}).strict();

export const DeckUpdateOneRequiredWithoutBlackCardsNestedInputSchema: z.ZodType<Prisma.DeckUpdateOneRequiredWithoutBlackCardsNestedInput> = z.object({
  create: z.union([ z.lazy(() => DeckCreateWithoutBlackCardsInputSchema),z.lazy(() => DeckUncheckedCreateWithoutBlackCardsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => DeckCreateOrConnectWithoutBlackCardsInputSchema).optional(),
  upsert: z.lazy(() => DeckUpsertWithoutBlackCardsInputSchema).optional(),
  connect: z.lazy(() => DeckWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => DeckUpdateToOneWithWhereWithoutBlackCardsInputSchema),z.lazy(() => DeckUpdateWithoutBlackCardsInputSchema),z.lazy(() => DeckUncheckedUpdateWithoutBlackCardsInputSchema) ]).optional(),
}).strict();

export const DeckCreateNestedOneWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckCreateNestedOneWithoutWhiteCardsInput> = z.object({
  create: z.union([ z.lazy(() => DeckCreateWithoutWhiteCardsInputSchema),z.lazy(() => DeckUncheckedCreateWithoutWhiteCardsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => DeckCreateOrConnectWithoutWhiteCardsInputSchema).optional(),
  connect: z.lazy(() => DeckWhereUniqueInputSchema).optional()
}).strict();

export const DeckUpdateOneRequiredWithoutWhiteCardsNestedInputSchema: z.ZodType<Prisma.DeckUpdateOneRequiredWithoutWhiteCardsNestedInput> = z.object({
  create: z.union([ z.lazy(() => DeckCreateWithoutWhiteCardsInputSchema),z.lazy(() => DeckUncheckedCreateWithoutWhiteCardsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => DeckCreateOrConnectWithoutWhiteCardsInputSchema).optional(),
  upsert: z.lazy(() => DeckUpsertWithoutWhiteCardsInputSchema).optional(),
  connect: z.lazy(() => DeckWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => DeckUpdateToOneWithWhereWithoutWhiteCardsInputSchema),z.lazy(() => DeckUpdateWithoutWhiteCardsInputSchema),z.lazy(() => DeckUncheckedUpdateWithoutWhiteCardsInputSchema) ]).optional(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
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
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const BlackCardCreateWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardCreateWithoutDeckInput> = z.object({
  content: z.string(),
  pickCount: z.number().int()
}).strict();

export const BlackCardUncheckedCreateWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUncheckedCreateWithoutDeckInput> = z.object({
  id: z.number().int().optional(),
  content: z.string(),
  pickCount: z.number().int()
}).strict();

export const BlackCardCreateOrConnectWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardCreateOrConnectWithoutDeckInput> = z.object({
  where: z.lazy(() => BlackCardWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BlackCardCreateWithoutDeckInputSchema),z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema) ]),
}).strict();

export const BlackCardCreateManyDeckInputEnvelopeSchema: z.ZodType<Prisma.BlackCardCreateManyDeckInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => BlackCardCreateManyDeckInputSchema),z.lazy(() => BlackCardCreateManyDeckInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const WhiteCardCreateWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardCreateWithoutDeckInput> = z.object({
  content: z.string()
}).strict();

export const WhiteCardUncheckedCreateWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUncheckedCreateWithoutDeckInput> = z.object({
  id: z.number().int().optional(),
  content: z.string()
}).strict();

export const WhiteCardCreateOrConnectWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardCreateOrConnectWithoutDeckInput> = z.object({
  where: z.lazy(() => WhiteCardWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema) ]),
}).strict();

export const WhiteCardCreateManyDeckInputEnvelopeSchema: z.ZodType<Prisma.WhiteCardCreateManyDeckInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => WhiteCardCreateManyDeckInputSchema),z.lazy(() => WhiteCardCreateManyDeckInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const BlackCardUpsertWithWhereUniqueWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUpsertWithWhereUniqueWithoutDeckInput> = z.object({
  where: z.lazy(() => BlackCardWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BlackCardUpdateWithoutDeckInputSchema),z.lazy(() => BlackCardUncheckedUpdateWithoutDeckInputSchema) ]),
  create: z.union([ z.lazy(() => BlackCardCreateWithoutDeckInputSchema),z.lazy(() => BlackCardUncheckedCreateWithoutDeckInputSchema) ]),
}).strict();

export const BlackCardUpdateWithWhereUniqueWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUpdateWithWhereUniqueWithoutDeckInput> = z.object({
  where: z.lazy(() => BlackCardWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BlackCardUpdateWithoutDeckInputSchema),z.lazy(() => BlackCardUncheckedUpdateWithoutDeckInputSchema) ]),
}).strict();

export const BlackCardUpdateManyWithWhereWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUpdateManyWithWhereWithoutDeckInput> = z.object({
  where: z.lazy(() => BlackCardScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BlackCardUpdateManyMutationInputSchema),z.lazy(() => BlackCardUncheckedUpdateManyWithoutDeckInputSchema) ]),
}).strict();

export const BlackCardScalarWhereInputSchema: z.ZodType<Prisma.BlackCardScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BlackCardScalarWhereInputSchema),z.lazy(() => BlackCardScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlackCardScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlackCardScalarWhereInputSchema),z.lazy(() => BlackCardScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  pickCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  deckId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
}).strict();

export const WhiteCardUpsertWithWhereUniqueWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUpsertWithWhereUniqueWithoutDeckInput> = z.object({
  where: z.lazy(() => WhiteCardWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => WhiteCardUpdateWithoutDeckInputSchema),z.lazy(() => WhiteCardUncheckedUpdateWithoutDeckInputSchema) ]),
  create: z.union([ z.lazy(() => WhiteCardCreateWithoutDeckInputSchema),z.lazy(() => WhiteCardUncheckedCreateWithoutDeckInputSchema) ]),
}).strict();

export const WhiteCardUpdateWithWhereUniqueWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUpdateWithWhereUniqueWithoutDeckInput> = z.object({
  where: z.lazy(() => WhiteCardWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => WhiteCardUpdateWithoutDeckInputSchema),z.lazy(() => WhiteCardUncheckedUpdateWithoutDeckInputSchema) ]),
}).strict();

export const WhiteCardUpdateManyWithWhereWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUpdateManyWithWhereWithoutDeckInput> = z.object({
  where: z.lazy(() => WhiteCardScalarWhereInputSchema),
  data: z.union([ z.lazy(() => WhiteCardUpdateManyMutationInputSchema),z.lazy(() => WhiteCardUncheckedUpdateManyWithoutDeckInputSchema) ]),
}).strict();

export const WhiteCardScalarWhereInputSchema: z.ZodType<Prisma.WhiteCardScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WhiteCardScalarWhereInputSchema),z.lazy(() => WhiteCardScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WhiteCardScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WhiteCardScalarWhereInputSchema),z.lazy(() => WhiteCardScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  deckId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
}).strict();

export const DeckCreateWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckCreateWithoutBlackCardsInput> = z.object({
  name: z.string(),
  watermark: z.string(),
  whiteCards: z.lazy(() => WhiteCardCreateNestedManyWithoutDeckInputSchema).optional()
}).strict();

export const DeckUncheckedCreateWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckUncheckedCreateWithoutBlackCardsInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  watermark: z.string(),
  whiteCards: z.lazy(() => WhiteCardUncheckedCreateNestedManyWithoutDeckInputSchema).optional()
}).strict();

export const DeckCreateOrConnectWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckCreateOrConnectWithoutBlackCardsInput> = z.object({
  where: z.lazy(() => DeckWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => DeckCreateWithoutBlackCardsInputSchema),z.lazy(() => DeckUncheckedCreateWithoutBlackCardsInputSchema) ]),
}).strict();

export const DeckUpsertWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckUpsertWithoutBlackCardsInput> = z.object({
  update: z.union([ z.lazy(() => DeckUpdateWithoutBlackCardsInputSchema),z.lazy(() => DeckUncheckedUpdateWithoutBlackCardsInputSchema) ]),
  create: z.union([ z.lazy(() => DeckCreateWithoutBlackCardsInputSchema),z.lazy(() => DeckUncheckedCreateWithoutBlackCardsInputSchema) ]),
  where: z.lazy(() => DeckWhereInputSchema).optional()
}).strict();

export const DeckUpdateToOneWithWhereWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckUpdateToOneWithWhereWithoutBlackCardsInput> = z.object({
  where: z.lazy(() => DeckWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => DeckUpdateWithoutBlackCardsInputSchema),z.lazy(() => DeckUncheckedUpdateWithoutBlackCardsInputSchema) ]),
}).strict();

export const DeckUpdateWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckUpdateWithoutBlackCardsInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  watermark: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  whiteCards: z.lazy(() => WhiteCardUpdateManyWithoutDeckNestedInputSchema).optional()
}).strict();

export const DeckUncheckedUpdateWithoutBlackCardsInputSchema: z.ZodType<Prisma.DeckUncheckedUpdateWithoutBlackCardsInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  watermark: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  whiteCards: z.lazy(() => WhiteCardUncheckedUpdateManyWithoutDeckNestedInputSchema).optional()
}).strict();

export const DeckCreateWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckCreateWithoutWhiteCardsInput> = z.object({
  name: z.string(),
  watermark: z.string(),
  blackCards: z.lazy(() => BlackCardCreateNestedManyWithoutDeckInputSchema).optional()
}).strict();

export const DeckUncheckedCreateWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckUncheckedCreateWithoutWhiteCardsInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  watermark: z.string(),
  blackCards: z.lazy(() => BlackCardUncheckedCreateNestedManyWithoutDeckInputSchema).optional()
}).strict();

export const DeckCreateOrConnectWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckCreateOrConnectWithoutWhiteCardsInput> = z.object({
  where: z.lazy(() => DeckWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => DeckCreateWithoutWhiteCardsInputSchema),z.lazy(() => DeckUncheckedCreateWithoutWhiteCardsInputSchema) ]),
}).strict();

export const DeckUpsertWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckUpsertWithoutWhiteCardsInput> = z.object({
  update: z.union([ z.lazy(() => DeckUpdateWithoutWhiteCardsInputSchema),z.lazy(() => DeckUncheckedUpdateWithoutWhiteCardsInputSchema) ]),
  create: z.union([ z.lazy(() => DeckCreateWithoutWhiteCardsInputSchema),z.lazy(() => DeckUncheckedCreateWithoutWhiteCardsInputSchema) ]),
  where: z.lazy(() => DeckWhereInputSchema).optional()
}).strict();

export const DeckUpdateToOneWithWhereWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckUpdateToOneWithWhereWithoutWhiteCardsInput> = z.object({
  where: z.lazy(() => DeckWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => DeckUpdateWithoutWhiteCardsInputSchema),z.lazy(() => DeckUncheckedUpdateWithoutWhiteCardsInputSchema) ]),
}).strict();

export const DeckUpdateWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckUpdateWithoutWhiteCardsInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  watermark: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  blackCards: z.lazy(() => BlackCardUpdateManyWithoutDeckNestedInputSchema).optional()
}).strict();

export const DeckUncheckedUpdateWithoutWhiteCardsInputSchema: z.ZodType<Prisma.DeckUncheckedUpdateWithoutWhiteCardsInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  watermark: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  blackCards: z.lazy(() => BlackCardUncheckedUpdateManyWithoutDeckNestedInputSchema).optional()
}).strict();

export const BlackCardCreateManyDeckInputSchema: z.ZodType<Prisma.BlackCardCreateManyDeckInput> = z.object({
  id: z.number().int().optional(),
  content: z.string(),
  pickCount: z.number().int()
}).strict();

export const WhiteCardCreateManyDeckInputSchema: z.ZodType<Prisma.WhiteCardCreateManyDeckInput> = z.object({
  id: z.number().int().optional(),
  content: z.string()
}).strict();

export const BlackCardUpdateWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUpdateWithoutDeckInput> = z.object({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  pickCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlackCardUncheckedUpdateWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUncheckedUpdateWithoutDeckInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  pickCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlackCardUncheckedUpdateManyWithoutDeckInputSchema: z.ZodType<Prisma.BlackCardUncheckedUpdateManyWithoutDeckInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  pickCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const WhiteCardUpdateWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUpdateWithoutDeckInput> = z.object({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const WhiteCardUncheckedUpdateWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUncheckedUpdateWithoutDeckInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const WhiteCardUncheckedUpdateManyWithoutDeckInputSchema: z.ZodType<Prisma.WhiteCardUncheckedUpdateManyWithoutDeckInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const DeckFindFirstArgsSchema: z.ZodType<Prisma.DeckFindFirstArgs> = z.object({
  select: DeckSelectSchema.optional(),
  include: DeckIncludeSchema.optional(),
  where: DeckWhereInputSchema.optional(),
  orderBy: z.union([ DeckOrderByWithRelationInputSchema.array(),DeckOrderByWithRelationInputSchema ]).optional(),
  cursor: DeckWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DeckScalarFieldEnumSchema,DeckScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const DeckFindFirstOrThrowArgsSchema: z.ZodType<Prisma.DeckFindFirstOrThrowArgs> = z.object({
  select: DeckSelectSchema.optional(),
  include: DeckIncludeSchema.optional(),
  where: DeckWhereInputSchema.optional(),
  orderBy: z.union([ DeckOrderByWithRelationInputSchema.array(),DeckOrderByWithRelationInputSchema ]).optional(),
  cursor: DeckWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DeckScalarFieldEnumSchema,DeckScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const DeckFindManyArgsSchema: z.ZodType<Prisma.DeckFindManyArgs> = z.object({
  select: DeckSelectSchema.optional(),
  include: DeckIncludeSchema.optional(),
  where: DeckWhereInputSchema.optional(),
  orderBy: z.union([ DeckOrderByWithRelationInputSchema.array(),DeckOrderByWithRelationInputSchema ]).optional(),
  cursor: DeckWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DeckScalarFieldEnumSchema,DeckScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const DeckAggregateArgsSchema: z.ZodType<Prisma.DeckAggregateArgs> = z.object({
  where: DeckWhereInputSchema.optional(),
  orderBy: z.union([ DeckOrderByWithRelationInputSchema.array(),DeckOrderByWithRelationInputSchema ]).optional(),
  cursor: DeckWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const DeckGroupByArgsSchema: z.ZodType<Prisma.DeckGroupByArgs> = z.object({
  where: DeckWhereInputSchema.optional(),
  orderBy: z.union([ DeckOrderByWithAggregationInputSchema.array(),DeckOrderByWithAggregationInputSchema ]).optional(),
  by: DeckScalarFieldEnumSchema.array(),
  having: DeckScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const DeckFindUniqueArgsSchema: z.ZodType<Prisma.DeckFindUniqueArgs> = z.object({
  select: DeckSelectSchema.optional(),
  include: DeckIncludeSchema.optional(),
  where: DeckWhereUniqueInputSchema,
}).strict() ;

export const DeckFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.DeckFindUniqueOrThrowArgs> = z.object({
  select: DeckSelectSchema.optional(),
  include: DeckIncludeSchema.optional(),
  where: DeckWhereUniqueInputSchema,
}).strict() ;

export const BlackCardFindFirstArgsSchema: z.ZodType<Prisma.BlackCardFindFirstArgs> = z.object({
  select: BlackCardSelectSchema.optional(),
  include: BlackCardIncludeSchema.optional(),
  where: BlackCardWhereInputSchema.optional(),
  orderBy: z.union([ BlackCardOrderByWithRelationInputSchema.array(),BlackCardOrderByWithRelationInputSchema ]).optional(),
  cursor: BlackCardWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BlackCardScalarFieldEnumSchema,BlackCardScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BlackCardFindFirstOrThrowArgsSchema: z.ZodType<Prisma.BlackCardFindFirstOrThrowArgs> = z.object({
  select: BlackCardSelectSchema.optional(),
  include: BlackCardIncludeSchema.optional(),
  where: BlackCardWhereInputSchema.optional(),
  orderBy: z.union([ BlackCardOrderByWithRelationInputSchema.array(),BlackCardOrderByWithRelationInputSchema ]).optional(),
  cursor: BlackCardWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BlackCardScalarFieldEnumSchema,BlackCardScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BlackCardFindManyArgsSchema: z.ZodType<Prisma.BlackCardFindManyArgs> = z.object({
  select: BlackCardSelectSchema.optional(),
  include: BlackCardIncludeSchema.optional(),
  where: BlackCardWhereInputSchema.optional(),
  orderBy: z.union([ BlackCardOrderByWithRelationInputSchema.array(),BlackCardOrderByWithRelationInputSchema ]).optional(),
  cursor: BlackCardWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BlackCardScalarFieldEnumSchema,BlackCardScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BlackCardAggregateArgsSchema: z.ZodType<Prisma.BlackCardAggregateArgs> = z.object({
  where: BlackCardWhereInputSchema.optional(),
  orderBy: z.union([ BlackCardOrderByWithRelationInputSchema.array(),BlackCardOrderByWithRelationInputSchema ]).optional(),
  cursor: BlackCardWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const BlackCardGroupByArgsSchema: z.ZodType<Prisma.BlackCardGroupByArgs> = z.object({
  where: BlackCardWhereInputSchema.optional(),
  orderBy: z.union([ BlackCardOrderByWithAggregationInputSchema.array(),BlackCardOrderByWithAggregationInputSchema ]).optional(),
  by: BlackCardScalarFieldEnumSchema.array(),
  having: BlackCardScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const BlackCardFindUniqueArgsSchema: z.ZodType<Prisma.BlackCardFindUniqueArgs> = z.object({
  select: BlackCardSelectSchema.optional(),
  include: BlackCardIncludeSchema.optional(),
  where: BlackCardWhereUniqueInputSchema,
}).strict() ;

export const BlackCardFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.BlackCardFindUniqueOrThrowArgs> = z.object({
  select: BlackCardSelectSchema.optional(),
  include: BlackCardIncludeSchema.optional(),
  where: BlackCardWhereUniqueInputSchema,
}).strict() ;

export const WhiteCardFindFirstArgsSchema: z.ZodType<Prisma.WhiteCardFindFirstArgs> = z.object({
  select: WhiteCardSelectSchema.optional(),
  include: WhiteCardIncludeSchema.optional(),
  where: WhiteCardWhereInputSchema.optional(),
  orderBy: z.union([ WhiteCardOrderByWithRelationInputSchema.array(),WhiteCardOrderByWithRelationInputSchema ]).optional(),
  cursor: WhiteCardWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ WhiteCardScalarFieldEnumSchema,WhiteCardScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const WhiteCardFindFirstOrThrowArgsSchema: z.ZodType<Prisma.WhiteCardFindFirstOrThrowArgs> = z.object({
  select: WhiteCardSelectSchema.optional(),
  include: WhiteCardIncludeSchema.optional(),
  where: WhiteCardWhereInputSchema.optional(),
  orderBy: z.union([ WhiteCardOrderByWithRelationInputSchema.array(),WhiteCardOrderByWithRelationInputSchema ]).optional(),
  cursor: WhiteCardWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ WhiteCardScalarFieldEnumSchema,WhiteCardScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const WhiteCardFindManyArgsSchema: z.ZodType<Prisma.WhiteCardFindManyArgs> = z.object({
  select: WhiteCardSelectSchema.optional(),
  include: WhiteCardIncludeSchema.optional(),
  where: WhiteCardWhereInputSchema.optional(),
  orderBy: z.union([ WhiteCardOrderByWithRelationInputSchema.array(),WhiteCardOrderByWithRelationInputSchema ]).optional(),
  cursor: WhiteCardWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ WhiteCardScalarFieldEnumSchema,WhiteCardScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const WhiteCardAggregateArgsSchema: z.ZodType<Prisma.WhiteCardAggregateArgs> = z.object({
  where: WhiteCardWhereInputSchema.optional(),
  orderBy: z.union([ WhiteCardOrderByWithRelationInputSchema.array(),WhiteCardOrderByWithRelationInputSchema ]).optional(),
  cursor: WhiteCardWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const WhiteCardGroupByArgsSchema: z.ZodType<Prisma.WhiteCardGroupByArgs> = z.object({
  where: WhiteCardWhereInputSchema.optional(),
  orderBy: z.union([ WhiteCardOrderByWithAggregationInputSchema.array(),WhiteCardOrderByWithAggregationInputSchema ]).optional(),
  by: WhiteCardScalarFieldEnumSchema.array(),
  having: WhiteCardScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const WhiteCardFindUniqueArgsSchema: z.ZodType<Prisma.WhiteCardFindUniqueArgs> = z.object({
  select: WhiteCardSelectSchema.optional(),
  include: WhiteCardIncludeSchema.optional(),
  where: WhiteCardWhereUniqueInputSchema,
}).strict() ;

export const WhiteCardFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.WhiteCardFindUniqueOrThrowArgs> = z.object({
  select: WhiteCardSelectSchema.optional(),
  include: WhiteCardIncludeSchema.optional(),
  where: WhiteCardWhereUniqueInputSchema,
}).strict() ;

export const DeckCreateArgsSchema: z.ZodType<Prisma.DeckCreateArgs> = z.object({
  select: DeckSelectSchema.optional(),
  include: DeckIncludeSchema.optional(),
  data: z.union([ DeckCreateInputSchema,DeckUncheckedCreateInputSchema ]),
}).strict() ;

export const DeckUpsertArgsSchema: z.ZodType<Prisma.DeckUpsertArgs> = z.object({
  select: DeckSelectSchema.optional(),
  include: DeckIncludeSchema.optional(),
  where: DeckWhereUniqueInputSchema,
  create: z.union([ DeckCreateInputSchema,DeckUncheckedCreateInputSchema ]),
  update: z.union([ DeckUpdateInputSchema,DeckUncheckedUpdateInputSchema ]),
}).strict() ;

export const DeckCreateManyArgsSchema: z.ZodType<Prisma.DeckCreateManyArgs> = z.object({
  data: z.union([ DeckCreateManyInputSchema,DeckCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const DeckCreateManyAndReturnArgsSchema: z.ZodType<Prisma.DeckCreateManyAndReturnArgs> = z.object({
  data: z.union([ DeckCreateManyInputSchema,DeckCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const DeckDeleteArgsSchema: z.ZodType<Prisma.DeckDeleteArgs> = z.object({
  select: DeckSelectSchema.optional(),
  include: DeckIncludeSchema.optional(),
  where: DeckWhereUniqueInputSchema,
}).strict() ;

export const DeckUpdateArgsSchema: z.ZodType<Prisma.DeckUpdateArgs> = z.object({
  select: DeckSelectSchema.optional(),
  include: DeckIncludeSchema.optional(),
  data: z.union([ DeckUpdateInputSchema,DeckUncheckedUpdateInputSchema ]),
  where: DeckWhereUniqueInputSchema,
}).strict() ;

export const DeckUpdateManyArgsSchema: z.ZodType<Prisma.DeckUpdateManyArgs> = z.object({
  data: z.union([ DeckUpdateManyMutationInputSchema,DeckUncheckedUpdateManyInputSchema ]),
  where: DeckWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const DeckUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.DeckUpdateManyAndReturnArgs> = z.object({
  data: z.union([ DeckUpdateManyMutationInputSchema,DeckUncheckedUpdateManyInputSchema ]),
  where: DeckWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const DeckDeleteManyArgsSchema: z.ZodType<Prisma.DeckDeleteManyArgs> = z.object({
  where: DeckWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const BlackCardCreateArgsSchema: z.ZodType<Prisma.BlackCardCreateArgs> = z.object({
  select: BlackCardSelectSchema.optional(),
  include: BlackCardIncludeSchema.optional(),
  data: z.union([ BlackCardCreateInputSchema,BlackCardUncheckedCreateInputSchema ]),
}).strict() ;

export const BlackCardUpsertArgsSchema: z.ZodType<Prisma.BlackCardUpsertArgs> = z.object({
  select: BlackCardSelectSchema.optional(),
  include: BlackCardIncludeSchema.optional(),
  where: BlackCardWhereUniqueInputSchema,
  create: z.union([ BlackCardCreateInputSchema,BlackCardUncheckedCreateInputSchema ]),
  update: z.union([ BlackCardUpdateInputSchema,BlackCardUncheckedUpdateInputSchema ]),
}).strict() ;

export const BlackCardCreateManyArgsSchema: z.ZodType<Prisma.BlackCardCreateManyArgs> = z.object({
  data: z.union([ BlackCardCreateManyInputSchema,BlackCardCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const BlackCardCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BlackCardCreateManyAndReturnArgs> = z.object({
  data: z.union([ BlackCardCreateManyInputSchema,BlackCardCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const BlackCardDeleteArgsSchema: z.ZodType<Prisma.BlackCardDeleteArgs> = z.object({
  select: BlackCardSelectSchema.optional(),
  include: BlackCardIncludeSchema.optional(),
  where: BlackCardWhereUniqueInputSchema,
}).strict() ;

export const BlackCardUpdateArgsSchema: z.ZodType<Prisma.BlackCardUpdateArgs> = z.object({
  select: BlackCardSelectSchema.optional(),
  include: BlackCardIncludeSchema.optional(),
  data: z.union([ BlackCardUpdateInputSchema,BlackCardUncheckedUpdateInputSchema ]),
  where: BlackCardWhereUniqueInputSchema,
}).strict() ;

export const BlackCardUpdateManyArgsSchema: z.ZodType<Prisma.BlackCardUpdateManyArgs> = z.object({
  data: z.union([ BlackCardUpdateManyMutationInputSchema,BlackCardUncheckedUpdateManyInputSchema ]),
  where: BlackCardWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const BlackCardUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.BlackCardUpdateManyAndReturnArgs> = z.object({
  data: z.union([ BlackCardUpdateManyMutationInputSchema,BlackCardUncheckedUpdateManyInputSchema ]),
  where: BlackCardWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const BlackCardDeleteManyArgsSchema: z.ZodType<Prisma.BlackCardDeleteManyArgs> = z.object({
  where: BlackCardWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const WhiteCardCreateArgsSchema: z.ZodType<Prisma.WhiteCardCreateArgs> = z.object({
  select: WhiteCardSelectSchema.optional(),
  include: WhiteCardIncludeSchema.optional(),
  data: z.union([ WhiteCardCreateInputSchema,WhiteCardUncheckedCreateInputSchema ]),
}).strict() ;

export const WhiteCardUpsertArgsSchema: z.ZodType<Prisma.WhiteCardUpsertArgs> = z.object({
  select: WhiteCardSelectSchema.optional(),
  include: WhiteCardIncludeSchema.optional(),
  where: WhiteCardWhereUniqueInputSchema,
  create: z.union([ WhiteCardCreateInputSchema,WhiteCardUncheckedCreateInputSchema ]),
  update: z.union([ WhiteCardUpdateInputSchema,WhiteCardUncheckedUpdateInputSchema ]),
}).strict() ;

export const WhiteCardCreateManyArgsSchema: z.ZodType<Prisma.WhiteCardCreateManyArgs> = z.object({
  data: z.union([ WhiteCardCreateManyInputSchema,WhiteCardCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const WhiteCardCreateManyAndReturnArgsSchema: z.ZodType<Prisma.WhiteCardCreateManyAndReturnArgs> = z.object({
  data: z.union([ WhiteCardCreateManyInputSchema,WhiteCardCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const WhiteCardDeleteArgsSchema: z.ZodType<Prisma.WhiteCardDeleteArgs> = z.object({
  select: WhiteCardSelectSchema.optional(),
  include: WhiteCardIncludeSchema.optional(),
  where: WhiteCardWhereUniqueInputSchema,
}).strict() ;

export const WhiteCardUpdateArgsSchema: z.ZodType<Prisma.WhiteCardUpdateArgs> = z.object({
  select: WhiteCardSelectSchema.optional(),
  include: WhiteCardIncludeSchema.optional(),
  data: z.union([ WhiteCardUpdateInputSchema,WhiteCardUncheckedUpdateInputSchema ]),
  where: WhiteCardWhereUniqueInputSchema,
}).strict() ;

export const WhiteCardUpdateManyArgsSchema: z.ZodType<Prisma.WhiteCardUpdateManyArgs> = z.object({
  data: z.union([ WhiteCardUpdateManyMutationInputSchema,WhiteCardUncheckedUpdateManyInputSchema ]),
  where: WhiteCardWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const WhiteCardUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.WhiteCardUpdateManyAndReturnArgs> = z.object({
  data: z.union([ WhiteCardUpdateManyMutationInputSchema,WhiteCardUncheckedUpdateManyInputSchema ]),
  where: WhiteCardWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const WhiteCardDeleteManyArgsSchema: z.ZodType<Prisma.WhiteCardDeleteManyArgs> = z.object({
  where: WhiteCardWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;