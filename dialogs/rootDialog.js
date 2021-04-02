// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { SlotDetails } = require('./slotDetails');
const { SlotFillingDialog } = require('./slotFillingDialog');

class RootDialog extends ComponentDialog {
    /**
     * SampleBot defines the core business logic of this bot.
     * @param {ConversationState} conversationState A ConversationState object used to store dialog state.
     */
    constructor(userState) {
        super('root');
        // Create a property used to store dialog state.
        // See https://aka.ms/about-bot-state-accessors to learn more about bot state and state accessors.
        this.userStateAccessor = userState.createProperty('result');

        // Set up a series of questions for collecting the user's name.
        const fullnameSlots = [

            new SlotDetails('first', 'text', 'Bienvenue sur notre site de commande en ligne. Quel est votre prenom ?'),
            new SlotDetails('last', 'text', 'Entrez votre nom de famille svp.')
        ];
        const auguste = [
            new SlotDetails('coucou', 'text', 'coucou.'),
            new SlotDetails('sss', 'text', 'sss')
        ];

        // Set up a series of questions to collect a street address.
        const addressSlots = [
            new SlotDetails('street', 'text', 'Quelle est votre adresse postale ?'),
            new SlotDetails('city', 'text', 'Dans quelle ville ?'),
            new SlotDetails('zip', 'text', 'Entrez votre code postal svp')
        ];

        // Link the questions together into a parent group that contains references
        // to both the fullname and address questions defined above.
        const slots = [
           // new SlotDetails('aug', 'aug'),
            new SlotDetails('fullname', 'fullname'),
            new SlotDetails('age', 'number', 'Entrez votre age svp'),
            new SlotDetails('shoesize', 'shoesize', 'Quelle est votre pointure', 'Nous n avons les tailles qu entre 36 et 48. Les demi tailles sont acceptes.'),
            new SlotDetails('shoename', 'shoename', 'Nous avons seulement yeezy (1) et jordan (2) en stock. Que souhaitez vous ?', 'You must enter only 1 or 2'),
            new SlotDetails('color', 'color', 'Nous avons du bleu (1) ou du vert (2). Lesquelles souhaitez vous?', 'You must enter only 1 or 2'),

            new SlotDetails('address', 'address')
        ];

        // Add the individual child dialogs and prompts used.
        // Note that the built-in prompts work hand-in-hand with our custom SlotFillingDialog class
        // because they are both based on the provided Dialog class.
        this.addDialog(new SlotFillingDialog('address', addressSlots));
        this.addDialog(new SlotFillingDialog('fullname', fullnameSlots));
        this.addDialog(new SlotFillingDialog('aug', auguste));
        this.addDialog(new TextPrompt('text'));
        this.addDialog(new NumberPrompt('number'));
        this.addDialog(new NumberPrompt('shoesize', this.shoeSizeValidator));
        this.addDialog(new NumberPrompt('shoename', this.shoeNameValidator));
        this.addDialog(new NumberPrompt('color', this.colorValidator));


        this.addDialog(new SlotFillingDialog('slot-dialog', slots));

        // Finally, add a 2-step WaterfallDialog that will initiate the SlotFillingDialog,
        // and then collect and display the results.
        this.addDialog(new WaterfallDialog('root', [
            this.startDialog.bind(this),
           // this.process.bind(this),
            this.processResults.bind(this)
        ]));

        this.initialDialogId = 'root';
    }

    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} dialogContext
     */
    async run(context, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    // This is the first step of the WaterfallDialog.
    // It kicks off the dialog with the multi-question SlotFillingDialog,
    // then passes the aggregated results on to the next step.
    async startDialog(step) {
        return await step.beginDialog('slot-dialog');
    }

        async process(step) {
        // Each "slot" in the SlotFillingDialog is represented by a field in step.result.values.
        // The complex that contain subfields have their own .values field containing the sub-values.
        const values = step.result.values;

        //await step.context.sendActivity(`You wear a size ${ values.shoesize } shoes.`);
        if (values.shoename == 1) {
            if (values.color == 1) {
                await step.context.sendActivity(`vous avez dans votre panier des  yeezy bleues en taille ${ values.shoesize }.`);
            }   
            if (values.color == 2) {
                await step.context.sendActivity(`vous avez dans votre panier des  yeezy vertes en taille ${ values.shoesize }.`);
            }
        }
        if (values.shoename == 2) {
            if (values.color == 1) {
                 await step.context.sendActivity(`vous avez dans votre panier  des  jordan bleues en taille ${ values.shoesize }.`);
            } 
            if (values.color == 2) {
                 await step.context.sendActivity(`vous avez dans votre panier  des  jordan vertes en taille ${ values.shoesize }.`);
            }
        }
    }


    // This is the second step of the WaterfallDialog.
    // It receives the results of the SlotFillingDialog and displays them.
    async processResults(step) {
        // Each "slot" in the SlotFillingDialog is represented by a field in step.result.values.
        // The complex that contain subfields have their own .values field containing the sub-values.
        const values = step.result.values;

        const fullname = values.fullname.values;
        await step.context.sendActivity(`Merci  ${ fullname.first } ${ fullname.last } pour ta commande. Elle sera expedie dans un delais de 3 jours ouvres`);

        //await step.context.sendActivity(`You wear a size ${ values.shoesize } shoes.`);
        if (values.shoename == 1) {
            if (values.color == 1) {
                await step.context.sendActivity(`vous avez commande des  yeezy bleues en taille ${ values.shoesize }.`);
            }   
            if (values.color == 2) {
                await step.context.sendActivity(`vous avez commande des  yeezy vertes en taille ${ values.shoesize }.`);
            }
        }
        if (values.shoename == 2) {
            if (values.color == 1) {
                 await step.context.sendActivity(`vous avez commande des  jordan bleues en taille ${ values.shoesize }.`);
            } 
            if (values.color == 2) {
                 await step.context.sendActivity(`vous avez commande des  jordan vertes en taille ${ values.shoesize }.`);
            }
        }

        const address = values.address.values;
        await step.context.sendActivity(`Elles seront livrees a ton adresse : ${ address.street }, ${ address.city } ${ address.zip }`);

        return await step.endDialog();
    }

    // Validate that the provided shoe size is between 0 and 16, and allow half steps.
    // This is used to instantiate a specialized NumberPrompt.
    async shoeSizeValidator(prompt) {
        if (prompt.recognized.succeeded) {
            const shoesize = prompt.recognized.value;

            // Shoe sizes can range from 0 to 16.
            if (shoesize >= 36 && shoesize <= 48) {
                // We only accept round numbers or half sizes.
                if (Math.floor(shoesize) === shoesize || Math.floor(shoesize * 2) === shoesize * 2) {
                    // Indicate success.
                    return true;
                }
            }
        }

        return false;
    }
    async shoeNameValidator(prompt) {
        if (prompt.recognized.succeeded) {
            const shoename = prompt.recognized.value;

            // Shoe can be yeezy or jordan
            if (shoename == 1 || shoename == 2) {
                return true;
            }
        }

        return false;
    }
    async colorValidator(prompt) {
        if (prompt.recognized.succeeded) {
            const color = prompt.recognized.value;

            // Shoe can be yeezy or jordan
            if (color == 1 || color == 2) {
                return true;
            }
        }

        return false;
    }
}

module.exports.RootDialog = RootDialog;
