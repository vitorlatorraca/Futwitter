import { setupApp } from "../server/app";

// Cache the app instance to reuse across invocations (warm start)
let appPromise: Promise<any> | null = null;

export default async (req: any, res: any) => {
    if (!appPromise) {
        appPromise = setupApp().then(({ app }) => app);
    }

    const app = await appPromise;
    app(req, res);
};
