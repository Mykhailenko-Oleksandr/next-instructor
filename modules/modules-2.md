- Обробка неіснуючих маршрутів
  1. Перенаправлення з неіснуючих маршрутів
  2. 404 для вкладених маршрутів
- Універсальні маршрути
  1. Фільтрація нотаток за категорією
  - Чому ми не використовуємо /notes/${id}?
- Програмна навігація
- Групування маршрутів
- Паралельні маршрути
- Перехоплення маршрутів
- Редіректи

# Обробка неіснуючих маршрутів

Що відбувається, якщо перейти за неіснуючим маршрутом, наприклад, на /hello або /profile/details?

Як бачимо, Next.js автоматично відображає стандартну сторінку 404. Хоча ми не створювали жодного компонента для цього, вбудована обробка помилок вже працює "з коробки".

Проте, цю сторінку можна легко змінити під власні потреби. Для цього достатньо створити файл not-found.tsx у папці app.

// app/not-found.tsx

import Link from 'next/link';

const NotFound = () => {
return (

<div>
<h1>404 - Page Not Found</h1>
<p>Sorry, the page you&#39;re looking for doesn&#39;t exist.</p>
<Link href="/">Go back home</Link>
</div>
);
};

export default NotFound;

Тепер, якщо користувач перейде на неіснуючий маршрут, відобразиться ваша кастомна сторінка:

## Перенаправлення з неіснуючих маршрутів

Якщо ви хочете, щоб користувач замість 404 сторінки потрапляв, наприклад, на головну або іншу сторінку – використовуйте not-found.tsx як клієнтський компонент із перенаправленням.

// app/not-found.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const NotFound = () => {
const router = useRouter();

useEffect(() => {
// Редірект через 3 секунди
const timer = setTimeout(() => router.push('/'), 3000);
return () => clearTimeout(timer);
}, [router]);

return (

<div>
<h1>404 - Сторінку не знайдено</h1>
<p>Вас буде перенаправлено на головну через кілька секунд…</p>
</div>
);
};

export default NotFound

## 404 для вкладених маршрутів

Якщо у вашому застосунку є вкладені маршрути, можна створити локальну not-found.tsx у конкретній папці, наприклад:

app/
├── profile/
│ ├── not-found.tsx ← працює тільки для /profile/\*

Це дозволяє створювати різні 404 сторінки для різних секцій сайту.

Next.js автоматично обробляє помилки типу 404, але при потребі ви можете задати власну сторінку – глобально або в межах окремого маршруту.
Для цього достатньо додати файл not-found.tsx у потрібну папку.

# Універсальні маршрути

Універсальні маршрути (сatch-all routes) – це спосіб створити сторінку, яка буде обробляти будь-яку кількість сегментів URL, навіть якщо їх кількість наперед невідома.

У вас є блог, і ви хочете мати одну сторінку, яка буде обробляти ось такі адреси:

- /docs
- /docs/setup
- /docs/setup/install
- /docs/setup/install/windows
- і так далі…

Замість того, щоб створювати окремий файл для кожного рівня, ви створюєте один файл:

app/docs/[...slug]/page.tsx

[...slug] – це синтаксис catch-all параметра
У компоненті ви отримаєте масив slug, який містить частини URL

// app/docs/[...slug]/page.tsx

type Props = {
params: Promise<{ slug: string[] }>;
};

export default async function DocsPage({ params }: Props) {
const { slug } = await params;

return (

<div>
<h1>Docs page</h1>
<p>Current path: {params.slug?.join(" / ") || "home"}</p>
</div>
);
}

Що буде при переході на:

- /docs → params.slug = []
- /docs/setup → params.slug = ['setup']
- /docs/setup/install → params.slug = ['setup', 'install']

## Фільтрація нотаток за категорією

У нотаток є категорії – це передбачено бекендом. Тому реалізуємо логіку фільтрації за категоріями через окремі маршрути.

Перше, що ми зробимо – це змінимо хедер. Замість звичайної навігації на сторінку /notes ми додамо меню з категоріями нотаток.

1. Крок 1. Запит на отримання категорій

Додаємо запит на отримання списку категорій до lib/api.ts:

// lib/api.ts

// Решта коду файла

export type Category = {
id: string;
name: string;
description: string;
createdAt: string;
updatedAt: string;
};

export const getCategories = async () => {
const res = await axios<Category[]>('/categories');
return res.data;
};

2. Крок 2. Додаємо меню до Header.tsx

// components/Header/Header.tsx

import Link from 'next/link';
import css from './Header.module.css';
import { getCategories } from '@/lib/api';

const Header = async () => {
const categories = await getCategories();

const handleClick = () => {
// ...
};

return (

<header>
<Link href="/" aria-label="Home">NoteHub</Link>
<nav aria-label="Main Navigation">
<ul>
<li><button onClick={handleClick}>Open menu</button></li>
<li><Link href="/profile">Profile</Link></li>
<li><Link href="/about">About</Link></li>
</ul>
</nav>
</header>
);
};

export default Header;

3. Крок 3. Створюємо компонент меню

Оскільки у серверному компоненті ми не можемо використовувати обробники подій, компонент Header залишаємо серверним, а меню виносимо в окремий клієнтський компонент CategoriesMenu.

// components/CategoriesMenu/CategoriesMenu.tsx

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Category } from '@/lib/api';
import css from './CategoriesMenu.module.css';

type Props = {
categories: Category[];
};

const CategoriesMenu = ({ categories }: Props) => {
const [isOpen, setIsOpen] = useState(false);
const toggle = () => setIsOpen(!isOpen);

return (

<div className={css.menuContainer}>
<button onClick={toggle} className={css.menuBtn}>
Notes
</button>
{isOpen && (
<ul className={css.menu}>
<li className={css.menuItem}>
<Link href={`/notes/filter/all`} onClick={toggle}>
All notes
</Link>
</li>
{categories.map((category) => (
<li key={category.id} className={css.menuItem}>
<Link href={`/notes/filter/${category.id}`} onClick={toggle}>
{category.name}
</Link>
</li>
))}
</ul>
)}
</div>
);
};

export default CategoriesMenu;

Також додамо логіку відображення сторінки без фільтрів. Це потрібно, адже ми відмовляємося від навігації /notes, тому буде маршрут /notes/filter/all.

### Чому ми не використовуємо /notes/${id}?

Щоб уникнути конфлікту між ідентифікатором нотатки та ідентифікатором категорії.

Зверніть увагу на href у компоненті Link. Ми навмисно використовуємо /notes/filter/${id} замість /notes/${id}, щоб уникнути плутанини. Інакше Next.js сприйме назву категорії як id нотатки:

/notes/123 – це ID нотатки?
/notes/123 – це категорія?

Тому використовуємо таку навігацію:

<Link href={`/notes/filter/${category.id}`}

4. Крок 4. Підключаємо меню в Header

// components/Header/Header.tsx

import Link from 'next/link';
import { getCategories } from '@/lib/api';
import CategoriesMenu from '../CategoriesMenu/CategoriesMenu';

const Header = async () => {
const categories = await getCategories();

return (

<header>
<Link href="/" aria-label="Home">NoteHub</Link>
<nav aria-label="Main Navigation">
<ul>
<li><CategoriesMenu categories={categories} /></li>
<li><Link href="/profile">Profile</Link></li>
<li><Link href="/about">About</Link></li>
</ul>
</nav>
</header>
);
};

export default Header;

5. Крок 5. Сторінка для нотаток за категорією

Тепер реалізуємо сторінку для виведення нотаток. Для catch-all маршруту створюємо папку [...slug]:

// app/notes/filter/[...slug]/page.tsx

const NotesByCategory = () => {
return <div>NotesByCategory</div>;
};

export default NotesByCategory;

6. Крок 6. Оновлюємо функцію getNotes

Функція getNotes очікує необов’язковий параметр categoryId:

// lib/api.ts

export const getNotes = async (categoryId?: string) => {
const res = await axios.get<NoteListResponse>('/notes', {
params: { categoryId },
});
return res.data;
};

7. Крок 7. Виводимо нотатки на сторінці

В catch-all маршруті Next.js передає значення параметра як масив slug.

slug – це масив, який дозволяє працювати з будь-якою кількістю вкладеностей.
Наприклад:
/notes/filter/tech/backend/frontend → slug = ['tech', 'backend', 'frontend']

Для простої фільтрації беремо значення з нульового індексу:

// app/notes/filter/[...slug]/page.tsx

import { getNotes } from '@/lib/api';
import NoteList from '@/components/NoteList/NoteList';

type Props = {
params: Promise<{ slug: string[] }>;
};

const NotesByCategory = async ({ params }: Props) => {
const { slug } = await params;
const category = slug[0] === 'all' ? undefined : slug[0];
const response = await getNotes(category);

return (

<div>
<h1>Notes List</h1>
{response?.notes?.length > 0 && <NoteList notes={response.notes} />}
</div>
);
};

export default NotesByCategory;

Тепер у нас є працююча сторінка для фільтрації за категоріями:

Підсумок

У нас є сторінка з нотатками, яка фільтрується за категорією через catch-all маршрут, а також пункт меню “усі нотатки”.

- /notes/filter/all → усі нотатки
- /notes/filter/123 → нотатки з категорії з ID 123
- /notes/filter/tech/backend → можливість реалізації складніших фільтрів у майбутньому.

# Програмна навігація

Маючи фільтрацію нотаток за категорією, виникає бажання – мати можливість зі сторінки деталей повертатися назад. Отже, нам потрібна кнопка “Назад” у компоненті NoteDetailsClient.

// app/notes/[id]/NoteDetails.client.tsx

const NoteDetailsClient = () => {
// Решта коду компонента
const handleGoBack = () => {};

return (

<div>
<button onClick={handleGoBack}>Back</button>
<h2>{note.title}</h2>
<p>{note.content}</p>
<p>{formattedDate}</p>
</div>
);
};

Ми знаємо, що можна використати компонент Link, але це не завжди підходить. Іноді перед переходом потрібно спочатку виконати якусь додаткову логіку – наприклад, запитати користувача, чи він дійсно хоче залишити сторінку.

Як це реалізувати?

Нам допоможе хук useRouter з пакета next/navigation. Ідеально, бо компонент клієнтський – можемо спокійно використовувати React-хуки.

import { useRouter } from 'next/navigation';

Хук useRouter повертає екземпляр навігації, який зазвичай називають router.

const router = useRouter();

Ось деякі корисні методи router:

- router.push('/url') – перехід на нову сторінку (додає в історію).
- router.replace('/url') – перехід із заміною поточної сторінки (історія не зберігається).
- router.back() – повернення на попередню сторінку.
- router.forward() – перехід уперед по історії (використовується рідко).

Додаємо у handleGoBack виклик router.back() з підтвердженням через вбудований у браузер confirm:

const handleGoBack = () => {
const isSure = confirm('Are you sure?');
if (isSure) {
router.back();
}
};

Підсумок

- Якщо потрібно просто перейти на іншу сторінку – використовуйте <Link>.
- Якщо перед переходом потрібно щось перевірити або виконати – використовуйте useRouter.

# Групування маршрутів

З попередніх тем ми знаємо: у папці app/ кожна нова папка = новий маршрут. Це добре для побудови сторінок, але що робити, коли ми хочемо просто логічно згрупувати маршрути без зміни URL?

Уявіть, наприклад:

- /notes і /profile – це публічні сторінки
- /about – приватна сторінка

Було б зручно зібрати їх у структуру:

app/
├─ (public routes)/
│ ├─ notes/
│ └─ profile/
├─ (private routes)/
│ └─ about/

Але ж ми не хочемо, щоб URL змінився на /public/notes чи /private/about, правда? На щастя, Next.js це передбачив.

Щоб згрупувати маршрути, але не змінювати URL – просто назвіть папку в круглих дужках.

Назви (private routes) і (public routes) існують лише в структурі проєкту. В URL вони не зʼявляються.

Що це нам дає?

- Організований код – маршрути не звалені в одну купу
- Читабельність – легко знайти потрібну частину
- Логіка доступу – приватні сторінки в одному місці (можна потім додати guard або middleware)
- Жодного впливу на URL – користувач бачить звичний шлях, напр. /profile, а не /private/profile

Висновок

- () в імені папки = групування, а не маршрут
- Це не впливає на URL
- Зручно для структуризації великих проєктів
- Добре підходить для поділу на public, private, admin, auth тощо

# Паралельні маршрути

Паралельні маршрути (parallel routes) – дозволяють одночасно показувати кілька незалежних областей на сторінці, кожна з яких має власний маршрут і свій контент.

Це зручно, коли:

- Потрібно відображати кілька логічних блоків, наприклад, контент + навігацію.
- Кожна область може перезавантажуватися окремо, не зачіпаючи інші.
- Ви хочете розділити логіку, щоб краще підтримувати код.

У нашому випадку ми додамо бокову панель з категоріями на сторінку фільтрованих нотаток /notes/filter. Цю панель реалізуємо як паралельний маршрут.

1. Крок 1. Створюємо layout.tsx для /notes/filter

// app/notes/filter/layout.tsx

type Props = {
children: React.ReactNode;
};

const NotesLayout = ({ children }: Props) => {
return (

<section>
<div>{children}</div>
</section>
);
};

export default NotesLayout;

Це базовий лейаут. Тепер ми підготуємо місце для бокової панелі.

2. Крок 2. Створюємо паралельний маршрут @sidebar

Щоб створити паралельний маршрут, у Next.js потрібно:

- Створити папку з назвою, що починається з @ – наприклад, @sidebar
- У ній створити файл default.tsx – він і буде "контентом" сайдбару за замовчуванням

// app/notes/filter/@sidebar/default.tsx

const NotesSidebar = async () => {
return <div>NotesSidebar</div>;
};

export default NotesSidebar;

Ось як повинна виглядати структура /app/notes/filter після цього:

notes/
├─ filter/
│ ├─ layout.tsx // Головний layout
│ ├─ [...slug]/ // Catch-all сторінки для нотаток
│ │ └─ page.tsx
│ ├─ @sidebar/ // Паралельний маршрут
│ │ └─ default.tsx // Контент для сайдбару

Це важливо: папка @sidebar повинна бути на одному рівні з [...slug].

3. Крок 3. Оновлюємо layout.tsx для сайдбара

У пропсах layout.tsx ви отримаєте доступ до sidebar – просто додаємо його до розмітки, по аналогії з children.

type Props = {
children: React.ReactNode;
sidebar: React.ReactNode;
};

const NotesLayout = ({ children, sidebar }: Props) => {
return (

<section>
<aside>{sidebar}</aside>
<div>{children}</div>
</section>
);
};

export default NotesLayout;

4. Крок 4. Додаємо контент до сайдбара

Тепер зробимо бокову панель справжньою – виведемо список категорій так само як ми робили це у хедері:

import Link from 'next/link';
import { getCategories } from '@/lib/api';

const NotesSidebar = async () => {
const categories = await getCategories();

return (

<ul>
<li>
<Link href={`/notes/filter/all`}>All notes</Link>
</li>
{categories.map((category) => (
<li key={category.id}>
<Link href={`/notes/filter/${category.id}`}>{category.name}</Link>
</li>
))}
</ul>
);
};

export default NotesSidebar;

- Сайдбар підвантажується окремо.
- Контент (нотатки) змінюється незалежно.
- Усе це працює на одній сторінці.

Підсумок

- Паралельні маршрути – це спосіб рендерити окремі незалежні області сторінки.
- У нашому випадку: main = нотатки, aside = категорії.
- Використовуються через папки @назва, наприклад, @sidebar.

# Перехоплення маршрутів

У стандартній поведінці Next.js перехід на сторінку (наприклад, /notes/123) повністю завантажує новий маршрут і сторінку. Але іноді нам хочеться зробити інакше:

Не переходити повністю на нову сторінку, а лише відобразити частину контенту – наприклад, деталі нотатки у модальному вікні.

Це і є перехоплення маршруту (interception): ми "перехоплюємо" перехід і показуємо щось інше (модалку) замість повноцінного рендеру.

Структура: як усе влаштовано?

Уявімо, що ми хочемо при натисканні на нотатку показати її в модалці, а не на окремій сторінці. Замість переходу /notes/123 → нова сторінка, ми лишаємось на /notes, і відкривається модальне вікно з деталями.

1. Крок 1. Аналізуємо, який маршрут хочемо перехопити

Це буде /notes/[id], тобто сторінка детальної нотатки.

2. Крок 2. Створюємо паралельний маршрут @modal

На одному рівні з папкою notes створюємо нову папку @modal. Це паралельний маршрут, який дозволяє вставити модальне вікно в загальний макет.

app/
├─ notes/
│ └─ [id]/page.tsx → звичайна сторінка нотатки
├─ @modal/
│ └─ default.tsx → дефолт (порожній) вміст

Оскільки це паралельний маршрут, він вимагає дефолтного відображення. Але в нашому випадку – якщо модалка не потрібна, ми нічого не рендеримо.

3. Крок 3. Додаємо modal у RootLayout

Оскільки ми хочемо показувати модальне вікно поверх будь-якого контенту – додаємо його в RootLayout.

// app/layout.tsx

export default function RootLayout({
children,
modal,
}: Readonly<{
children: React.ReactNode;
modal: React.ReactNode;
}>) {
return (

<html lang="en">
<body className={`${geistSans.variable} ${geistMono.variable}`}>
<TanStackProvider>
<Header />
<main>
{children}
{modal}
</main>
<footer>
<p>
Created <time dateTime="2025">2025</time>
</p>
</footer>
</TanStackProvider>
</body>
</html>
);
}

Тепер Next знає: якщо зʼявиться паралельний маршрут @modal – його слід рендерити як окремий блок на сторінці.

4. Крок 4. Створюємо перехоплювач

Тепер сам момент "перехоплення". Ми створюємо маршрут, який перехоплює /notes/[id], але не замінює сторінку повністю, а показується в @modal.

app/
├─ notes/
│ └─ [id]/page.tsx → звичайна сторінка нотатки
├─ @modal/
│ └─ (.)notes/[id]/page.tsx → перехоплений маршрут у модалці
│ └─ default.tsx → дефолт (порожній) вміст

Отже, для того, щоб перехопити маршрут, нам потрібно побудувати ідентичний перехопленню маршрут, але “посилатись” на той, що хочемо перехопити.

Спочатку будуємо маршрут аналогічний notes/[id]/page.tsx, але в папці @modal.

Тепер потрібно вказати перехоплювач. Це ключовий момент для спрацювання логіки перехоплення. Простими словами, нам за допомогою спеціального синтаксису, необхідно вказати шлях до маршруту, який хочемо перехопити.

Для побудови перехоплювача, нам потрібна логіка, яка використовується у відносних імпортах.

- / – поточна папка
- ./ – на один рівень вгору
- ./../ – на два рівні вгору

Аналогічно в маршрутах для перехоплювача:

- (.) – поточна папка
- (..) – на один рівень вгору
- (..)(..) – на два рівні вгору
- (...) – почати з кореневого каталогу app

У нашому випадку – ми в @modal, а notes знаходиться поруч → використовуємо (.)notes.

Тепер, якщо ми будемо виконувати навігацію на notes/[id] – Next побачить, що існує перехоплення, та відправить у рендер компонент з (.)notes/[id]. Але якщо ми будемо просто рендерити сторінку notes/[id], наприклад, у новій вкладці, або перезавантажимо цей маршрут, то відпрацює стандартна логіка.

Щоб перехоплення почало працювати, перезапусти dev-сервер – інакше Next не згенерує маршрути заново.

5. Крок 5. Структура файлів

Ще один важливий момент – винести паралельний маршрут @modal з групи (public routes). Це потрібно, через те, що layout просто не побачить паралельний маршрут, якщо вони будуть не в одній групі.

Щоб все це перевірити, нам потрібно наповнити page.tsx у перехопленому маршруті.

// app/@modal/(.)notes/[id]/page.tsx

import { getSingleNote } from '@/lib/api';

type Props = {
params: Promise<{ id: string }>;
};

const NotePreview = async ({ params }: Props) => {
const { id } = await params;
const note = await getSingleNote(id);

return (
<>

<h2>{note.title}</h2>
<p>{note.content}</p>
</>
);
};

export default NotePreview;

6. Крок 6. Створюємо модальне вікно

Компонент Modal.tsx – стандартне модальне вікно, але як клієнтський компонент.

// components/Modal/Modal.tsx

'use client';

import { useRouter } from 'next/navigation';

type Props = {
children: React.ReactNode;
};

const Modal = ({ children }: Props) => {
const router = useRouter();

const close = () => router.back();

return (

<div>
<div>
{children}
<button onClick={close}>Close</button>
</div>
</div>
);
};

export default Modal;

Закриття виконується через router.back(), бо це реальний маршрут, і ми просто повертаємось назад в історії.

Додаємо модальне вікно до сторінки NotePreview.

// app/@modal/(.)notes/[id]/page.tsx

import { getSingleNote } from '@/lib/api';
import Modal from '@/components/Modal/Modal';

type Props = {
params: Promise<{ id: string }>;
};

const NotePreview = async ({ params }: Props) => {
const { id } = await params;
const note = await getSingleNote(id);

return (
<Modal>

<h2>{note.title}</h2>
<p>{note.content}</p>
</Modal>
);
};

export default NotePreview;

Як це працює?

- Клік на нотатку → перехід на /notes/123
- Але замість нової сторінки відкривається модальне вікно
- Якщо перезавантажити або відкрити сторінку напряму – рендериться звичайна сторінка

Підсумок

- створили @modal – для модалки
- додали default.tsx – обовʼязковий файл
- додали modal у RootLayout
- створили (.)notes/[id] – для перехоплення маршруту
- використали Modal з router.back()
- винесли @modal з (public routes) – щоб працювало
- перезапустили проєкт – обов’язково.

# Редіректи

Редірект – це автоматичне перенаправлення користувача з одного маршруту на інший.

Це може бути корисно в ситуаціях, коли:

- сторінка більше неактуальна або тимчасово недоступна;
- користувач не має доступу до певного маршруту;
- потрібно реалізувати умовну логіку переходів (наприклад, для авторизації);
- ви хочете зберегти старі URL, але показувати новий контент.

У нашому проєкті ще не готова сторінка About. Тож ми можемо автоматично перенаправити користувача на головну:

// app/about/page.tsx

import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
title: 'About page',
};

const About = () => {
redirect('/');
return null;
};

export default About;

redirect() – це функція, яка зупиняє виконання компонента й одразу перенаправляє користувача. Повернення JSX після виклику redirect() не має сенсу – воно не буде виконано.

Потенційні юзкейси

- Приватні маршрути – неавторизованих користувачів перенаправляємо на сторінку входу.
- Публічні маршрути – якщо користувач уже залогінений, перенаправляємо з /login на /dashboard.
- Застарілі сторінки – перенаправляємо з /old-blog на новий /blog.
- Мультимовність – обираємо потрібну мову й перенаправляємо користувача, наприклад, на /en чи /uk.
- Сторінка в розробці – тимчасово перенаправляємо на головну або іншу активну сторінку.

Ми ще повернемось до redirect(), коли будемо розглядати авторизацію. Він там відіграє ключову роль.

Підсумок

- redirect() викликається лише у серверному компоненті.
- Автоматично переносить користувача на вказаний маршрут.
- Може використовуватись умовно.
  Корисний для:
- захисту доступу;
- UX-навігації за станом користувача;
- перенаправлення старих або недоступних маршрутів.
