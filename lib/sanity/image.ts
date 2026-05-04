/**
 * Sanity image helpers for Glatko.
 *
 * `urlFor` returns a builder preconfigured for `auto("format")` so callers
 * just chain `.width()` / `.height()`. The asset metadata projection
 * (asset->{metadata{dimensions}}) gives us dimensions when available; when
 * absent, fall back to next/image's intrinsic sizing.
 */

import imageUrlBuilder, {
  type ImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";

import { publicClient } from "./client";
import type { SanityImage, SanityImageDimensions } from "./types";

const builder = imageUrlBuilder(publicClient);

export function urlFor(source: SanityImageSource): ImageUrlBuilder {
  return builder.image(source).auto("format").fit("max");
}

export function getImageDimensions(
  image: SanityImage | null | undefined,
): SanityImageDimensions | null {
  return image?.asset?.metadata?.dimensions ?? null;
}

export function getImageLqip(
  image: SanityImage | null | undefined,
): string | null {
  return image?.asset?.metadata?.lqip ?? null;
}
