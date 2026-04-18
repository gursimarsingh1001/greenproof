import { Prisma } from "@prisma/client";
import { db } from "../../lib/db.js";
import { normalizeLookupKey } from "../../engine/claim-classifier.js";
import { VerificationEngine } from "../../engine/verifier.js";
import {
  attachIntegrityMetadata,
  buildIntegrityVerificationResponse,
  prepareIntegrityRecord
} from "../../lib/integrity.js";
import { generateDisplayId, verifyIntegrity as verifyIntegrityHash } from "../../lib/hash.js";
import type {
  BrandHistoryEvent,
  BrandNewsMention,
  BrandReputationPayload,
  BrandScoreSnapshot,
  CertificationCatalogItem,
  FeedbackReceiptPayload,
  FeedbackRequestPayload,
  ProductVerificationPayload,
  ScanRequestPayload,
  ScanResponsePayload,
  StatsPayload,
  VerificationReportPayload,
  VerifyIntegrityPayload,
  VerifyIntegrityRequestPayload
} from "../../types/api.js";
import type { VerificationRating } from "../../types/index.js";
import { products as seededProducts } from "../../lib/seed-data.js";
import {
  findBrandWithRelations,
  loadVerificationData,
  serializeBrandDetails,
  serializeCertificationCatalogItem,
  serializeProductDetails,
  buildSourceDetails,
  type BrandWithRelations,
  type LoadedVerificationData,
  type ProductWithRelations
} from "./verification-data.js";
import { OpenFoodFactsService, type ImportedCatalogProduct } from "./open-food-facts.js";

interface ProductQueryMatch {
  product: ProductWithRelations;
  score: number;
}

/**
 * Coordinates Prisma data loading with the verification engine for the REST API.
 */
export class GreenProofApiService {
  private readonly verificationEngine = new VerificationEngine();
  private readonly openFoodFactsService: OpenFoodFactsService;
  private static readonly localQueryAcceptanceThreshold = 80;
  private static readonly seededBarcodeSet = new Set(seededProducts.map((product) => product.barcode));
  private static readonly queryStopWords = new Set([
    "a",
    "an",
    "and",
    "any",
    "by",
    "for",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with"
  ]);
  private static readonly searchCanonicalMap = new Map<string, string>([
    ["tee", "shirt"],
    ["tees", "shirt"],
    ["tshirt", "shirt"],
    ["tops", "shirt"],
    ["hoodies", "hoodie"],
    ["sneakers", "sneaker"],
    ["shoes", "shoe"],
    ["cleaner", "cleaner"],
    ["soap", "soap"],
    ["soaps", "soap"]
  ]);

  public constructor(openFoodFactsService = new OpenFoodFactsService()) {
    this.openFoodFactsService = openFoodFactsService;
  }

  /**
   * Finds a product by barcode or search query and returns its full verification payload.
   */
  public async scan(payload: ScanRequestPayload): Promise<ScanResponsePayload | null> {
    let data = await loadVerificationData();
    let product: ProductWithRelations | undefined;

    if (payload.barcode) {
      product = data.products.find((candidate) => candidate.barcode === payload.barcode);

      if (product && this.shouldRefreshLegacyImportedProduct(product)) {
        const refreshedImportedProduct = await this.importBarcodeFromOpenFoodFacts(payload.barcode);

        if (refreshedImportedProduct) {
          data = await loadVerificationData();
          product = data.products.find((candidate) => candidate.id === refreshedImportedProduct.id);
        }
      }

      if (!product) {
        const importedProduct = await this.importBarcodeFromOpenFoodFacts(payload.barcode);

        if (importedProduct) {
          data = await loadVerificationData();
          product = data.products.find((candidate) => candidate.id === importedProduct.id);
        }
      }
    } else if (payload.query) {
      const localMatch = this.findBestProductByQuery(data.products, payload.query);

      if (localMatch && this.isAcceptableLocalQueryMatch(localMatch)) {
        product = localMatch.product;
      } else {
        const importedProduct = await this.importQueryFromOpenFoodFacts(payload.query);

        if (importedProduct) {
          data = await loadVerificationData();
          product = data.products.find((candidate) => candidate.id === importedProduct.id);
        }
      }
    }

    return product ? this.buildStoredVerificationPayload(product, data, { reuseLatestSnapshot: false }) : null;
  }

  /**
   * Returns one product with its latest verification output.
   */
  public async getProductVerification(productId: number): Promise<ProductVerificationPayload | null> {
    const data = await loadVerificationData();
    const product = data.products.find((candidate) => candidate.id === productId);

    return product ? this.buildStoredVerificationPayload(product, data, { reuseLatestSnapshot: true }) : null;
  }

  /**
   * Verifies whether a submitted report still matches the stored integrity record.
   */
  public async verifyIntegrity(payload: VerifyIntegrityRequestPayload): Promise<VerifyIntegrityPayload | null> {
    const snapshot = await db.verificationSnapshot.findUnique({
      where: {
        displayId: payload.displayId
      }
    });

    if (!snapshot) {
      return null;
    }

    const preparedRecord = prepareIntegrityRecord(payload.report);
    const verified =
      snapshot.algorithmVersion === preparedRecord.algorithmVersion &&
      verifyIntegrityHash(preparedRecord.resultHash, snapshot.resultHash);

    return buildIntegrityVerificationResponse({
      displayId: snapshot.displayId,
      verified,
      storedHash: snapshot.resultHash,
      submittedHash: preparedRecord.resultHash,
      storedAt: snapshot.createdAt,
      algorithmVersion: snapshot.algorithmVersion
    });
  }

  /**
   * Returns brand-level reputation detail, score snapshots, and curated reputation notes.
   */
  public async getBrandReputation(brandId: number): Promise<BrandReputationPayload | null> {
    const data = await loadVerificationData();
    const brandProducts = data.products.filter((product) => product.brandId === brandId);
    const brand = brandProducts[0]?.brand ?? (await findBrandWithRelations(brandId));

    if (!brand) {
      return null;
    }

    const pastScores = brandProducts
      .map<BrandScoreSnapshot>((product) => {
        const payload = this.buildVerificationReport(product, data);
        return {
          productId: product.id,
          productName: product.name,
          score: payload.result.score,
          rating: payload.result.rating,
          sampledAt: product.updatedAt.toISOString()
        };
      })
      .sort((leftScore, rightScore) => rightScore.score - leftScore.score);

    return {
      brand: serializeBrandDetails(brand),
      history: this.buildBrandHistory(brand, pastScores),
      pastScores,
      newsMentions: this.buildBrandNewsMentions(brand),
      averageTrustScore: this.roundNumber(
        pastScores.length === 0
          ? 0
          : pastScores.reduce((totalScore, snapshot) => totalScore + snapshot.score, 0) / pastScores.length
      )
    };
  }

  /**
   * Returns the recognized certification catalog.
   */
  public async listCertifications(): Promise<CertificationCatalogItem[]> {
    const certifications = await db.certification.findMany({
      orderBy: {
        name: "asc"
      }
    });

    return certifications.map(serializeCertificationCatalogItem);
  }

  /**
   * Returns platform-wide verification statistics.
   */
  public async getStats(): Promise<StatsPayload> {
    const data = await loadVerificationData();
    const outcomes = data.products.map((product) => this.buildVerificationReport(product, data));
    const feedbackCount = await db.feedback.count();
    const ratingDistribution = this.createEmptyRatingDistribution();

    for (const outcome of outcomes) {
      ratingDistribution[outcome.result.rating] += 1;
    }

    const sortedOutcomes = [...outcomes].sort((leftOutcome, rightOutcome) => rightOutcome.result.score - leftOutcome.result.score);
    const mostQuestionableOutcome = sortedOutcomes.at(-1);
    const stats: StatsPayload = {
      productsAnalyzed: outcomes.length,
      brandsTracked: new Set(data.products.map((product) => product.brandId)).size,
      certificationsRecognized: data.referenceData.certifications.length,
      flaggedBrands: new Set(data.products.filter((product) => product.brand.isFlagged).map((product) => product.brandId)).size,
      feedbackCount,
      averageTrustScore: this.roundNumber(
        outcomes.reduce((totalScore, outcome) => totalScore + outcome.result.score, 0) / Math.max(outcomes.length, 1)
      ),
      averageBrandReputation: this.roundNumber(
        data.products.reduce((totalScore, product) => totalScore + product.brand.reputationScore, 0) /
          Math.max(data.products.length, 1)
      ),
      ratingDistribution
    };

    if (sortedOutcomes[0]) {
      stats.mostTrustedProduct = {
        productId: sortedOutcomes[0].product.id,
        productName: sortedOutcomes[0].product.name,
        score: sortedOutcomes[0].result.score
      };
    }

    if (mostQuestionableOutcome) {
      stats.mostQuestionableProduct = {
        productId: mostQuestionableOutcome.product.id,
        productName: mostQuestionableOutcome.product.name,
        score: mostQuestionableOutcome.result.score
      };
    }

    return stats;
  }

  /**
   * Stores user feedback about a product score for future review.
   */
  public async submitFeedback(payload: FeedbackRequestPayload): Promise<FeedbackReceiptPayload | null> {
    const product = await db.product.findUnique({
      where: {
        id: payload.productId
      }
    });

    if (!product) {
      return null;
    }

    const feedback = await db.feedback.create({
      data: {
        productId: payload.productId,
        issueType: payload.issueType,
        message: payload.message,
        ...(payload.email ? { email: payload.email } : {}),
        ...(payload.reportedScore !== undefined ? { reportedScore: payload.reportedScore } : {}),
        ...(payload.expectedScore !== undefined ? { expectedScore: payload.expectedScore } : {})
      }
    });

    return {
      id: feedback.id,
      productId: feedback.productId,
      issueType: feedback.issueType,
      message: feedback.message,
      email: feedback.email,
      reportedScore: feedback.reportedScore,
      expectedScore: feedback.expectedScore,
      createdAt: feedback.createdAt.toISOString()
    };
  }

  /**
   * Builds the API payload for one product and its latest verification output.
   */
  private buildVerificationReport(
    product: ProductWithRelations,
    data: LoadedVerificationData
  ): VerificationReportPayload {
    const record = data.recordsByProductId.get(product.id);

    if (!record) {
      throw new Error(`Verification record missing for product ${product.id}.`);
    }

    const outcome = this.verificationEngine.verify(record, data.referenceData);
    const baseReport = {
      product: serializeProductDetails(product),
      brand: serializeBrandDetails(product.brand),
      dataSource: record.dataSource,
      claims: outcome.claims,
      result: outcome.result,
      explanation: outcome.explanation,
      alternatives: outcome.alternatives
    };
    const sourceDetails = record.sourceDetails ?? buildSourceDetails(product);

    if (sourceDetails) {
      return {
        ...baseReport,
        sourceDetails
      };
    }

    return baseReport;
  }

  /**
   * Builds a product verification payload and attaches stored integrity metadata.
   */
  private async buildStoredVerificationPayload(
    product: ProductWithRelations,
    data: LoadedVerificationData,
    options: {
      reuseLatestSnapshot: boolean;
    }
  ): Promise<ProductVerificationPayload> {
    const report = this.buildVerificationReport(product, data);
    const preparedRecord = prepareIntegrityRecord(report);
    const snapshot =
      options.reuseLatestSnapshot
        ? (await this.findLatestMatchingSnapshot(product.id, preparedRecord.resultHash, preparedRecord.algorithmVersion)) ??
          (await this.createVerificationSnapshot(product.id, preparedRecord))
        : await this.createVerificationSnapshot(product.id, preparedRecord);

    return attachIntegrityMetadata(report, snapshot);
  }

  /**
   * Returns the newest stored snapshot whose hash still matches the current report.
   */
  private async findLatestMatchingSnapshot(productId: number, resultHash: string, algorithmVersion: string) {
    return db.verificationSnapshot.findFirst({
      where: {
        productId,
        resultHash,
        algorithmVersion
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  /**
   * Persists a new integrity snapshot for a verification report.
   */
  private async createVerificationSnapshot(
    productId: number,
    preparedRecord: ReturnType<typeof prepareIntegrityRecord>
  ) {
    return db.verificationSnapshot.create({
      data: {
        productId,
        displayId: generateDisplayId(),
        resultHash: preparedRecord.resultHash,
        algorithmVersion: preparedRecord.algorithmVersion,
        canonicalPayload: preparedRecord.canonicalPayload as Prisma.InputJsonValue
      }
    });
  }

  /**
   * Imports a barcode from Open Food Facts into the local catalog when the product is missing locally.
   */
  private async importBarcodeFromOpenFoodFacts(barcode: string): Promise<ProductWithRelations | null> {
    const importedProduct = await this.openFoodFactsService.getProductByBarcode(barcode);

    if (!importedProduct) {
      return null;
    }

    return this.upsertImportedProduct(importedProduct);
  }

  /**
   * Imports the top matching Open Food Facts search result for a manual food query.
   */
  private async importQueryFromOpenFoodFacts(query: string): Promise<ProductWithRelations | null> {
    const importedProduct = (await this.openFoodFactsService.searchProducts(query, 5)).find(
      (candidate) => candidate.barcode.trim().length > 0
    );

    if (!importedProduct) {
      return null;
    }

    return this.upsertImportedProduct(importedProduct);
  }

  /**
   * Stores or refreshes one imported OFF product inside the local Prisma catalog.
   */
  private async upsertImportedProduct(importedProduct: ImportedCatalogProduct): Promise<ProductWithRelations | null> {
    const brand = await db.brand.upsert({
      where: {
        name: importedProduct.brandName
      },
      update: {},
      create: {
        name: importedProduct.brandName,
        reputationScore: 0.5
      }
    });
    const existingByBarcode = await db.product.findUnique({
      where: {
        barcode: importedProduct.barcode
      }
    });
    const productName = existingByBarcode
      ? importedProduct.name
      : await this.ensureUniqueImportedProductName(importedProduct.name, brand.id, importedProduct.barcode);

    await db.product.upsert({
      where: {
        barcode: importedProduct.barcode
      },
      update: {
        name: productName,
        brandId: brand.id,
        category: importedProduct.category,
        description: importedProduct.description,
        imageUrl: importedProduct.imageUrl,
        dataSource: "open_food_facts",
        sourceUrl: importedProduct.sourceUrl,
        sourceMetadata: importedProduct.sourceDetails as unknown as Prisma.InputJsonValue,
        claims: importedProduct.claimTexts
      },
      create: {
        name: productName,
        brandId: brand.id,
        barcode: importedProduct.barcode,
        category: importedProduct.category,
        description: importedProduct.description,
        imageUrl: importedProduct.imageUrl,
        dataSource: "open_food_facts",
        sourceUrl: importedProduct.sourceUrl,
        sourceMetadata: importedProduct.sourceDetails as unknown as Prisma.InputJsonValue,
        claims: importedProduct.claimTexts
      }
    });

    const refreshedData = await loadVerificationData();
    return refreshedData.products.find((product) => product.barcode === importedProduct.barcode) ?? null;
  }

  /**
   * Avoids collisions with the local unique constraint on product name plus brand.
   */
  private async ensureUniqueImportedProductName(name: string, brandId: number, barcode: string): Promise<string> {
    const existingProduct = await db.product.findFirst({
      where: {
        name,
        brandId
      },
      select: {
        id: true
      }
    });

    return existingProduct ? `${name} (${barcode})` : name;
  }

  /**
   * Chooses the best local product match for a manual search query.
   */
  private findBestProductByQuery(products: ProductWithRelations[], query: string): ProductQueryMatch | undefined {
    const normalizedQuery = normalizeLookupKey(query);
    const queryTokens = this.tokenizeSearchTerms(query);

    if (!normalizedQuery || queryTokens.length === 0) {
      return undefined;
    }

    return products
      .map((product) => ({ product, score: this.rankProductMatch(product, normalizedQuery, queryTokens) }))
      .filter((candidate) => candidate.score > 0)
      .sort((leftCandidate, rightCandidate) => rightCandidate.score - leftCandidate.score)
      [0];
  }

  /**
   * Guards manual local search so weak fuzzy matches do not beat a better OFF search result.
   */
  private isAcceptableLocalQueryMatch(match: ProductQueryMatch): boolean {
    return match.score >= GreenProofApiService.localQueryAcceptanceThreshold;
  }

  /**
   * Refreshes legacy imported rows that were created before provenance tracking existed.
   */
  private shouldRefreshLegacyImportedProduct(product: ProductWithRelations): boolean {
    return (
      !GreenProofApiService.seededBarcodeSet.has(product.barcode) &&
      product.dataSource !== "open_food_facts" &&
      !product.sourceUrl &&
      product.sourceMetadata == null
    );
  }

  /**
   * Produces a simple relevance score for manual search matching.
   */
  private rankProductMatch(product: ProductWithRelations, normalizedQuery: string, queryTerms: string[]): number {
    const searchableName = normalizeLookupKey(product.name);
    const searchableBrand = normalizeLookupKey(product.brand.name);
    const searchableCategory = normalizeLookupKey(product.category);
    const searchableDescription = normalizeLookupKey(product.description ?? "");
    const searchableClaims = normalizeLookupKey(serializeProductDetails(product).claims.join(" "));
    const nameTokens = new Set(this.tokenizeSearchTerms(product.name));
    const brandTokens = new Set(this.tokenizeSearchTerms(product.brand.name));
    const categoryTokens = new Set(this.tokenizeSearchTerms(product.category));
    const descriptionTokens = new Set(this.tokenizeSearchTerms(product.description ?? ""));
    const claimTokens = new Set(this.tokenizeSearchTerms(serializeProductDetails(product).claims.join(" ")));
    let score = 0;
    let nameMatchCount = 0;
    let claimMatchCount = 0;
    let categoryMatchCount = 0;
    let descriptionMatchCount = 0;
    let brandMatchCount = 0;

    if (searchableName === normalizedQuery) {
      score += 160;
    }

    if (searchableName.includes(normalizedQuery)) {
      score += 100;
    }

    if (searchableClaims.includes(normalizedQuery)) {
      score += 70;
    }

    if (searchableCategory.includes(normalizedQuery)) {
      score += 45;
    }

    if (searchableBrand.includes(normalizedQuery)) {
      score += 35;
    }

    for (const term of queryTerms) {
      if (nameTokens.has(term)) {
        nameMatchCount += 1;
      }

      if (claimTokens.has(term)) {
        claimMatchCount += 1;
      }

      if (categoryTokens.has(term)) {
        categoryMatchCount += 1;
      }

      if (brandTokens.has(term)) {
        brandMatchCount += 1;
      }

      if (descriptionTokens.has(term)) {
        descriptionMatchCount += 1;
      }
    }

    score += nameMatchCount * 40;
    score += claimMatchCount * 22;
    score += categoryMatchCount * 18;
    score += brandMatchCount * 15;
    score += descriptionMatchCount * 6;

    if (queryTerms.every((term) => nameTokens.has(term))) {
      score += 50;
    }

    if (queryTerms.every((term) => nameTokens.has(term) || claimTokens.has(term) || categoryTokens.has(term))) {
      score += 25;
    }

    if (nameMatchCount === 0 && claimMatchCount === 0 && categoryMatchCount === 0) {
      score = 0;
    }

    return score;
  }

  /**
   * Tokenizes free-text search into canonical terms for ranking.
   */
  private tokenizeSearchTerms(value: string): string[] {
    const normalizedValue = normalizeLookupKey(value);

    if (!normalizedValue) {
      return [];
    }

    const rawTokens = normalizedValue
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length > 1)
      .filter((token) => !GreenProofApiService.queryStopWords.has(token));
    const canonicalTokens = rawTokens.map((token) => GreenProofApiService.searchCanonicalMap.get(token) ?? token);

    return [...new Set(canonicalTokens)];
  }

  /**
   * Builds simple brand reputation history entries for the API.
   */
  private buildBrandHistory(brand: BrandWithRelations | ProductWithRelations["brand"], pastScores: BrandScoreSnapshot[]): BrandHistoryEvent[] {
    const history: BrandHistoryEvent[] = [];

    if (brand.flagReason) {
      history.push({
        date: brand.updatedAt.toISOString(),
        title: "Brand caution flag",
        detail: brand.flagReason,
        severity: "warning"
      });
    }

    if (brand.reputationScore > 0.8) {
      history.push({
        date: brand.updatedAt.toISOString(),
        title: "Strong brand reputation",
        detail: `${brand.name} maintains a high reputation score of ${brand.reputationScore}.`,
        severity: "positive"
      });
    }

    for (const certification of brand.brandCertifications) {
      if (!certification.isValid) {
        continue;
      }

      history.push({
        date: certification.expiryDate?.toISOString() ?? brand.updatedAt.toISOString(),
        title: `Brand certification: ${certification.certification.name}`,
        detail: `${brand.name} holds a valid ${certification.certification.acronym} certification.`,
        severity: "positive"
      });
    }

    if (pastScores.length > 0) {
      const latestSnapshot = pastScores[0];

      if (!latestSnapshot) {
        return history;
      }

      history.push({
        date: latestSnapshot.sampledAt,
        title: "Current product score snapshot",
        detail: `${brand.name} currently averages ${this.roundNumber(
          pastScores.reduce((totalScore, snapshot) => totalScore + snapshot.score, 0) / pastScores.length
        )} across tracked products.`,
        severity: "neutral"
      });
    }

    return history.sort((leftEvent, rightEvent) => rightEvent.date.localeCompare(leftEvent.date));
  }

  /**
   * Builds lightweight reputation mentions for the brand endpoint.
   */
  private buildBrandNewsMentions(brand: BrandWithRelations | ProductWithRelations["brand"]): BrandNewsMention[] {
    if (brand.flagReason) {
      return [
        {
          title: `${brand.name} reputation alert`,
          summary: brand.flagReason,
          source: "GreenProof Seed Intelligence",
          sentiment: "negative",
          publishedAt: brand.updatedAt.toISOString()
        }
      ];
    }

    if (brand.reputationScore > 0.8) {
      return [
        {
          title: `${brand.name} holds a strong sustainability reputation`,
          summary: `${brand.name} currently maintains one of the strongest brand reputation scores in the GreenProof catalog.`,
          source: "GreenProof Seed Intelligence",
          sentiment: "positive",
          publishedAt: brand.updatedAt.toISOString()
        }
      ];
    }

    return [];
  }

  /**
   * Creates an empty rating distribution object for stats aggregation.
   */
  private createEmptyRatingDistribution(): Record<VerificationRating, number> {
    return {
      TRUSTED: 0,
      MODERATE: 0,
      SUSPICIOUS: 0,
      UNVERIFIED: 0
    };
  }

  /**
   * Rounds floating point values for API responses.
   */
  private roundNumber(value: number): number {
    return Math.round(value * 10) / 10;
  }
}
