/**
 * Example DataModel scaffold. Delete if not used.
 * Register in CONFIG.<Document>.dataModels during `init` to activate a subtype.
 */
const fields = foundry.data.fields;

export class ExampleModel extends foundry.abstract.TypeDataModel<any, any> {
  static override defineSchema() {
    return {
      power: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
        min: 0
      }),
      tags: new fields.ArrayField(new fields.StringField({ blank: false }), {
        initial: []
      }),
      notes: new fields.HTMLField({ required: false })
    };
  }

  override prepareDerivedData(): void {
    // computed properties go here
  }
}
