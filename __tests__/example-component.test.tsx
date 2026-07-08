// Ejemplo de test de componente React en entorno jsdom (entorno por defecto).
// Sirve como plantilla y verificación del toolchain; puedes eliminarlo.
import { render, screen } from "@testing-library/react";

function Greeting({ name }: { name: string }) {
  return <p>Hola, {name}</p>;
}

describe("Test de componente (jsdom)", () => {
  it("renderiza y aplica matchers de jest-dom", () => {
    render(<Greeting name="NarrARA" />);
    expect(screen.getByText("Hola, NarrARA")).toBeInTheDocument();
  });
});
