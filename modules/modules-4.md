- Створення Route Handler
  1. Перенаправляємо клієнтські запити
  2. Отримання однієї нотатки
  3. Створення нової нотатки
- Налаштування Axios
  1. Рефактор запитів
  2. Оновлення Route Handlers
- Реєстрація користувача
  1. Навігація в хедері
  2. Сторінка реєстрації
  3. Функція register
  4. Хендлер для реєстрації
  5. Робота з cookies у хендлері
  6. Відправлення форми
- Логін користувача
  1. Сторінка логіну
  2. Функція login
  3. Хендлер для логіну
  4. Підключаємо логіку на сторінку
- Логаут користувача
  1. Глобальний стан авторизації
  2. Реалізація перевірки сесії
  3. Отримання об’єкта користувача
  4. Провайдер авторизації
  5. Динамічна навігація в хедері
  6. Логіка логауту
  7. Оновлення сторінок логіну та реєстрації
- Помилка під час попереднього рендеру
  1. Оновлюємо Header
  2. Оновлюємо CategoriesMenu
- Middleware
- Приватні запити
- Завантаження зображень

# Створення Route Handler

Розглянемо приклад на основі існуючого запиту для отримання категорій:

GET https://next-docs-api.onrender.com/categories

Замість цього ми хочемо, щоб компонент сторінки page.tsx робив запит до Next-сервера за адресою http://localhost:3000, а той уже відправляв запит до бекенду.

Оскільки клієнтська маршрутизація Next конфліктує зі звичайними запитами, ми створимо окремий API-маршрут у просторі app/api.

Структура директорій буде такою:

app/
└── api/
└── categories/
└── route.ts

Весь код всередині папки app/api є кодом Next сервера і виконується на ньому, а не в браузері.

Логіка у файлі route.ts

Файл route.ts повинен експортувати функції з назвами, що збігаються з HTTP-методами, які ми хочемо обробляти (GET, POST, PUT тощо).

Наприклад, для обробки GET у файлі пишемо:

// app/api/categories/route.ts

export async function GET() {}

Далі нам потрібно виконати запит до бекенду за допомогою Axios. Для цього у папці api створюємо допоміжний файл api.ts, де налаштовуємо інстанс Axios:

app/
└── api/
├── api.ts
└── categories/
└── route.ts

Ось код файла.

// app/api/api.ts

import axios from 'axios';

export const api = axios.create({
baseURL: 'https://next-docs-api.onrender.com',
});

Також, для зручності, типізуємо можливу помилку запиту. Бекенд може повернути заготовлене повідомлення, або ж стандартну помилку, при зверненні до неіснуючих маршрутів, або якщо бекенд “впав”.

// app/api/api.ts

import axios, { AxiosError } from 'axios';

export type ApiError = AxiosError<{ error: string }>

export const api = axios.create({
baseURL: 'https://next-docs-api.onrender.com',
});

У route.ts імпортуємо цей інстанс і виконуємо запит:

// app/api/categories/route.ts

import { NextResponse } from 'next/server';
import { api, ApiError } from '../api';

export async function GET() {
try {
const { data } = await api('/categories')

    // Повертаємо те, що відповів бекенд через метод json
    return NextResponse.json(data)

} catch (error) {
// У випадку помилки — повертаємо обʼєкт з помилкою
return NextResponse.json(
{
error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
},
{ status: (error as ApiError).status }
)
}
}

Тут ми використали NextResponse.json, щоб повернути дані. Це дуже зручно, адже NextResponse – це розширення стандартного Web Response з додатковими методами Next.js, і дозволяє легко повертати JSON-дані.

## Перенаправляємо клієнтські запити

Тепер потрібно налаштувати axios, щоб він надсилав запити не до бекенду напряму, а до Route Handlers Next-сервера:

// lib/api.ts

// axios.defaults.baseURL = 'https://next-docs-api.onrender.com'
axios.defaults.baseURL = 'http://localhost:3000/api'

Таким чином усі запити типу api.get('/categories') автоматично підуть спочатку на Next-сервер, який уже відправить запит до бекенду нотатків.

Усі компоненти залишаються без змін, ми лише перенаправили запити через Next, щоб централізувати їх обробку.

Оновлюємо роботу з нотатками

За аналогією налаштуємо обробку запиту для отримання списку нотаток.

Створюємо структуру:

app/
└── api/
├── api.ts
├── categories/
│ └── route.ts
└── notes/
└── route.ts

Файл route.ts для нотаток:

// app/api/notes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '../api';

export async function GET(request: NextRequest) {
const categoryId = request.nextUrl.searchParams.get('categoryId')
try {
const { data } = await api('/notes', {
params: { categoryId },
})
return NextResponse.json(data)
} catch (error) {
return NextResponse.json(
{
error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
},
{ status: (error as ApiError).status }
)
}
}

Зверни увагу:

- будь-яка функція хендлера отримує об’єкт request як параметр;
- ми використовуємо фільтрацію, передаючи параметри через searchParams;
- через request.nextUrl маємо повний доступ до запиту, включаючи query-параметри.

## Отримання однієї нотатки

Для відображення окремої нотатки за її id використовуємо dynamic routing:

app/
└── api/
└── notes/
├── route.ts
└── [id]/
└── route.ts

Отримання нотатки – це також GET запит.

// app/api/notes/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '../api';

type Props = {
params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
const { id } = await params;
try {
const { data } = await api(`/notes/${id}`);

    return NextResponse.json(data);

} catch (error) {
return NextResponse.json(
{
error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
},
{ status: (error as ApiError).status }
)
}
}

Ідентифікатор нотатки ми отримуємо із params – це проміс, що повертає обʼєкт з властивістю id.

## Створення нової нотатки

Ми вже маємо GET у notes/route.ts, тепер додамо POST для створення нотатки:

// app/api/notes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '../api';

export async function GET(request: NextRequest) {
// попередня логіка
}

export async function POST(request: NextRequest) {
// Отримуємо дані з тіла запиту
const body = await request.json();

try {
// Передаємо їх далі на бекенд нотаток
const { data } = await api.post('/notes', body);

      return NextResponse.json(data);

} catch (error) {
return NextResponse.json(
{
error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
},
{ status: (error as ApiError).status }
)
}
}

Під час виклику createNote у компоненті ви передаєте обʼєкт нової нотатки. Ці дані автоматично потрапляють у request на Next-сервері, і функція POST обробляє їх за допомогою request.json().

Next автоматично визначає, яку функцію викликати – GET чи POST – залежно від типу запиту.

Що ми отримали в результаті?

- Усі запити тепер йдуть через Next-сервер
- Централізована логіка роботи з API
- Можливість керувати cookies або токенами безпосередньо на сервері Next
- Більш контрольована і безпечна архітектура

# Налаштування Axios

Бібліотека axios за замовчуванням не надсилає cookie, якщо явно не вказати це. Щоб не дублювати налаштування для кожного запиту, ми створимо окремий інстанс axios, який будемо використовувати по всьому проєкту:

// lib/api.ts

import axios from 'axios';

// Видаляємо стару логіку baseURL
// axios.defaults.baseURL = 'http://localhost:3000/api'

// Створюємо інстанс axios
const nextServer = axios.create({
baseURL: 'http://localhost:3000/api',
withCredentials: true, // дозволяє axios працювати з cookie
});

Параметр withCredentials: true означає:

axios буде приймати cookie, які повертає сервер
і відправляти ці cookie автоматично при кожному запиті

## Рефактор запитів

Після створення інстансу nextServer потрібно у всіх запитах замінити використання axios на цей інстанс. Це гарантує, що cookies працюватимуть автоматично:

// lib/api.ts

export const getNotes = async (categoryId?: string) => {
const res = await nextServer.get<NoteListResponse>('/notes', {
params: { categoryId },
});
return res.data;
};

Усі запити в компонентах проєкта відтепер повинні використовувати інстанс nextServer.

## Оновлення Route Handlers

Аналогічно, треба оновити інстанс axios, який використовується всередині Route Handlers для запитів до зовнішнього API:

// app/api/api.ts

import axios from 'axios';

export const api = axios.create({
baseURL: 'https://next-docs-api.onrender.com',
withCredentials: true, // також додаємо цей параметр
});

Підсумок

- Cookie – це механізм збереження токенів для авторизації
- Сервер встановлює cookie, фронтенду нічого вручну зберігати не потрібно
- Щоб це працювало:
- Ми створили інстанс axios із withCredentials: true
  оновили інстанс у Route Handlers, також додавши withCredentials: true

Це налаштування критично важливе для безпечної та стабільної роботи автентифікації в Next.js. Без нього токени не працюватимуть або не надсилатимуться, і користувач не зможе залишатися залогіненим.

# Реєстрація користувача

Почнемо реалізацію авторизації з першого кроку – реєстрації. Це процес створення нового акаунта у нашому застосунку. Користувач вводить свої дані (наприклад, ім’я, email і пароль), а ми створюємо для нього запис у базі.

Які сторінки нам потрібні?

Ми створимо дві окремі сторінки:

- /sign-up – для створення нового акаунта (реєстрація)
- /sign-in – для входу в існуючий акаунт (логін)
  Поки зосередимось на першій.

## Навігація в хедері

Спочатку підготуємо хедер. Додамо посилання на сторінки входу та реєстрації, щоб користувач завжди міг увійти або зареєструватися.

// components/Header/Header.tsx

const Header = async () => {
const categories = await getCategories()

return (

<header>
<Link href="/" aria-label="Home">
NoteHub
</Link>
<nav aria-label="Main Navigation">
<ul>
<li>
<CategoriesMenu categories={categories} />
</li>
<li>
<Link href="/profile">Profile</Link>
</li>
<li>
<Link href="/about">About</Link>
</li>
{/_ Нові посилання _/}
<li>
<Link href="/sign-in">Login</Link>
</li>
<li>
<Link href="/sign-up">Register</Link>
</li>
</ul>
</nav>
</header>
);
}

export default Header;

## Сторінка реєстрації

Тепер створимо саму сторінку app/(auth routes)/sign-up/page.tsx. Це буде клієнтський компонент із простою формою, де користувач вводить:

- ім’я користувача
- пошту
- пароль

// app/(auth routes)/sign-up/page.tsx

'use client';

const SignUp = () => {
const handleSubmit = async (formData: FormData) => {
// ...
};

return (
<>

<h1>Sign up</h1>
<form action={handleSubmit}>
<label>
Username
<input type="text" name="userName" required />
</label>
<label>
Email
<input type="email" name="email" required />
</label>
<label>
Password
<input type="password" name="password" required />
</label>
<button type="submit">Register</button>
</form>
</>
);
};

export default SignUp;

## Функція register

Реєстрація – це POST-запит. Ми відправляємо дані, які користувач ввів у формі, а сервер створює новий обліковий запис і повертає нам об’єкт користувача.

Опишемо типи запиту та створимо функцію, яка його виконає:

// lib/api.ts

// Попередній код без змін

export type RegisterRequest = {
email: string;
password: string;
userName: string;
};

export type User = {
id: string;
email: string;
userName?: string;
photoUrl?: string;
createdAt: Date;
updatedAt: Date;
};

export const register = async (data: RegisterRequest) => {
const res = await nextServer.post<User>('/auth/register', data);
return res.data;
};

## Хендлер для реєстрації

Тепер створимо хендлер, який буде ловити запит register і надсилати його до нашого API.

У папці app/api додаємо папку auth, а в ній – папку register і файл route.ts:

app/
└── api/
└── auth/
└── register/
└── route.ts

Основні моменти, які потрібно врахувати у хендлері:

- POST-запит
- обробка тіла запиту (body)

// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '../../api';

export async function POST(req: NextRequest) {
const body = await req.json();
try {
const apiRes = await api.post('auth/register', body);

    return NextResponse.json(apiRes.data);

} catch (error) {
return NextResponse.json(
{
error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
},
{ status: (error as ApiError).status }
)
}
}

Але цього недостатньо! Наша логіка авторизації зав’язана на cookie – отже їх також потрібно тут опрацювати.

## Робота з cookies у хендлері

Раніше ми згадували, що браузер сам буде відправляти й отримувати cookie. І це справді так. Але у нашому випадку між браузером і бекендом є Next-сервер, через який проходять усі запити. Тому треба опрацювати куки тут, так само як ми обробляємо body або параметри запиту.

Під час реєстрації користувач не авторизований, і передавати куки до API немає сенсу – їх просто ще немає. Але у відповіді від API нам можуть прийти нові куки (наприклад, accessToken і refreshToken), які треба зберегти у браузері. Цю логіку реалізуємо в хендлері.

API надсилає cookies у заголовку Set-Cookie. Він може виглядати так:

accessToken=eyJhb...; Path=/; Max-Age=900; Expires=Fri, 01 Sep 2025 13:44:59 GMT; HttpOnly

- accessToken – значення токена
- Max-Age – кількість секунд, після яких значення вважається застарілим
- Path – шлях який має існувати у запиті, інакше браузер не відправить заголовок
- Expires – максимальний час життя у форматі дати-час

Усі параметри цього заголовка формує бекенд, а наше завдання – просто передати їх у браузер. Для цього використаємо метод cookies() з next/headers.

Алгоритм:

- отримати значення set-cookie
- перевірити, чи воно рядок, чи масив
- розпарсити його
- встановити cookie через cookies().set()

Інсталюємо пакет для парсингу куки:

npm i cookie

Ось повний код хендлера з поясненнями:

// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '../../api';
// Імпортуємо parse з пакету cookie та cookies з next/headers:
import { parse } from 'cookie';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
// Парсимо body
const body = await req.json();
try {
// Запит до бекенду
const apiRes = await api.post('auth/register', body);
// Отримуємо інстанс для роботи з cookies
const cookieStore = await cookies();
// Отримуємо значення set-cookie з хедерів
const setCookie = apiRes.headers['set-cookie'];
// Додаємо перевірку існування setCookie
if (setCookie) {
// Примусово робимо масив
const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
// Проходимось по масиву та парсимо кожне значення
// щоб отримати результат у вигляді обʼєкту
for (const cookieStr of cookieArray) {
const parsed = parse(cookieStr);
// Створюємо налаштування для cookies
const options = {
expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
path: parsed.Path,
maxAge: Number(parsed['Max-Age']),
};

// Методом cookieStore.set додаємо кукі до нашого запиту
if (parsed.accessToken) {
// cookieStore.set('імʼя ключа', 'значення токену', додаткові налаштування)
cookieStore.set('accessToken', parsed.accessToken, options);
}
if (parsed.refreshToken) {
cookieStore.set('refreshToken', parsed.refreshToken, options);
}
}

// Тільки якщо є setCookie повертаємо результат
return NextResponse.json(apiRes.data);
}
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
} catch (error) {
return NextResponse.json(
{
error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
},
{ status: (error as ApiError).status }
)
}
}

Ключі в cookieStore.set() пишуться у нижньому регістрі, а метод parse() повертає ключі так, як вони є у рядку cookie (іноді з великої літери), тому потрібно уважно обробляти ці значення.

## Відправлення форми

Тепер зв’яжемо все у компоненті. Додамо:

- useState – для збереження помилки
- useRouter – для редіректу після успішної реєстрації
- обробник сабміту, який викликає register()

// app/(auth routes)/sign-up/page.tsx

'use client';

// Додаємо імпорти
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register, RegisterRequest } from '@/lib/api';
import { ApiError } from '@/app/api/api'

const SignUp = () => {
const router = useRouter();
const [error, setError] = useState('');

const handleSubmit = async (formData: FormData) => {
try {
// Типізуємо дані форми
const formValues = Object.fromEntries(formData) as RegisterRequest;
// Виконуємо запит
const res = await register(formValues);
// Виконуємо редірект або відображаємо помилку
if (res) {
router.push('/profile');
} else {
setError('Invalid email or password');
}
} catch (error) {
setError(
(error as ApiError).response?.data?.error ??
(error as ApiError).message ??
'Oops... some error'
)
}
};

return (
<>

<h1>Sign up</h1>
<form action={handleSubmit}>
<label>
Username
<input type="text" name="userName" required />
</label>
<label>
Email
<input type="email" name="email" required />
</label>
<label>
Password
<input type="password" name="password" required />
</label>
<button type="submit">Register</button>
</form>
{error && <p>{error}</p>}
</>
);
};

export default SignUp;

Подивимось результат

Підсумок

- Створили сторінку /sign-up з формою реєстрації
- Написали функцію register() для відправлення даних
- Написали хендлер для register()
- Додали обробку помилок і автоматичний перехід при успіху

# Логін користувача

Логін – це процес, під час якого користувач вводить свої дані (email і пароль), а бекенд перевіряє, чи такий користувач існує та чи правильний пароль. Якщо все ок – ми вважаємо, що користувач «автентифікований» і можемо дати доступ до приватних сторінок.

В цілому процес дуже схожий на реєстрацію, лише відрізняються маршрути та назви.

## Сторінка логіну

Створюємо сторінку app/(auth routes)/sign-in/page.tsx. На ній буде форма з двома полями – email та пароль. Коли користувач натискає кнопку, ми будемо надсилати дані на сервер для перевірки.

// sapp/(auth routes)/sign-in/page.tsx

'use client';

const SignIn = () => {
const handleSubmit = async (formData: FormData) => {};

return (

<form action={handleSubmit}>
<h1>Sign in</h1>
<label>
Email
<input type="email" name="email" required />
</label>
<label>
Password
<input type="password" name="password" required />
</label>
<button type="submit">Log in</button>
</form>
);
};

export default SignIn;

## Функція login

Коли користувач натискає «Log in», ми виконуємо POST-запит на сервер – надсилаємо email і пароль, щоб перевірити, чи є такий акаунт. Якщо все добре, сервер створює сесію або токен і повертає його нам.

Опишемо типи, які передаємо та отримуємо, і напишемо саму функцію:

// lib/api.ts

// Попередній код без змін

export type LoginRequest = {
email: string;
password: string;
};

export const login = async (data: LoginRequest) => {
const res = await nextServer.post<User>('/auth/login', data);
return res.data;
};

## Хендлер для логіну

Тепер створимо хендлер, який перехоплюватиме запит login і відправлятиме його до API.

У папці app/api створюємо папку auth, а в ній папку login і файл route.ts:

app/
└── api/
└── auth/
└── login/
└── route.ts

Основні моменти у хендлері:

- це POSTзапит
- треба опрацювати body
- треба обробити cookie, як і у випадку з реєстрацією

Структура тут ідентична реєстрації, тому що принцип авторизації зберігається – бекенд повертає Set-Cookie, а ми його передаємо клієнту. Наводимо одразу повний код із поясненнями:

// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '../../api';
import { parse } from 'cookie';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
// Парсимо тіло запиту
const body = await req.json();
try {
// Виконуємо запит до API
const apiRes = await api.post('auth/login', body);
// Ініціалізуємо cookieStore
const cookieStore = cookies();
// Дістаємо set-cookie з хедерів відповіді
const setCookie = apiRes.headers['set-cookie'];
if (setCookie) {
// Якщо set-cookie — масив, беремо як є, інакше примусово робимо масив
const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
// Проходимо по кожному cookie
for (const cookieStr of cookieArray) {
const parsed = parse(cookieStr);
// Створюємо опції для cookie
const options = {
expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
path: parsed.Path,
maxAge: Number(parsed['Max-Age']),
};
// Встановлюємо токени
if (parsed.accessToken) {
cookieStore.set('accessToken', parsed.accessToken, options);
}
if (parsed.refreshToken) {
cookieStore.set('refreshToken', parsed.refreshToken, options);
}
}
return NextResponse.json(apiRes.data);
}
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
} catch (error) {
return NextResponse.json(
{
error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
},
{ status: (error as ApiError).status }
)
}
}

## Підключаємо логіку на сторінку

Далі оновимо нашу сторінку /sign-in, щоб:

- Викликати функцію login()
- Обробити помилку, якщо дані неправильні
- Зробити редірект при успішному вході

// app/(auth routes)/sign-in/page.tsx

'use client';

// Додаємо імпорти
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, LoginRequest } from '@/lib/api';
import { ApiError } from '@/app/api/api'

const SignIn = () => {
const router = useRouter();
const [error, setError] = useState('');

const handleSubmit = async (formData: FormData) => {
try {
// Типізуємо дані форми
const formValues = Object.fromEntries(formData) as LoginRequest;
// Виконуємо запит
const res = await login(formValues);
// Виконуємо редірект або відображаємо помилку
if (res) {
router.push('/profile');
} else {
setError('Invalid email or password');
}
} catch (error) {
setError(
(error as ApiError).response?.data?.error ??
(error as ApiError).message ??
'Oops... some error'
)
}
};
return (

<form action={handleSubmit}>
<h1>Sign in</h1>
<label>
Email
<input type="email" name="email" required />
</label>
<label>
Password
<input type="password" name="password" required />
</label>
<button type="submit">Log in</button>
{error && <p>{error}</p>}
</form>
);
};

export default SignIn;

Підсумок

- Створили сторінку /sign-in із формою входу
- Написали функцію login() для надсилання даних
- Реалізували хендлер, що передає куки назад клієнту
- Додали редірект і обробку помилок

Користувач тепер може авторизуватися у своєму акаунті, і ми зможемо зберігати його статус у глобальному стані.

# Логаут користувача

У нашому застосунку автентифікація працює через токени, які сервер зберігає в cookie. Це дозволяє браузеру автоматично надсилати ці токени з кожним запитом, щоб сервер «пізнавав» користувача.

У нас зберігаються:

- accessToken – короткочасний токен доступу
- refreshToken – довготривалий токен для оновлення access'а

Як це працює?

- Користувач заходить на сайт і логіниться
- Сервер відповідає заголовком Set-Cookie
- Браузер автоматично зберігає ці токени
- При кожному запиті до API браузер надсилає їх назад

Перевірити cookie можна в DevTools → вкладка Application → Cookies.

Якщо ми хочемо разлогінитися, потрібна окрема кнопка. Але відображати її постійно — не дуже зручно. Так само нелогічно показувати кнопки входу чи реєстрації, якщо користувач уже авторизований. Отже, потрібен механізм, який стежитиме за станом авторизації й оновлюватиме інтерфейс. Використаємо для цього глобальний стан zustand.

## Глобальний стан авторизації

Для зручного доступу до стану авторизації з будь-якої сторінки створимо глобальний стан, який міститиме:

- булеве значення isAuthenticated
- об’єкт користувача
- методи оновлення цього стану

Створюємо новий файл:

lib/
├─ api.ts
└─ store/
├─ noteStore.ts
└─ authStore.ts <-- Новий файл

Описуємо типи та сам хук:

// lib/store/authStore.ts

import { create } from 'zustand';
import { User } from '../api';

type AuthStore = {
isAuthenticated: boolean;
user: User | null;
setUser: (user: User) => void;
clearIsAuthenticated: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
isAuthenticated: false,
user: null,
setUser: (user: User) => {
set(() => ({ user, isAuthenticated: true }));
},
clearIsAuthenticated: () => {
set(() => ({ user: null, isAuthenticated: false }));
},
}));

## Реалізація перевірки сесії

Оскільки логікою створення і перевірки токенів керує бекенд, щоб дізнатися, чи дійсні поточні токени в браузері, нам потрібно зробити GET-запит до /auth/session. У відповідь ми отримаємо або нові токени, або 401, що означає, що користувач не авторизований.

Створюємо метод checkSession:

// lib/api.ts

// попередній код

type CheckSessionRequest = {
success: boolean;
};

export const checkSession = async () => {
const res = await nextServer.get<CheckSessionRequest>('/auth/session');
return res.data.success;
};

Тепер робимо хендлер для цього запиту:

app/
└── api/
└── auth/
└── session/
└── route.ts
// app/api/auth/session/route.ts

export async function GET() {}

Але це буде не просто GET-запит – нам потрібно реалізувати наступну логіку хендлера:

- отримати поточні cookie
- дістати значення кожного токена (accessToken, refreshToken)
- якщо accessToken існує, то користувач авторизований – без запитів до API одразу повертаємо відповідь { success: true }
- якщо accessToken не існує (він «протух» і автоматично зник), перевіряємо наявність refreshToken
- якщо refreshToken не існує – повертаємо відповідь { success: false }
- якщо refreshToken існує – виконуємо запит до API для перевірки його валідності. Якщо він дійсний, бекенд поверне нову пару свіжих токенів, і їх треба засетити так само як при логіні чи реєстрації, та повернути відповідь { success: true }

// app/api/auth/session/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api } from '../../api';
import { parse } from 'cookie';

export async function GET() {
// Отримуємо інстанс для роботи з cookie
const cookieStore = await cookies();

// Дістаємо токени
const accessToken = cookieStore.get('accessToken')?.value;
const refreshToken = cookieStore.get('refreshToken')?.value;

// Якщо accessToken є — сесія валідна
if (accessToken) {
return NextResponse.json({ success: true });
}

// Якщо accessToken немає — перевіряємо refreshToken
if (refreshToken) {
// Виконуємо запит до API, передаючи всі cookie у заголовку
const apiRes = await api.get('auth/session', {
headers: {
Cookie: cookieStore.toString(), // перетворюємо cookie у рядок
},
});

    // Якщо бекенд повернув нові токени — встановлюємо їх
    const setCookie = apiRes.headers['set-cookie'];
    if (setCookie) {
      const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
      for (const cookieStr of cookieArray) {
        const parsed = parse(cookieStr);
        const options = {
          expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
          path: parsed.Path,
          maxAge: Number(parsed['Max-Age']),
        };
        if (parsed.accessToken) cookieStore.set('accessToken', parsed.accessToken, options);
        if (parsed.refreshToken) cookieStore.set('refreshToken', parsed.refreshToken, options);
      }
      return NextResponse.json({ success: true });
    }

}

// Якщо немає refreshToken або API повернув пустий setCookie — сесія невалідна
return NextResponse.json({ success: false });
}

Отже, виклик checkSession перевіряє наявність accessToken і повертає інформацію про валідність сесії, або автоматично оновлює токени за допомогою refreshToken, або повідомляє, що сесія невалідна.

Це називають silent authentication – оновлення сесії «тихо», без участі користувача.

## Отримання об’єкта користувача

Наш глобальний стан повинен знати про користувача, тому зробимо ще один запит:

// lib/api.ts

// увесь попередній код

export const getMe = async () => {
const { data } = await nextServer.get<User>('/auth/me');
return data;
};

Створюємо хендлер:

app/
└── api/
└── auth/
└── me/
└── route.ts

auth/me – це приватний маршрут в API, тому, так само як і auth/session, обов’язково має отримувати cookie:

// app/api/auth/me/route.ts

import { NextResponse } from 'next/server';
import { api, ApiError } from '../../api';
import { cookies } from 'next/headers';

export async function GET() {
const cookieStore = await cookies();

try {
const { data } = await api.get('/auth/me', {
headers: {
Cookie: cookieStore.toString(),
},
});

    return NextResponse.json(data);

} catch (error) {
return NextResponse.json(
{
error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
},
{ status: (error as ApiError).status }
)
}
}

## Провайдер авторизації

Тепер створимо провайдер AuthProvider, який:

- перевіряє сесію через checkSession
- за потреби отримує дані користувача
- оновлює глобальний стан
- скидає його, якщо сесія не валідна

// components/AuthProvider/AuthProvider.tsx

'use client';

import { checkSession, getMe } from '../lib/api';
import { useAuthStore } from '../lib/store/authStore';
import { useEffect } from 'react';

type Props = {
children: React.ReactNode;
};

const AuthProvider = ({ children }: Props) => {
const setUser = useAuthStore((state) => state.setUser);
const clearIsAuthenticated = useAuthStore((state) => state.clearIsAuthenticated);

useEffect(() => {
const fetchUser = async () => {
// Перевіряємо сесію
const isAuthenticated = await checkSession();
if (isAuthenticated) {
// Якщо сесія валідна — отримуємо користувача
const user = await getMe();
if (user) setUser(user);
} else {
// Якщо сесія невалідна — чистимо стан
clearIsAuthenticated();
}
};
fetchUser();
}, [setUser, clearIsAuthenticated]);

return children;
};

export default AuthProvider;

Додаємо цей провайдер у layout.tsx, щоб дані про авторизацію були доступні в будь-якому компоненті застосунку:

// app/layout.tsx

import AuthProvider from '@/components/AuthProvider/AuthProvider';

// попередній код...

export default function RootLayout({
children,
modal,
}: Readonly<{
children: React.ReactNode;
modal: React.ReactNode;
}>) {
return (

<html lang="en">
<body className={`${roboto.variable} ${styles.body}`}>
<TanStackProvider>
<AuthProvider> {/_ <-- додаємо провайдер _/}
<Header />
<main className={styles.main}>
{children}
{modal}
</main>
<footer className={styles.footer}>
<p>
Created <time dateTime="2025">2025</time>
</p>
</footer>
</AuthProvider> {/_ <-- додаємо провайдер _/}
</TanStackProvider>
</body>
</html>
);
}

## Динамічна навігація в хедері

Щоб змінювати відображення кнопок у хедері залежно від статусу авторизації, створюємо окремий клієнтський компонент AuthNavigation:

// components/AuthNavigation/AuthNavigation.tsx

'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store/authStore'

const AuthNavigation = () => {
// Отримуємо поточну сесію та юзера
const { isAuthenticated, user } = useAuthStore();

const handleLogout = () => {};

// Якщо є сесія - відображаємо Logout та інформацію про користувача
// інакше - посилання на логін та реєстрацію
return isAuthenticated ? (

<li>
<p>{user?.email}</p>
<button onClick={handleLogout}>Logout</button>
</li>
) : (
<>
<li>
<Link href="/sign-in">Login</Link>
</li>
<li>
<Link href="/sign-up">Sign up</Link>
</li>
</>
);
};

export default AuthNavigation;

І додаємо його у хедер:

// components/Header/Header.tsx

import Link from 'next/link';
import CategoriesMenu from '../CategoriesMenu/CategoriesMenu';
import AuthNavigation from '../AuthNavigation/AuthNavigation';

const Header = async () => {
const categories = await getCategories()
return (

<header>
<Link href="/" aria-label="Home">
NoteHub
</Link>
<nav aria-label="Main Navigation">
<ul>
<li>
<CategoriesMenu categories={categories} />
</li>
<li>
<Link href="/profile">Profile</Link>
</li>
<li>
<Link href="/about">About</Link>
</li>
{/_ Відображаємо компонент _/}
<AuthNavigation />
</ul>
</nav>
</header>
);
};

export default Header;

## Логіка логауту

Що потрібно зробити для правильного виходу користувача:

- запит до API
- хендлер запиту
- очищення глобального стану
- редірект на сторінку авторизації

Створюємо метод:

// lib/api.ts

// попередній код

export const logout = async (): Promise<void> => {
await nextServer.post('/auth/logout')
};

Хендлер:

app/
└── api/
└── auth/
└── logout/
└── route.ts
// app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api } from '../../api';

export async function POST() {
// Передаємо поточні cookie до API
const cookieStore = await cookies();
await api.post('auth/logout', {
headers: {
Cookie: cookieStore.toString(),
},
});

// Очищаємо токени після запиту
cookieStore.delete('accessToken');
cookieStore.delete('refreshToken');

return NextResponse.json({ message: 'Logged out successfully' });
}

Оновлюємо AuthNavigation, щоб додати справжню дію логауту до handleLogout:

// components/AuthNavigation/AuthNavigation.tsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { logout } from '@/lib/api';

const AuthNavigation = () => {
const router = useRouter();
// Отримуємо поточну сесію та юзера
const { isAuthenticated, user } = useAuthStore();
// Отримуємо метод очищення глобального стану
const clearIsAuthenticated = useAuthStore(
(state) => state.clearIsAuthenticated,
);

const handleLogout = async () => {
// Викликаємо logout
await logout();
// Чистимо глобальний стан
clearIsAuthenticated();
// Виконуємо навігацію на сторінку авторизації
router.push('/sign-in');
};

// Якщо є сесія - відображаємо кнопку Logout та інформацію про користувача
// інакше - лінки для авторизації
return isAuthenticated ? (

<li>
<p>{user?.email}</p>
<button onClick={handleLogout}>Logout</button>
</li>
) : (
<>
<li>
<Link href="/sign-in">Login</Link>
</li>
<li>
<Link href="/sign-up">Sign up</Link>
</li>
</>
);
};

export default AuthNavigation;

## Оновлення сторінок логіну та реєстрації

Щоб після успішної авторизації глобальний стан відразу зберігав користувача, додаємо туди setUser.

Сторінка реєстрації:

// app/(auth routes)/sign-up/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register, RegisterRequest } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { ApiError } from '@/app/api/api'

const SignUp = () => {
const router = useRouter();
const [error, setError] = useState('');
// Отримуємо метод із стора
const setUser = useAuthStore((state) => state.setUser)

const handleSubmit = async (formData: FormData) => {
try {
const formValues = Object.fromEntries(formData) as RegisterRequest;
const res = await register(formValues);
if (res) {
// Записуємо користувача у глобальний стан
setUser(res)
router.push('/profile');
} else {
setError('Invalid email or password');
}
} catch (error) {
setError(
(error as ApiError).response?.data?.error ??
(error as ApiError).message ??
'Oops... some error'
)
}
};

return (
<>

<h1>Sign up</h1>
<form action={handleSubmit}>
<label>
Username
<input type="text" name="userName" required />
</label>
<label>
Email
<input type="email" name="email" required />
</label>
<label>
Password
<input type="password" name="password" required />
</label>
<button type="submit">Register</button>
</form>
{error && <p>{error}</p>}
</>
);
};

export default SignUp;

Сторінка логіна:

// app/(auth routes)/sign-in/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, LoginRequest } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { ApiError } from '@/app/api/api'

const SignIn = () => {
const router = useRouter();
const [error, setError] = useState('');
// Отримуємо метод із стора
const setUser = useAuthStore((state) => state.setUser)

const handleSubmit = async (formData: FormData) => {
try {
const formValues = Object.fromEntries(formData) as LoginRequest;
const res = await login(formValues);
if (res) {
// Записуємо користувача у глобальний стан
setUser(res)
router.push('/profile');
} else {
setError('Invalid email or password');
}
} catch (error) {
setError(
(error as ApiError).response?.data?.error ??
(error as ApiError).message ??
'Oops... some error'
)
}
};

return (

<form action={handleSubmit}>
<h1>Sign in</h1>
<label>
Email
<input type="email" name="email" required />
</label>
<label>
Password
<input type="password" name="password" required />
</label>
<button type="submit">Log in</button>
{error && <p>{error}</p>}
</form>
);
};

export default SignIn;

Підсумок

- Токени зберігаються в cookie та автоматично відправляються серверу
- При завершенні дії accessToken виконується silent authentication
- Стан авторизації та дані користувача зберігаються у глобальному стора
- Після логіну, реєстрації чи логауту – оновлюємо глобальний стан сесії.

# Помилка під час попереднього рендеру

Розглянемо дуже цікавий момент, який виникає при використанні Next Route Handlers. Якщо запустити збірку проєкту (next build), вона може завершитися помилкою. Повідомлення виглядає приблизно так:

Error occurred prerendering page "тут може бути будь-яка сторінка". Read more: https://nextjs.org/docs/messages/prerender-error
AggregateError:

У чому суть проблеми?

- Під час білду Next намагається попередньо відрендерити (предзавантажити) усі сторінки, які тільки можливо. - Якщо на цих сторінках є запити всередині компонентів, Next виконає їх ще під час збірки. І найголовніше – ці запити не повинні завершуватися помилкою, інакше білд впаде.

Чому ж у нас виникає проблема?

Усі наші запити йдуть через Next Route Handlers – тобто сам Next звертається до свого ж сервера. Але під час білду цей сервер ще не запущений, тому відповіді він віддати не може, і Next отримує помилку.

У більшості наших сторінок, де використовуються запити, ми застосовуємо асинхронні компоненти. Це дає Next зрозуміти, що сторінка є динамічним SSR-маршрутом, і він не намагається її предрендерити під час збірки. Тому там проблем немає.

Але є виняток – наш RootLayout.

У RootLayout ми маємо синхронний компонент, усередині якого імпортується асинхронний Header. А цей Header викликає запит за категоріями. Тобто:

- RootLayout – синхронний
- Header – асинхронний (отримує дані категорій)

Внаслідок цього Next намагається під час білду відрендерити RootLayout, заходить усередину Header, а той намагається зробити запит – і білд ламається, бо сервер ще не працює.

Як виправити?

Маємо два варіанти:

1. Зробити Header повністю клієнтським компонентом
2. Винести отримання категорій у клієнтський компонент, який рендериться всередині Header

Другий варіант — кращий, адже дає змогу зберегти SSR для всього RootLayout і винести тільки дані для меню в клієнт.

## Оновлюємо Header

Ми приберемо з Header виклик getCategories:

// components/Header/Header.tsx

import css from './Header.module.css';
import Link from 'next/link';
import CategoriesMenu from '../CategoriesMenu/CategoriesMenu';
import AuthNavigation from '../AuthNavigation/AuthNavigation';

const Header = () => {
// Прибираємо запит
// const categories = await getCategories()

return (

<header className={css.header}>
<Link href='/' aria-label='Home'>
Note HUB
</Link>
<nav aria-label='Main Navigation'>
<ul className={css.navigation}>
<li>
<Link href='/'>Home</Link>
</li>
<li>
{/_ Пропс categories тепер не приходять з SSR _/}
<CategoriesMenu />
</li>
<li>
<Link href='/profile'>Profile</Link>
</li>
<li>
<Link href='/about'>About</Link>
</li>
<AuthNavigation />
</ul>
</nav>
</header>
);
};

export default Header;

## Оновлюємо CategoriesMenu

Робимо його клієнтським і саме тут виконуємо запит за допомогою useEffect:

// components/CategoriesMenu/CategoriesMenu.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Category, getCategories } from '@/lib/api'
import css from './CategoriesMenu.module.css'

const CategoriesMenu = () => {
const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false)

const toggle = () => setIsOpen(!isOpen);

    // Додаємо стан

const [categories, setCategories] = useState<Category[]>([]);

    // Додаємо ефект для запиту
    useEffect(() => {
    	// Змінюємо стан
    	getCategories().then(data => setCategories(data));

}, []);

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
}

export default CategoriesMenu;

Таким чином:

RootLayout лишається синхронним і його можна без проблем передрендерити під час білда
самі дані категорій тепер завантажуються вже на клієнті, коли користувач відкриває сторінку
Тепер помилки при попередньому рендері більше не буде.

Підсумок

- Next під час збірки намагається попередньо відрендерити усі синхронні сторінки
- Якщо всередині таких сторінок виконується запит до ще не запущеного сервера — отримаємо помилку
- Ми винесли запит до категорій у клієнтський компонент
- Завдяки цьому SSR-білд проходить без помилок.

# Middleware

Наступне завдання – обмежити доступ до сторінки /profile лише для авторизованих користувачів. Тобто зробити її приватною.

Це означає, що лише користувач із токенами в cookie має бачити цю сторінку. Усі інші будуть автоматично перенаправлені на сторінку входу (/sign-in).

Для цього скористаємося механізмом middleware — це спеціальна функція, яка виконується до того, як сторінка буде показана користувачеві. Вона спрацьовує навіть раніше, ніж SSR (server-side rendering).

## Створення middleware.ts

У корені проєкту створюємо файл middleware.ts.

У цьому файлі:

Експортуємо саму функцію middleware.
Додаємо об'єкт config, у якому вказуємо маршрути, до яких застосовується middleware.

// middleware.ts
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {}

export const config = {};

Для зручності створимо масив приватних маршрутів:

// middleware.ts
import { NextRequest } from 'next/server';

const privateRoutes = ['/profile'];

export async function middleware(request: NextRequest) {}

export const config = {};

Як працює middleware?

Коли користувач переходить на певну сторінку:

- Браузер надсилає запит до сервера Next.js.
- Next.js запускає middleware і передає функції об'єкт request.
- request містить всю важливу інформацію: шлях, cookie, заголовки тощо.
- Ми можемо перевірити наявність токенів і вирішити – дозволити доступ чи перенаправити користувача.

⚠️ Зверніть увагу!
Вам не потрібно запам’ятовувати чи повністю від руки писати весь код middleware.ts, тому що він має доволі стандартну структуру. Головне – розуміти, які саме його частини відповідають за список приватних маршрутів, маршрутів аутентифікації, редіректи та перевірку токенів. У проєкті ви завжди зможете просто скопіювати цей шаблон і налаштувати його під свої власні маршрути.

## Отримання токенів із cookie

// middleware.ts

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers'

const privateRoutes = ['/profile'];

export async function middleware(request: NextRequest) {
const cookieStore = await cookies()
const accessToken = cookieStore.get('accessToken')?.value
const refreshToken = cookieStore.get('refreshToken')?.value
}

export const config = {};

## Отримання поточного шляху

Шлях, на який користувач намагається потрапити, зберігається у request.nextUrl.pathname.

// middleware.ts

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const privateRoutes = ['/profile']

export async function middleware(request: NextRequest) {
const cookieStore = await cookies()
const accessToken = cookieStore.get('accessToken')?.value
const refreshToken = cookieStore.get('refreshToken')?.value

    // Шлях, на який користувач намагається перейти

const { pathname } = request.nextUrl

const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route))

}

export const config = {};

Тепер потрібно реалізувати наступну логіку:

Якщо це приватний маршрут

1. Якщо accessToken є – надаємо доступ
2. Якщо accessToken немає – перевіряємо refreshTokenЯкщо refreshToken теж немає – перенаправляємо на /sign-in

Якщо це маршрут аутентифікації – просто надаємо доступ

Ми вже знаємо про клас NextResponse. За його допомогою будемо робити редірект або дозволяти доступ до маршруту.

// middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const privateRoutes = ['/profile'];

export async function middleware(request: NextRequest) {
const cookieStore = await cookies();
const accessToken = cookieStore.get('accessToken')?.value;
const refreshToken = cookieStore.get('refreshToken')?.value;

// Шлях, на який користувач намагається перейти
const { pathname } = request.nextUrl;

const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));

if (isPrivateRoute) {
if (!accessToken) {
if (refreshToken) {
// тут будемо пізніше додавати silent authentication
}

      // немає жодного токена — редірект на сторінку входу
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

}

// маршрут аутентифікації або accessToken є — дозволяємо доступ
return NextResponse.next();
}

export const config = {};

## Відокремлення серверних запитів

Тепер, якщо є refreshToken, потрібно реалізувати silent authentication так само як ми це робили в AuthProvider. Але просто викликати checkSession не можна, бо він використовувався лише у клієнтських компонентах, де браузер автоматично додавав cookie.

Middleware виконується на сервері Next, тож cookie потрібно передати вручну.

Щоб це реалізувати, створимо новий метод – подібний до checkSession, але з можливістю встановлювати cookie.

Цей метод не можна створювати у файлі lib/api.ts, бо там функції працюють у клієнті, а cookies() із next/headers доступні лише у серверних компонентах.

Тому структуруємо так.

Створюємо папку lib/api та два файли: clientApi.ts та serverApi.ts
Файл api.ts теж переносимо у папку api.

Усі методи з api.ts переносимо в clientApi.ts.

// lib/api/clientApi.ts

import { nextServer } from './api';

// Далі вся типізація і функції запитів

У самому api.ts залишаємо тільки інстанс nextServer.

// lib/api/api.ts

import axios from 'axios';

export const nextServer = axios.create({
baseURL: 'http://localhost:3000/api',
withCredentials: true, // дозволяє axios працювати з cookie
});

Таким чином маємо спільний інстанс Axios, але окремі файли для клієнтських і серверних методів.

## Серверна перевірка сесії

У serverApi.ts створюємо метод checkServerSession:

// lib/api/serverApi.ts

import { cookies } from 'next/headers';
import { nextServer } from './api';

export const checkServerSession = async () => {
// Дістаємо поточні cookie
const cookieStore = await cookies();
const res = await nextServer.get('/auth/session', {
headers: {
// передаємо кукі далі
Cookie: cookieStore.toString(),
},
});
// Повертаємо повний респонс, щоб middleware мав доступ до нових cookie
return res;
};

Логіка хендлера auth/session не змінюється

## Оновлення логіки middleware

Тепер додаємо виклик checkServerSession у middleware й обробляємо відповідь так само як у хендлері auth/session:

// middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parse } from 'cookie';
import { checkServerSession } from './lib/api/serverApi';

const privateRoutes = ['/profile'];

export async function middleware(request: NextRequest) {
const cookieStore = await cookies();
const accessToken = cookieStore.get('accessToken')?.value;
const refreshToken = cookieStore.get('refreshToken')?.value;

    // Шлях, на який користувач намагається перейти

const { pathname } = request.nextUrl;
const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));

if (isPrivateRoute) {
if (!accessToken) {
if (refreshToken) {
// Отримуємо нові cookie
const data = await checkServerSession();
const setCookie = data.headers['set-cookie'];

        if (setCookie) {
          const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
          for (const cookieStr of cookieArray) {
            const parsed = parse(cookieStr);
            const options = {
              expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
              path: parsed.Path,
              maxAge: Number(parsed['Max-Age']),
            };
            if (parsed.accessToken) cookieStore.set('accessToken', parsed.accessToken, options);
            if (parsed.refreshToken) cookieStore.set('refreshToken', parsed.refreshToken, options);
          }

          // важливо — передаємо нові cookie далі, щоб оновити їх у браузері
          return NextResponse.next({
            headers: {
              Cookie: cookieStore.toString(),
            },
          });
        }
      }

      // немає жодного токена — редірект на сторінку входу
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

}

// маршрут аутентифікації або accessToken є — дозволяємо доступ
return NextResponse.next();
}

export const config = {};

## Налаштування config

У config вказуємо, для яких маршрутів має запускатися middleware. Для цього служить властивість matcher:

// middleware.ts

// попередній код без змін...

export const config = {
matcher: ['/profile'],
};

## Проблема з маршрутами аутентифікації

Наразі користувач може перейти на /sign-in або /sign-up, навіть якщо вже авторизований. Це не зовсім зручно – краще одразу перенаправити його на головну.

Що робимо:

- створюємо масив маршрутів аутентифікації;
- перевіряємо: якщо користувач має токен і намагається зайти на маршрут аутентифікації – перенаправляємо на головну;
- додаємо ці маршрути в matcher.

// middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parse } from 'cookie';
import { checkServerSession } from './lib/api/serverApi';

const privateRoutes = ['/profile'];
const authRoutes = ['/sign-in', '/sign-up'];

export async function middleware(request: NextRequest) {
const { pathname } = request.nextUrl;
const cookieStore = await cookies();
const accessToken = cookieStore.get('accessToken')?.value;
const refreshToken = cookieStore.get('refreshToken')?.value;

const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));

if (!accessToken) {
if (refreshToken) {
// Якщо accessToken відсутній, але є refreshToken — потрібно перевірити сесію навіть для маршруту аутентифікації,
// адже сесія може залишатися активною, і тоді потрібно заборонити доступ до маршруту аутентифікації.
const data = await checkServerSession();
const setCookie = data.headers['set-cookie'];

      if (setCookie) {
        const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
        for (const cookieStr of cookieArray) {
          const parsed = parse(cookieStr);
          const options = {
            expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
            path: parsed.Path,
            maxAge: Number(parsed['Max-Age']),
          };
          if (parsed.accessToken) cookieStore.set('accessToken', parsed.accessToken, options);
          if (parsed.refreshToken) cookieStore.set('refreshToken', parsed.refreshToken, options);
        }
        // Якщо сесія все ще активна:
        // для приватного маршруту — виконуємо редірект на головну.
        if (isAuthRoute) {
          return NextResponse.redirect(new URL('/', request.url), {
            headers: {
              Cookie: cookieStore.toString(),
            },
          });
        }
        // для приватного маршруту — дозволяємо доступ
        if (isPrivateRoute) {
          return NextResponse.next({
            headers: {
              Cookie: cookieStore.toString(),
            },
          });
        }
      }
    }
    // Якщо refreshToken або сесії немає:
    // маршрут аутентифікації — дозволяємо доступ
    if (isAuthRoute) {
      return NextResponse.next();
    }

    // приватний маршрут — редірект на сторінку входу
    if (isPrivateRoute) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

}

// Якщо accessToken існує:
// приватний маршрут — виконуємо редірект на головну
if (isAuthRoute) {
return NextResponse.redirect(new URL('/', request.url));
}
// приватний маршрут — дозволяємо доступ
if (isPrivateRoute) {
return NextResponse.next();
}
}

export const config = {
matcher: ['/profile/:path*', '/sign-in', '/sign-up'],
};

## Проблеми на продакшені

Middleware дуже любить кешувати дані для оптимізації, але це може зашкодити. Наприклад, після виходу користувача з системи сторінка профілю іноді залишається доступною, бо потрапляє у кеш.

Щоб це виправити, у маршрути аутентифікації додаємо клієнтський layout, який виконає програмний refresh і очистить кеш.

// app/(auth routes)/layout.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
const [loading, setLoading] = useState(true);

const router = useRouter();

useEffect(() => {
// refresh викличе перезавантаження даних
router.refresh();
setLoading(false);
}, [router]);

return <>{loading ? <div>Loading...</div> : children}</>;
}

Підсумок

- middleware – функція, яка виконується перед рендерингом і може захистити сторінки.
- request – об'єкт із даними запиту.
- accessToken / refreshToken – токени в cookie, що підтверджують авторизацію.
- authRoutes – маршрути, доступні лише для неавторизованих користувачів.
- privateRoutes – маршрути, доступні лише для авторизованих.
- matcher – перелік маршрутів, для яких middleware має спрацьовувати.

# Приватні запити

Сторінка профілю та сторінка його редагування повинні отримувати дані користувача з API, і це має працювати ще до того, як сторінка потрапить у браузер. Тому потрібно налаштувати серверні запити, які будуть виконуватися вже під час першого завантаження сторінки на сервері.

Сторінки профілю (/profile) та редагування профілю (/profile/edit) є приватними. Для більш логічної структури винесемо їх у папку (private routes):

Тепер на сторінці /profile треба зробити запит до API для отримання даних користувача.

Ми вже маємо метод getMe, але він працює у клієнтських компонентах, а сторінка профілю є серверною. Отже, будемо дотримуватися такої логіки:

клієнтські та публічні запити зберігаються у файлі clientApi.ts;
серверні (приватні) запити, які вимагають cookie ще до завантаження в браузері, мають бути в serverApi.ts і передавати cookie вручну.

## Створюємо серверну функцію запиту

Створимо серверну функцію getServerMe, яка робить запит до /auth/me:

// lib/api/serverApi.ts

import { cookies } from 'next/headers';
import { nextServer } from './api';
import { User } from './clientApi';

// ...попередній код

export const getServerMe = async (): Promise<User> => {
const cookieStore = await cookies();
const { data } = await nextServer.get('/auth/me', {
headers: {
Cookie: cookieStore.toString(),
},
});
return data;
};

Імпортуємо її у сторінку профілю:

// app/(private routes)/profile/page.tsx

import Link from 'next/link';
import { getServerMe } from '@/lib/api/serverApi';

const Profile = async () => {
const user = await getServerMe();

return (

<section>
<div>
<h1>My Profile</h1>
<Link href="/profile/edit">Edit profile</Link>
</div>
<div>
<h2>Name: {user.userName}</h2>
<h2>Email: {user.email}</h2>
<p>
Some description: Lorem ipsum dolor sit amet consectetur adipisicing elit...
</p>
</div>
</section>
);
};

export default Profile;

Для усіх майбутніх приватних запитів, які мають викликатися у серверних компонентах, потрібно створювати окремі методи в serverApi.ts – за тим самим принципом, як ми зробили для getServerMe.

Підсумок

- SSR-сторінки рендеряться на сервері Next до потрапляння у браузер, тому не мають доступу до cookie, які зберігаються безпосередньо у браузері.
- Нам потрібно дістати токени вручну через cookies() і передати їх самостійно.
- Завдяки цьому SSR-сторінка може виконувати приватні запити з куками, не перетворюючи її на клієнтську.

# Завантаження зображень

У нашого користувача є поле photoUrl, а API підтримує /upload, отже потрібно реалізувати інтерфейс для перегляду, завантаження, зміни та видалення фото профілю.

## Створюємо компонент AvatarPicker

Спершу зробимо базовий варіант без логіки – просто кнопку для вибору фото. У папці components/AvatarPicker створюємо AvatarPicker.tsx:

// components/AvatarPicker/AvatarPicker.tsx

'use client';

const AvatarPicker = () => {
return (

<div>
<label>
📷 Choose photo
<input type="file" accept="image/*" />
</label>
</div>
);
};

export default AvatarPicker;

Цей інпут має type="file" і приймає лише зображення – завдяки accept="image/\*".

## Додаємо обробник події

Далі додамо обробник на зміну файлу:

// components/AvatarPicker/AvatarPicker.tsx

'use client';

const AvatarPicker = () => {
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
console.log('file', file);
};

return (

<div>
<label>
📷 Choose photo
<input type='file' accept='image/*' onChange={handleFileChange} />
</label>
</div>
);
};

export default AvatarPicker;

## Додаємо перевірки типу та розміру

Використаємо useState для помилки та додамо перевірки:

- чи це дійсно зображення;
- чи не перевищує розмір 5MB.

// components/AvatarPicker/AvatarPicker.tsx

'use client';

import { useState } from 'react';

const AvatarPicker = () => {
const [error, setError] = useState('');

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
setError('');

    if (file) {
      // Перевіряємо тип файлу
      if (!file.type.startsWith('image/')) {
        setError('Only images');
        return;
      }

      // Перевіряємо розмір файлу (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Max file size 5MB');
        return;
      }
    }

};

return (

<div>
<label>
📷 Choose photo
<input type="file" accept="image/*" onChange={handleFileChange} />
</label>
{error && <p>{error}</p>}
</div>
);
};

export default AvatarPicker;

## Відображаємо превʼю

Використаємо FileReader, щоб створити превʼю для обраного файлу:

- додаємо стан для збереження previewUrl
- для отримання url з файлу використовуємо FileReader
- створюємо екземпляр FileReader
- в метод onloadend додаємо логіку оновлення стану previewUrl
- викликаємо readAsDataURL передаючи у нього файл

// components/AvatarPicker/AvatarPicker.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';

const AvatarPicker = () => {
const [previewUrl, setPreviewUrl] = useState('');
const [error, setError] = useState('');

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
setError('');

    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Only images');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Max file size 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

};

return (

<div>
{/_ Відображаємо прев'ю якщо зображення існує _/}
{previewUrl ? (
<Image src={previewUrl} alt='Preview' width={300} height={300} />
) : (
<label>
📷 Choose photo
<input type='file' accept='image/*' onChange={handleFileChange} />
</label>
)}
{error && <p>{error}</p>}
</div>
);
};

export default AvatarPicker;

## Підключаємо на сторінку EditProfile

Додаємо цей компонент:

// app/(private routes)/profile/edit/page.tsx

import AvatarPicker from '@/components/AvatarPicker/AvatarPicker';

const EditProfile = () => {
return (

<div>
<h1>Edit profile</h1>
<AvatarPicker />
</div>
);
};

export default EditProfile;

Тепер у нас є можливість вибрати фото і побачити його превʼю, а далі ми реалізуємо редагування і видалення фото через зовнішню форму, яка буде відповідати за редагування всього профілю.

## Пропс зображення

Додаємо AvatarPicker проп profilePhotoUrl, тобто посилання на фото, яке бекенд повертає при завантаженні сторінки або оновленні. Через useEffect запишемо це значення в стан.

// components/AvatarPicker/AvatarPicker.tsx

// попередній код...

type Props = {
profilePhotoUrl?: string;
};

const AvatarPicker = ({ profilePhotoUrl }: Props) => {
const [previewUrl, setPreviewUrl] = useState<string>('');
const [error, setError] = useState<string>('');

useEffect(() => {
if (profilePhotoUrl) {
setPreviewUrl(profilePhotoUrl);
}
}, [profilePhotoUrl]);

// решта коду
};

## Додаткова розмітка

Розширимо розмітку, щоб користувач міг перезавантажувати або видаляти фото (стилі можуть бути будь-які):

// components/AvatarPicker/AvatarPicker.tsx

// попередній код...

const handleRemove = () => {
setPreviewUrl('');
};

return (

<div>
<div className={css.picker}>
{previewUrl && (
<Image
            src={previewUrl}
            alt="Preview"
            width={300}
            height={300}
            className={css.avatar}
          />
)}
<label className={previewUrl ? `${css.wrapper} ${css.reload}` : css.wrapper}>
📷 Choose photo
<input type="file" accept="image/*" onChange={handleFileChange} className={css.input} />
</label>
{previewUrl && (
<button className={css.remove} onClick={handleRemove}>
❌
</button>
)}
</div>
{error && <p className={css.error}>{error}</p>}
</div>
);
};

## Форма редагування профілю

Тепер додамо на сторінку EditProfile форму редагування профілю. Створюємо метод в clientApi.ts:

// lib/api/clientApi.ts

// попередній код...

export type UpdateUserRequest = {
userName?: string;
photoUrl?: string;
};

export const updateMe = async (payload: UpdateUserRequest) => {
const res = await nextServer.put<User>('/auth/me', payload);
return res.data;
};

Створюємо хендлер для updateMe:

// app/api/auth/me/route.ts

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { api, ApiError } from '../api';

// Решта коду для GET

export async function PUT(request: Request) {
const cookieStore = await cookies();
const body = await request.json();
try {
const { data } = await api.put('/auth/me', body, {
headers: {
Cookie: cookieStore.toString(),
},
});
return NextResponse.json(data);

} catch (error) {
return NextResponse.json(
{
error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
},
{ status: (error as ApiError).status }
)
}
}

Додаємо форму зі станом та слухачами:

// app/(private routes)/profile/edit/page.tsx

'use client'

import { useState } from 'react'
import AvatarPicker from '@/components/AvatarPicker/AvatarPicker'
import { updateMe } from '@/lib/api/clientApi';

const EditProfile = () => {
const [userName, setUserName] = useState('')

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
setUserName(event.target.value);
};

const handleSaveUser = async (event: React.FormEvent<HTMLFormElement>) => {
event.preventDefault();
await updateMe({ userName, photoUrl: "" });
};

return (

<div>
<h1>Edit Profile</h1>
<AvatarPicker />
<form onSubmit={handleSaveUser}>
<input type="text" value={userName} onChange={handleChange} />
<button type="submit">Save user</button>
</form>
</div>
);
}

export default EditProfile;

Додаємо логіку getMe у поточну сторінку:

// app/(private routes)/profile/edit/page.tsx

'use client'

import { useEffect, useState } from 'react';
import AvatarPicker from '@/components/AvatarPicker/AvatarPicker';
import { getMe, updateMe } from '@/lib/api/clientApi';

const EditProfile = () => {
const [userName, setUserName] = useState('');
const [photoUrl, setPhotoUrl] = useState('');

    useEffect(() => {
    getMe().then((user) => {
      setUserName(user.userName ?? '');
      setPhotoUrl(user.photoUrl ?? '');
    });

}, []);

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
setUserName(event.target.value);
};

const handleSaveUser = async (event: React.FormEvent<HTMLFormElement>) => {
event.preventDefault();
await updateMe({ userName, photoUrl });
};

return (

<div>
<h1>Edit profile</h1>
<br />
<AvatarPicker profilePhotoUrl={photoUrl} />
<br />
<form onSubmit={handleSaveUser}>
<input type='text' value={userName} onChange={handleChange} />
<br />
<button type='submit'>Save user</button>
</form>
</div>
)
}

export default EditProfile;

## Поєднуємо редагування та AvatarPicker

У компоненті EditProfile додамо стан для вибраного файлу, щоб передати його в AvatarPicker:

// app/(private routes)/profile/edit/page.tsx

'use client';

import { useEffect, useState } from 'react';
import AvatarPicker from '@/components/AvatarPicker/AvatarPicker';
import { getMe, updateMe } from '@/lib/api/clientApi';

const EditProfile = () => {
const [userName, setUserName] = useState('');
const [photoUrl, setPhotoUrl] = useState('');
const [imageFile, setImageFile] = useState<File | null>(null);

// ...

return (

<div>
<h1>Edit profile</h1>
<AvatarPicker profilePhotoUrl={photoUrl} onChangePhoto={setImageFile} />
{/_ Решта коду без змін _/}

У самому компоненті AvatarPicker:

- оновлюємо пропси
- викликаємо onChangePhoto при зміні та видаленні файлу

// compoentns/AvatarPicker/AvatarPicker.tsx

import Image from 'next/image';
import { ChangeEvent, useState, useEffect } from 'react';
import css from './AvatarPicker.module.css';

type Props = {
onChangePhoto: (file: File | null) => void;
profilePhotoUrl?: string;
};

const AvatarPicker = ({ profilePhotoUrl, onChangePhoto }: Props) => {
// ...

const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0]
setError('')

    if (file) {
      // Перевіримо тип файлу
      if (!file.type.startsWith('image/')) {
        setError('Only images')
        return
      }

      // Перевіримо розмір файлу (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Max file size 5MB')
        return
      }

      onChangePhoto(file) // передаємо файл у батьківський компонент

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

}

const handleRemove = () => {
onChangePhoto(null) // очищуємо батьківський стан
setPreviewUrl('')
}

// ...

## Завантаження на сервер

Тепер у компоненті EditProfile додамо завантаження файлу на сервер. Додаємо у clientApi.ts метод для завантаження файлу:

// lib/api/clientApi.ts

// попередній код...

export const uploadImage = async (file: File): Promise<string> => {
const formData = new FormData();
formData.append('file', file);
const { data } = await nextServer.post('/upload', formData);
return data.url;
};

Створюємо хендлер:

// app/api/upload/route.ts

import { NextResponse } from 'next/server';
import { api, ApiError } from '../api';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
const cookieStore = await cookies();
try {
const formData = await request.formData();

      const { data } = await api.post('/upload', formData, {
        headers: {
          Cookie: cookieStore.toString(),
        },
      });


    return NextResponse.json(data);

} catch (error) {
return NextResponse.json(
{
error: (error as ApiError).response?.data?.error ?? (error as ApiError).message,
},
{ status: (error as ApiError).status }
)
}
}

У EditProfile отримаємо у відповідь url файлу та передамо цей url як нове значення ключа photoUrl у користувача.

// app/(private routes)/profile/edit/page.tsx

import { updateMe, getMe, uploadImage } from '@/lib/api/clientApi';

// ...

const handleSaveUser = async (event: React.FormEvent<HTMLFormElement>) => {
event.preventDefault();
try {
const newPhotoUrl = imageFile ? await uploadImage(imageFile) : '';
await updateMe({ userName, photoUrl: newPhotoUrl });
} catch (error) {
console.error('Oops, some error:', error);
}
};

// ...

При спробі завантажити та переглянути аватар ви побачите приблизно таку помилку. Проблема в тому, що бекенд, який ми використовуємо, зберігає зображення на окремому ресурсі aliiev-lomach.com, і компонент Image не може його відобразити.

Виправити це можна, просто додавши ще один запис до remotePatterns у конфігурації next.config.ts:

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
images: {
remotePatterns: [
{ protocol: 'https', hostname: 'picsum.photos' },
{ protocol: 'https', hostname: 'aliiev-lomach.com' },
],
},
};

export default nextConfig;

У проєктах файли зображень зазвичай зберігаються на окремих сервісах чи CDN, тому для їх коректного відображення потрібно обов’язково додавати відповідні домени у конфігурацію Next.
