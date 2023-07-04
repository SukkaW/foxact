/**
 * Originally created by huozhi @ GitHub <https://huozhi.im/>
 * License: MIT
 * This is from huozhi's amazing zero config bundler: https://github.com/huozhi/bunchee
 *
 * https://github.com/huozhi/bunchee/blob/23cbd6ebab992b886a207a531ec54dfa0877ab39/src/plugins/directive-plugin.ts
 *
 * Following changes are made:
 *
 * - Replace `magic-string` with `@napi-rs/magic-string`
 * - Use a Map to track directives for each module, to support multiple entries input
 */

import type { Plugin } from 'rollup';
import { MagicString } from '@napi-rs/magic-string';

const isNonNull = <T>(val: T | null | undefined): val is T => val != null;

export function preserveUseDirectivePlugin(): Plugin {
  const fileDirectivesMap = new Map<string, Set<string>>();

  return {
    name: 'use-directive',

    transform(code, id) {
      const regex = /^(?:['"]use[^'"]+['"][^\n]*|#![^\n]*)/gm;
      const directives = new Set<string>();

      const replacedCode = code.replace(regex, (match) => {
        // replace double quotes with single quotes
        directives.add(match.replace(/["]/g, '\''));
        return '';
      });

      if (directives.size) fileDirectivesMap.set(id, directives);

      return {
        code: replacedCode,
        map: null
      };
    },

    renderChunk(code, chunk, { sourcemap }) {
      const outputDirectives = chunk.moduleIds
        .map((id) => fileDirectivesMap.get(id))
        .filter(isNonNull)
        .reduce((acc, directives) => {
          directives.forEach((directive) => acc.add(directive));
          return acc;
        }, new Set<string>());

      if (outputDirectives.size === 0) return null;

      const s = new MagicString(code);
      s.prepend(`${[...outputDirectives].join('\n')}\n`);

      return {
        code: s.toString(),
        map: sourcemap ? s.generateMap({ hires: true }).toMap() : null
      };
    }
  };
}
