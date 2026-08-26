import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // `react` habilita el JSX/Fast Refresh para probar componentes.
  plugins: [react()],
  // Resuelve los alias @domain/@application/@adapters/@composition de tsconfig.json (soporte nativo de Vite).
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // Entorno por defecto para tests de componentes React.
    // Los tests de backend pueden optar a Node con el docblock
    // `// @vitest-environment node` al inicio del fichero.
    environment: "jsdom",
    // API global (describe/it/expect) sin imports y limpieza automática de RTL.
    globals: true,
    // Extiende `expect` con los matchers de jest-dom.
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/",
        ".next/",
        "coverage/",
        "**/*.config.{ts,js,mjs}",
        "**/*.d.ts",
        "next-env.d.ts",
        "vitest.setup.ts",
        "**/__tests__/**",
        "**/*.test.{ts,tsx}",
      ],
    },
  },
});
