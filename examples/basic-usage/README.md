# Пример базового использования

Этот пример демонстрирует базовую конфигурацию генератора API клиента.

## Конфигурация

Файл `config.ts` содержит пример конфигурации с:

- Фильтрацией по тегам
- Генерацией нескольких классов по тегам
- Генерацией конфигурации axios
- Поддержкой распыления пользовательских конфигураций

## Запуск

```bash
# Из корня проекта
api-docs-generator --config examples/basic-usage/config.ts

# Или через npx
npx @paulpugovkin/api-docs-axios-ts-generator --config examples/basic-usage/config.ts
```

## Результат

После генерации будет создана следующая структура:

```
src/api/
├── config/
│   └── axios/
│       └── axios.ts
├── interfaces/
│   ├── User.ts
│   ├── Product.ts
│   └── index.ts
├── classes/
│   ├── UsersApi.ts
│   ├── ProductsApi.ts
│   └── index.ts
└── index.ts
```

## Использование

```typescript
import { UsersApi, ProductsApi } from './src/api';

const usersApi = new UsersApi();
const productsApi = new ProductsApi();

// Получение пользователя
const user = await usersApi.getUserById(123);

// С пользовательской конфигурацией
const user = await usersApi.getUserById(123, {
  headers: {
    'X-Custom-Header': 'value',
  },
  timeout: 5000,
});
```
