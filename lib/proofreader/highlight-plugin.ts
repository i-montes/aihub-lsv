import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const proofreaderHighlightKey = new PluginKey<DecorationSet>(
  "proofreaderHighlight"
);

export interface HighlightRange {
  from: number;
  to: number;
  /** Clase CSS; permite distinguir la sugerencia activa del hover */
  className?: string;
}

/**
 * Resalta un rango con una decoración.
 *
 * Antes esto se hacía envolviendo el texto en un `<span>` (con
 * `range.surroundContents` en el panel y con `addMark` en el editor), lo que
 * modificaba el documento y podía partir un enlace por la mitad. Una
 * decoración es solo una capa de pintado: el documento no se toca, así que
 * resaltar nunca puede corromper el marcado.
 */
export const ProofreaderHighlight = Extension.create({
  name: "proofreaderHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: proofreaderHighlightKey,

        state: {
          init: () => DecorationSet.empty,

          apply(tr, current) {
            const meta = tr.getMeta(proofreaderHighlightKey) as
              | HighlightRange
              | null
              | undefined;

            // `null` limpia; un rango lo fija; sin meta, se remapea con el doc
            if (meta === null) return DecorationSet.empty;

            if (meta) {
              return DecorationSet.create(tr.doc, [
                Decoration.inline(meta.from, meta.to, {
                  class: meta.className ?? "proofreader-highlight",
                }),
              ]);
            }

            return current.map(tr.mapping, tr.doc);
          },
        },

        props: {
          decorations(state) {
            return proofreaderHighlightKey.getState(state);
          },
        },
      }),
    ];
  },
});
