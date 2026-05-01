# DataModel & TypeDataModel

v14 requires typed schemas for any structured document data. Do not put raw objects into `system` or flags without a schema if you can avoid it.

## Classes
- `foundry.abstract.DataModel` — generic typed object with validation.
- `foundry.abstract.TypeDataModel` — subclass tailored for Document subtypes (items, actors, etc.).
- Schema fields live under `foundry.data.fields.*` (StringField, NumberField, SchemaField, ArrayField, EmbeddedDataField, …). Resolve via MCP for the full, current list.

## Defining a model
- Override `static defineSchema()` returning a plain object of field instances.
- Use `SchemaField` for nested objects, `EmbeddedDataField` for reusable sub-models.
- Add `static migrateData(source)` when renaming or restructuring fields across versions.
- Override `prepareBaseData` / `prepareDerivedData` for computed properties (these are called by the owning Document).

## Registering custom subtypes
- Declare subtypes in `module.json` under `documentTypes` (e.g. `Item.{{MODULE_ID}}.gadget`).
- Register the corresponding model class in `CONFIG.Item.dataModels["{{MODULE_ID}}.gadget"]` during `init`.
- Provide default values via `defineSchema` — avoid `migrateData` hacks for initial shape.

## Validation
- DataModel validates on construction and on `updateSource`. Throwing in a field setter aborts the update.
- Prefer `required: true` + `initial` over optional fields where possible.
- `StringField` with `choices` gives you an enum for free; document the choices in i18n.

## Interop with system data
- Never assume the active game system's data shape. Keep your models self-contained and store cross-references as UUIDs (`foundry.utils.fromUuid`).