import type { ProductSourceDetails } from "../../types/index.js";

interface OpenFoodFactsApiProduct {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  generic_name?: string;
  brands?: string;
  categories?: string;
  labels?: string;
  labels_tags?: string[];
  packaging?: string;
  packaging_tags?: string[];
  ingredients_text?: string;
  ecoscore_grade?: string;
  ecoscore_score?: number;
  nutriscore_grade?: string;
  nova_group?: number;
  image_front_url?: string;
  image_url?: string;
  url?: string;
}

interface OpenFoodFactsBarcodeResponse {
  status?: number;
  code?: string;
  product?: OpenFoodFactsApiProduct;
}

interface OpenFoodFactsSearchResponse {
  products?: OpenFoodFactsApiProduct[];
}

export interface ImportedCatalogProduct {
  barcode: string;
  name: string;
  brandName: string;
  category: string;
  description: string;
  claimTexts: string[];
  imageUrl: string | null;
  sourceUrl: string | null;
  sourceDetails: ProductSourceDetails;
}

const LABEL_CLAIM_MATCHERS = [
  { matcher: /\borganic\b/i, text: "organic" },
  { matcher: /\bfair.?trade\b/i, text: "fair trade" },
  { matcher: /\bvegan\b/i, text: "vegan" },
  { matcher: /\brainforest.?alliance\b/i, text: "rainforest alliance" },
  { matcher: /\becocert\b/i, text: "ecocert" },
  { matcher: /\bfsc\b/i, text: "fsc" }
] as const;

const PACKAGING_SIGNAL_MATCHERS = [
  { matcher: /\brecycl/i, text: "recyclable packaging" },
  { matcher: /\bcompost/i, text: "compostable packaging" },
  { matcher: /\bbiodegrad/i, text: "biodegradable packaging" }
] as const;

/**
 * Open Food Facts client used to hydrate real food barcode scans and manual search fallbacks.
 */
export class OpenFoodFactsService {
  private readonly apiBaseUrl: string;
  private readonly searchBaseUrl: string;
  private readonly fetchImplementation: typeof fetch;

  public constructor(
    apiBaseUrl = process.env.OPEN_FOOD_FACTS_BASE_URL ?? "https://world.openfoodfacts.org/api/v2",
    searchBaseUrl = process.env.OPEN_FOOD_FACTS_SEARCH_URL ?? "https://world.openfoodfacts.org/cgi/search.pl",
    fetchImplementation: typeof fetch = fetch
  ) {
    this.apiBaseUrl = apiBaseUrl;
    this.searchBaseUrl = searchBaseUrl;
    this.fetchImplementation = fetchImplementation;
  }

  /**
   * Fetches one product by barcode and maps it into the GreenProof import shape.
   */
  public async getProductByBarcode(barcode: string): Promise<ImportedCatalogProduct | null> {
    const requestUrl = new URL(`product/${encodeURIComponent(barcode)}.json`, this.ensureTrailingSlash(this.apiBaseUrl));
    requestUrl.searchParams.set("fields", this.getRequestedFieldList());
    const payload = await this.fetchJson<OpenFoodFactsBarcodeResponse>(requestUrl);

    if (!payload || payload.status !== 1 || !payload.product) {
      return null;
    }

    return this.mapImportedProduct(barcode, payload.product);
  }

  /**
   * Searches the Open Food Facts catalog for manual food queries and returns normalized candidates.
   */
  public async searchProducts(query: string, pageSize = 5): Promise<ImportedCatalogProduct[]> {
    const requestUrl = new URL(this.searchBaseUrl);
    requestUrl.searchParams.set("search_terms", query);
    requestUrl.searchParams.set("json", "1");
    requestUrl.searchParams.set("page_size", String(pageSize));
    requestUrl.searchParams.set("sort_by", "unique_scans_n");
    requestUrl.searchParams.set("fields", this.getRequestedFieldList());
    const payload = await this.fetchJson<OpenFoodFactsSearchResponse>(requestUrl);

    if (!payload?.products?.length) {
      return [];
    }

    return payload.products
      .map((product) => this.mapImportedProduct(this.firstNonEmpty(product.code, ""), product))
      .filter((product): product is ImportedCatalogProduct => product !== null);
  }

  /**
   * Ensures URL construction works whether the configured base URL ends with a slash or not.
   */
  private ensureTrailingSlash(value: string): string {
    return value.endsWith("/") ? value : `${value}/`;
  }

  /**
   * Centralizes the Open Food Facts fields we need for provenance and claim extraction.
   */
  private getRequestedFieldList(): string {
    return [
      "code",
      "product_name",
      "product_name_en",
      "generic_name",
      "brands",
      "categories",
      "labels",
      "labels_tags",
      "packaging",
      "packaging_tags",
      "ingredients_text",
      "ecoscore_grade",
      "ecoscore_score",
      "nutriscore_grade",
      "nova_group",
      "image_front_url",
      "image_url",
      "url"
    ].join(",");
  }

  /**
   * Performs one JSON fetch against Open Food Facts and tolerates network/API misses.
   */
  private async fetchJson<T>(requestUrl: URL): Promise<T | null> {
    try {
      const response = await this.fetchImplementation(requestUrl, {
        headers: {
          "User-Agent": "GreenProof/0.1 (open-food-facts integration)"
        }
      });

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  /**
   * Maps the external API response to the local GreenProof import format.
   */
  private mapImportedProduct(barcode: string, product: OpenFoodFactsApiProduct): ImportedCatalogProduct | null {
    const normalizedBarcode = barcode.trim();

    if (!normalizedBarcode) {
      return null;
    }

    const name = this.firstNonEmpty(
      product.product_name,
      product.product_name_en,
      product.generic_name,
      `Imported Product ${normalizedBarcode}`
    );
    const brandName = this.pickPrimaryValue(product.brands, "Unknown Brand");
    const category = this.pickPrimaryValue(product.categories, "Food");
    const labels = this.extractTagDisplayValues(product.labels_tags, product.labels);
    const packaging = this.extractPackagingValues(product.packaging_tags, product.packaging);
    const claimTexts = this.extractClaimTexts(labels, packaging);
    const description = [
      `${name} by ${brandName}.`,
      product.categories ? `Category details: ${product.categories}.` : "",
      product.labels ? `Catalog labels: ${product.labels}.` : "",
      product.packaging ? `Packaging details: ${product.packaging}.` : "",
      product.ingredients_text ? `Ingredients summary: ${product.ingredients_text}.` : ""
    ]
      .filter(Boolean)
      .join(" ");

    return {
      barcode: normalizedBarcode,
      name,
      brandName,
      category,
      description,
      claimTexts,
      imageUrl: product.image_front_url ?? product.image_url ?? null,
      sourceUrl: product.url ?? null,
      sourceDetails: {
        label: "Open Food Facts",
        ...(product.url ? { productUrl: product.url } : {}),
        ...(labels.length > 0 ? { labels } : {}),
        ...(packaging.length > 0 ? { packaging } : {}),
        ...(product.ecoscore_grade ? { ecoscoreGrade: product.ecoscore_grade.toUpperCase() } : {}),
        ...(product.ecoscore_score !== undefined ? { ecoscoreScore: product.ecoscore_score } : {}),
        ...(product.nutriscore_grade ? { nutriscoreGrade: product.nutriscore_grade.toUpperCase() } : {}),
        ...(product.nova_group !== undefined ? { novaGroup: product.nova_group } : {})
      }
    };
  }

  /**
   * Converts OFF labels and packaging signals into claim texts that GreenProof understands.
   */
  private extractClaimTexts(labels: string[], packaging: string[]): string[] {
    const claimTexts = new Set<string>();

    for (const label of labels) {
      for (const matcher of LABEL_CLAIM_MATCHERS) {
        if (matcher.matcher.test(label)) {
          claimTexts.add(matcher.text);
        }
      }
    }

    for (const packagingSignal of packaging) {
      for (const matcher of PACKAGING_SIGNAL_MATCHERS) {
        if (matcher.matcher.test(packagingSignal)) {
          claimTexts.add(matcher.text);
        }
      }
    }

    return [...claimTexts];
  }

  /**
   * Normalizes label tags into readable strings while preserving OFF structured signal fidelity.
   */
  private extractTagDisplayValues(tags: string[] | undefined, fallbackText: string | undefined): string[] {
    if (Array.isArray(tags) && tags.length > 0) {
      return [
        ...new Set(
          tags
            .map((tag) => tag.replace(/^[a-z]{2}:/i, ""))
            .map((tag) => tag.replace(/-/g, " ").trim())
            .filter((tag) => tag.length > 0)
        )
      ];
    }

    return fallbackText
      ? fallbackText
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
      : [];
  }

  /**
   * Normalizes packaging tags into compact readable values.
   */
  private extractPackagingValues(tags: string[] | undefined, fallbackText: string | undefined): string[] {
    if (Array.isArray(tags) && tags.length > 0) {
      return [
        ...new Set(
          tags
            .map((tag) => tag.replace(/^[a-z]{2}:/i, ""))
            .map((tag) => tag.replace(/-/g, " ").trim())
            .filter((tag) => tag.length > 0)
        )
      ];
    }

    return fallbackText
      ? fallbackText
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
      : [];
  }

  /**
   * Returns the first populated value from a list of possibly empty strings.
   */
  private firstNonEmpty(...values: Array<string | undefined>): string {
    return values.find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? "";
  }

  /**
   * Picks the first comma-delimited label from a text field.
   */
  private pickPrimaryValue(value: string | undefined, fallback: string): string {
    const primaryValue = value
      ?.split(",")
      .map((entry) => entry.trim())
      .find((entry) => entry.length > 0);

    return primaryValue ?? fallback;
  }
}
