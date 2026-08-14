// El backend también emite "punctuation"; sin él la UI lo pintaba como
// "Estilo" y con un badge sin color.
export type SuggestionType = "spelling" | "grammar" | "style" | "punctuation";

export type Suggestion = {
  id: string;
  type: SuggestionType;
  original: string;
  suggestion: string;
  explanation: string;
  /**
   * La corrección no se pudo localizar en el documento (texto editado a mano
   * o fragmento que cruza párrafos). Se marca para avisar al usuario en vez
   * de descartarla en silencio.
   */
  unresolved?: boolean;
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
