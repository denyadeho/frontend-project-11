import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import i18next from 'i18next';
import ru from './ru.js';

const state = {
  successedUrls: [],
  website: '',
  errors: '',
};
yup.setLocale({
  string: {
    test: 'invalidUrl',
  },
});

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
button.addEventListener('click', (e) => {
  e.preventDefault();

  schema.validate(state)
    .then(() => {
      validationTextChange(i18next.t('validationSuccess'), true);
      state.successedUrls.push(state.website);
      input.value = '';
      input.focus();
      state.website = '';
    })
    .catch((err) => {
      console.log(err.errors)
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
