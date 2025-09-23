- Створення проєкту
  1. Налаштування проєкту
  2. Запуск сервера розробки
- Структура Next.js проєкту
- Створення сторінок
- Як працює Layout
  1. Додаємо хедер і футер
  2. Коли варто створювати окремі Layout-файли
- Створення компонентів
- Знайомство з навігацією
- Директива 'use client'
- Стан запитів: помилки та завантаження
  1. Індикатор завантаження
- Динамічні маршрути
  1. Отримання id з URL
  2. Запит за нотаткою
  3. Навігація на сторінку нотатки
  4. Глобальні error.tsx і loading.tsx
- Завантаження даних у клієнтському компоненті
  1. Налаштування React Query
  2. Prefetch і кешування
  3. Вивід даних у клієнтському компоненті

# Створення проєкту

Щоб почати роботу з Next.js, потрібно зробити кілька простих кроків:

- Створіть порожній репозиторій на GitHub.
- Клонуйте його на свій комп’ютер.
- Відкрийте термінал і перейдіть у папку з цим репозиторієм.
- Створіть новий застосунок за допомогою офіційного генератора Next.js.

Для генерації проєкту використаємо create-next-app – CLI-утиліту, що створює типовий шаблон застосунку.

У терміналі виконайте команду:

npx create-next-app@latest

Використовуйте клавіші вгору/вниз для навігації опціями, та Enter для підтвердження вибору.

Якщо ви хочете створити проєкт у поточній папці (наприклад, безпосередньо в клонованому репозиторії), замість назви проєкту введіть . (крапку). Символ . означає, що проєкт буде створено в цій самій директорії, без створення додаткової вкладеної папки.

Команда встановлення Prettier та додаткового конфігу ESLint:

npm install -D prettier eslint-config-prettier

## Налаштування проєкту

Після запуску команди ви побачите кілька питань:

Need to install the following packages:
create-next-app@15.2.0
Ok to proceed? (y)
✔ Would you like to use TypeScript? … No / **Yes**
✔ Would you like to use ESLint? … No / **Yes**
✔ Would you like to use Tailwind CSS? … **No** / Yes
✔ Would you like your code inside a `src/` directory? … **No** / Yes
✔ Would you like to use App Router? (recommended) … No / **Yes**
✔ Would you like to use Turbopack for `next dev`? … No / **Yes**
✔ Would you like to customize the import alias (`@/*` by default)? … No / **Yes**

Основні опції:

- TypeScript – обираємо Yes, щоб мати кращу підтримку типів і уникати помилок у коді.
- ESLint – обираємо Yes для автоматичної перевірки коду та дотримання стандартів якості.
- Tailwind CSS – обираємо No, тому що для стилізації ми будемо використовувати CSS модулі.
- App Router – обираємо Yes, це сучасний підхід до маршрутизації у Next.js.
- Turbopack – обираємо Yes для прискореної обробки коду під час розробки, це сучасна альтернатива Webpack.
- Import alias – обираємо Yes, ми будемо користуватись функціоналом скорочених шляхів для імпортів.

Ці налаштування створюють комфортне середовище для розробки і чудово підходять під структуру нашого курсу.

## Запуск сервера розробки

Після завершення ініціалізації проєкту перейдіть у створену папку (якщо ще не там) та запустіть локальний сервер:

npm run dev

Застосунок буде доступний за адресою http://localhost:3000.

💡 React Developer Tools працюють з Next.js так само, як і з React, оскільки під капотом Next.js – це все той самий React. Просто тепер із готовою інфраструктурою.

# Структура Next.js проєкту

Після створення проєкту з використанням Next.js ви отримаєте типовий набір папок і файлів, які організовують ваш код.

Розглянемо основні з них:

1. app – головна папка застосунку

Це основна директорія, в якій ви працюватимете. Next.js автоматично формує маршрути на основі структури цієї папки.

- page.tsx – головна сторінка застосунку (маршрут /).
- layout.tsx – спільна оболонка для всіх сторінок (хедер, футер тощо).
- globals.css – глобальні стилі, які застосовуються до всього застосунку.
- page.module.css – локальні стилі тільки для головної сторінки.

У майбутньому ви додаватимете сюди окремі підпапки для інших сторінок (наприклад, about/page.tsx, notes/page.tsx тощо).

2. public – статичні ресурси

Ця папка призначена для файлів, які мають бути напряму доступними з браузера:

- зображення (/logo.png, /banner.jpg);
- службові файли (/robots.txt, /manifest.json).

Усе, що знаходиться в public, доступне за шляхом /назва_файлу.

3. next.config.ts – конфігурація Next.js

Цей файл дозволяє змінювати стандартну поведінку Next.js:

- налаштовувати домени для зображень;
- додавати змінні середовища;
- вмикати/вимикати експериментальні можливості тощо.

На старті курсів залишайте цей файл без змін – до нього ми повернемося пізніше.

4. tsconfig.json – конфігурація TypeScript

Файл автоматично створюється, якщо ви обрали TypeScript під час ініціалізації. Він визначає правила перевірки типів та автодоповнення в редакторі.

5. package.json – залежності та команди

Цей файл містить перелік всіх встановлених бібліотек, а також корисні скрипти для запуску та збірки проєкту:

- npm run dev – запуск локального сервера розробки;
- npm run build – створення продакшн-версії;
- npm run start – запуск зібраного застосунку.

Висновок

Структура Next.js-проєкту інтуїтивна:

- Код інтерфейсу – у папці app/;
- Статичні файли – у public/;
- Налаштування – у next.config.ts та tsconfig.json;
- Інформація про залежності – у package.json.

Розуміння цієї структури допоможе вам швидко орієнтуватися в проєкті, підтримувати порядок і розширювати застосунок у правильному напрямку.

# Створення сторінок

У межах цього курсу ми розробляємо NoteHub – платформу для створення та перегляду нотаток. Це буде динамічний застосунок, у якому користувачі зможуть створювати та переглядати свої нотатки.

На старті ми закладемо основу структури проєкту, створивши такі сторінки:

- Головна (/)
- Нотатки (/notes)
- Про платформу (/about)
- Профіль користувача (/profile)
- Компонент NoteCard для відображення нотаток

Усе це базується на файловій маршрутизації, яку забезпечує Next.js.
Ви створюєте папку + page.tsx – і це вже окрема сторінка з URL.

Next.js створює базовий шаблон, який потрібно очистити від зайвого:

- видаліть весь вміст головної сторінки app/page.tsx, залишивши порожній компонент;
- видаліть усі непотрібні стилі або папки, які не стосуються нашого застосунку.

- Файл globals.css залишаємо як є.
- Файл layout.tsx поки не чіпаємо – до нього повернемось далі.

У результаті маємо отримати наступну структуру:

Ціль – мати такі сторінки:

- Home Page → app/page.tsx
- Notes Page → app/notes/page.tsx
- About Page → app/about/page.tsx
- Profile Page → app/profile/page.tsx

Принцип: 1 сторінка = 1 папка + 1 файл page.tsx

Створюємо першу сторінку /notes

У папці app/ створіть підпапку notes
Додайте в неї файл page.tsx:

// app/notes/page.tsx

const Notes = () => {
return <div>Notes</div>;
};

export default Notes;

Next.js автоматично зв’язує цей файл із маршрутом /notes – ніякої ручної конфігурації не потрібно. Тепер, якщо перейти за адресою http://localhost:3000/notes – ви побачите текст Notes.

Додаємо решту сторінок за аналогією

app/about/page.tsx
app/profile/page.tsx

Висновок

Маючи кілька сторінок, ви можете перемикатись між ними, змінюючи URL у браузері. Але це не зовсім зручно. У наступному блоці розглянемо, як працює файл layout.tsx і як організовується спільна структура всіх сторінок.

# Як працює Layout

Файл layout.tsx дозволяє задати спільну структуру для всіх сторінок. Це зручно, якщо потрібно відображати спільні елементи, як-от хедер, футер або бокове меню – без дублювання коду.

Для чого потрібен Layout

- Визначає глобальний інтерфейс сторінки
- Відображається на всіх маршрутах, які лежать усередині app/
- Дозволяє обгорнути контент навколо children (тобто контенту сторінки)
- Коли ви створили проєкт, Next.js згенерував файл app/layout.tsx. Розберімося, з чого він складається.

1. Імпорти

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

- Metadata – тип для опису SEO-даних сторінки
- Geist, Geist_Mono – Google-шрифти, підключені через next/font/google
- globals.css – глобальні стилі

2. Підключення шрифтів

const geistSans = Geist({
variable: "--font-geist-sans",
subsets: ["latin"],
});

const geistMono = Geist_Mono({
variable: "--font-geist-mono",
subsets: ["latin"],
});

- Geist() і Geist_Mono() – підключають шрифти Geist (звичайний) і Geist Mono (моноширинний).
- variable: "--font-geist-sans" – створюють CSS-змінні для використання шрифтів у стилях.
- subsets: ["latin"] – завантажують лише латиницю, щоб зменшити вагу шрифтів.

Ми до всього цього обовʼязково повернемось, але трохи згодом.

3. SEO-метадані

export const metadata: Metadata = {
title: "Create Next App",
description: "Generated by create next app",
};

Дані, які потрапляють у <head> сторінки
Ці метадані можна задавати глобально або окремо для кожної сторінки

4. Компонент RootLayout

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode;
}>) {
return (

<html lang="en">
<body className={`${geistSans.variable} ${geistMono.variable}`}>
{children}
</body>
</html>
);
};

- Обгортає всі сторінки та компоненти
- У body передається змінна зі шрифтами
- children – це і є контент сторінок, які будуть відображатися всередині лейаута

## Додаємо хедер і футер

Весь контент, який ви розмістите до або після children, буде відображатися на всіх сторінках.

Розмістимо children у <main>, а також додамо header і footer:

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode
}>) {
return (

<html lang='en'>
<body className={`${geistSans.variable} ${geistMono.variable}`}>
<header>
<h1>Hello Note Hub</h1>
</header>

        <main>{children}</main>

        <footer>
          <p>
            Created <time dateTime='2025'>2025</time>
          </p>
        </footer>
      </body>
    </html>

);
};

Це базовий приклад. Ми ще додамо стилі, але вже зараз можна бачити загальну структуру.

Зайшовши на будь-яку з ваших сторінок, браузер покаже одну й ту саму структуру – змінюється тільки main, решта (хедер і футер) незмінні. Це і є логіка Layout – один шаблон для всіх сторінок.

## Коли варто створювати окремі Layout-файли

Коли потрібно використовувати різну навігацію або бокову панель. Наприклад, користувацький інтерфейс має головне меню, а Dashboard – бокове меню.

Коли деякі сторінки мають унікальний дизайн. Наприклад, сторінка входу/реєстрації може мати свій Layout без хедера і футера.

Або ж, наприклад, у вас є звичайний Layout для основного сайту (головна, про нас) і адмінський Layout для панелі адміністратора.

Підсумок

Layout у Next.js:

- дозволяє створити єдиний каркас сторінки;
- зменшує дублювання коду;
- дозволяє реалізовувати різні макети для окремих частин застосунку.

# Створення компонентів

У нас вже є чотири сторінки. Тепер настав час реалізувати можливість перемикання між ними. Для цього ми оновимо файл layout.tsx, винісши навігацію в окремий компонент Header.

У Next.js компоненти створюються так само як і в React – це звичайні функції, які повертають JSX. Завдяки цьому ми можемо:

- уникати дублювання коду,
- розбивати інтерфейс на логічні частини,
- краще організовувати структуру проєкту.

Крок 1. Створюємо компонент Header

Створіть папку components на тому ж рівні, що й app/
Всередині створіть папку Header і додайте файл Header.tsx:

// components/Header/Header.tsx

const Header = () => {
return <header>Header</header>;
}

export default Header;

Крок 2. Додаємо CSS-модуль для стилізації

Створіть файл Header.module.css у тій самій папці:

/_ components/Header/Header.module.css _/

.header {
display: flex;
align-items: center;
justify-content: flex-start;
gap: 24px;
padding: 12px;
border-block-end: 1px solid #ccc;
}

.navigation {
display: flex;
align-items: center;
justify-content: flex-start;
gap: 12px;
list-style-type: none;
}

Крок 3. Підключаємо стилі до компонента

Оновіть Header.tsx і застосуйте стилі:

// components/Header/Header.tsx

import css from './Header.module.css';

const Header = () => {
return (

<header className={css.header}>
<h2>NoteHub</h2>
<nav>
<ul className={css.navigation}>
<li>Home</li>
<li>Notes</li>
<li>Profile</li>
<li>About</li>
</ul>
</nav>
</header>
);
};

export default Header;

Крок 4. Вбудовуємо Header у Layout

Тепер імпортуємо і використовуємо Header у layout.tsx.

// app/layout.tsx
import Header from "@/components/Header/Header";

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode
}>) {
return (

<html lang='en'>
<body className={`${geistSans.variable} ${geistMono.variable}`}>
<Header />
<main>{children}</main>
<footer>
<p>
Created <time dateTime='2025'>2025</time>
</p>
</footer>
</body>
</html>
);
};

Підсумок

Ми винесли навігацію в окремий компонент і підключили його до глобального layout.tsx. Таким чином:

- ми не дублюємо код хедера на кожній сторінці;
- можемо централізовано змінювати структуру або стилі;
- компоненти в Next.js працюють абсолютно так само, як у React.

# Знайомство з навігацією

На цьому етапі ми хочемо реалізувати повноцінну навігацію між сторінками. Базово, у HTML для переходу між сторінками використовується тег <a>. Але в Next.js є кращий підхід.

Next.js надає спеціальний компонент <Link>, який дозволяє:

- здійснювати переходи між сторінками без повного перезавантаження сторінки;
- зберігати стан застосунку;
- автоматично оптимізувати переходи;
- забезпечити хорошу підтримку для SEO.

Компонент <Link> працює подібно до звичайного <a>, але використовує клієнтську маршрутизацію, що значно покращує UX.

Оновлюємо компонент Header

Імпортуємо компонент Link:

import Link from 'next/link';

Замінюємо звичайні пункти меню на <Link>:

// components/Header/Header.tsx

import css from './Header.module.css';
import Link from 'next/link';

const Header = () => {
return (

<header className={css.header}>
<Link href='/' aria-label='Home'>
NoteHub
</Link>
<nav aria-label='Main Navigation'>
<ul className={css.navigation}>
<li>
<Link href='/'>Home</Link>
</li>
<li>
<Link href='/notes'>Notes</Link>
</li>
<li>
<Link href='/profile'>Profile</Link>
</li>
<li>
<Link href='/about'>About</Link>
</li>
</ul>
</nav>
</header>
);
};

export default Header;

Усі пункти меню тепер використовують Link, що забезпечує швидкий перехід між сторінками.

Відкрийте застосунок у браузері й спробуйте перейти між сторінками. Ви побачите, що переходи миттєві, і весь макет (хедер/футер) залишається на місці – змінюється лише центральний вміст (<main>).

💡 При кожному переході Next.js завантажує сторінку на сервері, повертає HTML, але не перезавантажує всю вкладку. Це і є гібридний підхід у дії. Пошукові системи й надалі бачать повноцінну HTML-структуру – SEO не страждає.

# Початок роботи з API

Маємо сторінку Notes за маршрутом /notes.

Наступне завдання – отримати список нотаток з бекенду та відобразити їх у застосунку.

Що будемо використовувати:

- Axios – для HTTP-запитів;
- React Query – для ефективного кешування, оновлення й управління станом запитів (пізніше).

Почнемо з Axios, а далі поступово додамо React Query.

Встановлюємо бібліотеки:

npm install axios @tanstack/react-query

Використаємо вже готовий API. Документація на сайті дозволяє переглянути доступні ендпоінти.

https://next-docs-api.onrender.com

HTTP-запити: створюємо файл api.ts

Для організації коду створимо файл lib/api.ts, у якому зберігатимемо функції для запитів:

// lib/api.ts

import axios from "axios";

export type Note = {
id: string;
title: string;
content: string;
categoryId: string;
userId: string;
createdAt: string;
updatedAt: string;
};

export type NoteListResponse = {
notes: Note[];
total: number;
};

axios.defaults.baseURL = https://next-docs-api.onrender.com;

export const getNotes = async () => {
const res = await axios.get<NoteListResponse>("/notes");
return res.data;
};

Тепер додамо код для виконання запиту до компонента сторінки /notes.

// app/notes/page.tsx

// 1. Імпортуємо функцію
import { getNotes } from "@/lib/api";

// 2. Робимо фукнцію асинхронною
const Notes = async () => {
// 3. Виконуємо запит
const notes = await getNotes();
console.log("notes", notes);

return <div>Notes page</div>;
}

export default Notes;

Перевіряємо у браузері

Переходимо на домашню сторінку http://localhost:3000

В інструментах розробника перейдіть у вкладку "Мережа" (Network) → фільтр Fetch

За допомогою навігації переходимо на сторінку /notes

- Чому не видно запиту в Network?
  Тому що запит виконується на сервері Next.js, ще до відправлення HTML у браузер. Це нормально, так і має бути. У браузер надходить готова сторінка з результатами – це і є SSR (Server-Side Rendering).

Проте, у вкладці Console результат ми все ж таки бачимо, але з поміткою Server.

У консолі VS Code ви також побачите результат – це ще один доказ, що обробка йде на сервері.

💡 Так ми отримуємо логіку SSR рендеру (Server-Side Rendering).
Що це таке, та які ще існують типи рендеру? Ми про все це ще поговоримо далі.

- Список нотатків

Додамо відображення списку на сторінку. Розгорнемо компонент NoteItem.tsx і типізуємо пропси.

// components/NoteItem/NoteItem.tsx

import { Note } from "@/lib/api";

type Props = {
item: Note;
};

const NoteItem = ({ item }: Props) => {
return (

<li>
<p>{item.title}</p>
</li>
);
}

export default NoteItem;

Наступним компонентом буде список нотатків NoteList.tsx, в якому використаємо NoteItem і звісно не забуваємо про типізацію.

// components/NoteList/NoteList.tsx

import { Note } from "@/lib/api";
import NoteItem from "../NoteItem/NoteItem";

type Props = {
notes: Note[];
};

const NoteList = ({ notes }: Props) => {
return (

<ul>
{notes.map((note) => (
<NoteItem key={note.id} item={note} />
))}
</ul>
);
}

export default NoteList;

Тепер додаємо NoteList у компонент сторінки /notes/page.tsx.

// notes/page.tsx

import { getNotes } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";

const Notes = async () => {
const response = await getNotes();

return (

<section>
<h1>Notes List</h1>
{response?.notes?.length > 0 && <NoteList notes={response.notes} />}
</section>
);
}

export default Notes;

Подивимось на результат:

- Сторінка рендериться вже з готовим HTML-контентом, який прийшов із бекенду.
- У вихідному коді сторінки (view-source) вже присутні всі заголовки нотаток.
- Немає ніяких спалахів завантаження – користувач одразу бачить дані.

Це все завдяки SSR – і саме в цьому полягає перевага Next.js перед звичайним SPA.

# Директива 'use client'

Ми вже реалізували отримання даних у серверному компоненті. Але іноді потрібно робити запити на клієнті, вже після того, як сторінка відрендерилася.

У Next.js всі компоненти за замовчуванням – серверні. Це означає, що вони виконуються на сервері, а клієнту надсилається вже згенерована HTML-сторінка.

Але є ситуації, коли нам потрібно:

- зробити запит після рендеру (наприклад, при натисканні);
- змінити стан компонента (через useState, useEffect тощо);
- реалізувати інтерфейсну логіку (відображення/приховування, фільтрація, події).

Рішення – директива 'use client'

Щоб вказати, що компонент має виконуватись на клієнті, потрібно додати на початку файлу рядок:

'use client';

Це перетворює файл з серверного на клієнтський. Після цього ми можемо використовувати всі React-хуки й події, як у звичайному React.

Приклад: отримання нотаток по кліку

Крок 1. Робимо компонент сторінки Notes клієнтським

// app/notes/page.tsx

'use client';
// інший код файлу

Одразу ж бачимо скарги від ESLint через використання асинхронних клієнтських компонентів.

Це очікувано, бо асинхронні компоненти на клієнті не підтримуються.

Отже, реалізуємо запит по кліку. Для цього:

- Робимо компонент звичайним синхронним, без async
- Додаємо стан через useState
- Додаємо у JSX кнопку
- Додаємо обробник події onClick
- У функції-обробнику виконуємо запит до API
- Зберігаємо відповідь у стан
- Виводимо список, якщо відповідь є

Усе працює так само як у звичайних React-компонентах.

// app/notes/page.tsx

"use client";

import { useState } from "react";
import NoteList from "@/components/NoteList/NoteList";
import { getNotes, Note } from "@/lib/api";

const Notes = () => {
const [notes, setNotes] = useState<Note[]>([]);

const handleClick = async () => {
const response = await getNotes();
if (response?.notes) {
setNotes(response.notes);
}
};

return (

<section>
<h1>Notes List</h1>
<button onClick={handleClick}>Get my notes</button>
{notes.length > 0 && <NoteList notes={notes} />}
</section>
);
}

export default Notes;

- Переходимо на сторінку /notes
- Відкриваємо Network → бачимо реальний запит
- Контент зʼявляється після натискання на кнопку
- У вихідному HTML (через view-source) цього контенту немає – і це логічно

Це приклад клієнтського рендерингу – CSR (Client-Side Rendering):

- HTML спочатку містить тільки базову структуру
- Дані підвантажуються вже в браузері
- Браузер показує результат після запиту

На відміну від SSR, тут контент не передається від сервера одразу. Це дає більше динаміки, але гірше підходить для SEO.

Підсумок

- У Next.js існують серверні та клієнтські компоненти.
- Щоб зробити компонент клієнтським, потрібно вказати 'use client'.
- У клієнтських компонентах доступні всі React-хуки та логіка.

# Стан запитів: помилки та завантаження

Повернемо логіку отримання списку нотатків у серверний компонент

Цей підхід чудово працює, поки все йде добре. Але що буде, якщо API не відповість або поверне помилку?

Спробуємо навмисно зламати запит, змінивши URL в axios.defaults.baseURL. Після цього ви побачите помилку 500 Internal Server Error у браузері.

Next.js дозволяє відловлювати ці помилки й відображати власний інтерфейс замість "падіння" сторінки.

У Next.js ви можете створити файл error.tsx безпосередньо у папці маршруту. Наприклад:

app/
└── notes/
├── page.tsx
└── error.tsx

Цей компонент буде автоматично відображений, якщо під час завантаження сторінки виникла помилка.

// app/notes/error.tsx

'use client';

type Props = {
error: Error;
};

const Error = ({ error }: Props) => {
return (

<div>
<h2>Помилка при завантаженні</h2>
<p>{error.message}</p>
</div>
);
}

export default Error;

- error.tsx завжди рендериться на клієнті, тому обов’язково має містити директиву 'use client'
- До компонента передається об’єкт помилки
- Ви можете відобразити повідомлення або надати опцію повторити спробу

Тепер, якщо щось піде не так, користувач побачить повідомлення, а не порожню сторінку.

Додамо кнопку "Спробувати знову”

Next.js автоматично передає в error.tsx також функцію reset. Вона скидає помилку і повторно запускає логіку завантаження сторінки.

// app/notes/error.tsx

'use client';

type Props = {
error: Error;
reset: () => void;
};

const Error = ({ error, reset }: Props) => {
return (

<div>
<h2>Помилка при завантаженні</h2>
<p>{error.message}</p>
<button onClick={reset}>Спробувати знову</button>
</div>
);
}

export default Error;

Це особливо корисно, коли помилка тимчасова – наприклад, через відсутність інтернету.

## Індикатор завантаження

Запити можуть займати час, тому важливо показувати користувачу, що дані завантажуються.

У Next.js для цього достатньо створити компонент loading.tsx у тій самій папці:

app/
└── notes/
├── page.tsx
├── error.tsx
└── loading.tsx

Поки триває запит, користувач бачитиме цей текст (або спінер – якщо додасте стилі).

// app/notes/loading.tsx

const Loading = () => {
return <p>Завантаження нотатків...</p>;
}

export default Loading;

Підсумок

- Помилки обробляються в error.tsx
- Завантаження обробляється у loading.tsx
- Все це працює автоматично, якщо компоненти знаходяться поруч із page.tsx
- Ви можете перевизначати логіку для кожного маршруту окремо

# Динамічні маршрути

Ми хочемо створити сторінку для перегляду деталей окремої нотатки. Для цього потрібно реалізувати динамічний маршрут – тобто сторінку, яка працює з різними id.

У Next.js структура маршруту базується на папках. Для динамічного маршруту використовується формат у квадратних дужках:

app/notes/[id]/page.tsx

1. У папці app/notes/ створіть нову папку [id]
2. Додайте до неї сторінку page.tsx

[id] – це змінний сегмент, який означає "будь-яке значення".
Наприклад: /notes/123, /notes/abc, /notes/5fa9c тощо.

## Отримання id з URL

Next.js автоматично передає параметри маршруту у пропс params. В серверному компоненті params це проміс, тому перед ним потрібно додати await, щоб почекати поки він виконається зі значенням.

// app/notes/[id]/page.tsx

type Props = {
params: Promise<{ id: string }>;
};

const NoteDetails = async ({ params }: Props) => {
const { id } = await params;
console.log('note id:', id);

return <div>NoteDetails</div>;
};

export default NoteDetails;

При відвідуванні сторінки нотатки побачимо в терміналі VSCode логування ідентифікатора.

## Запит за нотаткою

Додамо функцію запиту до API:

// lib/api.ts

// Інший код файлу

export const getSingleNote = async (id: string) => {
const res = await axios.get<Note>(`/notes/${id}`);
return res.data;
};

Використаємо її у сторінці:

// app/notes/[id]/page.tsx

import { getSingleNote } from "@/lib/api";

type Props = {
params: Promise<{ id: string }>;
};

const NoteDetails = async ({ params }: Props) => {
const { id } = await params;
const note = await getSingleNote(id);
console.log(note);

return <div>NoteDetails</div>;
};

export default NoteDetails;

Знову відкриваємо сторінку з будь-яким id та подивимось результат:

Якщо запит поверне помилку (наприклад, нотатки не існує) – спрацює компонент error.tsx. Якщо в поточній папці його немає, Next.js підніметься вище у структурі, поки не знайде глобальний error.tsx.

Це дозволяє мати глобальний обробник помилок для всього застосунку. Тобто ми можемо на самому верхньому рівні створити єдиний компонент error.tsx для відображення помилки для абсолютно усіх маршрутів.

## Навігація на сторінку нотатки

Для цього нам потрібно у компоненті NoteItem.tsx додати логіку навігації, за допомогою Link

// components/NoteItem/NoteItem.tsx

import Link from 'next/link';
import { Note } from '@/lib/api';

type Props = {
item: Note;
};

const NoteItem = ({ item }: Props) => {
return (

<li>
<Link href={`/notes/${item.id}`}>{item.title}</Link>
</li>
);
};

export default NoteItem;

Що ми побачимо у браузері?

- Перехід на /notes/123
- Спрацьовує loading.tsx – якщо затримка в API
- Якщо id не існує – рендериться error.tsx

Тобто дочірні маршрути автоматично успадковують компоненти loading.tsx і error.tsx з батьківської папки. Тобто ми можемо на самому верхньому рівні створити єдиний компонент loading.tsx для відображення глобального лоадера для абсолютно усіх маршрутів.

## Глобальні error.tsx і loading.tsx

Якщо ви хочете, щоб однакові компоненти помилок і завантаження працювали для всього застосунку, просто створіть їх у кореневій папці app/:

Це зручно, якщо:

- хочете мати єдину стилістику;
- не хочете дублювати код;
- потрібна централізована обробка проблем із мережею чи API.

Але при потребі можна створити окремі error.tsx і loading.tsx для кожного маршруту.

Підсумок

- [id] – синтаксис динамічних маршрутів у Next.js
- Дані параметри автоматично потрапляють у params як сторінок так і хендлерів
- Обробка помилок і завантаження – через спеціальні файли error.tsx і loading.tsx

# Завантаження даних у клієнтському компоненті

Ми вже виводили деталі нотатки на сторінці app/notes/[id]/page.tsx, використовуючи серверний компонент. Тепер підготуємо компонент для клієнтської взаємодії з контентом, наприклад, в майбутньому потрібна буде реакція на натискання кнопки, стан тощо.

Проблема: обробка подій у серверному компоненті

Сторінка деталей – це серверний компонент, який виконується на сервері. Користувач отримує вже згенерований HTML без клієнтських обробників подій.

Якщо ви спробуєте додати onClick, отримаєте помилку:

// app/notes/[id]/page.tsx

const handleClick = () => {
console.log("CLICK");
};

<button onClick={handleClick}>Edit</button> // ❌ не працює

Next.js попередить, що обробку подій можна зробити лише у клієнтських компонентах, для яких потрібно явно додати директиву "use client". Але в такому випадку одразу отримаємо попередження від лінтера про те, що клієнтський компонент не може бути async.

Якщо зробити сторінку повністю клієнтською – доведеться переписати все, зокрема й асинхронну логіку. Це незручно. Замість того щоб робити всю сторінку клієнтською (що спричинило б інші проблеми), ми залишаємо page.tsx серверним, а вміст переносимо у клієнтський компонент.

Структура:

- app/notes/[id]/page.tsx – залишаємо page.tsx серверним
- app/notes/[id]/NoteDetails.client.tsx – створюємо окремий клієнтський компонент для інтерактивного вмісту

## Налаштування React Query

Використаємо React Query для зручної роботи з даними в клієнтському компоненті. Встановлюємо бібліотеку:

npm i @tanstack/react-query

Почнемо з підключення провайдера React Query, щоб усі клієнтські компоненти могли використовувати useQuery, кеш і мутації. У папці components створимо клієнтський компонент TanStackProvider, завдання якого дати доступ до queryClient усім дочірнім компонентам.

// components/TanStackProvider/TanStackProvider.tsx

"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Props = {
children: React.ReactNode;
};

const TanStackProvider = ({ children }: Props) => {
const [queryClient] = useState(() => new QueryClient());

return (
<QueryClientProvider client={queryClient}>
{children}
</QueryClientProvider>
);
};

export default TanStackProvider;

Детальніше:

- QueryClient – керує кешем, мутаціями, завантаженнями тощо
- QueryClientProvider – обгортка яка дає доступ до queryClient усім дочірнім компонентам

За бажанням тут також можна підключити ReactQueryDevtools.

Провайдер підключається один раз на весь проєкт, тому зробимо це в головному шаблоні app/layout.tsx який огортає всі компоненти додатка.

// app/layout.tsx

import TanStackProvider from "@/components/TanStackProvider/TanStackProvider.jsx";

// інший код файлу

export default function RootLayout({
children
}: Readonly<{ children: React.ReactNode; }>) {
return (

<html lang="en">
<body className={`${geistSans.variable} ${geistMono.variable}`}>
<TanStackProvider>
<Header />
<main>{children}</main>
<footer>
<p>Created <time dateTime="2025">2025</time></p>
</footer>
</TanStackProvider>
</body>
</html>
);
}

## Prefetch і кешування

Далі, до серверного компонента app/notes/[id]/page.tsx повертаємо логіку читання ідентифікатора із параметрів. Також додамо код, щоб компонент завантажував дані заздалегідь (prefetch).

// app/notes/[id]/page.tsx

import { QueryClient } from "@tanstack/react-query";
import { getSingleNote } from "@/lib/api";
import NoteDetailsClient from "./NoteDetails.client";

type Props = {
params: Promise<{ id: string }>;
};

const NoteDetails = async ({ params }: Props) => {
const { id } = await params;
const queryClient = new QueryClient();

await queryClient.prefetchQuery({
queryKey: ["note", id],
queryFn: () => getSingleNote(id),
});

return <NoteDetailsClient />;
};

export default NoteDetails;

- prefetchQuery – функція, яка завчасно завантажить нам ці нотатки та збереже їх у кеш на сервері. Завдяки цьому при виклику useQuery у клієнтському компоненті, дані вже будуть доступні – без повторного запиту.
- queryKey – ключ, за яким дані будуть збережені у кеш
- queryFn – функція HTTP-запиту

Для того, щоб використати ці дані в клієнтському компоненті, необхідно використати HydrationBoundary із React Query.

// app/notes/[id]/page.tsx

import {
QueryClient,
HydrationBoundary,
dehydrate,
} from "@tanstack/react-query";
import { getSingleNote } from "@/lib/api";
import NoteDetailsClient from "./NoteDetails.client";

type Props = {
params: Promise<{ id: string }>;
};

const NoteDetails = async ({ params }: Props) => {
const { id } = await params;
const queryClient = new QueryClient();

await queryClient.prefetchQuery({
queryKey: ["note", id],
queryFn: () => getSingleNote(id),
});

return (
<HydrationBoundary state={dehydrate(queryClient)}>
<NoteDetailsClient />
</HydrationBoundary>
);
};

export default NoteDetails;

- HydrationBoundary – компонент, передає кеш клієнту
- dehydrate(queryClient) – перетворює кеш у серіалізований обʼєкт

## Вивід даних у клієнтському компоненті

Тепер в клієнтському компоненті необхідно також отримати ідентифікатор нотатки із URL через useParams, додати хук useQuery та опрацювати дані.

// app/notes/[id]/NoteDetails.client.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getSingleNote } from "@/lib/api";

const NoteDetailsClient = () => {
const { id } = useParams<{ id: string }>();

const { data: note, isLoading, error } = useQuery({
queryKey: ["note", id],
queryFn: () => getSingleNote(id),
refetchOnMount: false,
});

if (isLoading) return <p>Loading...</p>;

if (error || !note) return <p>Some error..</p>;

const formattedDate = note.updatedAt
? `Updated at: ${note.updatedAt}`
: `Created at: ${note.createdAt}`;

return (

<div>
<h2>{note.title}</h2>
<p>{note.content}</p>
<p>{formattedDate}</p>
</div>
);
};

export default NoteDetailsClient;

- useParams – хук для клієнтських компонентів, який повертає об'єкт із динамічними параметрами поточного маршруту, підставленими з URL; він не приймає жодних аргументів.
- В useQuery потрібно передати той же queryKey, що і для prefetchQuery, щоб дістати із кешу дані відповідної нотатки.
- Також обов’язково вказуємо, що нам не потрібен повторний запит при монтуванні клієнтського компонента (refetchOnMount: false). Це вимикає повторний запит при монтуванні, оскільки дані вже є з prefetchQuery.

В результаті при переході на сторінку нотатки отримаємо її дані.

Що ми отримали

- SSR-запит у page.tsx – дані приходять на сервер
- Дані кешуються через prefetchQuery
- HydrationBoundary передає кеш клієнту
- useQuery у клієнтському компоненті дістає ці дані з кешу
- У браузер потрапляє згенерований HTML, а React Query забезпечує інтерактивність без додаткових запитів.
