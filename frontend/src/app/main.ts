import { vMaska } from 'maska/vue';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import './styles/index.scss';

const app = createApp(App);
const pinia = createPinia();

app.directive('maska', vMaska);
app.use(pinia);
app.use(router);
app.mount('#app');
