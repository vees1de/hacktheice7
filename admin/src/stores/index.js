import { createPinia, setActivePinia } from "pinia";

export const pinia = createPinia();

// Устанавливаем pinia как активную для случаев, когда сторы вызываются вне контекста приложения (например, в router)
setActivePinia(pinia);
