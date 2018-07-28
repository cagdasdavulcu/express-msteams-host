// Copyright (c) Wictor Wilén. All rights reserved. 
// Licensed under the MIT license.

import { Router } from 'express';
import { IBot } from '../interfaces/IBot';
import { IOutgoingWebhook } from '../interfaces/IOutgoingWebhook';
import { IConnector } from '../interfaces/IConnector';
import * as teamBuilder from 'botbuilder-teams';

/**
 * Express router for Microsoft Teams Connectors, Bots and Outgoing Webhooks
 * @param components Imported module with all implementations
 */
export const MsTeamsApiRouter = (components: any): Router => {
    let router = Router();

    for (let app in components) {
        let component = components[app];

        if (component["isBot"]) {
            
            console.log(`Creating a new bot instance at ${component.serviceEndpoint}`);

            let bot: IBot = new component(new teamBuilder.TeamsChatConnector(component.botSettings));
            router.post(component.serviceEndpoint, bot.Connector.listen());

        } else if (component['isOutgoingWebhook']) {
            console.log(`Creating a new outgoing webhook instance at ${component.serviceEndpoint}`);

            let outgoingWebhook: IOutgoingWebhook = new component();
            router.post(component.serviceEndpoint, outgoingWebhook.requestHandler);

        } else if (component['isConnector']) {
            console.log(`Creating a new connector instance at ${component.connectEndpoint}`);

            let connector: IConnector = new component(); // TODO: byt namn på IConnector? - kolliderar med teamsbuilder

            // Connector Ping endpoint
            router.get(component.pingEndpoint, (req, res) => {
                Promise.all(connector.Ping()).then(p => {
                    console.log(`Connector ping succeeded`);
                    res.redirect('/');
                }).catch(reason => {
                    console.log(reason);
                });
            });

            // Connector connect page
            router.get(component.connectEndpoint, (req, res) => {
                if (!req.query.state) {
                    res.redirect('/');
                    return;
                }
                res.render(component.connectPage, {
                    webhookUrl: req.query.webhook_url,
                    user: req.query.user_objectId,
                    appType: req.query.app_type,
                    groupName: req.query.group_name,
                    state: req.query.state
                });
            });

            // Connector connect post back 
            router.post(component.connectEndpoint, (req, res) => {
                connector.Connect(req.body);
                res.redirect(component.connectedPage);
            })

        } else {
            // component is not of a recognized type
        }
    }
    return router;

}