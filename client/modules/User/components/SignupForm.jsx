import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { validateSignup } from '../../../utils/reduxFormUtils';
import { validateAndSignUpUser } from '../actions';
import Button from '../../../common/Button';
import apiClient from '../../../utils/apiClient';
import useSyncFormTranslations from '../../../common/useSyncFormTranslations';

const timeoutRef = { current: null };

function asyncValidate(fieldToValidate, value) {
  if (!value || value.trim().length === 0) {
    return Promise.resolve('');
  }

  const queryParams = {
    [fieldToValidate]: value,
    check_type: fieldToValidate
  };

  return new Promise((resolve) => {
    if (timeoutRef.current) {
      timeoutRef.current();
    }

    const timerId = setTimeout(() => {
      apiClient
        .get('/signup/duplicate_check', { params: queryParams })
        .then((response) => {
          if (response.data.exists) {
            resolve(response.data.message);
          } else {
            resolve('');
          }
        })
        .catch(() => {
          resolve('An error occurred while validating');
        });
    }, 300);

    timeoutRef.current = () => {
      clearTimeout(timerId);
      resolve('');
    };
  });
}

function validateUsername(username) {
  return asyncValidate('username', username);
}

function validateEmail(email) {
  return asyncValidate('email', email);
}

function SignupForm() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useSyncFormTranslations(formRef, i18n.language);

  const handleVisibility = () => setShowPassword(!showPassword);
  const handleConfirmVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  function onSubmit(formProps) {
    return dispatch(validateAndSignUpUser(formProps));
  }

  return (
    <Form
      fields={['username', 'email', 'password', 'confirmPassword']}
      validate={validateSignup}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, pristine, submitting, invalid, form }) => {
        formRef.current = form;
        return (
          <form className="form" onSubmit={handleSubmit}>
            <Field
              name="username"
              validate={validateUsername}
              validateFields={[]}
            >
              {(field) => (
                <div className="form__field">
                  <label htmlFor="username" className="form__label">
                    {t('SignupForm.Title')}
                  </label>
                  <input
                    className="form__input"
                    aria-label={t('SignupForm.TitleARIA')}
                    type="text"
                    id="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    {...field.input}
                  />
                  {field.meta.touched && field.meta.error && (
                    <span className="form-error" aria-live="polite">
                      {field.meta.error}
                    </span>
                  )}
                </div>
              )}
            </Field>
            <Field name="email" validate={validateEmail} validateFields={[]}>
              {(field) => (
                <div className="form__field">
                  <label htmlFor="email" className="form__label">
                    {t('SignupForm.Email')}
                  </label>
                  <input
                    className="form__input"
                    aria-label={t('SignupForm.EmailARIA')}
                    type="email"
                    id="email"
                    autoComplete="email"
                    {...field.input}
                  />
                  {field.meta.touched && field.meta.error && (
                    <span className="form-error" aria-live="polite">
                      {field.meta.error}
                    </span>
                  )}
                </div>
              )}
            </Field>
            <Field name="password">
              {(field) => (
                <div className="form__field">
                  <label htmlFor="password" className="form__label">
                    {t('SignupForm.Password')}
                  </label>
                  <div className="form__field__password">
                    <input
                      className="form__input"
                      aria-label={t('SignupForm.PasswordARIA')}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
                      {...field.input}
                    />
                    <button
                      className="form__eye__icon"
                      type="button"
                      onClick={handleVisibility}
                      aria-hidden="true"
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible />
                      ) : (
                        <AiOutlineEye />
                      )}
                    </button>
                  </div>
                  {field.meta.touched && field.meta.error && (
                    <span className="form-error" aria-live="polite">
                      {field.meta.error}
                    </span>
                  )}
                </div>
              )}
            </Field>
            <Field name="confirmPassword">
              {(field) => (
                <div className="form__field">
                  <label htmlFor="confirmPassword" className="form__label">
                    {t('SignupForm.ConfirmPassword')}
                  </label>
                  <div className="form__field__password">
                    <input
                      className="form__input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      aria-label={t('SignupForm.ConfirmPasswordARIA')}
                      id="confirmPassword" // Match the id with htmlFor
                      autoComplete="new-password"
                      {...field.input}
                    />
                    <button
                      className="form__eye__icon"
                      type="button"
                      onClick={handleConfirmVisibility}
                      aria-hidden="true"
                    >
                      {showConfirmPassword ? (
                        <AiOutlineEyeInvisible />
                      ) : (
                        <AiOutlineEye />
                      )}
                    </button>
                  </div>
                  {field.meta.touched && field.meta.error && (
                    <span className="form-error" aria-live="polite">
                      {field.meta.error}
                    </span>
                  )}
                </div>
              )}
            </Field>
            <Button type="submit" disabled={submitting || invalid || pristine}>
              {t('SignupForm.SubmitSignup')}
            </Button>
          </form>
        );
      }}
    </Form>
  );
}

export default SignupForm;
