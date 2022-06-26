import { Markup } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export function getOneColumnButtons(actions: {label: string, data: string}[]): {reply_markup: {inline_keyboard: InlineKeyboardButton[][]}} {
    return {
        reply_markup: {
            inline_keyboard: [
                ...actions.map(x => {
                    return [
                        Markup.button.callback(x.label, x.data, true)
                    ]
                })
            ]
        }
    }
}