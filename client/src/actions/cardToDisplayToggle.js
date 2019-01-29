import { CARD_TO_DISPLAY } from './types';

export default function (numberOfCardsToDisplay) {
    return {
        type: CARD_TO_DISPLAY,
        payload: numberOfCardsToDisplay
    }
}