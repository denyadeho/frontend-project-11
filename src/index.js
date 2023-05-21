import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
// import $ from 'jquery';
// import Popper from 'popper.js';

const state = {
  successedUrls: [],
  website: '',
  errors: '',
};

const schema = yup.object().shape({
  website: yup.string().test('not-duplicate', 'URL has already been used', (value) => !state.successedUrls.includes(value)).url(),
});
const input = document.querySelector('#url-input');
const button = document.querySelector('.h-100', '.btn', '.btn-lg', '.btn-primary', '.px-sm-5');
input.addEventListener('input', (e) => {
  state.website = e.target.value;
});

const validationTextChange = (text, flag) => {
  const errorElement = document.querySelector('.feedback', '.m-0', '.position-absolute', '.small');
  if (flag === true) {
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
      validationTextChange('RSS успешно загружен', true);
      state.successedUrls.push(state.website);
      input.value = '';
      input.focus();
      state.website = '';
    })
    .catch((err) => {
      state.errors = err.message;
      switch (state.errors) {
        case 'website must be a valid URL':
          validationTextChange('Ссылка должна быть валидным URL');
          break;
        case 'URL has already been used':
          validationTextChange('RSS уже существует');
          break;
        default:
          console.log('biba');
      }
    });
});
