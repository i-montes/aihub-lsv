export type SuggestionType = "spelling" | "grammar" | "style";

export type Suggestion = {
  id: string;
  type: SuggestionType;
  original: string;
  suggestion: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
  severity: number; // 1-3, where 1 is minor, 3 is critical
};

export type WordPressPost = {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  link: string;
  date: string;
  status: string;
};

export type WordPressConnection = {
  id: string;
  siteName?: string;
  site_url: string;
  api_path?: string;
  organizationId: string;
  username?: string;
  password?: string;
  active: boolean;
  apiKey?: string;
  createdAt: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  permissions?: any;
  connection_type: "self_hosted" | "wordpress_com";
};
