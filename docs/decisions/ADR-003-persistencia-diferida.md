# ADR-003 — Persistencia diferida tras interfaz de repositorio (in-memory first)

- **Versión:** v1.0.0
- **Fecha:** 2026-08-21
- **Estado:** ✅ **Aceptada** · **Fecha de aceptación:** 2026-08-25
- **Decisores:** autor del TFM
- **Relacionado con:** NarrARA (principal) §5, §6; Consolidación §3.5, §3.6; ADR-001; INC-00, INC-05

---

## Contexto

NarrARA necesita persistir cuentos, perfiles y (a futuro) embeddings, pero su **contribución defendible** está en la lógica de dominio verificable (motor de verificación, rebalanceo, moderación), no en la capa de datos. Comprometerse pronto con una tecnología de base de datos concreta añade fricción de infraestructura y arrastra decisiones (esquema, migraciones, ORM) antes de que el núcleo esté validado.

Existe además un riesgo técnico específico del stack elegido: en Node **todo I/O es asíncrono**. Si el dominio se construye contra un almacenamiento en memoria de acceso síncrono, es fácil que la lógica asuma resultados inmediatos. Cuando más tarde entre una BD real (asíncrona, con posible fallo de red), ese supuesto se rompe y obliga a reescribir. El autor procede de un ecosistema (PHP) donde el acceso síncrono es la norma, lo que agrava el riesgo.

---

## Decisión

**Se difiere la persistencia real detrás de una interfaz de repositorio** definida en la capa de **Use Cases** (`CuentoRepository` y equivalentes). Durante los primeros incrementos el único adaptador es **in-memory**, en la capa de Interface Adapters. El adaptador real (PostgreSQL + pgvector) se introduce en **INC-05**, una vez el núcleo esté probado.

**Invariante asociada:** todas las firmas de la interfaz de repositorio devuelven `Promise<T>` **desde el día uno**, aunque el adaptador in-memory resuelva de forma síncrona e instantánea.

---

## Justificación

- **El núcleo se valida antes que la infraestructura:** el motor de verificación y el pipeline se prueban sin depender de una BD, alineado con el enfoque MVP-first y el orden del Plan de Incrementos.
- **El contrato async no cambia al entrar I/O real:** el dominio y los casos de uso se construyen "pensando en asíncrono", eliminando por diseño la clase de bug "asumí acceso síncrono".
- **Coherencia con Clean Architecture:** cambiar de in-memory a Postgres es añadir un adaptador que implementa una interfaz ya existente; no toca Entities ni Use Cases. Es la demostración práctica de la regla de dependencia.
- **Menos piezas móviles en el arranque:** coherente con el ritmo sostenible (~2-3 h/día) y con la curva de aprendizaje del stack.

---

## Alternativas consideradas

### Integrar PostgreSQL desde el primer incremento
- **A favor:** el modelo de datos se valida antes; no hay "trabajo desechable".
- **En contra:** añade fricción de infraestructura (esquema, migraciones, contenedor de BD) antes de validar el núcleo; no aporta valor a la contribución del TFM en esa fase.
- **Motivo del descarte:** invierte el orden de prioridades del proyecto (núcleo defendible primero).

### Interfaz síncrona en memoria, migrar a async más adelante
- **A favor:** más simple de escribir al principio.
- **En contra:** reintroduce exactamente el riesgo que este ADR busca evitar; obliga a refactorizar dominio y casos de uso al entrar la BD real.
- **Motivo del descarte:** el ahorro inicial es marginal frente al coste de la reescritura.

---

## Consecuencias

**Positivas:**
- El núcleo defendible se valida sin depender de infraestructura de datos.
- El cambio a BD real no toca Entities ni Use Cases.
- Se elimina por diseño el acoplamiento a acceso síncrono.

**Negativas / riesgos:**
- El adaptador in-memory no cubre comportamientos propios de una BD real (transaccionalidad, concurrencia, consultas complejas, pgvector). **Mitigación:** esos aspectos se validan específicamente en INC-05, con su propia spec.
- Trabajar con `Promise` sobre un almacén que resuelve al instante puede parecer ceremonia innecesaria al principio; es una inversión deliberada, no un descuido. Conviene dejarlo explicado en la memoria.

---

## Notas de trazabilidad

- Materializado en **INC-00** (declaración de interfaces async, T07; stub in-memory y composition root, T08) y en **INC-05** (adaptador real).
- Reflejado en **NarrARA (principal) §6** y **Consolidación §3.5, §3.6**.
- Se relaciona con **ADR-004** (composition root), que ensambla el adaptador in-memory con los casos de uso.
