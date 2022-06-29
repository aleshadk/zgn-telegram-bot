import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

interface IButtonData {
  label: string;
  data: string;
}

export function getOneColumnButtons(actions: IButtonData[]): { reply_markup: { inline_keyboard: InlineKeyboardButton[][] } } {
  return {
    reply_markup: {
      inline_keyboard: [
        ...actions.map(x => {
          return [
            Markup.button.callback(x.label, x.data, true)
          ];
        })
      ]
    }
  };
}

export function getTwoColumnsButtons(actions: IButtonData[]): { reply_markup: { inline_keyboard: InlineKeyboardButton[][] } } {
  const left: IButtonData[] = [];
  const right: IButtonData[] = [];

  actions.forEach((x, i) => {
    const column = i % 2 === 0 ? left : right;
    column.push(x);
  });

  if (!right.length) {
    return getOneColumnButtons(actions);
  }

  return {
    reply_markup: {
      inline_keyboard: [
        left.map(x => Markup.button.callback(x.label, x.data, true)),
        right.map(x => Markup.button.callback(x.label, x.data, true)),
      ]
    }
  };
}