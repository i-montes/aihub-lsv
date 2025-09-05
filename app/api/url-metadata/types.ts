export interface UrlMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  statusCode: number;
  isValid: boolean;
  error?: string;
  complete_text?: string;

  // Twitter response
  isTwitter?: boolean;
  text?: string;
  username?: string;
  name?: string;
  follower_count?: number;
  author_image?: string;
  like_count?: number;
  retweet_count?: number;
  creation_date?: string | Date;
  user_description?: string;
  media_image?: string;
  media_video?: string;
  complete_response?: TwitterResponse;
}

export interface TwitterResponse {
  // Twitter-specific fields
  likes?: number;
  created_at?: string;
  status?: string;
  text?: string;
  display_text?: string;
  urls?: {
    url: string;
    expanded_url: string;
    display_url: string;
  }[];
  retweets?: number;
  bookmarks?: number;
  quotes?: number;
  reply_to?: string;
  replies?: number;
  lang?: string;
  in_reply_to_screen_name?: string;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id_str?: string;
  sensitive?: boolean;
  views?: number;
  conversation_id?: string;
  entities?: {
    hashtags: Hashtags[];
    media: Media[];
    symbols: any[];
    timestamps: any[];
    urls: {
      url: string;
      expanded_url: string;
      display_url: string;
      indices: number[];
    }[];
    user_mentions: [];
  };
  initial_tweets?: any;
  author: {
    rest_id: string;
    name: string;
    screen_name: string;
    image: string;
    blue_verified: boolean;
    sub_count: number;
  };
}

export type Hashtags = {
  indices: number[];
  text: string;
};

export interface Media {
  display_url: string;
  expanded_url: string;
  id_str: string;
  indices: number[];
  media_key: string;
  media_url_https: string;
  type: string;
  url: string;
  additional_media_info: AdditionalMediaInfo;
  ext_media_availability: ExtMediaAvailability;
  sizes: Sizes;
  original_info: OriginalInfo;
  video_info: VideoInfo;
  media_results: MediaResults;
}

export interface AdditionalMediaInfo {
  monetizable: boolean;
}

export interface ExtMediaAvailability {
  status: string;
}

export interface Sizes {
  large: Large;
  medium: Medium;
  small: Small;
  thumb: Thumb;
}

export interface Large {
  h: number;
  w: number;
  resize: string;
}

export interface Medium {
  h: number;
  w: number;
  resize: string;
}

export interface Small {
  h: number;
  w: number;
  resize: string;
}

export interface Thumb {
  h: number;
  w: number;
  resize: string;
}

export interface OriginalInfo {
  height: number;
  width: number;
  focus_rects: any[];
}

export interface VideoInfo {
  aspect_ratio: number[];
  duration_millis: number;
  variants: Variant[];
}

export interface Variant {
  content_type: string;
  url: string;
  bitrate?: number;
}

export interface MediaResults {
  result: Result;
}

export interface Result {
  media_key: string;
}
