// Тонкая обёртка. Сейчас всё уходит в mockApi, при замене на реальный бэкенд — правим тут.
import * as mock from "./mockApi";
export const api = mock;
// Реэкспорт ВСЕХ функций как именованные экспорты
export * from "./mockApi";

// И дополнительный неймспейс-экспорт, если где-то удобно вызывать через api.*
// export * as api from "./mockApi";
