// Copyright (c) Wictor Wilén. All rights reserved.
// Licensed under the MIT license.

import { BotFrameworkAdapterSettings, Storage } from "botbuilder";

/**
 * Decorator function for Bots
 * @param endpoint The endpoint to expose for the bot (typically '/api/messages')
 * @param storage The Storage to use for the bot (ex: new MemoryStorage())
 * @param appId The App Id for the bot
 * @param appPassword The app password for the bot
 */
export function BotDeclaration(
    endpoint: string,
    storage: Storage,
    appId: string | undefined,
    appPassword: string | undefined) {
    return (target: any) => {
        target.__isBot = true;
        target.__botSettings = <Partial<BotFrameworkAdapterSettings>>{
            appId: appId,
            appPassword: appPassword,
        };
        target.__serviceEndpoint = endpoint;
        target.__storage = storage;
    };
}
