# `ui/` — Círculo 4 · Frameworks & Drivers

Componentes de presentación, hooks de cliente y estilos. No importa de
`domain/` ni `application/`: consume exclusivamente tipos `*ViewModel`
desde `adapters/inbound/presenters/` (regla de dependencia, ver
[`../README.md`](../README.md)).

**Vacío en INC-00 a propósito.** Los componentes de UI llegan con las
pantallas del incremento correspondiente (ver el Plan de Incrementos);
este incremento solo declara la carpeta y su regla de dependencia.
