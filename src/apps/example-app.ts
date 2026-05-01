import { MODULE_ID } from "@/scripts/constants";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

interface ExampleAppContext {
  moduleId: string;
  message: string;
}

/**
 * Minimal ApplicationV2 window. Extend or delete — this is a scaffold.
 */
export class ExampleApp extends HandlebarsApplicationMixin(ApplicationV2<ExampleAppContext>) {
  static override DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-example`,
    tag: "section",
    window: {
      title: `${MODULE_ID}.app.example.title`,
      icon: "fas fa-cube",
      resizable: true
    },
    position: { width: 480, height: "auto" as const },
    actions: {
      ping: ExampleApp.#onPing
    }
  };

  static override PARTS = {
    body: {
      template: `modules/${MODULE_ID}/templates/example-app.hbs`
    }
  };

  protected override async _prepareContext(): Promise<ExampleAppContext> {
    return {
      moduleId: MODULE_ID,
      message: game.i18n!.localize(`${MODULE_ID}.app.example.message`)
    };
  }

  static #onPing(this: ExampleApp): void {
    ui.notifications?.info(`[${MODULE_ID}] pong`);
  }
}
