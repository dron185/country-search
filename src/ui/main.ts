import { SearchController, type AppState } from '../app/search-controller.js';

const app = document.createElement('div');
app.className = 'app';
document.body.append(app);

// Шапка
const header = document.createElement('header');
const title = document.createElement('h1');
title.textContent = 'Country Search';
const input = document.createElement('input');
input.type = 'text';
input.placeholder = 'Введите название страны...';
input.className = 'search-input';
header.append(title, input);
app.append(header);

// Контейнер для контента
const content = document.createElement('main');
content.className = 'content';
app.append(content);

function render(state: AppState) {
  content.replaceChildren(); // Безопасная очистка (без innerHTML)

  if (state.status === 'idle') {
    const p = document.createElement('p');
    p.textContent = 'Начните вводить название страны';
    p.className = 'hint';
    content.append(p);
  } else if (state.status === 'loading') {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.textContent = 'Загрузка...';
    content.append(loader);
  } else if (state.status === 'empty') {
    const p = document.createElement('p');
    p.textContent = 'Ничего не найдено. Попробуйте другое название.';
    p.className = 'hint';
    content.append(p);
  } else if (state.status === 'error') {
    const errBlock = document.createElement('div');
    errBlock.className = 'error-block';
    const p = document.createElement('p');
    p.textContent = `Ошибка: ${state.message}`;
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Повторить';
    retryBtn.addEventListener('click', () => controller.retry());
    errBlock.append(p, retryBtn);
    content.append(errBlock);
  } else if (state.status === 'success') {
    const list = document.createElement('div');
    list.className = 'country-list';

    state.data.forEach((country) => {
      const card = document.createElement('article');
      card.className = 'country-card';

      const img = document.createElement('img');
      img.src = country.flagUrl;
      img.alt = `Флаг ${country.name}`;

      const name = document.createElement('h2');
      name.textContent = country.name;

      const details = document.createElement('p');
      details.textContent = `${country.capital} • ${country.region} • ${country.population} чел.`;

      card.append(img, name, details);

      // Детальный вид (просто расширяем карточку)
      card.addEventListener('click', () => {
        if (card.classList.contains('expanded')) return;
        const extra = document.createElement('div');
        extra.className = 'extra-info';
        extra.append(document.createElement('p', {}));
        const desc = document.createElement('p');
        desc.textContent = country.description;
        const langs = document.createElement('p');
        langs.textContent = `Языки: ${country.languages.join(', ') || 'Нет данных'}`;
        const curr = document.createElement('p');
        curr.textContent = `Валюта: ${country.currencies.join(', ') || 'Нет данных'}`;
        extra.append(desc, langs, curr);
        card.append(extra);
        card.classList.add('expanded');
      });

      list.append(card);
    });
    content.append(list);
  }
}

// Инициализация
const controller = new SearchController(render);
render({ status: 'idle' });

input.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  controller.search(target.value);
});
