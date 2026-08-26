import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import eslintConfigPrettier from "eslint-config-prettier";

// R3 (ADR-007 §4): adapters, inbound y presenters comparten el mismo
// destino permitido — se declara una vez para no repetirlo en las tres
// políticas (el plugin no admite un array de tipos en `from`, así que cada
// tipo de origen necesita su propia entrada).
const adapterFamilyAllowedTargets = {
  to: {
    element: {
      types: ["adapters", "inbound", "presenters", "application", "domain"],
    },
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
      // Orden de más a menos específico: el plugin usa el primer patrón que
      // coincide para clasificar cada fichero.
      "boundaries/elements": [
        { type: "presenters", pattern: "src/adapters/inbound/presenters/**" },
        { type: "inbound", pattern: "src/adapters/inbound/**" },
        { type: "adapters", pattern: "src/adapters/**" },
        { type: "domain", pattern: "src/domain/**" },
        { type: "application", pattern: "src/application/**" },
        { type: "composition", pattern: "src/composition/**" },
        { type: "ui", pattern: "src/ui/**" },
        { type: "app", pattern: "src/app/**" },
      ],
    },
    rules: {
      // Regla de dependencia de Clean Architecture (ADR-007 §4, seis reglas).
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            // R1: domain no importa de ninguna otra capa.
            {
              from: { element: { type: "domain" } },
              allow: { to: { element: { types: ["domain"] } } },
            },
            // R2: application solo importa de domain (y de sí misma).
            {
              from: { element: { type: "application" } },
              allow: {
                to: { element: { types: ["application", "domain"] } },
              },
            },
            // R3: adapters (incl. inbound/presenters) importa de
            // application y domain; nunca de app, ui ni composition.
            {
              from: { element: { type: "adapters" } },
              allow: adapterFamilyAllowedTargets,
            },
            {
              from: { element: { type: "inbound" } },
              allow: adapterFamilyAllowedTargets,
            },
            {
              from: { element: { type: "presenters" } },
              allow: adapterFamilyAllowedTargets,
            },
            // R4: ui no importa de domain ni application; solo *ViewModel
            // desde presenters.
            {
              from: { element: { type: "ui" } },
              allow: { to: { element: { types: ["ui", "presenters"] } } },
            },
            // R5: app importa de composition y de adapters/inbound; nunca
            // de domain ni application.
            {
              from: { element: { type: "app" } },
              allow: {
                to: {
                  element: {
                    types: ["app", "composition", "inbound", "presenters"],
                  },
                },
              },
            },
            // R6: únicamente composition puede importar de las demás capas.
            {
              from: { element: { type: "composition" } },
              allow: {
                to: {
                  element: {
                    types: [
                      "domain",
                      "application",
                      "adapters",
                      "inbound",
                      "presenters",
                      "ui",
                      "app",
                      "composition",
                    ],
                  },
                },
              },
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated / tooling output, not part of the source to lint:
    "coverage/**",
    ".claude/**",
    "playwright-report/**",
    "test-results/**",
  ]),
  // Debe ir el último: desactiva las reglas de estilo que Prettier gobierna.
  eslintConfigPrettier,
]);

export default eslintConfig;
