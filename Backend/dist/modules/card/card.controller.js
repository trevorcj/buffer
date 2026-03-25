"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardController = void 0;
const card_service_1 = require("./card.service");
class CardController {
    service = new card_service_1.CardService();
    create = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const result = await this.service.createCard(req.user.id);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getAll = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const result = await this.service.getCards(req.user.id);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    freeze = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const result = await this.service.freezeCard(req.user.id, req.body.cardId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    unfreeze = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const result = await this.service.unfreezeCard(req.user.id, req.body.cardId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.CardController = CardController;
