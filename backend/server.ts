import express, { Express, Request, Response } from "express";
import cors from "cors";
import {
  AtpAgent,
  AppBskyFeedDefs,
  AppBskyEmbedImages,
  AppBskyFeedPost,
} from "@atproto/api";

const agent = new AtpAgent({ service: "https://public.api.bsky.app" });

const app = express();
const port = 3001;

app.use(cors());

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

// Routes
app.get("/api/photos", async (_req: Request, res: Response): Promise<void> => {
  try {
    const searchResponse = await agent.app.bsky.feed.searchPosts({
      q: "photography",
      limit: 30,
    });

    const photoPosts: PhotoPost[] = searchResponse.data.posts
      .filter(hasValidImageEmbed)
      .map((post) => ({
        id: post.uri,
        text: getPostText(post),
        author: {
          handle: post.author.handle,
          displayName: post.author.displayName || post.author.handle,
          profileUrl: `https://bsky.app/profile/${post.author.handle}`,
        },
        imageUrl: getImageUrl(post.embed as AppBskyEmbedImages.View)!,
        fullImageUrl: (post.embed as AppBskyEmbedImages.View).images[0]
          .fullsize,
        createdAt: post.indexedAt,
      }));

    res.json(photoPosts);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
