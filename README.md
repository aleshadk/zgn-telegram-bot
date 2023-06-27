### Bot for telegram messenger that provides online rehearsal booking in music studio [Zagon](https://vk.com/zagondubna) 🤟

<p align="center">
  <img src="https://github.com/aleshadk/zgn-telegram-bot/blob/main/zagon.png?raw=true" alt="Sublime's custom image"/>
</p>

### **Technologies**
- ts-node
- telegraf
- mongoose

### **CJM**

**Registration**
- user sends `/start`
- user sends his own contact data
- user can see controls to book new rehearsal or manage existed

**Booking**
- user clicks `Book a rehearsal` and select session duration and date he'd like to visit a studio 
- user can see available slots
- user clicks on slot to create a rehearsal in status 'Not confirmed by the studio'

**Rehearsal status**
- Administrator can recieve a message that new rehearsal was booked
- Administrator can approve or decline new rehearsal
- Administrator can decline rehearsal that previously was approved by another administator
- Administrator can receive a message that rehearsal was approved/rejected by another administrator
- User can get a message that rehearsal was approved or declined

**User and existing rehearsals**
- User can see all upcoming rehearsals with statuses ⏳, ✅ or ❌
- User can abandone his rehearsal. Administrator will receive a message. This slot will be available for other users


### Телеграм-бот для брони слотов в репетиционной точке [Загон](https://vk.com/zagondubna) 🤟

### **Стек**
- ts-node
- telegraf
- mongoose

### **CJM**

**Регистрация**
- пользователь отправляет `/start`
- пользователь отправляет свой контакт
- пользователю доступны кнопки для бронирования и просмотра/управления своими репетициями

**Бронирование**
- пользователь жмёт `Забронировать репетицию` и получает кнопки выбора даты репетиции
- пользователь выбирает дату и получает кнопки выбора длительности репетиции
- пользователь получает свободные для этого дня и этой длительности слоты
- пользователь выбирает слот
- пользователь получает сообщение, что его репетиция будет подтверждена администратором

**Админитратор**
- получает сообщение о забронированной репетиции с возможностью подтвердить её или отклонить
- администратор может отклонить уже подтверждённую другим администратором репетицию
- администратор получает сообщение о том, что другой аднистратор произвёл дейсвтвие с репетицией
- пользователь получает сообщение о действиях с его репетицией

**Просмотр репетиций**
- пользователь может посмотреть список своих репетиций со статусами ⏳, ✅ или ❌

**Управление репетициями**
- пользователь может отлонить свою репетицию, если она находится в статусе "Ждёт подтверждения" или "Подтверждена". В таком случае администраторы получают уведомление, а слот становится доступен другим пользователям

<br/>

> **Warning**
> Если отправить непонятное сообщение, есть шанс получить гачи-стикер в ответ
