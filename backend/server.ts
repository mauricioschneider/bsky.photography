import express, { Express, Request, Response } from "express";
import cors from "cors";
import {
  AtpAgent,
  AppBskyFeedDefs,
  AppBskyEmbedImages,
  AppBskyFeedPost,
  Label,
} from "@atproto/api";

const agent = new AtpAgent({ service: "https://public.api.bsky.app" });

const app = express();
const port = process.env.API_PORT || 8080;

app.use(cors());

// Cache for storing the photos
interface Cache {
  data: any;
  timestamp: number;
}

let photosCache: Cache = {
  data: null,
  timestamp: 0,
};

// Cache duration in milliseconds (2 seconds)
const CACHE_DURATION = 2 * 1000;

// Types
interface PhotoPost {
  id: string;
  text: string;
  author: {
    handle: string;
    displayName: string;
    profileUrl: string;
  };
  imageUrl: string;
  fullImageUrl: string;
  createdAt: string;
  labels: Label[] | undefined;
}

// TODO: Update type guard to use https://github.com/bluesky-social/atproto/tree/main/packages/api#validation-and-types
// Type guard to check if record is a post record
const isPostRecord = (record: unknown): record is AppBskyFeedPost.Record => {
  return (record as AppBskyFeedPost.Record)?.$type === "app.bsky.feed.post";
};

// Helper to safely get post text
const getPostText = (post: AppBskyFeedDefs.PostView): string => {
  if (isPostRecord(post.record)) {
    return post.record.text;
  }
  return "";
};

// Type guard to check if embed is an image embed
const isImageEmbed = (embed: unknown): embed is AppBskyEmbedImages.View => {
  return (
    (embed as AppBskyEmbedImages.View)?.$type === "app.bsky.embed.images#view"
  );
};

// Helper function to get the image URL from embed
const getImageUrl = (
  embed: AppBskyEmbedImages.View | undefined
): string | null => {
  if (embed && isImageEmbed(embed) && embed.images.length > 0) {
    return embed.images[0].thumb;
  }
  return null;
};

// Type guard to check if a post has valid image embed
const hasValidImageEmbed = (post: AppBskyFeedDefs.PostView): boolean => {
  return isImageEmbed(post.embed) && post.embed.images.length > 0;
};

const hasNoLabels = (post: AppBskyFeedDefs.PostView): boolean => {
  if (post.labels && post.labels.length > 0) {
    return false;
  }

  return true;
};

// Extract post ID from URI (after "app.bsky.feed.post/")
const getPostId = (uri: string): string => {
  const parts = uri.split("/");
  return parts[parts.length - 1];
};

const fetchPhotosFromApi = async (): Promise<PhotoPost[]> => {
  const searchResponse = await agent.app.bsky.feed.searchPosts({
    q: "photography",
    //author: "did:plc:dgfozpqiulvymjgun4quydgv",
    limit: 100,
  });

  const photoPosts: PhotoPost[] = searchResponse.data.posts
    .filter(hasValidImageEmbed)
    .filter(hasNoLabels)
    .map((post) => ({
      id: post.uri,
      text: getPostText(post),
      author: {
        handle: post.author.handle,
        displayName: post.author.displayName || post.author.handle,
        profileUrl: `https://bsky.app/profile/${post.author.handle}`,
      },
      postUrl: `https://bsky.app/profile/${post.author.handle}/post/${getPostId(post.uri)}`,
      imageUrl: getImageUrl(post.embed as AppBskyEmbedImages.View)!,
      fullImageUrl: (post.embed as AppBskyEmbedImages.View).images[0].fullsize,
      createdAt: post.indexedAt,
      labels: post.labels,
    }));

  return photoPosts;
};

// Function to refresh cache
const refreshCache = async () => {
  try {
    console.log(`[${formatTime()}] Refreshing cache...`);
    const photos = await fetchPhotosFromApi();
    photosCache = {
      data: photos,
      timestamp: Date.now(),
    };
    console.log(
      `[${formatTime()}] Cache refreshed successfully with ${photos.length} photos`
    );
  } catch (error) {
    console.error(`[${formatTime()}] Error refreshing cache:`, error);
  }
};

// Format timestamp for logging
const formatTime = () => {
  return new Date().toLocaleTimeString();
};

setInterval(refreshCache, CACHE_DURATION);

// Initial cache population
refreshCache().then(() => {
  console.log(`[${formatTime()}] Initial cache population completed`);
});

app.get("/api/photos", async (_req: Request, res: Response): Promise<void> => {
  try {
    // Always serve from cache if available
    if (photosCache.data) {
      console.log(
        `[${formatTime()}] Serving ${photosCache.data.length} photos from cache`
      );
      res.json(photosCache.data);
      return;
    }

    // If cache is empty (first request), fetch data
    console.log(`[${formatTime()}] Cache empty, fetching fresh data`);
    const photos = await fetchPhotosFromApi();
    photosCache = {
      data: photos,
      timestamp: Date.now(),
    };

    res.json(photos);
  } catch (error) {
    console.error(`[${formatTime()}] Error handling request:`, error);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

app.listen(port, () => {
  console.log(`[${formatTime()}] Server running on port ${port}`);
});

export default app;
