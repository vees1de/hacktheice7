import { vMaska } from 'maska/vue';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import './styles/index.scss';
import { useThemeStore } from '@shared/stores/theme.store';

const app = createApp(App);
const pinia = createPinia();

app.directive('maska', vMaska);
app.use(pinia);

const themeStore = useThemeStore(pinia);
themeStore.init();

app.use(router);
app.mount('#app');

const loader = document.getElementById('boot-loader');
if (loader?.parentNode) {
  loader.parentNode.removeChild(loader);
}
