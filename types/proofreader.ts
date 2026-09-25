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
  /**
   * La regla del manual que motivó la corrección, copiada tal cual.
   *
   * El tamiz sabe exactamente qué regla señaló, así que se arrastra hasta la
   * interfaz: ante una sugerencia dudosa, el editor puede contrastarla con el
   * manual sin salir de la pantalla ni fiarse de la explicación del modelo.
   */
  regla?: string;
  /** Sección del manual de la que sale la regla. */
  categoria?: string;
  /** Cuánto de seguro estaba el tamiz de que esta frase rompía algo, de 0 a 1. */
  confianza?: number;
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
