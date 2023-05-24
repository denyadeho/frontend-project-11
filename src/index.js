import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import ru from './ru.js';

const state = {
  successedUrls: [],
  website: '',
  errors: '',
};

const schema = yup.object().shape({
  website: yup
    .string()
    .test('not-duplicate', 'URL has already been used', (value) => !state.successedUrls.includes(value))
    .url(),
});
const input = document.querySelector('#url-input');
const button = document.querySelector('.h-100', '.btn', '.btn-lg', '.btn-primary', '.px-sm-5');
input.addEventListener('input', (e) => {
  state.website = e.target.value;
});

i18next.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru: {
      translation: {
        ...ru,
      },
    },
  },
});

const validationTextChange = (text, flag) => {
  const errorElement = document.querySelector('.feedback', '.m-0', '.position-absolute', '.small');
  if (flag) {
    errorElement.classList.remove('text-danger');
    errorElement.classList.add('text-success');
    errorElement.innerHTML = text;
  } else {
    errorElement.classList.remove('text-success');
    errorElement.classList.add('text-danger');
    errorElement.innerHTML = text;
  }
};

const statePosts = {
  feeds: [],
  posts: [],
  flag: true,
  ulElementPost: null,
  ulElementFeed: null,
};

const parserDom = (elements) => {
  const parser = new DOMParser();
  const domDocument = parser.parseFromString(elements, 'application/xml');
  console.log(domDocument);
  const titleFeed = domDocument.querySelector('title');
  const descriptionFeed = domDocument.querySelector('description');
  const linkFeed = domDocument.querySelector('link');
  // const webMasterFeed = domDocument.querySelector('webMaster');
  const dataFeed = {
    title: titleFeed.textContent,
    description: descriptionFeed.textContent,
    link: linkFeed.textContent,
    // webMaster: webMasterFeed.textContent,
  };
  statePosts.feeds.push(dataFeed);
  const items = [...domDocument.querySelectorAll('item')];
  items.forEach((item) => {
    const title = item.querySelector('title');
    const guid = item.querySelector('guid');
    const link = item.querySelector('link');
    const description = item.querySelector('description');
    const pubDate = item.querySelector('pubDate');
    const data = {
      title: title.textContent,
      guid: guid.textContent,
      link: link.textContent,
      description: description.textContent,
      pubDate: pubDate.textContent,
    };
    statePosts.posts.push(data);
    console.log(statePosts);
  });
};

const renderNews = () => {
  if (statePosts.flag) {
    const postList = document.querySelector('.col-md-10.col-lg-8.order-1.mx-auto.posts');
    const firstDivPost = document.createElement('div');
    firstDivPost.classList.add('card', 'border-0');
    postList.append(firstDivPost);
    const secondDivPost = document.createElement('div');
    secondDivPost.classList.add('card-body');
    firstDivPost.append(secondDivPost);
    const h2ElementPost = document.createElement('h2');
    h2ElementPost.classList.add('card-title', 'h4');
    h2ElementPost.innerHTML = 'Посты';
    secondDivPost.append(h2ElementPost);
    statePosts.ulElementPost = document.createElement('ul');
    // console.log('ullll', ulElementPost);
    statePosts.ulElementPost.classList.add('list-group', 'border-0', 'rounded-0');
    firstDivPost.append(statePosts.ulElementPost);

    const feedList = document.querySelector('.col-md-10.col-lg-4.mx-auto.order-0.order-lg-1.feeds');
    const firstDivFeed = document.createElement('div');
    firstDivFeed.classList.add('card', 'border-0');
    feedList.append(firstDivFeed);
    const secondDivFeed = document.createElement('div');
    secondDivFeed.classList.add('card-body');
    firstDivFeed.append(secondDivFeed);
    const h2ElementFeed = document.createElement('h2');
    h2ElementFeed.classList.add('card-title', 'h4');
    h2ElementFeed.innerHTML = 'Фиды';
    secondDivFeed.append(h2ElementFeed);
    statePosts.ulElementFeed = document.createElement('ul');
    statePosts.ulElementFeed.classList.add('list-group', 'border-0', 'rounded-0');
    firstDivFeed.append(statePosts.ulElementFeed);
    console.log(statePosts.ulElementPost);
    console.log(statePosts.ulElementFeed);
    statePosts.flag = false;
  } else {
    statePosts.ulElementFeed.innerHTML = '';
    statePosts.ulElementPost.innerHTML = '';
  }

  statePosts.posts.forEach(({ title, link, description }) => {
    const liElementPost = document.createElement('li');
    liElementPost.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    statePosts.ulElementPost.prepend(liElementPost);
    const aElementPost = document.createElement('a');
    aElementPost.setAttribute('href', link);
    aElementPost.setAttribute('target', '_blank');
    aElementPost.setAttribute('rel', 'noopener noreferrer');
    aElementPost.classList.add('fw-bold');
    aElementPost.innerHTML = title;
    liElementPost.append(aElementPost);
  });

  statePosts.feeds.forEach(({ title, link, description }) => {
    const liElementFeed = document.createElement('li');
    liElementFeed.classList.add('list-group-item', 'border-0', 'border-end-0');
    statePosts.ulElementFeed.prepend(liElementFeed);
    const h3ElementFeed = document.createElement('h3');
    h3ElementFeed.classList.add('h6', 'm-0');
    h3ElementFeed.innerHTML = title;
    const pElementFeed = document.createElement('p');
    pElementFeed.classList.add('m-0', 'small', 'text-black-50');
    pElementFeed.innerHTML = description;
    liElementFeed.append(h3ElementFeed);
    liElementFeed.append(pElementFeed);
  });
};

const makeRequest = () => {
  axios.get(`https://allorigins.hexlet.app/raw?url=${state.website}`)
    .then((response) => {
      const elements = response.data;
      parserDom(elements);
      renderNews();
      // state.website = '';
      setTimeout(makeRequest, 5000);
    })
    .catch((error) => {
      console.error('Ошибка при выполнении запроса:', error);
    });
};
button.addEventListener('click', (e) => {
  e.preventDefault();

  schema.validate(state)
    .then(() => {
      validationTextChange(i18next.t('validationSuccess'), true);
      state.successedUrls.push(state.website);
      input.value = '';
      input.focus();
      makeRequest();
    })
    .catch((err) => {
      state.errors = err.message;
      switch (state.errors) {
        case 'website must be a valid URL':
          validationTextChange(i18next.t('invalidUrl'));
          break;
        case 'URL has already been used':
          validationTextChange(i18next.t('urlAlreadyExists'));
          break;
        default:
          break;
      }
    });
});
